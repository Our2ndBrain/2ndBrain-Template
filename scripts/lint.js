#!/usr/bin/env node

/**
 * Run a lightweight JavaScript syntax lint over source, tests, and scripts.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const roots = ['bin', 'scripts', 'src', 'test'];
const files = [];

function walk(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
}

for (const root of roots) {
  walk(path.join(repoRoot, root));
}

for (const file of files.sort()) {
  execFileSync(process.execPath, ['--check', file], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
}

console.log(`JavaScript syntax check passed for ${files.length} files.`);
