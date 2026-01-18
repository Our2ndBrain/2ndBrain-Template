/**
 * 2ndBrain CLI - Init Command
 *
 * Initialize a new 2ndBrain project or integrate into existing vault.
 */

const path = require('path');
const fs = require('fs-extra');
const {
  TEMPLATE_ROOT,
  FRAMEWORK_FILES,
  FRAMEWORK_DIRS,
  USER_DATA_DIRS,
  COPY_DIRS,
  SMART_COPY_DIRS,
  INIT_ONLY_FILES,
  is2ndBrainProject,
} = require('../lib/config');
const { copyFiles, ensureDirs, createFile, isDirEmpty, copyFilesSmart } = require('../lib/files');
const { copyObsidianDirSmart } = require('../lib/obsidian');

/**
 * Scan existing directory to understand current state
 * @param {string} targetPath - Target directory path
 * @returns {Promise<Object>} Scan result with existing files/dirs
 */
async function scanExistingDirectory(targetPath) {
  const scan = {
    hasFiles: false,
    existingDirs: new Set(),
    existingFiles: new Set(),
    hasObsidian: false,
    hasUserDataDirs: new Set(),
    hasFrameworkDirs: new Set(),
  };

  if (!await fs.pathExists(targetPath)) {
    return scan;
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      scan.existingDirs.add(entry.name);
      scan.hasFiles = true;

      if (entry.name === '.obsidian') {
        scan.hasObsidian = true;
      }
      if (USER_DATA_DIRS.includes(entry.name)) {
        scan.hasUserDataDirs.add(entry.name);
      }
      if (FRAMEWORK_DIRS.some(d => d.startsWith(entry.name))) {
        scan.hasFrameworkDirs.add(entry.name);
      }
    } else if (entry.isFile()) {
      scan.existingFiles.add(entry.name);
      scan.hasFiles = true;
    }
  }

  return scan;
}

/**
 * Handle .obsidian directory reset from template
 * @param {string} obsidianSrc - Template .obsidian path
 * @param {string} obsidianDest - Target .obsidian path
 * @param {Function} log - Logger function
 * @param {boolean} skipConfirmation - Skip confirmation if true
 * @returns {Promise<boolean>} True if reset performed, false if cancelled
 */
async function handleObsidianReset(obsidianSrc, obsidianDest, log, skipConfirmation = false) {
  const { confirm } = require('../lib/prompt');

  // Check if template exists
  if (!await fs.pathExists(obsidianSrc)) {
    log.warn('  Template .obsidian not found, skipping reset');
    return false;
  }

  const targetExists = await fs.pathExists(obsidianDest);

  // If target doesn't exist, just copy (no confirmation needed)
  if (!targetExists) {
    log.info('  No existing .obsidian found, creating from template...');
    await fs.copy(obsidianSrc, obsidianDest);
    log.success('  + .obsidian/');
    return true;
  }

  // Target exists - require confirmation
  log.warn('');
  log.warn('╔════════════════════════════════════════════════════════════╗');
  log.warn('║          ⚠️  OBSIDIAN CONFIGURATION RESET WARNING         ║');
  log.warn('╚════════════════════════════════════════════════════════════╝');
  log.warn('');
  log.warn('You are about to COMPLETELY REPLACE your .obsidian directory.');
  log.warn('This will delete all your Obsidian settings and preferences.');
  log.warn('');

  if (skipConfirmation) {
    log.warn('  Force reset: skipping confirmation (--force)');
  }

  const confirmed = skipConfirmation || await confirm(
    'Are you sure you want to reset your .obsidian directory?',
    false // Default to NO for safety
  );

  if (!confirmed) {
    log.info('');
    log.info('Obsidian reset cancelled. Preserving existing configuration.');
    return false;
  }

  // Perform the reset
  try {
    log.info('  Resetting .obsidian directory...');
    await fs.remove(obsidianDest);
    await fs.copy(obsidianSrc, obsidianDest);
    log.success('  .obsidian/ reset complete');
    log.info('    • All settings replaced with template defaults');
    return true;
  } catch (err) {
    log.error(`  Failed to reset .obsidian: ${err.message}`);
    throw err;
  }
}

/**
 * Initialize a new 2ndBrain project or integrate into existing vault
 * @param {string} targetPath - Target directory path
 * @param {Object} options - Command options
 * @param {string} [options.template] - Custom template path
 * @param {boolean} [options.force] - Force overwrite existing 2ndBrain project
 * @param {boolean} [options.resetObsidian] - Reset .obsidian from template
 * @param {Function} log - Logger function
 */
