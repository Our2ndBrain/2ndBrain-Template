/**
 * 2ndBrain CLI - Smart Obsidian Directory Updates
 *
 * Provides intelligent merging for .obsidian directory that preserves user
 * configurations while adding new plugins from templates.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

/**
 * Merge strategies for different file types
 */
const MERGE_STRATEGIES = {
  /**
   * ARRAY_UNION - Merge arrays, add new items, preserve user items
   * Used for: community-plugins.json
   */
  ARRAY_UNION: 'ARRAY_UNION',

  /**
   * ADD_ONLY - Only add new files/directories, never overwrite
   * Used for: plugins directory (never overwrite user plugin configs)
   */
  ADD_ONLY: 'ADD_ONLY',

  /**
   * TEMPLATE_WINS - Template replaces user config
   * Used for: other JSON files where template is authoritative
   */
  TEMPLATE_WINS: 'TEMPLATE_WINS',
};

/**
 * Manifest filename for merge strategies
 */
const MANIFEST_FILE = '.2ndbrain-manifest.json';

/**
 * Get the merge strategy manifest from template
 * @param {string} obsidianTemplatePath - Path to .obsidian in template
 * @returns {Promise<Object>} Manifest object
 */
async function getManifest(obsidianTemplatePath) {
  const manifestPath = path.join(obsidianTemplatePath, MANIFEST_FILE);

  try {
    const content = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    // If no manifest exists, return default strategies
    return {
      version: '1.0.0',
      description: '2ndBrain Obsidian directory merge manifest',
      strategies: {
        'community-plugins.json': 'ARRAY_UNION',
        'plugins': 'ADD_ONLY',
      },
      deprecatedPlugins: [],
    };
  }
}

/**
 * Get all files recursively in a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<string[]>} Array of relative file paths
 */
async function getAllFiles(dirPath) {
  const files = [];

  if (!(await fs.pathExists(dirPath))) {
    return files;
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath);
      files.push(...subFiles.map(f => path.join(entry.name, f)));
    } else {
      files.push(entry.name);
    }
  }

  return files;
}

/**
 * Merge community plugins using array union strategy
 * Adds new plugins from template, preserves user-added plugins
 * @param {string} userPluginsPath - Path to user's community-plugins.json
 * @param {string} templatePluginsPath - Path to template's community-plugins.json
 * @param {Object} manifest - Merge manifest
 * @returns {Promise<Object>} Result with status and details
 */
async function mergeCommunityPlugins(userPluginsPath, templatePluginsPath, manifest) {
  let userPlugins = [];
  let templatePlugins = [];

  // Read user plugins
  if (await fs.pathExists(userPluginsPath)) {
    try {
      const content = await fs.readFile(userPluginsPath, 'utf8');
      userPlugins = JSON.parse(content);
    } catch (err) {
      // If file is invalid, start fresh
      userPlugins = [];
    }
  }

  // Read template plugins
  if (await fs.pathExists(templatePluginsPath)) {
    try {
      const content = await fs.readFile(templatePluginsPath, 'utf8');
      templatePlugins = JSON.parse(content);
    } catch (err) {
      templatePlugins = [];
    }
  }

  // Union merge: template plugins + user plugins (excluding duplicates)
  const mergedPlugins = [
    ...new Set([
      ...templatePlugins,
      ...userPlugins.filter(p => !templatePlugins.includes(p)),
    ]),
  ];

  // Sort for consistency
  mergedPlugins.sort();

  // Detect changes
  const hasChanges = (
    mergedPlugins.length !== userPlugins.length ||
    !mergedPlugins.every(p => userPlugins.includes(p))
  );

  if (!hasChanges) {
    return {
      action: 'unchanged',
      oldPlugins: userPlugins,
      newPlugins: userPlugins,
      added: [],
      removed: [],
    };
  }

  const added = mergedPlugins.filter(p => !userPlugins.includes(p));
  const removed = userPlugins.filter(p => !mergedPlugins.includes(p));

  return {
    action: 'merged',
    oldPlugins: userPlugins,
    newPlugins: mergedPlugins,
    added,
    removed,
  };
}

/**
 * Process a single file in the .obsidian directory
 * @param {string} relativePath - Relative path from .obsidian root
 * @param {string} obsidianTemplatePath - Template .obsidian path
 * @param {string} obsidianTargetPath - Target .obsidian path
 * @param {Object} manifest - Merge manifest
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - Dry run mode
 * @returns {Promise<Object>} Result object
 */
