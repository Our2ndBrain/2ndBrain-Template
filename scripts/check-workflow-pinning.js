#!/usr/bin/env node

/**
 * Ensure third-party GitHub Actions are pinned to a full commit SHA.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const githubDir = path.join(repoRoot, '.github');
const actionRefPattern = /^\s*uses:\s*([^\s#]+)\s*(?:#.*)?$/;
const pinnedRefPattern = /^[^@]+@[0-9a-f]{40}$/i;
const violations = [];

function scanWorkflowFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(actionRefPattern);
    if (!match) {
      return;
    }

    const actionRef = match[1].replace(/^["']|["']$/g, '');
    if (actionRef.startsWith('./') || actionRef.startsWith('../')) {
      return;
    }

    if (!pinnedRefPattern.test(actionRef)) {
      const relativePath = path.relative(repoRoot, filePath);
      violations.push(`${relativePath}:${index + 1} ${actionRef}`);
    }
  });
}

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

    if (entry.isFile() && /\.(ya?ml)$/.test(entry.name)) {
      scanWorkflowFile(fullPath);
    }
  }
}

walk(githubDir);

if (violations.length > 0) {
  console.error('Unpinned GitHub Actions references found:');
  for (const violation of violations) {
    console.error(`  ${violation}`);
  }
  process.exit(1);
}

console.log('Workflow action pinning check passed.');
