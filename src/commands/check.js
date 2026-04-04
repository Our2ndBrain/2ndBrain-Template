/**
 * 2ndBrain CLI - Check Command
 *
 * Cross-platform environment check. All platform detection is handled
 * in Node.js — agents never need to write shell/PowerShell scripts.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { is2ndBrainProject } = require('../lib/config');

const MIN_NODE_MAJOR = 18;

function commandExists(cmd) {
  try {
    const isWin = process.platform === 'win32';
    if (isWin) {
      execFileSync('where', [cmd], { stdio: 'pipe' });
    } else {
      execFileSync('which', [cmd], { stdio: 'pipe' });
    }
    return true;
  } catch {
    return false;
  }
}

function getCommandVersion(cmd, args = ['--version']) {
  try {
    return execFileSync(cmd, args, { stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function checkObsidianInstalled() {
  switch (process.platform) {
    case 'darwin':
      return fs.existsSync('/Applications/Obsidian.app');
    case 'win32': {
      const localAppData = process.env.LOCALAPPDATA || '';
      return fs.existsSync(path.join(localAppData, 'Programs', 'Obsidian', 'Obsidian.exe'));
    }
    default:
      return commandExists('obsidian');
  }
}

function getObsidianInstallHint() {
  switch (process.platform) {
    case 'darwin':
      return 'brew install --cask obsidian  (或从 https://obsidian.md/ 下载)';
    case 'win32':
      return 'winget install Obsidian.MD.Obsidian  (或从 https://obsidian.md/ 下载)';
    default:
      return '从 https://obsidian.md/ 下载 AppImage';
  }
}

function getNodeInstallHint() {
  switch (process.platform) {
    case 'darwin':
      return 'brew install node';
    case 'win32':
      return 'winget install OpenJS.NodeJS.LTS  (或从 https://nodejs.org/ 下载)';
    default:
      return 'sudo apt install nodejs npm  (Debian/Ubuntu) 或从 https://nodejs.org/ 下载';
  }
}

function getObsidianCLIPathHint() {
  switch (process.platform) {
    case 'darwin':
      return '在 ~/.zshrc 中添加:\nexport PATH="$PATH:/Applications/Obsidian.app/Contents/MacOS"';
    case 'win32':
      return '系统设置 → 环境变量 → Path → 新增:\nC:\\Users\\<用户名>\\AppData\\Local\\Programs\\Obsidian\\';
    default:
      return 'sudo ln -s /opt/obsidian/obsidian /usr/local/bin/obsidian';
  }
}

async function check(targetPath, _options, log) {
  const results = [];
  let allPassed = true;

  log.info('\n🧠 2ndBrain 环境检测\n');

  // 1. Node.js version
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (nodeMajor >= MIN_NODE_MAJOR) {
    results.push({ ok: true, label: `Node.js ${nodeVersion}` });
  } else {
    results.push({
      ok: false,
      label: `Node.js ${nodeVersion} (需要 >= ${MIN_NODE_MAJOR})`,
      hint: getNodeInstallHint(),
    });
    allPassed = false;
  }

  // 2. Git
  const gitVersion = getCommandVersion('git');
  if (gitVersion) {
    results.push({ ok: true, label: `Git ${gitVersion.replace('git version ', '')}` });
  } else {
    results.push({
      ok: false,
      label: 'Git 未安装',
      hint: process.platform === 'win32'
        ? 'winget install Git.Git'
        : process.platform === 'darwin'
          ? 'brew install git'
          : 'sudo apt install git',
    });
    allPassed = false;
  }

  // 3. Obsidian app
  if (checkObsidianInstalled()) {
    results.push({ ok: true, label: 'Obsidian 已安装' });
  } else {
    results.push({
      ok: false,
      label: 'Obsidian 未安装',
      hint: getObsidianInstallHint(),
    });
    allPassed = false;
  }

  // 4. Obsidian CLI
  if (commandExists('obsidian')) {
    const obsVersion = getCommandVersion('obsidian');
    results.push({ ok: true, label: `Obsidian CLI ${obsVersion || '可用'}` });
  } else {
    results.push({
      ok: false,
      label: 'Obsidian CLI 未配置',
      hint: `在 Obsidian Settings > General > CLI 中启用，然后配置 PATH:\n${getObsidianCLIPathHint()}`,
    });
    // Obsidian CLI is optional, don't fail the whole check
  }

  // 5. 2ndBrain project (if path given)
  const resolvedPath = path.resolve(targetPath);
  if (fs.existsSync(resolvedPath)) {
    if (is2ndBrainProject(resolvedPath)) {
      results.push({ ok: true, label: `2ndBrain 知识库: ${resolvedPath}` });
    } else {
      results.push({
        ok: false,
        label: `${resolvedPath} 不是 2ndBrain 知识库`,
        hint: `运行: 2ndbrain init ${targetPath}`,
      });
    }
  }

  // 6. Agent CLI (openclaw or claude)
  if (commandExists('openclaw')) {
    results.push({ ok: true, label: 'OpenClaw CLI 可用' });
  } else if (commandExists('claude')) {
    results.push({ ok: true, label: 'Claude CLI 可用' });
  } else {
    results.push({
      ok: false,
      label: 'Agent CLI 未找到 (openclaw / claude)',
      hint: '安装 OpenClaw: https://docs.openclaw.ai/start\n或 Claude Code: https://code.claude.com',
    });
  }

  // Print results
  for (const r of results) {
    if (r.ok) {
      log.success(`  ✓ ${r.label}`);
    } else {
      log.error(`  ✗ ${r.label}`);
      if (r.hint) {
        log.warn(`    → ${r.hint.split('\n').join('\n    → ')}`);
      }
    }
  }

  log.info('');

  if (allPassed) {
    log.success('所有必要组件已就绪 ✓\n');
  } else {
    log.warn('部分组件缺失，请按上方提示安装\n');
  }

  return allPassed;
}

module.exports = check;
module.exports.MIN_NODE_MAJOR = MIN_NODE_MAJOR;
module.exports.commandExists = commandExists;
module.exports.getCommandVersion = getCommandVersion;
module.exports.checkObsidianInstalled = checkObsidianInstalled;
