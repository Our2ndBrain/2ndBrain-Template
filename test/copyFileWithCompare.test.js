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
