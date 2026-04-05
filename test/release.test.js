const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DATE_VERSION_PATTERN,
  RELEASE_TAG_PATTERN,
  assertMonotonicVersion,
  isValidCalendarDate,
  parseArgs,
  parseReleaseVersion,
  parseReleaseTags,
  resolveNextVersion,
  resolveReleaseBranch,
  resolveReleaseDate,
  resolveRepositoryFullName,
  resolveReleaseWorkflowRun,
  assertMatchingRefs,
} = require('../scripts/release');

const RELEASE_BASELINE_VERSION = '1.1.3';

test('release date format requires YYYY.M.D without zero-padded month/day', () => {
  assert.equal(DATE_VERSION_PATTERN.test('2026.4.4'), true);
  assert.equal(DATE_VERSION_PATTERN.test('2026.12.31'), true);
  assert.equal(DATE_VERSION_PATTERN.test('2026.04.04'), false);
  assert.equal(DATE_VERSION_PATTERN.test('26.4.4'), false);
  assert.equal(isValidCalendarDate(2026, 4, 30), true);
  assert.equal(isValidCalendarDate(2024, 2, 29), true);
  assert.equal(isValidCalendarDate(2025, 2, 29), false);
  assert.equal(isValidCalendarDate(2026, 13, 1), false);
});

test('release tag parser accepts stable, beta, and hotfix tags only', () => {
  assert.equal(RELEASE_TAG_PATTERN.test('v2026.4.4'), true);
  assert.equal(RELEASE_TAG_PATTERN.test('v2026.4.4-1'), true);
  assert.equal(RELEASE_TAG_PATTERN.test('v2026.4.4-beta.1'), true);
  assert.equal(RELEASE_TAG_PATTERN.test('v2026.4.4-beta.01'), false);
  assert.equal(RELEASE_TAG_PATTERN.test('v2026.04.04'), false);
  assert.equal(RELEASE_TAG_PATTERN.test('v1.1.3'), false);
  assert.equal(RELEASE_TAG_PATTERN.test('2026.4.4'), false);

  assert.deepEqual(parseReleaseTags(['v2026.4.4', 'v2026.4.4-2', 'v2026.4.4-beta.3']), [
    { tag: 'v2026.4.4', base: '2026.4.4', beta: null, hotfix: null },
    { tag: 'v2026.4.4-2', base: '2026.4.4', beta: null, hotfix: 2 },
    { tag: 'v2026.4.4-beta.3', base: '2026.4.4', beta: 3, hotfix: null },
  ]);

  assert.deepEqual(parseReleaseVersion('2026.4.4-beta.3'), {
    tag: 'v2026.4.4-beta.3',
    base: '2026.4.4',
    year: 2026,
    month: 4,
    day: 4,
    stage: 'beta',
    stageOrder: 0,
    stageNumber: 3,
    beta: 3,
    hotfix: null,
  });
  assert.equal(parseReleaseVersion('1.1.3'), null);
  assert.equal(parseReleaseVersion('2026.13.40'), null);
  assert.equal(parseReleaseVersion('2025.2.29'), null);
});

test('release argument parser supports stable, beta, hotfix, and --dry-run', () => {
  assert.deepEqual(parseArgs(['stable']), {
    releaseType: 'stable',
    dryRun: false,
  });
  assert.deepEqual(parseArgs(['beta', '--dry-run']), {
    releaseType: 'beta',
    dryRun: true,
  });
  assert.throws(() => parseArgs(['patch']), /Usage: npm run release/);
});

test('resolveReleaseDate uses local calendar date and supports RELEASE_DATE override', () => {
  assert.equal(resolveReleaseDate({}, new Date('2026-04-04T10:20:30')), '2026.4.4');
  assert.equal(resolveReleaseDate({ RELEASE_DATE: '2026.12.31' }), '2026.12.31');
  assert.throws(
    () => resolveReleaseDate({ RELEASE_DATE: '2026-12-31' }),
    /Invalid release date/
  );
  assert.throws(
    () => resolveReleaseDate({ RELEASE_DATE: '2026.13.40' }),
    /Expected a real calendar date/
  );
});

