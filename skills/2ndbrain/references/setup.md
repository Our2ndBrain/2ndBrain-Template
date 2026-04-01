# 安装引导

**重要：不要使用 PowerShell、cmd、bat、bash 等平台特定命令。所有步骤只用 `git`、`npm`、`node`、`2ndbrain` 这四个命令。不要写 `Set-Location`、`New-Item`、`$env:`、`Test-Path`、`Get-ChildItem` 等。Windows 上 `~` 由 git/npm 自动解析为用户目录，不需要手动替换为 `%USERPROFILE%`。**

包不在 npm 上，从 GitHub 克隆后本地安装。所有平台检测封装在 CLI 里，你不需要写任何 shell 脚本。

## 安装 CLI（一次性）

按顺序执行以下 4 个命令（macOS/Windows/Linux 通用，无需修改）：

```
git clone https://github.com/Our2ndBrain/2ndBrain-Template.git ~/.2ndbrain-cli
```

```
cd ~/.2ndbrain-cli && npm install
```

```
npm link
```

```
2ndbrain check
```

安装完成后 `2ndbrain` 命令全局可用。`npm link` 在 Windows/macOS/Linux 上都能正确创建全局命令。

> 如果 `npm link` 报权限错误（Linux/macOS），提示用户运行 `sudo npm link`。Windows 上以管理员身份运行终端。

## 初始化知识库

```
2ndbrain init <vault-path>
```

`<vault-path>` 替换为用户想要的知识库路径，例如 `~/Documents/my-brain`。

```
2ndbrain member <name>
```

`<name>` 替换为用户的名字，例如 `Alice`。这会创建：
- `10_Inbox/Alice/00_To-Do.md` — 个人待办清单
- `10_Inbox/Alice/01_Tasks.md` — 个人任务看板
- `10_Inbox/Alice/09_Done.md` — 完成归档
- `.obsidian/daily-notes.json` — 日记配置

## 引导用户打开 Obsidian

告诉用户：

1. 打开 Obsidian 应用（如未安装，`2ndbrain check` 会给出安装提示）
2. 选择「打开本地仓库」（Open folder as vault）
3. 选择刚才创建的知识库目录
4. 弹出「信任作者并启用插件」时，点击确认

插件已预装在 `.obsidian/plugins/` 中，信任即可启用，无需手动安装。

## 启用 Obsidian CLI（可选但推荐）

Obsidian CLI 让 Agent 能通过命令行操作知识库，需要 Obsidian v1.12.4+。

告诉用户：

1. 打开 Obsidian Settings（齿轮图标）
2. 找到 General 页面
3. 找到 Command line interface 选项
4. 点击 Enable
5. 按提示将 CLI 注册到系统 PATH

PATH 配置：`2ndbrain check` 会检测 Obsidian CLI 是否可用。如果不可用但 Obsidian 已安装，`check` 命令会输出当前操作系统对应的 PATH 配置方法。

## 验证安装

```
2ndbrain check
```

输出应该全部显示 ✓。如果有 ✗，按输出的提示修复。

## 更新 CLI

```
cd ~/.2ndbrain-cli && git pull && npm install
```

## 故障排查

| 问题 | 解决 |
|------|------|
| `2ndbrain` 命令未找到 | 重新运行 `cd ~/.2ndbrain-cli && npm link` |
| `npm link` 权限错误 | Linux/macOS: `sudo npm link`；Windows: 管理员终端 |
| Obsidian CLI 不可用 | 确认 Obsidian >= v1.12.4 且已在 Settings 中启用 CLI |
| `2ndbrain check` 报 Node 版本低 | 升级 Node.js 到 >= 16 |
