#!/usr/bin/env node

/**
 * Pack the CLI, install the tarball into a temporary project, and run key commands.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const npmCache = process.env.SECONDBRAIN_NPM_CACHE
  || path.join(os.tmpdir(), '2ndbrain-npm-cache');

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      npm_config_cache: npmCache,
      ...(options.env || {}),
    },
    ...options,
  });
}

function parsePackedTarball(rawOutput) {
  const parsed = JSON.parse(rawOutput);
  const pack = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!pack || typeof pack.filename !== 'string') {
    throw new Error('npm pack did not return a tarball filename.');
  }
  return pack.filename;
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected path to exist: ${filePath}`);
  }
}

function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), '2ndbrain-smoke-'));
  const packDir = path.join(tempRoot, 'pack');
  const installDir = path.join(tempRoot, 'install');
  const vaultDir = path.join(tempRoot, 'vault');
  fs.mkdirSync(packDir, { recursive: true });
  fs.mkdirSync(installDir, { recursive: true });

  try {
    const packOutput = run('npm', ['pack', '--json', '--pack-destination', packDir], {
      cwd: repoRoot,
    });
    const tarballPath = path.join(packDir, parsePackedTarball(packOutput));

    run('npm', ['init', '-y'], { cwd: installDir });
    run('npm', ['install', '--no-package-lock', '--no-save', tarballPath], {
      cwd: installDir,
    });

    const binaryPath = path.join(
      installDir,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? '2ndbrain.cmd' : '2ndbrain'
    );

    run(binaryPath, ['--help'], { cwd: installDir });
    run(binaryPath, ['init', vaultDir], { cwd: installDir });
    run(binaryPath, ['member', 'Alex', vaultDir, '--no-config'], { cwd: installDir });
    run(binaryPath, ['update', vaultDir, '--dry-run'], { cwd: installDir });

    assertExists(path.join(vaultDir, 'AGENTS.md'));
    assertExists(path.join(vaultDir, '10_Inbox', 'Alex', '00_To-Do.md'));
    assertExists(path.join(vaultDir, '10_Inbox', 'Alex', '01_Tasks.md'));

    console.log(`Smoke install passed with tarball ${tarballPath}`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main();
