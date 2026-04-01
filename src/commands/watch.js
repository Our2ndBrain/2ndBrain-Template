/**
 * 2ndBrain CLI - Watch Command
 *
 * File watcher that monitors To-Do files for changes and triggers
 * lightweight inbox organization via openclaw/claude agent CLI.
 * Pure Node.js — works on macOS, Windows, and Linux.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync, spawn } = require('child_process');
const { is2ndBrainProject } = require('../lib/config');

const DEFAULT_INTERVAL_MINUTES = 5;
const LOCK_FILE = '.2ndbrain-watch-lock';

function detectAgentCLI() {
  const isWin = process.platform === 'win32';
  const whichCmd = isWin ? 'where' : 'which';

  try {
    execFileSync(whichCmd, ['openclaw'], { stdio: 'pipe' });
    return 'openclaw';
  } catch { /* not found */ }

  try {
    execFileSync(whichCmd, ['claude'], { stdio: 'pipe' });
    return 'claude';
  } catch { /* not found */ }

  return null;
}

function buildOrganizePrompt(vaultPath) {
  return [
    '你已安装 2ndbrain skill。请按照该 skill 的整理指令集执行：',
    '1. 读取所有 10_Inbox/*/00_To-Do.md 中 ## Inbox 下的未分类任务',
    '2. 分类、打标签、移动到项目 Heading',
    '3. 完成的任务归档到 09_Done.md',
    '4. 生成整理报告写入当日日记',
    `Vault 路径: ${vaultPath}`,
  ].join('\n');
}

function triggerAgent(agentCLI, vaultPath, log) {
  const prompt = buildOrganizePrompt(vaultPath);

  let child;
  if (agentCLI === 'openclaw') {
    child = spawn('openclaw', ['agent', '--agent', 'main', '--message', prompt, '--local'], {
      stdio: 'ignore',
      detached: true,
      cwd: vaultPath,
    });
  } else {
    child = spawn('claude', ['-p', prompt], {
      stdio: 'ignore',
      detached: true,
      cwd: vaultPath,
    });
  }

  child.unref();
  log.info(`  → 已触发 ${agentCLI} 执行整理 (PID: ${child.pid})`);
  return child.pid;
}

function findToDoFiles(vaultPath) {
  const inboxDir = path.join(vaultPath, '10_Inbox');
  if (!fs.existsSync(inboxDir)) return [];

  const files = [];
  try {
    const entries = fs.readdirSync(inboxDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'Agents') continue;
      const todoFile = path.join(inboxDir, entry.name, '00_To-Do.md');
      if (fs.existsSync(todoFile)) {
        files.push(todoFile);
      }
    }
  } catch { /* ignore read errors */ }
  return files;
}

async function watch(targetPath, options, log) {
  const vaultPath = path.resolve(targetPath);
  const intervalMinutes = options.interval || DEFAULT_INTERVAL_MINUTES;
  const once = options.once || false;

  if (!is2ndBrainProject(vaultPath)) {
    log.error(`${vaultPath} 不是 2ndBrain 知识库。请先运行: 2ndbrain init ${targetPath}`);
    process.exit(1);
  }

  const agentCLI = detectAgentCLI();
  if (!agentCLI) {
    log.error('未找到 Agent CLI (openclaw / claude)。');
    log.warn('请安装 OpenClaw (https://docs.openclaw.ai/start) 或 Claude Code (https://code.claude.com)');
    process.exit(1);
  }

  const todoFiles = findToDoFiles(vaultPath);
  if (todoFiles.length === 0) {
    log.error('未找到任何 To-Do 文件。请先运行: 2ndbrain member <name>');
    process.exit(1);
  }

  log.info('\n🧠 2ndBrain Watch 模式\n');
  log.info(`  知识库: ${vaultPath}`);
  log.info(`  Agent CLI: ${agentCLI}`);
  log.info(`  防抖间隔: ${intervalMinutes} 分钟`);
  log.info(`  监听文件:`);
  for (const f of todoFiles) {
    log.info(`    - ${path.relative(vaultPath, f)}`);
  }
  log.info('\n  按 Ctrl+C 退出\n');

  const lockFile = path.join(vaultPath, LOCK_FILE);
  let debounceTimer = null;
  const watchers = [];

  function isLocked() {
    if (!fs.existsSync(lockFile)) return false;
    try {
      const lockTime = parseInt(fs.readFileSync(lockFile, 'utf8'), 10);
      // Lock expires after 30 minutes
      if (Date.now() - lockTime > 30 * 60 * 1000) {
        fs.unlinkSync(lockFile);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  function acquireLock() {
    fs.writeFileSync(lockFile, String(Date.now()));
  }

  function releaseLock() {
    try { fs.unlinkSync(lockFile); } catch { /* ignore */ }
  }

  function onFileChange(filename) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const now = new Date().toLocaleTimeString();
    log.info(`  [${now}] 检测到变化: ${filename}`);
    log.info(`  [${now}] 等待 ${intervalMinutes} 分钟后触发整理...`);

    debounceTimer = setTimeout(() => {
      if (isLocked()) {
        log.warn('  上一次整理尚未完成，跳过本次触发');
        return;
      }

      acquireLock();
      const triggerTime = new Date().toLocaleTimeString();
      log.success(`  [${triggerTime}] 防抖结束，触发整理`);

      triggerAgent(agentCLI, vaultPath, log);

      // Release lock after a reasonable time
      setTimeout(() => releaseLock(), 10 * 60 * 1000);

      if (once) {
        log.info('\n  --once 模式，退出\n');
        cleanup();
        process.exit(0);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Set up file watchers
  for (const todoFile of todoFiles) {
    try {
      const watcher = fs.watch(todoFile, (eventType) => {
        if (eventType === 'change') {
          onFileChange(path.relative(vaultPath, todoFile));
        }
      });
      watchers.push(watcher);
    } catch (err) {
      log.warn(`  无法监听 ${path.relative(vaultPath, todoFile)}: ${err.message}`);
    }
  }

  function cleanup() {
    if (debounceTimer) clearTimeout(debounceTimer);
    for (const w of watchers) {
      try { w.close(); } catch { /* ignore */ }
    }
    releaseLock();
  }

  process.on('SIGINT', () => {
    log.info('\n\n  正在退出...\n');
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}

module.exports = watch;
