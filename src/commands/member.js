/**
 * 2ndBrain CLI - Member Command
 * 
 * Initialize a new member directory with personal dashboard.
 */

const path = require('path');
const fs = require('fs-extra');
const { is2ndBrainProject } = require('../lib/config');
const { createFile, ensureDirs } = require('../lib/files');

/**
 * Template placeholders to replace
 */
const PLACEHOLDER = '{{MEMBER_NAME}}';

/**
 * Member files configuration
 */
const MEMBER_FILES = [
  { template: 'tpl_member_tasks.md', output: '01_Tasks.md' },
  { template: 'tpl_member_done.md', output: '09_Done.md' },
];

/**
 * Initialize a new member directory
 * @param {string} memberName - Member name
 * @param {string} targetPath - Target project path
 * @param {Object} options - Command options
 * @param {boolean} [options.force] - Force overwrite existing member
 * @param {boolean} [options.noConfig] - Skip Obsidian config update
 * @param {Object} log - Logger object
 */
async function member(memberName, targetPath, options, log) {
  const resolvedPath = path.resolve(targetPath);
  const memberDir = path.join(resolvedPath, '10_Inbox', memberName);
  const templateDir = path.join(resolvedPath, '99_System/Templates');
  const obsidianConfig = path.join(resolvedPath, '.obsidian/daily-notes.json');

  log.info('');
  log.info('🧠 2ndBrain Member Init');
  log.info('========================');
  log.info(`Member name: ${memberName}`);
  log.info(`Member directory: 10_Inbox/${memberName}`);
  log.info('');

  // Validate project
  if (!is2ndBrainProject(resolvedPath)) {
    throw new Error(
      'Target directory is not a 2ndBrain project. Run "2ndbrain init" first.'
    );
  }

  // Check if member directory exists
  if (await fs.pathExists(memberDir)) {
    const contents = await fs.readdir(memberDir);
    if (contents.length > 0 && !options.force) {
      throw new Error(
        `Member directory 10_Inbox/${memberName} already exists. Use --force to overwrite.`
      );
    }
    if (options.force) {
      log.warn(`Overwriting existing member directory...`);
    }
  }

  // Step 1: Create member directory
  log.info('📁 Creating member directory...');
  await ensureDirs([`10_Inbox/${memberName}`], resolvedPath);
  log.success(`  + 10_Inbox/${memberName}/`);

  // Step 2: Copy and process template files
  log.info('📋 Creating member files...');
  for (const { template, output } of MEMBER_FILES) {
    const templatePath = path.join(templateDir, template);
    const outputPath = path.join(memberDir, output);

    if (!await fs.pathExists(templatePath)) {
      log.error(`  ! ${template} (template not found)`);
      continue;
    }

    // Read template and replace placeholder
    let content = await fs.readFile(templatePath, 'utf8');
    content = content.replace(new RegExp(PLACEHOLDER, 'g'), memberName);

    // Write output file
    await createFile(outputPath, content);
    log.success(`  + 10_Inbox/${memberName}/${output}`);
  }

  // Step 3: Update Obsidian daily-notes config (unless --no-config)
  if (options.config !== false) {
    log.info('⚙️  Configuring Obsidian daily-notes...');
    await fs.ensureDir(path.join(resolvedPath, '.obsidian'));
    
    const config = {
      folder: `10_Inbox/${memberName}`,
      autorun: true,
      template: '99_System/Templates/tpl_daily_note',
    };

    await createFile(obsidianConfig, JSON.stringify(config, null, 2));
    log.success('  + .obsidian/daily-notes.json');
  }

  // Summary
  log.info('');
  log.info('========================');
  log.success('🎉 Member init complete!');
  log.info('');
  log.info('Created files:');
  log.info(`  - 10_Inbox/${memberName}/01_Tasks.md (personal dashboard)`);
  log.info(`  - 10_Inbox/${memberName}/09_Done.md (done records)`);
  log.info('');
  log.info('Next steps:');
  log.info('  1. Open this vault with Obsidian');
  log.info(`  2. New daily notes will auto-save to 10_Inbox/${memberName}/`);
  log.info('  3. Start recording your first task!');
  log.info('');
}

module.exports = member;
