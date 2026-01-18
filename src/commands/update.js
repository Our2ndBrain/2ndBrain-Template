/**
 * 2ndBrain CLI - Update Command
 *
 * Update framework files from template with diff display and confirmation.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const {
  TEMPLATE_ROOT,
  FRAMEWORK_FILES,
  SMART_COPY_DIRS,
  is2ndBrainProject,
} = require('../lib/config');
const { copyFilesSmart, copyFileWithCompare, createFile } = require('../lib/files');
const { generateDiff, formatDiffForTerminal, areContentsEqual, isBinaryFile, isLargeFile, LARGE_FILE_THRESHOLD } = require('../lib/diff');
const { confirm, confirmBatchUpdates, confirmFile, confirmBinaryFile, confirmLargeFile } = require('../lib/prompt');
const { copyObsidianDirSmart, MERGE_STRATEGIES } = require('../lib/obsidian');

/**
 * Update framework files in an existing 2ndBrain project
 * @param {string} targetPath - Target directory path
 * @param {Object} options - Command options
 * @param {string} [options.template] - Custom template path
 * @param {boolean} [options.dryRun] - Dry run mode
 * @param {boolean} [options.yes] - Auto-confirm all updates
 * @param {Function} log - Logger function
 */
async function update(targetPath, options, log) {
  const resolvedPath = path.resolve(targetPath);
  const templateRoot = options.template ? path.resolve(options.template) : TEMPLATE_ROOT;

  log.info(`Updating 2ndBrain project at: ${resolvedPath}`);
  log.info(`Using template from: ${templateRoot}`);

  // Check if target is a 2ndBrain project
  if (!is2ndBrainProject(resolvedPath)) {
    throw new Error(
      'Target directory is not a 2ndBrain project. Run "2ndbrain init" first.'
    );
  }

  if (options.dryRun) {
    await performDryRun(resolvedPath, templateRoot, log);
    return;
  }

  // Main update flow
  await performUpdate(resolvedPath, templateRoot, options, log);
}

/**
 * Perform dry run - show what would be updated
 * @param {string} resolvedPath - Target project path
 * @param {string} templateRoot - Template root path
 * @param {Function} log - Logger function
 */
async function performDryRun(resolvedPath, templateRoot, log) {
  log.warn('[DRY RUN] No files will be modified.');
  log.info('');

  log.info('Analyzing framework files...');

  const result = await copyFilesSmart(
    FRAMEWORK_FILES,
    templateRoot,
    resolvedPath,
    { dryRun: true },
    (file, action, detail) => {
      if (action === 'unchanged') {
        log.info(`  = ${file}`);
      } else if (action === 'dryrun' && detail) {
        const parts = [];
        if (detail.binary) {
          parts.push('binary');
        } else if (detail.large) {
          parts.push('large file');
        } else {
          if (detail.added > 0) parts.push(chalk.green(`+${detail.added}`));
          if (detail.removed > 0) parts.push(chalk.red(`-${detail.removed}`));
        }
        log.info(`  * ${file} (${parts.join(' ')})`);
      }
    }
  );

  // Summary
  log.info('');
  log.info('Framework files summary:');
  log.info(`  Unchanged: ${result.unchanged.length} files`);
  log.info(`  Would update: ${result.skipped.length} files`);

  // Analyze .obsidian directory
  const obsidianTemplatePath = path.join(templateRoot, '.obsidian');
  const obsidianTargetPath = path.join(resolvedPath, '.obsidian');

  if (await fs.pathExists(obsidianTemplatePath)) {
    log.info('');
    log.info('Analyzing .obsidian directory...');

    const obsidianResult = await copyObsidianDirSmart(
      obsidianTemplatePath,
      obsidianTargetPath,
      { dryRun: true }
    );

    // Display .obsidian changes
    for (const item of obsidianResult.added) {
      log.info(`  + ${item.file}`);
    }
    for (const item of obsidianResult.updated) {
      log.info(`  ↻ ${item.file}`);
    }
    for (const item of obsidianResult.merged) {
      const parts = [];
      if (item.added && item.added.length > 0) {
        parts.push(chalk.green(`+${item.added.join(', ')}`));
      }
      if (item.removed && item.removed.length > 0) {
        parts.push(chalk.red(`-${item.removed.join(', ')}`));
      }
      log.info(`  ↻ ${item.file} (${parts.join(' ')})`);
    }
    for (const item of obsidianResult.unchanged) {
      log.info(`  = ${item.file}`);
    }
    for (const item of obsidianResult.preserved) {
      log.info(`  = ${item.file} (preserved)`);
    }

    // Summary
    log.info('');
    log.info('.obsidian summary:');
    log.info(`  New files: ${obsidianResult.added.length}`);
    log.info(`  Updated: ${obsidianResult.updated.length}`);
    log.info(`  Merged: ${obsidianResult.merged.length}`);
    log.info(`  Unchanged: ${obsidianResult.unchanged.length}`);
    log.info(`  Preserved: ${obsidianResult.preserved.length}`);
  }

  // Member dashboards
  const inboxDir = path.join(resolvedPath, '10_Inbox');
  if (await fs.pathExists(inboxDir)) {
    const members = await getMemberDirectories(inboxDir);
    if (members.length > 0) {
      log.info('');
      log.info('Member dashboards that would be updated:');
      for (const member of members) {
        log.info(`  10_Inbox/${member}/01_Tasks.md`);
        log.info(`  10_Inbox/${member}/09_Done.md`);
      }
    }
  }
}

