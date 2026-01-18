/**
 * 2ndBrain CLI - Interactive Prompt Utilities
 *
 * Provides user confirmation and selection prompts for CLI interactions.
 */

const readline = require('readline');
const chalk = require('chalk');

/**
 * Create a readline interface
 * @returns {readline.Interface}
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a Yes/No confirmation question
 * @param {string} question - Question to ask
 * @param {boolean} [default=true] - Default answer if user presses Enter
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
function confirm(question, defaultValue = true) {
  return new Promise((resolve) => {
    const rl = createInterface();
    const prompt = defaultValue ? ' [Y/n]: ' : ' [y/N]: ';

    rl.question(`${question}${prompt}`, (answer) => {
      rl.close();

      if (answer.trim() === '') {
        resolve(defaultValue);
        return;
      }

      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Ask a selection question with options
 * @param {string} question - Question to ask
 * @param {Array<{label: string, value: any, description?: string}>} options - Options to display
 * @param {number|string} [default] - Default option value if user presses Enter
 * @returns {Promise<any>} Selected value
 */
function select(question, options, defaultValue) {
  return new Promise((resolve) => {
    const rl = createInterface();

    console.log('');
    console.log(chalk.cyan(question));

    options.forEach((opt, idx) => {
      const isDefault = defaultValue !== undefined && opt.value === defaultValue;
      const marker = isDefault ? ' (default)' : '';
      const num = `${idx + 1})`.padStart(3);
      const label = `${num} ${opt.label}${marker}`;

      if (opt.description) {
        console.log(`  ${chalk.dim(label)} - ${opt.description}`);
      } else {
        console.log(`  ${label}`);
      }
    });

    rl.question(chalk.yellow('\nYour choice: '), (answer) => {
      rl.close();

      const trimmed = answer.trim();

      if (trimmed === '' && defaultValue !== undefined) {
        resolve(defaultValue);
        return;
      }

      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        resolve(options[num - 1].value);
      } else {
        // Try to find matching value
        const match = options.find(opt => opt.value === trimmed);
        if (match) {
          resolve(match.value);
        } else {
          console.log(chalk.yellow('Invalid choice, using default (1).'));
          resolve(options[0].value);
        }
      }
    });
  });
}

/**
 * Confirm batch updates with a summary of changes
 * @param {Array<{file: string, added: number, removed: number, binary?: boolean, large?: boolean}>} changes - List of changes
 * @param {Function} log - Logger function
 * @param {Object} chalk - Chalk module for colors
 * @returns {Promise<'all'|'review'|'skip'>} User's choice
 */
async function confirmBatchUpdates(changes, log, chalk) {
  if (changes.length === 0) {
    return 'skip';
  }

  console.log('');
  log.info(`${changes.length} file(s) have changes:`);

  for (const change of changes) {
    if (change.binary) {
      console.log(`  * ${chalk.yellow(change.file)} (binary file)`);
    } else if (change.large) {
      console.log(`  * ${chalk.yellow(change.file)} (large file, use --force to review)`);
    } else {
      const parts = [];
      if (change.added > 0) parts.push(chalk.green(`+${change.added}`));
      if (change.removed > 0) parts.push(chalk.red(`-${change.removed}`));
      const summary = parts.join(' ');
      console.log(`  * ${chalk.yellow(change.file)} (${summary} lines)`);
    }
  }

  console.log('');

  const choice = await select('How would you like to proceed?', [
    { label: 'Apply all changes', value: 'all', description: 'Update all changed files without review' },
    { label: 'Review each file individually', value: 'review', description: 'Confirm each file one by one' },
    { label: 'Skip all changes', value: 'skip', description: 'Cancel the update' },
  ], 1);

  return choice;
}

/**
 * Confirm a single file update
 * @param {string} file - File path
 * @param {boolean} [default=true] - Default answer
 * @returns {Promise<boolean>} True if user wants to update
 */
function confirmFile(file, defaultValue = true) {
  return confirm(`Update ${chalk.yellow(file)}?`, defaultValue);
}

/**
 * Prompt for handling large files
 * @param {string} file - File path
 * @param {number} size - File size in bytes
 * @returns {Promise<boolean>} True if user wants to proceed
 */
function confirmLargeFile(file, size) {
  const sizeKB = (size / 1024).toFixed(2);
  console.log('');
  console.log(chalk.yellow(`Warning: ${file} is a large file (${sizeKB} KB).`));
  return confirm('Update this file anyway?', false);
}

/**
 * Prompt for handling binary files
 * @param {string} file - File path
 * @returns {Promise<boolean>} True if user wants to proceed
 */
function confirmBinaryFile(file) {
  console.log('');
  console.log(chalk.yellow(`Warning: ${file} appears to be a binary file.`));
  console.log(chalk.dim('Binary files cannot show diffs and will be completely replaced.'));
  return confirm('Update this file anyway?', false);
}

module.exports = {
  confirm,
  select,
  confirmBatchUpdates,
  confirmFile,
  confirmLargeFile,
  confirmBinaryFile,
};
