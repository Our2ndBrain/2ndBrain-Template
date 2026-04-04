#!/usr/bin/env node

/**
 * Validate release tag, package version, and git ancestry before publishing.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const RELEASE_TAG_PATTERN =
  /^v\d{4}\.[1-9]\d*\.[1-9]\d*(?:-(?:[1-9]\d*|beta\.[1-9]\d*))?$/;

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assertTagFormat(tag) {
  if (!RELEASE_TAG_PATTERN.test(tag)) {
    fail(`Invalid release tag: ${tag}. Expected vYYYY.M.D, vYYYY.M.D-N, or vYYYY.M.D-beta.N`);
  }
}

function assertPackageVersion(tag) {
  const expectedVersion = tag.slice(1);
  if (pkg.version !== expectedVersion) {
    fail(`Tag/version mismatch: ${tag} vs package.json ${pkg.version}`);
  }
}

function assertChangelogEntry(version) {
  const changelogPath = path.join(repoRoot, 'CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const versionHeading = `## [${version}] -`;

  if (!changelog.includes(versionHeading)) {
    fail(`CHANGELOG.md is missing release heading: ${versionHeading}`);
  }
}

function assertTagPointsToHead(tag) {
  const headSha = git(['rev-parse', 'HEAD']);
  const tagSha = git(['rev-list', '-n', '1', tag]);

  if (headSha !== tagSha) {
    fail(`Current checkout is ${headSha}, but ${tag} points to ${tagSha}`);
  }
}

function assertReleaseCommitOnMain(mainRef) {
  if (!mainRef) {
    return;
  }

  try {
    execFileSync('git', ['merge-base', '--is-ancestor', 'HEAD', mainRef], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
  } catch {
    fail(`Release commit ${git(['rev-parse', 'HEAD'])} is not contained in ${mainRef}`);
  }
}

function main() {
  const releaseTag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME;
  const mainRef = process.env.RELEASE_MAIN_REF;

  if (!releaseTag) {
    fail('RELEASE_TAG or GITHUB_REF_NAME is required.');
  }

  assertTagFormat(releaseTag);
  assertPackageVersion(releaseTag);
  assertChangelogEntry(pkg.version);
  assertTagPointsToHead(releaseTag);
  assertReleaseCommitOnMain(mainRef);

  console.log(`Release metadata check passed for ${releaseTag}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  RELEASE_TAG_PATTERN,
  assertTagFormat,
  assertPackageVersion,
  assertChangelogEntry,
  assertTagPointsToHead,
  assertReleaseCommitOnMain,
  main,
};
