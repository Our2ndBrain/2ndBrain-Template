/**
 * 2ndBrain CLI - Configuration
 * 
 * Defines framework files and directories managed by the CLI tool.
 */

const path = require('path');

// Template root directory (npm package root)
const TEMPLATE_ROOT = path.resolve(__dirname, '../../');

/**
 * Framework files - managed by init/update/remove commands
 * These files will be copied during init, updated during update, and removed during remove.
 */
const FRAMEWORK_FILES = [
  'AGENTS.md',
  'README.md',
  'CHANGELOG.md',
  'CLAUDE.md',
  'LICENSE',
  '00_Dashboard/01_All_Tasks.md',
  '00_Dashboard/09_All_Done.md',
  '99_System/Templates/tpl_daily_note.md',
  '99_System/Templates/tpl_member_tasks.md',
  '99_System/Templates/tpl_member_done.md',
  '99_System/Scripts/init_member.sh',
];

/**
 * Framework directories - created during init
 */
const FRAMEWORK_DIRS = [
  '00_Dashboard',
  '10_Inbox/Agents',
  '99_System/Templates',
  '99_System/Scripts',
];

/**
 * User data directories - NEVER touched by update/remove
 */
const USER_DATA_DIRS = [
  '20_Areas',
  '30_Projects',
  '40_Resources',
  '90_Archives',
];

/**
 * Directories to copy entirely during init (e.g., .obsidian with plugins)
 */
const COPY_DIRS = [
  '.obsidian',
];

/**
 * Directories requiring smart merge (preserves user configs, adds new items)
 */
const SMART_COPY_DIRS = [
  '.obsidian',
];

/**
 * Files created only during init (not updated/removed)
 */
const INIT_ONLY_FILES = [
  { path: '10_Inbox/Agents/Journal.md', content: '# Agent Journal\n' },
];

/**
 * Marker file to identify a 2ndBrain project
 */
const MARKER_FILE = 'AGENTS.md';

/**
 * Get the path to a template file
 * @param {string} relativePath - Relative path from template root
 * @param {string} [templateRoot] - Optional custom template root
 * @returns {string} Absolute path to the template file
 */
function getTemplatePath(relativePath, templateRoot = TEMPLATE_ROOT) {
  return path.join(templateRoot, relativePath);
}

/**
 * Check if a path is a 2ndBrain project
 * @param {string} targetPath - Path to check
 * @returns {boolean}
 */
function is2ndBrainProject(targetPath) {
  const markerPath = path.join(targetPath, MARKER_FILE);
  try {
    require('fs').accessSync(markerPath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  TEMPLATE_ROOT,
  FRAMEWORK_FILES,
  FRAMEWORK_DIRS,
  USER_DATA_DIRS,
  COPY_DIRS,
  SMART_COPY_DIRS,
  INIT_ONLY_FILES,
  MARKER_FILE,
  getTemplatePath,
  is2ndBrainProject,
};
