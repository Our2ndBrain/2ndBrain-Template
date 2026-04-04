#!/usr/bin/env node

/**
 * Validate npm package contents and size budget.
 */

const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const pkg = require('../package.json');

const MAX_PACKED_SIZE = 1_000_000;
const MAX_UNPACKED_SIZE = 4_000_000;
const REQUIRED_FILES = [
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'bin/2ndbrain.js',
  'src/index.js',
  'template/00_Dashboard/01_All_Tasks.md',
  'template/10_Inbox/Agents/Journal.md',
  'template/99_System/Templates/tpl_daily_note.md',
  'template/.obsidian/community-plugins.json',
];
const DISALLOWED_PREFIXES = ['.github/', 'scripts/', 'test/'];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parsePackMetadata(rawOutput) {
  try {
    const parsed = JSON.parse(rawOutput);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (error) {
    fail(`Unable to parse npm pack metadata: ${error.message}`);
  }
}

function main() {
  const npmCache = process.env.SECONDBRAIN_NPM_CACHE
    || path.join(os.tmpdir(), '2ndbrain-npm-cache');

  const rawOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
  });

  const pack = parsePackMetadata(rawOutput);
  if (!pack || !Array.isArray(pack.files)) {
    fail('npm pack did not return a file list.');
  }

  if (pack.name !== pkg.name || pack.version !== pkg.version) {
    fail(`Packed metadata mismatch: expected ${pkg.name}@${pkg.version}, got ${pack.name}@${pack.version}`);
  }

  if (pack.size > MAX_PACKED_SIZE) {
    fail(`Packed tarball too large: ${pack.size} > ${MAX_PACKED_SIZE} bytes`);
  }

  if (pack.unpackedSize > MAX_UNPACKED_SIZE) {
    fail(`Unpacked package too large: ${pack.unpackedSize} > ${MAX_UNPACKED_SIZE} bytes`);
  }

  const files = pack.files.map((file) => file.path);
  const fileSet = new Set(files);

  for (const requiredFile of REQUIRED_FILES) {
    if (!fileSet.has(requiredFile)) {
      fail(`Required file missing from npm package: ${requiredFile}`);
    }
  }

  for (const file of files) {
    if (DISALLOWED_PREFIXES.some((prefix) => file.startsWith(prefix))) {
      fail(`Unexpected file published to npm package: ${file}`);
    }
  }

  console.log(`npm package check passed for ${pack.name}@${pack.version} (${pack.files.length} files, ${pack.size} bytes packed)`);
}

main();