/**
 * Perform the actual update with user confirmation
 * @param {string} resolvedPath - Target project path
 * @param {string} templateRoot - Template root path
 * @param {Object} options - Command options
 * @param {boolean} [options.yes] - Auto-confirm all updates
 * @param {Function} log - Logger function
 */
async function performUpdate(resolvedPath, templateRoot, options, log) {
  log.info('Analyzing framework files...');

  // First pass: analyze all files
  const analysis = await copyFilesSmart(
    FRAMEWORK_FILES,
    templateRoot,
    resolvedPath,
    {},
    (file, action, detail) => {
      // Silent during analysis
    }
  );

  // Display analysis results
  for (const file of analysis.unchanged) {
    log.info(`  = ${file} (unchanged)`);
  }

  // Filter out unchanged files from changes
  const changes = analysis.changes.filter(c => {
    const file = c.file;
    return !analysis.unchanged.includes(file);
  });

  if (changes.length === 0 && analysis.unchanged.length > 0) {
    log.info('');
    log.success('All framework files are already up to date!');
    return;
  }

  // Ask user what to do
  let userChoice;
  if (options.yes) {
    userChoice = 'all';
  } else {
    userChoice = await confirmBatchUpdates(changes, log, chalk);

    if (userChoice === 'skip') {
      log.info('Update cancelled.');
      return;
    }
  }

  // Execute updates
  log.info('');
  log.info('Updating framework files...');

  if (userChoice === 'all') {
    // Apply all changes
    for (const change of changes) {
      const src = path.join(templateRoot, change.file);
      const dest = path.join(resolvedPath, change.file);

      // Handle special cases
      if (change.large && !options.yes) {
        const stats = await fs.stat(src);
        const confirmed = await confirmLargeFile(change.file, stats.size);
        if (!confirmed) {
          log.warn(`  ~ ${change.file} (skipped)`);
          continue;
        }
      } else if (change.binary && !options.yes) {
        const confirmed = await confirmBinaryFile(change.file);
        if (!confirmed) {
          log.warn(`  ~ ${change.file} (skipped)`);
          continue;
        }
      }

      await copyFileWithCompare(src, dest, { force: true });
      log.success(`  ↻ ${change.file}`);
    }
  } else if (userChoice === 'review') {
    // Review each file individually
    for (const change of changes) {
      const file = change.file;
      const src = path.join(templateRoot, file);
      const dest = path.join(resolvedPath, file);

      // Handle special files
      if (change.large) {
        const stats = await fs.stat(src);
        const confirmed = await confirmLargeFile(file, stats.size);
        if (!confirmed) {
          log.warn(`  ~ ${file} (skipped)`);
          continue;
        }
        await copyFileWithCompare(src, dest, { force: true });
        log.success(`  ↻ ${file}`);
        continue;
      }

      if (change.binary) {
        const confirmed = await confirmBinaryFile(file);
        if (!confirmed) {
          log.warn(`  ~ ${file} (skipped)`);
          continue;
        }
        await copyFileWithCompare(src, dest, { force: true });
        log.success(`  ↻ ${file}`);
        continue;
      }

      // Show diff for text files
      console.log('');
      console.log(chalk.bold(`=== ${file} ===`));

      const [oldContent, newContent] = await Promise.all([
        fs.readFile(dest, 'utf8').catch(() => ''),
        fs.readFile(src, 'utf8'),
      ]);

      const diffText = generateDiff(oldContent, newContent, file, file);
      const formattedDiff = formatDiffForTerminal(diffText, chalk);
      console.log(formattedDiff);

      const shouldUpdate = await confirmFile(file, true);
      if (shouldUpdate) {
        await copyFileWithCompare(src, dest, { force: true });
        log.success(`  ↻ ${file}`);
      } else {
        log.warn(`  ~ ${file} (skipped)`);
      }
    }
  }

  // Summary for framework files
  log.info('');
  log.success('Framework files updated!');

  // Update .obsidian directory with smart merge
  await updateObsidianDir(resolvedPath, templateRoot, log);

  // Now update member dashboards
  await updateMemberDashboards(resolvedPath, templateRoot, options, log);
}

