const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DATE_VERSION_PATTERN,
  RELEASE_TAG_PATTERN,
  parseArgs,
  parseReleaseTags,
  resolveNextVersion,
  resolveReleaseDate,
  assertMatchingRefs,
} = require('../scripts/release');

test('release date format requires YYYY.M.D without zero-padded month/day', () => {
  assert.equal(DATE_VERSION_PATTERN.test('2026.4.4'), true);
  assert.equal(DATE_VERSION_PATTERN.test('2026.12.31'), true);
  assert.equal(DATE_VERSION_PATTERN.test('2026.04.04'), false);
  assert.equal(DATE_VERSION_PATTERN.test('26.4.4'), false);
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
});

test('resolveNextVersion creates stable, beta, and hotfix versions from existing tags', () => {
  assert.equal(resolveNextVersion('stable', '2026.4.4', ['v1.1.3']), '2026.4.4');
  assert.equal(
    resolveNextVersion('beta', '2026.4.4', ['v2026.4.4-beta.1', 'v2026.4.4-beta.2']),
    '2026.4.4-beta.3'
  );
  assert.equal(
    resolveNextVersion('hotfix', '2026.4.4', ['v2026.4.4', 'v2026.4.4-1']),
    '2026.4.4-2'
  );
});

test('resolveNextVersion rejects conflicting same-day release lanes', () => {
  assert.throws(
    () => resolveNextVersion('stable', '2026.4.4', ['v2026.4.4']),
    /Stable release 2026.4.4 already exists/
  );
  assert.throws(
    () => resolveNextVersion('hotfix', '2026.4.4', ['v2026.4.4-beta.1']),
    /Cannot create 2026.4.4-N before 2026.4.4 exists/
  );
  assert.throws(
    () => resolveNextVersion('beta', '2026.4.4', ['v2026.4.4']),
    /Cannot create 2026.4.4-beta.N after a same-day stable release/
  );
});

test('release requires local main HEAD to exactly match origin/main', () => {
  assert.doesNotThrow(() => assertMatchingRefs('abc123', 'abc123'));
  assert.throws(
    () => assertMatchingRefs('abc123', 'def456'),
    /Local main must exactly match origin\/main before releasing/
  );
});
