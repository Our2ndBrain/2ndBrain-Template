#!/usr/bin/env node

/**
 * Create a release commit/tag, then push to GitHub so Actions can publish.
 */

const { execFileSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const RELEASE_TYPES = new Set(['stable', 'beta', 'hotfix']);
const DATE_VERSION_PATTERN = /^(?<year>\d{4})\.(?<month>[1-9]\d*)\.(?<day>[1-9]\d*)$/;
const RELEASE_TAG_PATTERN =
  /^v(?<base>\d{4}\.[1-9]\d*\.[1-9]\d*)(?:-(?:(?<hotfix>[1-9]\d*)|beta\.(?<beta>[1-9]\d*)))?$/;

function run(command, args, options = {}) {
  const output = execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    env: options.env || process.env,
  });

  return typeof output === 'string' ? output.trim() : '';
}

function git(args, options = {}) {
  return run('git', args, options);
}

function npm(args, options = {}) {
  return run('npm', args, options);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = [...argv];
  const dryRunIndex = args.indexOf('--dry-run');
  const dryRun = dryRunIndex !== -1;

  if (dryRun) {
    args.splice(dryRunIndex, 1);
  }

  const releaseType = args[0];

  if (!RELEASE_TYPES.has(releaseType) || args.length !== 1) {
    throw new Error('Usage: npm run release -- <stable|beta|hotfix> [--dry-run]');
  }

  return { releaseType, dryRun };
}

function resolveReleaseDate(env = process.env, now = new Date()) {
  const dateVersion = env.RELEASE_DATE || `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;

  if (!DATE_VERSION_PATTERN.test(dateVersion)) {
    throw new Error(
      `Invalid release date "${dateVersion}". Expected YYYY.M.D with no zero-padded month/day.`
    );
  }

  return dateVersion;
}

function parseReleaseTags(tags) {
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.match(RELEASE_TAG_PATTERN))
    .filter(Boolean)
    .map((match) => ({
      tag: match[0],
      base: match.groups.base,
      beta: match.groups.beta ? Number(match.groups.beta) : null,
      hotfix: match.groups.hotfix ? Number(match.groups.hotfix) : null,
    }));
}

function resolveNextVersion(releaseType, releaseDate, tags) {
  const releaseTags = parseReleaseTags(tags);
  const sameDayTags = releaseTags.filter((tag) => tag.base === releaseDate);
  const hasStableTag = sameDayTags.some((tag) => tag.beta === null && tag.hotfix === null);
  const hotfixVersions = sameDayTags
    .map((tag) => tag.hotfix)
    .filter((version) => version !== null);
  const betaVersions = sameDayTags
    .map((tag) => tag.beta)
    .filter((version) => version !== null);

  if (releaseType === 'stable') {
    if (hasStableTag || hotfixVersions.length > 0) {
      throw new Error(
        `Stable release ${releaseDate} already exists. Use "npm run release -- hotfix" for same-day corrections.`
      );
    }

    return releaseDate;
  }

  if (releaseType === 'hotfix') {
    if (!hasStableTag && hotfixVersions.length === 0) {
      throw new Error(
        `Cannot create ${releaseDate}-N before ${releaseDate} exists. Use "npm run release -- stable" first.`
      );
    }

    const nextHotfix = Math.max(0, ...hotfixVersions) + 1;
    return `${releaseDate}-${nextHotfix}`;
  }

  if (hasStableTag || hotfixVersions.length > 0) {
    throw new Error(
      `Cannot create ${releaseDate}-beta.N after a same-day stable release already exists.`
    );
  }

  const nextBeta = Math.max(0, ...betaVersions) + 1;
  return `${releaseDate}-beta.${nextBeta}`;
}

function assertMainBranch() {
  const branch = git(['branch', '--show-current']);

  if (branch !== 'main') {
    throw new Error(`Release must run on main, current branch is "${branch || '(detached HEAD)'}".`);
  }

  return branch;
}

function assertCleanWorktree() {
  const status = git(['status', '--short']);

  if (status) {
    throw new Error('Working tree is not clean. Commit or stash local changes before releasing.');
  }
}

function assertMainContainsOriginMain() {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
  } catch {
    throw new Error('Local main does not contain origin/main. Pull/rebase before releasing.');
  }
}

function listGitTags() {
  const tags = git(['tag', '--list']);
  return tags ? tags.split('\n') : [];
}

function runLocalChecks() {
  npm(['run', 'lint'], { stdio: 'inherit' });
  npm(['test'], { stdio: 'inherit' });
  npm(['run', 'pack:check'], { stdio: 'inherit' });
}

function createRelease(version) {
  const releaseTag = `v${version}`;

  npm(['version', version], { stdio: 'inherit' });
  npm(['run', 'release:check'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      RELEASE_TAG: releaseTag,
    },
  });

  git(['push', 'origin', 'HEAD:main'], { stdio: 'inherit' });
  git(['push', 'origin', releaseTag], { stdio: 'inherit' });

  return releaseTag;
}

function main(argv = process.argv.slice(2), env = process.env) {
  const { releaseType, dryRun } = parseArgs(argv);

  assertMainBranch();
  assertCleanWorktree();

  git(['fetch', '--no-tags', 'origin', '+refs/heads/main:refs/remotes/origin/main'], {
    stdio: 'inherit',
  });
  git(['fetch', '--tags', 'origin'], { stdio: 'inherit' });
  assertMainContainsOriginMain();

  const releaseDate = resolveReleaseDate(env);
  const version = resolveNextVersion(releaseType, releaseDate, listGitTags());

  if (dryRun) {
    console.log(`Next ${releaseType} release: v${version}`);
    return version;
  }

  runLocalChecks();
  const releaseTag = createRelease(version);
  console.log(`Release ${releaseTag} pushed. GitHub Actions will publish to npm.`);
  return version;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    fail(error.message);
  }
}

module.exports = {
  DATE_VERSION_PATTERN,
  RELEASE_TAG_PATTERN,
  parseArgs,
  parseReleaseTags,
  resolveNextVersion,
  resolveReleaseDate,
  main,
};
