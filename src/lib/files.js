/**
 * 2ndBrain CLI - File Operations
 *
 * Provides file copy, remove, and directory operations.
 */

const fs = require('fs-extra');
const path = require('path');
const { compareFiles, summarizeChanges, isBinaryFile, isLargeFile } = require('./diff');

/**
 * Copy a file from source to destination
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @returns {Promise<void>}
 */
async function copyFile(src, dest) {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

/**
 * Copy multiple files from template to target
 * @param {string[]} files - Array of relative file paths
 * @param {string} templateRoot - Template root directory
 * @param {string} targetRoot - Target root directory
 * @param {Function} [onFile] - Callback for each file (relativePath, action)
 * @returns {Promise<{copied: string[], skipped: string[], errors: string[]}>}
 */
async function copyFiles(files, templateRoot, targetRoot, onFile) {
  const result = { copied: [], skipped: [], errors: [] };

  for (const file of files) {
    const src = path.join(templateRoot, file);
    const dest = path.join(targetRoot, file);

    try {
      // Check if source exists
      if (!await fs.pathExists(src)) {
        result.skipped.push(file);
        if (onFile) onFile(file, 'skip', 'source not found');
        continue;
      }

      await copyFile(src, dest);
      result.copied.push(file);
      if (onFile) onFile(file, 'copy');
    } catch (err) {
      result.errors.push(`${file}: ${err.message}`);
      if (onFile) onFile(file, 'error', err.message);
    }
  }

  return result;
}

/**
 * Remove a file if it exists
 * @param {string} filePath - File path to remove
 * @returns {Promise<boolean>} True if removed, false if not found
 */
async function removeFile(filePath) {
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
    return true;
  }
  return false;
}

/**
 * Remove multiple files from target directory
 * @param {string[]} files - Array of relative file paths
 * @param {string} targetRoot - Target root directory
 * @param {Function} [onFile] - Callback for each file (relativePath, action)
 * @returns {Promise<{removed: string[], skipped: string[], errors: string[]}>}
 */
async function removeFiles(files, targetRoot, onFile) {
  const result = { removed: [], skipped: [], errors: [] };

  for (const file of files) {
    const filePath = path.join(targetRoot, file);

    try {
      if (await removeFile(filePath)) {
        result.removed.push(file);
        if (onFile) onFile(file, 'remove');
      } else {
        result.skipped.push(file);
        if (onFile) onFile(file, 'skip', 'not found');
      }
    } catch (err) {
      result.errors.push(`${file}: ${err.message}`);
      if (onFile) onFile(file, 'error', err.message);
    }
  }

  return result;
}

/**
 * Ensure directories exist
 * @param {string[]} dirs - Array of relative directory paths
 * @param {string} targetRoot - Target root directory
 * @returns {Promise<void>}
 */
async function ensureDirs(dirs, targetRoot) {
  for (const dir of dirs) {
    await fs.ensureDir(path.join(targetRoot, dir));
  }
}

/**
 * Remove empty directories (bottom-up)
 * @param {string[]} dirs - Array of relative directory paths
 * @param {string} targetRoot - Target root directory
 * @param {Function} [onDir] - Callback for each directory (relativePath, action)
 * @returns {Promise<string[]>} Array of removed directories
 */
async function removeEmptyDirs(dirs, targetRoot, onDir) {
  const removed = [];

  // Sort by depth (deepest first)
  const sortedDirs = [...dirs].sort((a, b) => {
    return b.split('/').length - a.split('/').length;
  });

  for (const dir of sortedDirs) {
    const dirPath = path.join(targetRoot, dir);

    try {
      if (await fs.pathExists(dirPath)) {
        const contents = await fs.readdir(dirPath);
        if (contents.length === 0) {
          await fs.remove(dirPath);
          removed.push(dir);
          if (onDir) onDir(dir, 'remove');
        } else {
          if (onDir) onDir(dir, 'skip', 'not empty');
        }
      }
    } catch (err) {
      // Ignore errors for directory removal
    }
  }

  // Also try to remove parent directories if empty
  const parentDirs = new Set();
  for (const dir of removed) {
    const parent = path.dirname(dir);
    if (parent !== '.') {
      parentDirs.add(parent);
    }
  }

  for (const parent of parentDirs) {
    const parentPath = path.join(targetRoot, parent);
    try {
      if (await fs.pathExists(parentPath)) {
        const contents = await fs.readdir(parentPath);
        if (contents.length === 0) {
          await fs.remove(parentPath);
          removed.push(parent);
          if (onDir) onDir(parent, 'remove');
        }
      }
    } catch {
      // Ignore errors
    }
  }

  return removed;
}

