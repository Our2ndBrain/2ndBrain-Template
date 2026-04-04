#!/usr/bin/env node

/**
 * Open a release PR from origin/main, wait for merge, then dispatch Release.
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
const RELEASE_WORKFLOW_FILE = '.github/workflows/release.yml';
const RELEASE_ENVIRONMENT_NAME = 'npm-release';
const RELEASE_POLL_INTERVAL_MS = 3000;
const RELEASE_TIMEOUT_MS = 30 * 60 * 1000;

function run(command, args, options = {}) {
  const output = execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    env: options.env || process.env,
    input: options.input,
  });

  return typeof output === 'string' ? output.trim() : '';
}

function git(args, options = {}) {
  return run('git', args, options);
}

function npm(args, options = {}) {
  return run('npm', args, options);
}

function gh(args, options = {}) {
  return run('gh', args, options);
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

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runLocalChecks() {
  npm(['run', 'lint'], { stdio: 'inherit' });
  npm(['test'], { stdio: 'inherit' });
  npm(['run', 'pack:check'], { stdio: 'inherit' });
}

function assertGhAuthenticated() {
  try {
    gh(['auth', 'status']);
  } catch {
    throw new Error(
      'GitHub CLI auth is required for one-command release. Run `gh auth login` first.'
    );
  }
}

function resolveRepositoryFullName(remoteUrl) {
  const match = remoteUrl.match(
    /^(?:git@[^:]+:|ssh:\/\/git@[^/]+\/|https:\/\/[^/]+\/)(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?$/
  );

  if (!match) {
    throw new Error(`Cannot parse GitHub repository from origin URL: ${remoteUrl}`);
  }

  return `${match.groups.owner}/${match.groups.repo}`;
}

function getRepositoryFullName() {
  return resolveRepositoryFullName(git(['remote', 'get-url', 'origin']));
}

function resolveReleaseBranch(version) {
  return `codex/release-${version}-${Date.now()}`;
}

function createReleaseCommit(version, releaseTag) {
  npm(['version', version], { stdio: 'inherit' });
  npm(['run', 'release:check'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      RELEASE_TAG: releaseTag,
    },
  });
}

function resolveReleaseTypeFromVersion(version) {
  if (version.includes('-beta.')) {
    return 'beta';
  }

  if (version.includes('-')) {
    return 'hotfix';
  }

  return 'stable';
}

function openReleasePullRequest(branch, releaseTag) {
  const releaseType = resolveReleaseTypeFromVersion(releaseTag.slice(1));
  const prUrl = gh([
    'pr',
    'create',
    '--base',
    'main',
    '--head',
    branch,
    '--title',
    `Release ${releaseTag}`,
    '--body',
    [
      '## Summary',
      `- Bump package version and changelog for ${releaseTag}`,
      '',
      '## Validation',
      '- npm run lint',
      '- npm test',
      '- npm run pack:check',
      '- npm run release:check',
      '',
      `This PR was generated by \`npm run release -- ${releaseType}\`.`,
    ].join('\n'),
  ]);
  const match = prUrl.match(/\/pull\/(?<number>\d+)$/);

  if (!match) {
    throw new Error(`Cannot parse pull request number from: ${prUrl}`);
  }

  return {
    number: Number(match.groups.number),
    url: prUrl,
  };
}

function enableAutoMerge(prNumber, repositoryFullName) {
  gh([
    'pr',
    'merge',
    String(prNumber),
    '--repo',
    repositoryFullName,
    '--squash',
    '--auto',
    '--delete-branch',
  ]);
}

function waitForPullRequestChecks(prNumber, repositoryFullName) {
  gh(
    [
      'pr',
      'checks',
      String(prNumber),
      '--repo',
      repositoryFullName,
      '--watch',
    ],
    { stdio: 'inherit' }
  );
}

function waitForPullRequestMerge(prNumber, repositoryFullName, startedAt = Date.now()) {
  while (Date.now() - startedAt < RELEASE_TIMEOUT_MS) {
    const pullRequest = JSON.parse(
      gh([
        'pr',
        'view',
        String(prNumber),
        '--repo',
        repositoryFullName,
        '--json',
        'state,mergeCommit,url',
      ])
    );

    if (pullRequest.state === 'MERGED' && pullRequest.mergeCommit?.oid) {
      return {
        mergeCommitSha: pullRequest.mergeCommit.oid,
        url: pullRequest.url,
      };
    }

    if (pullRequest.state === 'CLOSED') {
      throw new Error(`Release PR was closed without merge: ${pullRequest.url}`);
    }

    sleep(RELEASE_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for release PR #${prNumber} to merge.`);
}

function publishReleaseTag(releaseTag, mergeCommitSha) {
  git(['tag', '-fa', releaseTag, mergeCommitSha, '-m', releaseTag.slice(1)], {
    stdio: 'inherit',
  });
  git(['push', 'origin', releaseTag], { stdio: 'inherit' });
}

function dispatchReleaseWorkflow(releaseTag, repositoryFullName) {
  const runUrl = gh([
    'workflow',
    'run',
    RELEASE_WORKFLOW_FILE,
    '--repo',
    repositoryFullName,
    '--ref',
    'main',
    '-f',
    `tag=${releaseTag}`,
    '-f',
    'publish=true',
  ]);
  const match = runUrl.match(/\/runs\/(?<id>\d+)$/);

  if (!match) {
    throw new Error(`Cannot parse release workflow run id from: ${runUrl}`);
  }

  return {
    id: Number(match.groups.id),
    url: runUrl,
  };
}

function approvePendingDeployments(repositoryFullName, runId) {
  const deployments = JSON.parse(
    gh(['api', `repos/${repositoryFullName}/actions/runs/${runId}/pending_deployments`])
  );
  const environmentIds = deployments
    .filter(
      (deployment) =>
        deployment.current_user_can_approve &&
        deployment.environment?.name === RELEASE_ENVIRONMENT_NAME
    )
    .map((deployment) => deployment.environment.id);

  if (environmentIds.length === 0) {
    return false;
  }

  gh(
    [
      'api',
      `repos/${repositoryFullName}/actions/runs/${runId}/pending_deployments`,
      '--method',
      'POST',
      '--input',
      '-',
    ],
    {
      input: JSON.stringify({
        environment_ids: environmentIds,
        state: 'approved',
        comment: 'Approve one-command npm release.',
      }),
    }
  );

  return true;
}

function waitForReleaseWorkflow(runId, repositoryFullName, startedAt = Date.now()) {
  let approvedDeployment = false;

  while (Date.now() - startedAt < RELEASE_TIMEOUT_MS) {
    const releaseRun = JSON.parse(
      gh([
        'run',
        'view',
        String(runId),
        '--repo',
        repositoryFullName,
        '--json',
        'status,conclusion,url',
      ])
    );

    if (releaseRun.status === 'completed') {
      if (releaseRun.conclusion === 'success') {
        return releaseRun.url;
      }

      throw new Error(
        `Release workflow failed: ${releaseRun.url} (${releaseRun.conclusion || 'unknown'})`
      );
    }

    if (releaseRun.status === 'waiting' && !approvedDeployment) {
      approvedDeployment = approvePendingDeployments(repositoryFullName, runId);
    }

    sleep(RELEASE_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for release workflow run ${runId}.`);
}

function verifyPublishedRelease(version, releaseTag, repositoryFullName) {
  npm(['view', `${pkg.name}@${version}`, 'version']);
  const release = JSON.parse(
    gh([
      'release',
      'view',
      releaseTag,
      '--repo',
      repositoryFullName,
      '--json',
      'url',
    ])
  );

  return release.url;
}

function cleanupReleaseBranch(branch, originalBranch) {
  if (git(['branch', '--show-current']) === branch) {
    git(['switch', originalBranch], { stdio: 'inherit' });
  }

  git(['branch', '-D', branch], { stdio: 'inherit' });
}

function createRelease(version, originalBranch) {
  const releaseTag = `v${version}`;
  const releaseBranch = resolveReleaseBranch(version);
  const repositoryFullName = getRepositoryFullName();

  assertGhAuthenticated();
  git(['switch', '-c', releaseBranch, 'origin/main'], { stdio: 'inherit' });

  try {
    createReleaseCommit(version, releaseTag);
    git(['push', 'origin', `HEAD:refs/heads/${releaseBranch}`], { stdio: 'inherit' });

    const pullRequest = openReleasePullRequest(releaseBranch, releaseTag);
    console.log(`Release PR opened: ${pullRequest.url}`);
    enableAutoMerge(pullRequest.number, repositoryFullName);
    waitForPullRequestChecks(pullRequest.number, repositoryFullName);

    const mergeResult = waitForPullRequestMerge(pullRequest.number, repositoryFullName);
    console.log(`Release PR merged: ${mergeResult.url}`);

    git(['fetch', '--no-tags', 'origin', '+refs/heads/main:refs/remotes/origin/main'], {
      stdio: 'inherit',
    });
    publishReleaseTag(releaseTag, mergeResult.mergeCommitSha);

    const releaseWorkflow = dispatchReleaseWorkflow(releaseTag, repositoryFullName);
    console.log(`Release workflow dispatched: ${releaseWorkflow.url}`);
    waitForReleaseWorkflow(releaseWorkflow.id, repositoryFullName);

    const releaseUrl = verifyPublishedRelease(version, releaseTag, repositoryFullName);
    console.log(`Release ${releaseTag} published: ${releaseUrl}`);
    return releaseTag;
  } finally {
    cleanupReleaseBranch(releaseBranch, originalBranch);
  }
}

function main(argv = process.argv.slice(2), env = process.env) {
  const { releaseType, dryRun } = parseArgs(argv);
  const originalBranch = git(['branch', '--show-current']);

  if (!originalBranch) {
    throw new Error('Release must run from a named branch, current checkout is detached HEAD.');
  }

  assertCleanWorktree();

  git(['fetch', '--no-tags', 'origin', '+refs/heads/main:refs/remotes/origin/main'], {
    stdio: 'inherit',
  });
  git(['fetch', '--tags', 'origin'], { stdio: 'inherit' });

  const releaseDate = resolveReleaseDate(env);
  const version = resolveNextVersion(releaseType, releaseDate, listGitTags());

  if (dryRun) {
    console.log(`Next ${releaseType} release: v${version}`);
    return version;
  }

  runLocalChecks();
  const releaseTag = createRelease(version, originalBranch);
  console.log(`Release ${releaseTag} completed.`);
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
  resolveRepositoryFullName,
  resolveReleaseBranch,
  assertMatchingRefs,
  main,
};
