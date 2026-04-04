#!/usr/bin/env node

/**
 * Create a release commit/tag, then push to GitHub so Actions can publish.
 */

const { execFileSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const RELEASE_TYPES = new Set(['stable', 'beta', 'hotfix']);
const RELEASE_STAGE_ORDER = {
  beta: 0,
  stable: 1,
  hotfix: 2,
};
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
  const match = dateVersion.match(DATE_VERSION_PATTERN);

  if (!match) {
    throw new Error(
      `Invalid release date "${dateVersion}". Expected YYYY.M.D with no zero-padded month/day.`
    );
  }

  const { year, month, day } = match.groups;
  if (!isValidCalendarDate(Number(year), Number(month), Number(day))) {
    throw new Error(`Invalid release date "${dateVersion}". Expected a real calendar date.`);
  }

  return dateVersion;
}

function isValidCalendarDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}
function parseReleaseVersion(version) {
  const releaseTag = version.startsWith('v') ? version : `v${version}`;
  const match = releaseTag.match(RELEASE_TAG_PATTERN);

  if (!match) {
    return null;
  }

  const [year, month, day] = match.groups.base.split('.').map(Number);
  if (!isValidCalendarDate(year, month, day)) {
    return null;
  }
  const stage = match.groups.beta ? 'beta' : match.groups.hotfix ? 'hotfix' : 'stable';

  return {
    tag: match[0],
    base: match.groups.base,
    year,
    month,
    day,
    stage,
    stageOrder: RELEASE_STAGE_ORDER[stage],
    stageNumber: Number(match.groups.beta || match.groups.hotfix || 0),
    beta: match.groups.beta ? Number(match.groups.beta) : null,
    hotfix: match.groups.hotfix ? Number(match.groups.hotfix) : null,
  };
}

function parseReleaseTags(tags) {
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => parseReleaseVersion(tag))
    .filter(Boolean)
    .map((version) => ({
      tag: version.tag,
      base: version.base,
      beta: version.beta,
      hotfix: version.hotfix,
    }));
}

function compareReleaseVersions(left, right) {
  return (
    left.year - right.year ||
    left.month - right.month ||
    left.day - right.day ||
    left.stageOrder - right.stageOrder ||
    left.stageNumber - right.stageNumber
  );
}

function assertMonotonicVersion(version, tags, currentVersion = pkg.version) {
  const nextVersion = parseReleaseVersion(version);
  const existingVersions = [...tags, currentVersion]
    .map((tag) => parseReleaseVersion(tag))
    .filter(Boolean);

  if (!nextVersion || existingVersions.length === 0) {
    return;
  }

  const latestVersion = existingVersions.reduce((latest, candidate) =>
    compareReleaseVersions(candidate, latest) > 0 ? candidate : latest
  );

  if (compareReleaseVersions(nextVersion, latestVersion) <= 0) {
    throw new Error(
      `Release version ${version} must be newer than current release line ${latestVersion.tag.slice(1)}.`
    );
  }
}

function resolveNextVersion(releaseType, releaseDate, tags, currentVersion = pkg.version) {
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

    const version = releaseDate;
    assertMonotonicVersion(version, tags, currentVersion);
    return version;
  }

  if (releaseType === 'hotfix') {
    if (!hasStableTag && hotfixVersions.length === 0) {
      throw new Error(
        `Cannot create ${releaseDate}-N before ${releaseDate} exists. Use "npm run release -- stable" first.`
      );
    }

    const nextHotfix = Math.max(0, ...hotfixVersions) + 1;
    const version = `${releaseDate}-${nextHotfix}`;
    assertMonotonicVersion(version, tags, currentVersion);
    return version;
  }

  if (hasStableTag || hotfixVersions.length > 0) {
    throw new Error(
      `Cannot create ${releaseDate}-beta.N after a same-day stable release already exists.`
    );
  }

  const nextBeta = Math.max(0, ...betaVersions) + 1;
  const version = `${releaseDate}-beta.${nextBeta}`;
  assertMonotonicVersion(version, tags, currentVersion);
  return version;
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

function assertMatchingRefs(localHead, remoteMain) {
  if (localHead !== remoteMain) {
    throw new Error(
      'Local main must exactly match origin/main before releasing. Pull/rebase or push local commits first.'
    );
  }
}

function assertMainMatchesOriginMain() {
  const localHead = git(['rev-parse', 'HEAD']);
  const remoteMain = git(['rev-parse', 'origin/main']);
  assertMatchingRefs(localHead, remoteMain);
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

  git(['push', '--atomic', 'origin', 'HEAD:main', releaseTag], { stdio: 'inherit' });

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
  assertMainMatchesOriginMain();

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
  isValidCalendarDate,
  parseReleaseVersion,
  parseReleaseTags,
  compareReleaseVersions,
  assertMonotonicVersion,
  resolveNextVersion,
  resolveReleaseDate,
  assertMatchingRefs,
  main,
};