/**
 * Create a file with content
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
async function createFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Check if directory is empty or doesn't exist
 * @param {string} dirPath - Directory path
 * @returns {Promise<boolean>}
 */
async function isDirEmpty(dirPath) {
  if (!await fs.pathExists(dirPath)) {
    return true;
  }
  const contents = await fs.readdir(dirPath);
  return contents.length === 0;
}

/**
 * Compare source and destination files
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @returns {Promise<{equal: boolean, exists: boolean, error?: string, binary?: boolean, large?: boolean}>}
 */
async function compareFilesWrapper(src, dest) {
  const destExists = await fs.pathExists(dest);

  if (!destExists) {
    return { equal: false, exists: false };
  }

  const result = await compareFiles(src, dest);
  return { ...result, exists: true };
}

/**
 * Copy a single file with comparison
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @param {Object} options - Copy options
 * @param {boolean} [options.force] - Force copy even if equal
 * @returns {Promise<{copied: boolean, unchanged: boolean, error?: string, change?: any}>}
 */
async function copyFileWithCompare(src, dest, options = {}) {
  try {
    // Check if source exists
    if (!await fs.pathExists(src)) {
      return { copied: false, unchanged: false, error: 'source not found' };
    }

    // Compare files if destination exists
    const comparison = await compareFilesWrapper(src, dest);

    if (comparison.exists && comparison.equal && !options.force) {
      return { copied: false, unchanged: true };
    }

    // Perform the copy
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest);

    // Generate change summary
    let change = null;
    if (!comparison.equal) {
      if (comparison.binary) {
        change = { binary: true };
      } else if (comparison.large) {
        change = { large: true };
      } else {
        try {
          const [srcContent, destContent] = await Promise.all([
            fs.readFile(src, 'utf8'),
            comparison.exists ? fs.readFile(dest, 'utf8') : '',
          ]);
          const summary = summarizeChanges(destContent, srcContent);
          change = { added: summary.added, removed: summary.removed };
        } catch {
          // If we can't read as text, mark as binary
          change = { binary: true };
        }
      }
    }

    return { copied: true, unchanged: false, change };
  } catch (err) {
    return { copied: false, unchanged: false, error: err.message };
  }
}

/**
 * Copy multiple files with smart comparison
 * @param {string[]} files - Array of relative file paths
 * @param {string} templateRoot - Template root directory
 * @param {string} targetRoot - Target root directory
 * @param {Object} options - Copy options
 * @param {boolean} [options.force] - Force copy even if equal
 * @param {boolean} [options.dryRun] - Dry run mode
 * @param {Function} [onFile] - Callback for each file (relativePath, action, detail)
 * @returns {Promise<{copied: string[], skipped: string[], unchanged: string[], errors: string[], changes: Array}>}
 */
async function copyFilesSmart(files, templateRoot, targetRoot, options = {}, onFile) {
  const result = {
    copied: [],
    skipped: [],
    unchanged: [],
    errors: [],
    changes: [],
  };

  for (const file of files) {
    const src = path.join(templateRoot, file);
    const dest = path.join(targetRoot, file);

    try {
      const fileResult = await copyFileWithCompare(src, dest, options);

      if (fileResult.error) {
        result.errors.push(`${file}: ${fileResult.error}`);
        if (onFile) onFile(file, 'error', fileResult.error);
        continue;
      }

      if (fileResult.unchanged) {
        result.unchanged.push(file);
        if (onFile) onFile(file, 'unchanged');
        continue;
      }

      if (options.dryRun) {
        result.skipped.push(file);
        if (onFile) onFile(file, 'dryrun', fileResult.change);
        continue;
      }

      result.copied.push(file);
      if (fileResult.change) {
        result.changes.push({ file, ...fileResult.change });
      }
      if (onFile) onFile(file, 'copy', fileResult.change);
    } catch (err) {
      result.errors.push(`${file}: ${err.message}`);
      if (onFile) onFile(file, 'error', err.message);
    }
  }

  return result;
}

module.exports = {
  copyFile,
  copyFiles,
  removeFile,
  removeFiles,
  ensureDirs,
  removeEmptyDirs,
  createFile,
  isDirEmpty,
  compareFilesWrapper,
  copyFileWithCompare,
  copyFilesSmart,
};
