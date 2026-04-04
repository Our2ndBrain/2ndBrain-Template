const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const init = require('../src/commands/init');
const member = require('../src/commands/member');
const update = require('../src/commands/update');
const remove = require('../src/commands/remove');
const completion = require('../src/commands/completion');
const check = require('../src/commands/check');

function createLog() {
  const messages = [];
  return {
    messages,
    info: (message) => messages.push(['info', message]),
    success: (message) => messages.push(['success', message]),
    warn: (message) => messages.push(['warn', message]),
    error: (message) => messages.push(['error', message]),
  };
}

async function createTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), '2ndbrain-cli-'));
}

test('init creates a project and refuses to reinitialize without --force', async () => {
  const tempDir = await createTempDir();
  const log = createLog();

  try {
    await init(tempDir, {}, log);

    assert.equal(await fs.pathExists(path.join(tempDir, 'AGENTS.md')), true);
    assert.equal(await fs.pathExists(path.join(tempDir, '00_Dashboard/01_All_Tasks.md')), true);
    assert.equal(await fs.pathExists(path.join(tempDir, '10_Inbox/Agents/Journal.md')), true);
    assert.equal(await fs.pathExists(path.join(tempDir, '20_Areas/.gitkeep')), true);

    await assert.rejects(
      init(tempDir, {}, createLog()),
      /Target directory is already a 2ndBrain project/
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test('member creates member files without changing daily-notes config when --no-config is set', async () => {
  const tempDir = await createTempDir();

  try {
    await init(tempDir, {}, createLog());
    await member('Alex', tempDir, { config: false }, createLog());

    const todoPath = path.join(tempDir, '10_Inbox/Alex/00_To-Do.md');
    const tasksPath = path.join(tempDir, '10_Inbox/Alex/01_Tasks.md');

    assert.equal(await fs.pathExists(todoPath), true);
    assert.equal(await fs.pathExists(tasksPath), true);
    assert.equal(
      await fs.pathExists(path.join(tempDir, '.obsidian/daily-notes.json')),
      false
    );

    const tasksContent = await fs.readFile(tasksPath, 'utf8');
    assert.match(tasksContent, /# 📋 Alex's Tasks/);
    assert.match(tasksContent, /path includes \{\{query\.file\.folder\}\}/);
    assert.equal(tasksContent.includes('{{MEMBER_NAME}}'), false);
  } finally {
    await fs.remove(tempDir);
  }
});

test('update dry-run reports changes without modifying files', async () => {
  const tempDir = await createTempDir();
  const readmePath = path.join(tempDir, 'README.md');
  const log = createLog();

  try {
    await init(tempDir, {}, createLog());
    await fs.writeFile(readmePath, '# stale readme\n', 'utf8');

    await update(tempDir, { dryRun: true }, log);

    assert.equal(await fs.readFile(readmePath, 'utf8'), '# stale readme\n');
    assert.equal(
      log.messages.some(([, message]) => String(message).includes('[DRY RUN]')),
      true
    );
  } finally {
    await fs.remove(tempDir);
  }
});

test('update --yes refreshes framework files and member dashboards', async () => {
  const tempDir = await createTempDir();
  const readmePath = path.join(tempDir, 'README.md');
  const memberDashboardPath = path.join(tempDir, '10_Inbox/Alex/01_Tasks.md');

  try {
    await init(tempDir, {}, createLog());
    await member('Alex', tempDir, { config: false }, createLog());
    await fs.writeFile(readmePath, '# stale readme\n', 'utf8');
    await fs.writeFile(memberDashboardPath, '# stale dashboard\n', 'utf8');

    await update(tempDir, { yes: true }, createLog());

    const readmeContent = await fs.readFile(readmePath, 'utf8');
    const dashboardContent = await fs.readFile(memberDashboardPath, 'utf8');

    assert.match(readmeContent, /# 🧠 2ndBrain/);
    assert.match(dashboardContent, /# 📋 Alex's Tasks/);
    assert.match(dashboardContent, /filename includes To-Do/);
  } finally {
    await fs.remove(tempDir);
  }
});

test('remove --dry-run keeps files and remove --force deletes framework files only', async () => {
  const tempDir = await createTempDir();
  const markerPath = path.join(tempDir, 'AGENTS.md');
  const userDataPath = path.join(tempDir, '20_Areas/.gitkeep');

  try {
    await init(tempDir, {}, createLog());

    await remove(tempDir, { dryRun: true }, createLog());
    assert.equal(await fs.pathExists(markerPath), true);

    await remove(tempDir, { force: true }, createLog());
    assert.equal(await fs.pathExists(markerPath), false);
    assert.equal(await fs.pathExists(userDataPath), true);
  } finally {
    await fs.remove(tempDir);
  }
});

test('completion supports known shells and rejects unsupported shells', () => {
  assert.match(completion('bash'), /check watch completion/);
  assert.match(completion('zsh'), /check:Check environment prerequisites/);
  assert.match(completion('fish'), /__fish_seen_subcommand_from watch/);
  assert.equal(completion('powershell'), null);
});

test('check exports Node.js baseline and reports project path', async () => {
  const tempDir = await createTempDir();
  const log = createLog();

  try {
    await init(tempDir, {}, createLog());

    const passed = await check(tempDir, {}, log);

    assert.equal(check.MIN_NODE_MAJOR, 18);
    assert.equal(typeof passed, 'boolean');
    assert.equal(
      log.messages.some(([, message]) => String(message).includes(`2ndBrain 知识库: ${tempDir}`)),
      true
    );
  } finally {
    await fs.remove(tempDir);
  }
});
