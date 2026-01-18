#!/usr/bin/env node

/**
 * 2ndBrain CLI
 * 
 * A CLI tool for managing 2ndBrain projects.
 */

const { program } = require('commander');
const { init, update, remove, member, completion } = require('../src');
const pkg = require('../package.json');

// ANSI color codes for terminal output
const colors = {
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
};

// Logger utility
const log = {
  info: (msg) => console.log(msg),
  success: (msg) => console.log(colors.green(msg)),
  warn: (msg) => console.log(colors.yellow(msg)),
  error: (msg) => console.log(colors.red(msg)),
};

// CLI setup
program
  .name('2ndbrain')
  .description('CLI tool for 2ndBrain - A personal knowledge management system')
  .version(pkg.version);

// Init command
program
  .command('init [path]')
  .description('Initialize a new 2ndBrain project (or integrate into existing vault)')
  .option('-t, --template <path>', 'Use custom template directory')
  .option('-f, --force', 'Force overwrite existing 2ndBrain project')
  .option('--reset-obsidian, --reset-obs', 'Reset .obsidian directory from template (overwrites all settings)')
  .action(async (targetPath = '.', options) => {
    try {
      await init(targetPath, options, log);
    } catch (err) {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Update command
program
  .command('update [path]')
  .description('Update framework files from template')
  .option('-t, --template <path>', 'Use custom template directory')
  .option('-d, --dry-run', 'Show what would be updated without making changes')
  .option('-y, --yes', 'Auto-confirm all updates without prompting')
  .action(async (targetPath = '.', options) => {
    try {
      await update(targetPath, options, log);
    } catch (err) {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Remove command
program
  .command('remove [path]')
  .description('Remove framework files (preserves user data)')
  .option('-d, --dry-run', 'Show what would be removed without making changes')
  .option('-f, --force', 'Force removal without confirmation')
  .action(async (targetPath = '.', options) => {
    try {
      await remove(targetPath, options, log);
    } catch (err) {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Member command
program
  .command('member <name> [path]')
  .description('Initialize a new member directory with personal dashboard')
  .option('-f, --force', 'Force overwrite existing member directory')
  .option('--no-config', 'Skip Obsidian daily-notes.json config update')
  .action(async (name, targetPath = '.', options) => {
    try {
      await member(name, targetPath, options, log);
    } catch (err) {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

// Completion command
program
  .command('completion <shell>')
  .description('Generate shell completion script (bash, zsh, fish)')
  .action((shell) => {
    const script = completion(shell);
    if (script) {
      // Ignore EPIPE errors (when pipe is closed early, e.g., piped to head)
      process.stdout.on('error', (err) => {
        if (err.code === 'EPIPE') {
          process.exit(0);
        }
        throw err;
      });
      process.stdout.write(script);
    } else {
      log.error(`Unsupported shell: ${shell}. Use bash, zsh, or fish.`);
      process.exit(1);
    }
  });

program.parse();