test('resolveNextVersion creates stable, beta, and hotfix versions from existing tags', () => {
  assert.equal(
    resolveNextVersion('stable', '2026.4.4', ['v1.1.3'], RELEASE_BASELINE_VERSION),
    '2026.4.4'
  );
  assert.equal(
    resolveNextVersion(
      'beta',
      '2026.4.4',
      ['v2026.4.4-beta.1', 'v2026.4.4-beta.2'],
      RELEASE_BASELINE_VERSION
    ),
    '2026.4.4-beta.3'
  );
  assert.equal(
    resolveNextVersion(
      'hotfix',
      '2026.4.4',
      ['v2026.4.4', 'v2026.4.4-1'],
      RELEASE_BASELINE_VERSION
    ),
    '2026.4.4-2'
  );
});

test('resolveNextVersion rejects conflicting same-day release lanes', () => {
  assert.throws(
    () => resolveNextVersion('stable', '2026.4.4', ['v2026.4.4'], RELEASE_BASELINE_VERSION),
    /Stable release 2026.4.4 already exists/
  );
  assert.throws(
    () =>
      resolveNextVersion('hotfix', '2026.4.4', ['v2026.4.4-beta.1'], RELEASE_BASELINE_VERSION),
    /Cannot create 2026.4.4-N before 2026.4.4 exists/
  );
  assert.throws(
    () => resolveNextVersion('beta', '2026.4.4', ['v2026.4.4'], RELEASE_BASELINE_VERSION),
    /Cannot create 2026.4.4-beta.N after a same-day stable release/
  );
});

test('resolveNextVersion rejects versions older than tags or package.json', () => {
  assert.throws(
    () =>
      resolveNextVersion(
        'hotfix',
        '2026.4.4',
        ['v2026.4.4', 'v2026.4.5'],
        RELEASE_BASELINE_VERSION
      ),
    /must be newer than current release line 2026\.4\.5/
  );
  assert.throws(
    () => resolveNextVersion('stable', '2026.4.4', [], '2026.4.5'),
    /must be newer than current release line 2026\.4\.5/
  );
  assert.doesNotThrow(() =>
    assertMonotonicVersion('2026.4.5', ['v2026.4.4-beta.2'], RELEASE_BASELINE_VERSION)
  );
});

test('release requires local main HEAD to exactly match origin/main', () => {
  assert.doesNotThrow(() => assertMatchingRefs('abc123', 'abc123'));
  assert.throws(
    () => assertMatchingRefs('abc123', 'def456'),
    /Local main must exactly match origin\/main before releasing/
  );
});

test('resolveRepositoryFullName parses common GitHub origin URLs', () => {
  assert.equal(
    resolveRepositoryFullName('git@github.com:Our2ndBrain/2ndBrain-Template.git'),
    'Our2ndBrain/2ndBrain-Template'
  );
  assert.equal(
    resolveRepositoryFullName('ssh://git@github.com/Our2ndBrain/2ndBrain-Template.git'),
    'Our2ndBrain/2ndBrain-Template'
  );
  assert.equal(
    resolveRepositoryFullName('https://github.com/Our2ndBrain/2ndBrain-Template.git'),
    'Our2ndBrain/2ndBrain-Template'
  );
  assert.throws(() => resolveRepositoryFullName('file:///tmp/repo'), /Cannot parse/);
});

test('resolveReleaseBranch generates a version-scoped release branch name', () => {
  assert.match(resolveReleaseBranch('2026.4.4'), /^codex\/release-2026\.4\.4-\d+$/);
});

test('resolveReleaseWorkflowRun prefers the push-triggered run for the published tag', () => {
  assert.deepEqual(
    resolveReleaseWorkflowRun(
      [
        {
          id: 101,
          event: 'workflow_dispatch',
          head_branch: 'main',
          head_sha: 'abc123',
          html_url: 'https://github.com/Our2ndBrain/2ndBrain-Template/actions/runs/101',
        },
        {
          id: 102,
          event: 'push',
          head_branch: 'v2026.4.4',
          head_sha: 'abc123',
          html_url: 'https://github.com/Our2ndBrain/2ndBrain-Template/actions/runs/102',
        },
      ],
      'v2026.4.4',
      'abc123'
    ),
    {
      id: 102,
      event: 'push',
      head_branch: 'v2026.4.4',
      head_sha: 'abc123',
      html_url: 'https://github.com/Our2ndBrain/2ndBrain-Template/actions/runs/102',
    }
  );

  assert.equal(
    resolveReleaseWorkflowRun(
      [
        {
          id: 103,
          event: 'push',
          head_branch: 'v2026.4.3',
          head_sha: 'def456',
          html_url: 'https://github.com/Our2ndBrain/2ndBrain-Template/actions/runs/103',
        },
      ],
      'v2026.4.4',
      'abc123'
    ),
    null
  );
});