/**
 * Update .obsidian directory with smart merge strategies
 * @param {string} resolvedPath - Target project path
 * @param {string} templateRoot - Template root path
 * @param {Function} log - Logger function
 */
async function updateObsidianDir(resolvedPath, templateRoot, log) {
  const obsidianTemplatePath = path.join(templateRoot, '.obsidian');
  const obsidianTargetPath = path.join(resolvedPath, '.obsidian');

  if (!(await fs.pathExists(obsidianTemplatePath))) {
    return;
  }

  log.info('');
  log.info('Updating .obsidian directory...');

  const result = await copyObsidianDirSmart(
    obsidianTemplatePath,
    obsidianTargetPath,
    { dryRun: false }
  );

  // Display results
  for (const item of result.added) {
    log.success(`  + ${item.file}`);
  }
  for (const item of result.updated) {
    log.success(`  ↻ ${item.file}`);
  }
  for (const item of result.merged) {
    const parts = [];
    if (item.added && item.added.length > 0) {
      parts.push(chalk.green(`+${item.added.join(', ')}`));
    }
    if (item.removed && item.removed.length > 0) {
      parts.push(chalk.red(`-${item.removed.join(', ')}`));
    }
    log.success(`  ↻ ${item.file} (${parts.join(' ')})`);
  }
  for (const item of result.unchanged) {
    log.info(`  = ${item.file}`);
  }
  for (const item of result.preserved) {
    log.info(`  = ${item.file} (preserved)`);
  }

  // Summary
  log.info('');
  log.success('.obsidian directory updated!');
  log.info(`  New files: ${result.added.length}`);
  log.info(`  Updated: ${result.updated.length}`);
  log.info(`  Merged: ${result.merged.length}`);
  log.info(`  Unchanged: ${result.unchanged.length}`);
  log.info(`  Preserved: ${result.preserved.length}`);
}

/**
 * Update all member dashboard files using latest templates
 * @param {string} resolvedPath - Target project path
 * @param {string} templateRoot - Template root path
 * @param {Object} options - Command options
 * @param {boolean} [options.yes] - Auto-confirm all updates
 * @param {Function} log - Logger function
 */
