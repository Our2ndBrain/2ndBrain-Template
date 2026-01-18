#!/usr/bin/env node

/**
 * 2ndBrain CLI - Version Helper
 *
 * Automatically updates CHANGELOG.md when version is bumped.
 * This script is called by npm's version hook.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the new version from package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = require(pkgPath);
const newVersion = pkg.version;

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Path to CHANGELOG.md
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

/**
 * Execute git command and return output
 */
function git(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: path.join(__dirname, '..') }).trim();
  } catch (error) {
    return '';
  }
}

/**
 * Get commits since the last tag
 */
function getCommitsSinceLastTag() {
  // Get the most recent tag
  const lastTag = git('git describe --tags --abbrev=0 2>/dev/null');

  if (!lastTag) {
    // No tags found, get all commits
    return git('git log --pretty=format:"%s"');
  }

  // Get commits since the last tag
  return git(`git log ${lastTag}..HEAD --pretty=format:"%s"`);
}

/**
 * Parse commit messages and categorize them
 * Supports Conventional Commits format: type(scope): description
 */
function parseCommits(commitsStr) {
  const commits = commitsStr.split('\n').filter(c => c.trim());
  const categories = {
    Added: [],
    Changed: [],
    Deprecated: [],
    Removed: [],
    Fixed: [],
    Security: []
  };

  for (const commit of commits) {
    // Match Conventional Commits format: type(scope): description
    const match = commit.match(/^(\w+)(?:\(([^)]+)\))?:?\s*(.+)$/);

    if (!match) {
      // Not a conventional commit, skip or add to Changed
      continue;
    }

    const [, type, scope, description] = match;

    // Map conventional commit types to changelog categories
    switch (type.toLowerCase()) {
      case 'feat':
        categories.Added.push(description);
        break;
      case 'fix':
        categories.Fixed.push(description);
        break;
      case 'chore':
      case 'refactor':
      case 'perf':
        categories.Changed.push(description);
        break;
      case 'docs':
        // Docs changes go to Changed
        categories.Changed.push(description);
        break;
      case 'style':
        // Style changes usually don't need changelog
        break;
      case 'test':
        // Test changes usually don't need changelog
        break;
      case 'deprecate':
      case 'deprecated':
        categories.Deprecated.push(description);
        break;
      case 'remove':
      case 'removed':
        categories.Removed.push(description);
        break;
      case 'security':
        categories.Security.push(description);
        break;
    }
  }

  return categories;
}

/**
 * Format categories as markdown
 */
function formatCategories(categories) {
  const lines = [];

  if (categories.Added.length > 0) {
    lines.push('### Added');
    categories.Added.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }

  if (categories.Changed.length > 0) {
    lines.push('### Changed');
    categories.Changed.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }

  if (categories.Deprecated.length > 0) {
    lines.push('### Deprecated');
    categories.Deprecated.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }

  if (categories.Removed.length > 0) {
    lines.push('### Removed');
    categories.Removed.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }

  if (categories.Fixed.length > 0) {
    lines.push('### Fixed');
    categories.Fixed.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }

  if (categories.Security.length > 0) {
    lines.push('### Security');
    categories.Security.forEach(item => lines.push(`- ${item}`));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Check if a version already exists in the changelog
 */
function versionExists(content, version) {
  const regex = new RegExp(`^## \\[${version}\\] -`, 'm');
  return regex.test(content);
}

/**
 * Remove duplicate version entries
 */
function removeDuplicateVersions(content) {
  const lines = content.split('\n');
  const seenVersions = new Map();
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const versionMatch = line.match(/^## \[([\d.]+)\] - /);

    if (versionMatch) {
      const version = versionMatch[1];
      if (seenVersions.has(version)) {
        console.warn(`  ⚠ Found duplicate version [${version}] at line ${i + 1}, skipping...`);
        continue;
      }
      seenVersions.set(version, i);
    }
    result.push(line);
  }

  return result.join('\n');
}

function updateChangelog() {
  if (!fs.existsSync(changelogPath)) {
    console.error('CHANGELOG.md not found!');
    process.exit(1);
  }

  let content = fs.readFileSync(changelogPath, 'utf8');

  // Clean up any existing duplicate versions first
  const beforeClean = content;
  content = removeDuplicateVersions(content);
  if (content !== beforeClean) {
    console.log('Cleaned up duplicate version entries');
    fs.writeFileSync(changelogPath, content);
  }

  // Check if this version already exists - if so, skip
  if (versionExists(content, newVersion)) {
    console.log(`Version [${newVersion}] already exists in CHANGELOG.md, skipping update.`);
    return;
  }

  // Get commits since last tag and parse them
  const commitsStr = getCommitsSinceLastTag();
  const categories = parseCommits(commitsStr);
  const changelogContent = formatCategories(categories);

  console.log(`Found ${commitsStr.split('\n').filter(c => c.trim()).length} commits since last tag`);

  // Check if file starts with "# Changelog" header
  const hasHeader = content.trimStart().startsWith('# Changelog');

  // Find the position after the header section
  let insertPos = 0;
  let headerEnd = '';

  if (hasHeader) {
    const headerMatch = content.match(/(# Changelog[\s\S]*?)(?=\n## \[|$)/);
    if (headerMatch) {
      headerEnd = headerMatch[0];
      insertPos = headerEnd.length;
    }
  }

  // Add new version section (without [Unreleased] handling)
  const newSection = `\n## [${newVersion}] - ${today}\n\n${changelogContent}`;

  if (hasHeader && headerEnd) {
    content = content.slice(0, insertPos) + newSection + content.slice(insertPos);
  } else {
    content = newSection.trimStart() + content;
  }

  console.log(`Updated CHANGELOG.md: Added [${newVersion}] section from git commits`);

  fs.writeFileSync(changelogPath, content);
}

updateChangelog();
