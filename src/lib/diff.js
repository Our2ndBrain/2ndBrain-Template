/**
 * 2ndBrain CLI - Diff Operations
 *
 * Provides file comparison and diff generation utilities.
 */

const fs = require('fs-extra');
const { diffLines, diffWords } = require('diff');

/**
 * Binary file extensions that should be detected and skipped
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.mp3', '.mp4', '.avi', '.mov', '.wav',
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  '.psd', '.ai', '.sketch',
]);

/**
 * Large file threshold in bytes (100KB)
 */
const LARGE_FILE_THRESHOLD = 100 * 1024;

/**
 * Check if a file is likely binary based on its extension
 * @param {string} filePath - File path
 * @returns {boolean} True if file is likely binary
 */
function isBinaryFile(filePath) {
  const ext = filePath.toLowerCase().split('.').pop();
  return BINARY_EXTENSIONS.has(`.${ext}`);
}

/**
 * Check if a file is too large for diff display
 * @param {string} filePath - File path
 * @returns {Promise<boolean>} True if file exceeds threshold
 */
async function isLargeFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size > LARGE_FILE_THRESHOLD;
  } catch {
    return false;
  }
}

/**
 * Compare two file contents for equality
 * @param {string} content1 - First content
 * @param {string} content2 - Second content
 * @returns {boolean} True if contents are equal
 */
function areContentsEqual(content1, content2) {
  if (content1 === content2) return true;

  // Normalize line endings for comparison
  const normalize = (str) => str.replace(/\r\n/g, '\n');
  return normalize(content1) === normalize(content2);
}

/**
 * Read file content safely
 * @param {string} filePath - File path
 * @returns {Promise<string|null>} File content or null if error
 */
async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

/**
 * Compare source and destination files
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @returns {Promise<{equal: boolean, error?: string, binary?: boolean, large?: boolean}>}
 */
async function compareFiles(src, dest) {
  // Check for binary file
  if (isBinaryFile(src) || isBinaryFile(dest)) {
    return { equal: false, binary: true };
  }

  // Check for large file
  if (await isLargeFile(src) || await isLargeFile(dest)) {
    return { equal: false, large: true };
  }

  try {
    const [srcContent, destContent] = await Promise.all([
      readFileContent(src),
      readFileContent(dest),
    ]);

    // If destination doesn't exist, files are not equal
    if (destContent === null) {
      return { equal: false };
    }

    // If source doesn't exist, that's an error
    if (srcContent === null) {
      return { equal: false, error: 'source file not found' };
    }

    return { equal: areContentsEqual(srcContent, destContent) };
  } catch (err) {
    return { equal: false, error: err.message };
  }
}

/**
 * Generate a unified diff between two contents
 * @param {string} oldContent - Old content
 * @param {string} newContent - New content
 * @param {string} oldPath - Old file path (for display)
 * @param {string} newPath - New file path (for display)
 * @returns {string} Unified diff string
 */
function generateDiff(oldContent, newContent, oldPath = 'old', newPath = 'new') {
  const changes = diffLines(oldContent, newContent);

  if (changes.length === 0) {
    return 'No differences found.';
  }

  let diffText = '';
  let oldLineNum = 1;
  let newLineNum = 1;

  // Count changes
  const addedLines = changes.filter(c => c.added).reduce((sum, c) => sum + c.count, 0);
  const removedLines = changes.filter(c => c.removed).reduce((sum, c) => sum + c.count, 0);

  diffText += `--- ${oldPath}\n`;
  diffText += `+++ ${newPath}\n`;
  diffText += `@@ -1 +${addedLines > 0 || removedLines === 0 ? '' : ''},${removedLines > 0 ? '?' : '1'} `;
  diffText += `+1 ${removedLines > 0 || addedLines === 0 ? '' : ''},${addedLines > 0 ? '?' : '1'} @@\n`;

  for (const change of changes) {
    const lines = change.value.split('\n');
    // Remove trailing empty line from split
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    for (const line of lines) {
      if (change.added) {
        diffText += `+${line}\n`;
        newLineNum++;
      } else if (change.removed) {
        diffText += `-${line}\n`;
        oldLineNum++;
      } else {
        diffText += ` ${line}\n`;
        oldLineNum++;
        newLineNum++;
      }
    }
  }

  return diffText;
}

/**
 * Format diff text with colors for terminal display
 * @param {string} diffText - Raw diff text
 * @param {Object} chalk - Chalk module for colors
 * @returns {string} Formatted diff with ANSI colors
 */
function formatDiffForTerminal(diffText, chalk) {
  const lines = diffText.split('\n');
  const formatted = lines.map(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return chalk.green(line);
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      return chalk.red(line);
    } else if (line.startsWith('@@')) {
      return chalk.cyan(line);
    } else if (line.startsWith('---')) {
      return chalk.yellow(line);
    } else if (line.startsWith('+++')) {
      return chalk.yellow(line);
    }
    return line;
  });

  return formatted.join('\n');
}

/**
 * Generate a summary of changes between two contents
 * @param {string} oldContent - Old content
 * @param {string} newContent - New content
 * @returns {{added: number, removed: number, changed: boolean}}
 */
function summarizeChanges(oldContent, newContent) {
  const changes = diffLines(oldContent, newContent);
  const added = changes.filter(c => c.added).reduce((sum, c) => sum + c.count, 0);
  const removed = changes.filter(c => c.removed).reduce((sum, c) => sum + c.count, 0);

  return {
    added,
    removed,
    changed: added > 0 || removed > 0,
  };
}

module.exports = {
  areContentsEqual,
  compareFiles,
  generateDiff,
  formatDiffForTerminal,
  summarizeChanges,
  isBinaryFile,
  isLargeFile,
  LARGE_FILE_THRESHOLD,
};
