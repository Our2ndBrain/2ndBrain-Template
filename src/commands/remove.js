/**
 * 2ndBrain CLI - Remove Command
 * 
 * Remove framework files while preserving user data.
 */

const path = require('path');
const {
  FRAMEWORK_FILES,
  FRAMEWORK_DIRS,
  is2ndBrainProject,
} = require('../lib/config');
const { removeFiles, removeEmptyDirs } = require('../lib/files');

/**
 * Remove framework files from a 2ndBrain project
 * @param {string} targetPath - Target directory path
 * @param {Object} options - Command options
 * @param {boolean} [options.dryRun] - Dry run mode
 * @param {boolean} [options.force] - Force removal without confirmation
 * @param {Function} log - Logger function
 */
async function remove(targetPath, options, log) {
  const resolvedPath = path.resolve(targetPath);

  log.info(`Removing 2ndBrain framework from: ${resolvedPath}`);

  // Check if target is a 2ndBrain project
  if (!is2ndBrainProject(resolvedPath)) {
    throw new Error(
      'Target directory is not a 2ndBrain project.'
    );
  }

  if (options.dryRun) {
    log.warn('[DRY RUN] No files will be removed.');
    log.info('');
    log.info('Files that would be removed:');
    for (const file of FRAMEWORK_FILES) {
      log.info(`  ${file}`);
    }
    log.info('');
    log.info('Directories that would be cleaned:');
    for (const dir of FRAMEWORK_DIRS) {
      log.info(`  ${dir}/`);
    }
    return;
  }

  if (!options.force) {
    log.warn('This will remove all framework files.');
    log.warn('User data in 20_Areas/, 30_Projects/, 40_Resources/, 90_Archives/ will be preserved.');
    log.warn('Use --force to skip this warning.');
    throw new Error('Aborted. Use --force to confirm removal.');
  }

  // Remove framework files
  log.info('Removing framework files...');
  const fileResult = await removeFiles(FRAMEWORK_FILES, resolvedPath, (file, action, reason) => {
    if (action === 'remove') {
      log.success(`  - ${file}`);
    } else if (action === 'skip') {
      log.warn(`  ~ ${file} (skipped: ${reason})`);
    } else if (action === 'error') {
      log.error(`  ! ${file} (error: ${reason})`);
    }
  });

  // Remove empty framework directories
  log.info('Cleaning empty directories...');
  const removedDirs = await removeEmptyDirs(FRAMEWORK_DIRS, resolvedPath, (dir, action) => {
    if (action === 'remove') {
      log.success(`  - ${dir}/`);
    }
  });

  // Summary
  log.info('');
  log.success('2ndBrain framework removed successfully!');
  log.info(`  Removed: ${fileResult.removed.length} files, ${removedDirs.length} directories`);
  if (fileResult.skipped.length > 0) {
    log.warn(`  Skipped: ${fileResult.skipped.length} files`);
  }
  log.info('');
  log.info('User data directories have been preserved.');
}

module.exports = remove;