async function processObsidianFile(relativePath, obsidianTemplatePath, obsidianTargetPath, manifest, options = {}) {
  const templateFilePath = path.join(obsidianTemplatePath, relativePath);
  const targetFilePath = path.join(obsidianTargetPath, relativePath);

  // Skip the manifest file itself
  if (relativePath === MANIFEST_FILE) {
    return { action: 'skip', file: relativePath, reason: 'internal manifest' };
  }

  // Check if this path or parent has a merge strategy
  let strategy = null;

  // Direct file strategy
  if (manifest.strategies[relativePath]) {
    strategy = manifest.strategies[relativePath];
  } else {
    // Check directory strategies
    const pathParts = relativePath.split(path.sep);
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const dirPath = pathParts.slice(0, i).join(path.sep);
      if (manifest.strategies[dirPath]) {
        strategy = manifest.strategies[dirPath];
        break;
      }
    }
  }

  // Handle community-plugins.json specially
  if (relativePath === 'community-plugins.json') {
    const result = await mergeCommunityPlugins(targetFilePath, templateFilePath, manifest);

    if (!options.dryRun && result.action === 'merged') {
      await fs.ensureDir(path.dirname(targetFilePath));
      await fs.writeFile(targetFilePath, JSON.stringify(result.newPlugins, null, 2) + '\n');
    }

    return {
      action: result.action,
      file: relativePath,
      added: result.added,
      removed: result.removed,
      strategy: 'ARRAY_UNION',
    };
  }

  // For ADD_ONLY strategy, only add if target doesn't exist
  if (strategy === MERGE_STRATEGIES.ADD_ONLY) {
    if (await fs.pathExists(targetFilePath)) {
      return { action: 'preserved', file: relativePath, reason: 'user file' };
    }
    // File doesn't exist, copy it
    if (!options.dryRun) {
      await fs.ensureDir(path.dirname(targetFilePath));
      await fs.copy(templateFilePath, targetFilePath);
    }
    return { action: 'added', file: relativePath };
  }

  // For TEMPLATE_WINS or no strategy, copy if different
  const templateExists = await fs.pathExists(templateFilePath);
  const targetExists = await fs.pathExists(targetFilePath);

  if (!templateExists) {
    return { action: 'skip', file: relativePath, reason: 'not in template' };
  }

  if (!targetExists) {
    if (!options.dryRun) {
      await fs.ensureDir(path.dirname(targetFilePath));
      await fs.copy(templateFilePath, targetFilePath);
    }
    return { action: 'added', file: relativePath };
  }

  // Compare contents
  const [templateContent, targetContent] = await Promise.all([
    fs.readFile(templateFilePath, 'utf8'),
    fs.readFile(targetFilePath, 'utf8'),
  ]);

  if (templateContent === targetContent) {
    return { action: 'unchanged', file: relativePath };
  }

  // TEMPLATE_WINS: replace with template
  if (!options.dryRun) {
    await fs.copy(templateFilePath, targetFilePath);
  }

  return {
    action: 'updated',
    file: relativePath,
    strategy: strategy || 'TEMPLATE_WINS',
  };
}

/**
 * Smart copy of .obsidian directory with merge strategies
 * @param {string} obsidianTemplatePath - Template .obsidian path
 * @param {string} obsidianTargetPath - Target .obsidian path
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - Dry run mode
 * @param {Function} options.onProgress - Callback for progress updates (file, action, detail)
 * @returns {Promise<Object>} Result with counts and changes
 */
async function copyObsidianDirSmart(obsidianTemplatePath, obsidianTargetPath, options = {}) {
  const { dryRun = false, onProgress } = options;

  // Ensure target directory exists
  if (!dryRun) {
    await fs.ensureDir(obsidianTargetPath);
  }

  // Get manifest
  const manifest = await getManifest(obsidianTemplatePath);

  // Get all template files
  const templateFiles = await getAllFiles(obsidianTemplatePath);

  // Process each file
  const results = {
    added: [],
    updated: [],
    merged: [],
    unchanged: [],
    preserved: [],
    skipped: [],
  };

  for (const relativePath of templateFiles) {
    const result = await processObsidianFile(
      relativePath,
      obsidianTemplatePath,
      obsidianTargetPath,
      manifest,
      { dryRun }
    );

    // Categorize result
    switch (result.action) {
      case 'added':
        results.added.push(result);
        if (onProgress) onProgress(result.file, 'added', result);
        break;
      case 'updated':
        results.updated.push(result);
        if (onProgress) onProgress(result.file, 'updated', result);
        break;
      case 'merged':
        results.merged.push(result);
        if (onProgress) onProgress(result.file, 'merged', result);
        break;
      case 'unchanged':
        results.unchanged.push(result);
        if (onProgress) onProgress(result.file, 'unchanged', result);
        break;
      case 'preserved':
        results.preserved.push(result);
        if (onProgress) onProgress(result.file, 'preserved', result);
        break;
      case 'skip':
        results.skipped.push(result);
        break;
    }
  }

  // Check for user files not in template (should be preserved)
  const targetFiles = await fs.pathExists(obsidianTargetPath)
    ? await getAllFiles(obsidianTargetPath)
    : [];

  for (const relativePath of targetFiles) {
    if (relativePath === MANIFEST_FILE) continue;
    if (templateFiles.includes(relativePath)) continue;

    // This is a user-only file
    results.preserved.push({ file: relativePath, reason: 'user-only' });
    if (onProgress) onProgress(relativePath, 'preserved', { reason: 'user-only' });
  }

  return results;
}

module.exports = {
  MERGE_STRATEGIES,
  MANIFEST_FILE,
  getManifest,
  getAllFiles,
  mergeCommunityPlugins,
  processObsidianFile,
  copyObsidianDirSmart,
};