async function init(targetPath, options, log) {
  const resolvedPath = path.resolve(targetPath);
  const templateRoot = options.template ? path.resolve(options.template) : TEMPLATE_ROOT;

  log.info(`Initializing 2ndBrain project at: ${resolvedPath}`);
  log.info(`Using template from: ${templateRoot}`);

  // Check if target directory exists and scan it
  const dirExists = await fs.pathExists(resolvedPath);
  const isEmpty = dirExists && await isDirEmpty(resolvedPath);
  const isExistingProject = dirExists && is2ndBrainProject(resolvedPath);

  // Handle existing 2ndBrain project
  if (isExistingProject) {
    if (!options.force) {
      log.warn('This directory is already a 2ndBrain project.');
      log.info('Use "2ndbrain update" to update framework files.');
      log.info('Or use --force to reinitialize (this will overwrite framework files).');
      throw new Error('Target directory is already a 2ndBrain project');
    }
    log.warn('Reinitializing existing 2ndBrain project (--force)...');
  }

  // Create target directory if needed
  await fs.ensureDir(resolvedPath);

  // Scan existing directory for smart integration
  const scan = await scanExistingDirectory(resolvedPath);
  const isIntegrateMode = !isEmpty && scan.hasFiles && !isExistingProject;

  if (isIntegrateMode) {
    log.info('');
    log.info('Integration mode: Merging 2ndBrain framework into existing vault');
    if (scan.hasUserDataDirs.size > 0) {
      log.info(`Found existing user data: ${[...scan.hasUserDataDirs].join(', ')}`);
    }
    if (scan.hasFrameworkDirs.size > 0) {
      log.warn(`Found existing framework dirs: ${[...scan.hasFrameworkDirs].join(', ')}`);
    }
    log.info('');
  }

  // Step 1: Create framework directories (only missing ones)
  log.info('Ensuring directories exist...');
  const dirsToCreate = [];

  for (const dir of FRAMEWORK_DIRS) {
    const dirPath = path.join(resolvedPath, dir);
    if (!await fs.pathExists(dirPath)) {
      dirsToCreate.push(dir);
    }
  }

  // Create missing framework directories
  if (dirsToCreate.length > 0) {
    await ensureDirs(dirsToCreate, resolvedPath);
    dirsToCreate.forEach(dir => log.success(`  + ${dir}/`));
  } else {
    log.info('  All framework directories exist');
  }

  // Ensure user data directories exist (never overwrite)
  const userDataDirsToCreate = [];
  for (const dir of USER_DATA_DIRS) {
    const dirPath = path.join(resolvedPath, dir);
    if (!await fs.pathExists(dirPath)) {
      userDataDirsToCreate.push(dir);
    }
  }

  if (userDataDirsToCreate.length > 0) {
    await ensureDirs(userDataDirsToCreate, resolvedPath);
    userDataDirsToCreate.forEach(dir => log.success(`  + ${dir}/ (user data)`));
  }

  // Step 2: Copy framework files (skip existing)
  log.info('Copying framework files...');
  const fileResult = await copyFilesSmart(
    FRAMEWORK_FILES,
    templateRoot,
    resolvedPath,
    {},
    (file, action, detail) => {
      if (action === 'copy') {
        log.success(`  + ${file}`);
      } else if (action === 'unchanged') {
        log.info(`  = ${file} (exists, unchanged)`);
      } else if (action === 'error') {
        log.error(`  ! ${file} (error: ${detail})`);
      }
    }
  );

  // Step 3: Process .obsidian directory
  log.info('Processing .obsidian configuration...');
  const obsidianSrc = path.join(templateRoot, '.obsidian');
  const obsidianDest = path.join(resolvedPath, '.obsidian');

  if (await fs.pathExists(obsidianSrc)) {
    // Handle --reset-obsidian option
    if (options.resetObsidian) {
      await handleObsidianReset(obsidianSrc, obsidianDest, log, options.force);
    } else if (await fs.pathExists(obsidianDest)) {
      // Smart merge existing .obsidian
      log.info('  Merging .obsidian/ (preserving your settings)...');
      const obsidianResult = await copyObsidianDirSmart(
        obsidianSrc,
        obsidianDest,
        {
          onProgress: (file, action, detail) => {
            if (action === 'added') {
              log.success(`    + ${file}`);
            } else if (action === 'merged') {
              log.success(`    * ${file} (merged)`);
              if (detail.added && detail.added.length > 0) {
                log.info(`      plugins added: ${detail.added.join(', ')}`);
              }
            } else if (action === 'preserved') {
              log.info(`    = ${file} (preserved)`);
            }
          },
        }
      );
      log.success(`  .obsidian/ merged: ${obsidianResult.added.length + obsidianResult.merged.length} updated`);
    } else {
      // New .obsidian directory
      await fs.copy(obsidianSrc, obsidianDest);
      log.success(`  + .obsidian/`);
    }
  }

  // Step 4: Create init-only files (if missing)
  log.info('Creating initial files...');
  for (const { path: filePath, content } of INIT_ONLY_FILES) {
    const fullPath = path.join(resolvedPath, filePath);
    if (!await fs.pathExists(fullPath)) {
      await createFile(fullPath, content);
      log.success(`  + ${filePath}`);
    }
  }

  // Step 5: Create .gitkeep files for user data directories
  for (const dir of USER_DATA_DIRS) {
    const gitkeepPath = path.join(resolvedPath, dir, '.gitkeep');
    if (!await fs.pathExists(gitkeepPath)) {
      await createFile(gitkeepPath, '');
    }
  }

  // Summary
  log.info('');
  log.success(isIntegrateMode ? '2ndBrain framework integrated!' : '2ndBrain project initialized!');
  log.info(`  Created: ${fileResult.copied.length} files`);
  if (fileResult.unchanged.length > 0) {
    log.info(`  Skipped: ${fileResult.unchanged.length} existing files`);
  }
  if (fileResult.errors.length > 0) {
    log.error(`  Errors: ${fileResult.errors.length} files`);
  }

  log.info('');
  log.info('Next steps:');
  log.info('  1. Open this directory with Obsidian');
  log.info('  2. Run: ./99_System/Scripts/init_member.sh <your-name>');
  log.info('  3. Start recording your first task!');
}

module.exports = init;