async function updateMemberDashboards(resolvedPath, templateRoot, options, log) {
  const inboxDir = path.join(resolvedPath, '10_Inbox');
  const templateDir = path.join(templateRoot, '99_System/Templates');

  if (!(await fs.pathExists(inboxDir))) {
    return;
  }

  const members = await getMemberDirectories(inboxDir);

  if (members.length === 0) {
    return;
  }

  log.info('');
  log.info('Updating member dashboards...');

  const PLACEHOLDER = '{{MEMBER_NAME}}';
  const memberChanges = [];

  for (const member of members) {
    const memberDir = path.join(inboxDir, member);
    const filesToCheck = [
      { template: 'tpl_member_tasks.md', output: '01_Tasks.md' },
      { template: 'tpl_member_done.md', output: '09_Done.md' },
    ];

    for (const { template, output } of filesToCheck) {
      const templatePath = path.join(templateDir, template);
      const outputPath = path.join(memberDir, output);

      if (!(await fs.pathExists(templatePath))) {
        continue;
      }

      try {
        let newContent = await fs.readFile(templatePath, 'utf8');
        newContent = newContent.replace(new RegExp(PLACEHOLDER, 'g'), member);

        const oldContent = await fs.readFile(outputPath, 'utf8').catch(() => '');

        if (!areContentsEqual(oldContent, newContent)) {
          const summary = require('../lib/diff').summarizeChanges(oldContent, newContent);
          memberChanges.push({
            file: `10_Inbox/${member}/${output}`,
            added: summary.added,
            removed: summary.removed,
            outputPath,
            newContent,
          });
        } else {
          log.info(`  = 10_Inbox/${member}/${output} (unchanged)`);
        }
      } catch (err) {
        log.error(`  ! 10_Inbox/${member}/${output} (error: ${err.message})`);
      }
    }
  }

  if (memberChanges.length === 0) {
    return;
  }

  // Ask about member dashboard updates
  let memberChoice;
  if (options.yes) {
    memberChoice = 'all';
  } else {
    memberChoice = await confirmBatchUpdates(memberChanges, log, chalk);

    if (memberChoice === 'skip') {
      log.info('Member dashboard updates cancelled.');
      return;
    }
  }

  // Execute member dashboard updates
  if (memberChoice === 'all') {
    for (const change of memberChanges) {
      await createFile(change.outputPath, change.newContent);
      log.success(`  ↻ ${change.file}`);
    }
  } else if (memberChoice === 'review') {
    for (const change of memberChanges) {
      console.log('');
      console.log(chalk.bold(`=== ${change.file} ===`));

      const oldContent = await fs.readFile(change.outputPath, 'utf8').catch(() => '');
      const diffText = generateDiff(oldContent, change.newContent, change.file, change.file);
      const formattedDiff = formatDiffForTerminal(diffText, chalk);
      console.log(formattedDiff);

      const shouldUpdate = await confirmFile(change.file, true);
      if (shouldUpdate) {
        await createFile(change.outputPath, change.newContent);
        log.success(`  ↻ ${change.file}`);
      } else {
        log.warn(`  ~ ${change.file} (skipped)`);
      }
    }
  }

  log.success('Member dashboards updated!');
}

/**
 * Get all member directories from 10_Inbox (excluding 'Agents')
 * @param {string} inboxDir - Path to 10_Inbox directory
 * @returns {Promise<string[]>} Array of member directory names
 */
async function getMemberDirectories(inboxDir) {
  const entries = await fs.readdir(inboxDir);
  const members = [];

  for (const entry of entries) {
    const entryPath = path.join(inboxDir, entry);
    const stat = await fs.stat(entryPath);

    if (stat.isDirectory() && entry !== 'Agents' && !entry.startsWith('.')) {
      members.push(entry);
    }
  }

  return members;
}

module.exports = update;
