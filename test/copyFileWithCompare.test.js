const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const { copyFileWithCompare } = require('../src/lib/files');

test('copyFileWithCompare reports line additions/removals against previous destination content', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), '2ndbrain-copy-'));
  const src = path.join(tempDir, 'src.md');
  const dest = path.join(tempDir, 'dest.md');

  try {
    await fs.writeFile(src, 'line-a\nline-b\nline-c\n', 'utf8');
    await fs.writeFile(dest, 'line-a\nline-old\n', 'utf8');

    const result = await copyFileWithCompare(src, dest);

    assert.equal(result.copied, true);
    assert.equal(result.unchanged, false);
    assert.deepEqual(result.change, { added: 2, removed: 1 });
  } finally {
    await fs.remove(tempDir);
  }
});

test('copyFileWithCompare returns unchanged when source and destination are equal', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), '2ndbrain-copy-'));
  const src = path.join(tempDir, 'src.md');
  const dest = path.join(tempDir, 'dest.md');

  try {
    await fs.writeFile(src, 'same-content\n', 'utf8');
    await fs.writeFile(dest, 'same-content\n', 'utf8');

    const result = await copyFileWithCompare(src, dest);

    assert.equal(result.copied, false);
    assert.equal(result.unchanged, true);
    assert.equal(result.error, undefined);
  } finally {
    await fs.remove(tempDir);
  }
});

test('copyFileWithCompare does not write destination during dry run', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), '2ndbrain-copy-'));
  const src = path.join(tempDir, 'src.md');
  const dest = path.join(tempDir, 'dest.md');

  try {
    await fs.writeFile(src, 'new-content\n', 'utf8');
    await fs.writeFile(dest, 'old-content\n', 'utf8');

    const result = await copyFileWithCompare(src, dest, { dryRun: true });
    const destContent = await fs.readFile(dest, 'utf8');

    assert.equal(result.copied, false);
    assert.equal(result.unchanged, false);
    assert.deepEqual(result.change, { added: 1, removed: 1 });
    assert.equal(destContent, 'old-content\n');
  } finally {
    await fs.remove(tempDir);
  }
});

test('copyFileWithCompare falls back to README.md for AGENTS.md when source symlink is missing', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), '2ndbrain-copy-'));
  const src = path.join(tempDir, 'AGENTS.md');
  const readme = path.join(tempDir, 'README.md');
  const dest = path.join(tempDir, 'dest', 'AGENTS.md');

  try {
    await fs.writeFile(readme, '# fallback docs\n', 'utf8');

    const result = await copyFileWithCompare(src, dest);
    const copiedContent = await fs.readFile(dest, 'utf8');

    assert.equal(result.copied, true);
    assert.equal(result.unchanged, false);
    assert.equal(copiedContent, '# fallback docs\n');
  } finally {
    await fs.remove(tempDir);
  }
});
