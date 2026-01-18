# 🧠 2ndBrain

> 一套融合 [PARA](#para)、[C-O-R-D](#cord) 工作流与 [Append-and-Review](#append-and-review) 笔记法的个人知识管理方法论。

[简体中文](README.md) | [English](README_en.md)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@our2ndbrain/cli.svg)](https://www.npmjs.com/package/@our2ndbrain/cli)

## ✨ 这是什么？

**2ndBrain** 是一套个人知识管理方法论，融合了 **[PARA](#para)** 组织架构、**[C-O-R-D](#cord)** 工作流与 **Karpathy 的 [Append-and-Review](#append-and-review)** 笔记法——**先记下来，回顾时再整理**，让系统自动汇总任务到看板，你只需专注记录和执行。

> 🛠️ **关于工具**：方法论与工具分离。本仓库提供基于 [Obsidian](https://obsidian.md/) 的开箱即用模板——它本地优先、插件生态丰富，是当前性价比很高的选择。所有数据都是纯文本 Markdown，随时可迁移到任何你喜欢的工具。

核心思路很简单：

- 📥 **先记下来再说**——所有输入先进收集箱，别打断你的心流
- 🏷️ **打个标签就行**——让任务能被系统"抓住"，不会石沉大海
- 📋 **看板帮你选**——回顾时一目了然，不用靠脑子记
- ✅ **只做下一步**——避免选择瘫痪，做完一件是一件

## 📖 目录

- [快速开始](#-快速开始)
- [团队协作](#-团队协作)
- [工作流程](#-工作流程-c-o-r-d)
- [任务约定](#-任务约定)
- [目录结构](#-目录结构-para)
- [核心入口](#-核心入口)
- [Obsidian 插件配置](#-obsidian-插件配置)
- [CLI 命令参考](#-cli-命令参考)
- [延伸阅读](#-延伸阅读)
- [贡献指南](#-贡献指南)

## 🚀 快速开始

### 安装

推荐使用 **npx**（无需安装）：

```bash
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
```

或全局安装：

```bash
npm install -g @our2ndbrain/cli
2ndbrain init my-brain
```

### 初始化你的知识库

```bash
# 1. 创建项目（如已全局安装，直接用 2ndbrain 命令）
npx @our2ndbrain/cli@latest init my-brain
cd my-brain

# 2. 添加你的成员目录
npx @our2ndbrain/cli@latest member yourname

# 3. 用 Obsidian 打开 my-brain 目录，开始使用
```

<details>
<summary><strong>🤖 让 AI 助手帮你设置</strong></summary>

把下面这段话粘贴给任何 AI 助手（Claude、ChatGPT、Cursor 等）：

```
帮我设置 2ndBrain 知识管理系统，按照这个文档操作：
https://raw.githubusercontent.com/Our2ndBrain/2ndBrain-Template/main/README.md
```

</details>

<details>
<summary><strong>📋 已有知识库？一键集成 2ndBrain</strong></summary>

如果你已有 Obsidian 知识库，可以直接运行：

```bash
# 进入你的现有知识库目录
cd my-existing-vault

# 运行 init 命令，它会智能合并框架文件
npx @our2ndbrain/cli@latest init
```

**集成模式特性**：
- ✅ 只创建缺失的框架文件和目录
- ✅ 智能合并 `.obsidian/` 配置，保留你的插件设置
- ✅ 从不修改你的个人数据（20_Areas、30_Projects 等）
- ✅ 自动检测并跳过已存在的内容

</details>

<details>
<summary><strong>🔧 For LLM Agents（AI 助手详细指南）</strong></summary>

如果你是帮助用户设置 2ndBrain 的 AI 助手，请按以下步骤操作：

#### 第一步：确认并安装前置条件

**1. 检查 Node.js**

```bash
# 检查 Node.js 是否可用（需要 v16+）
node --version

# 如果未安装，引导用户安装：
# macOS: brew install node
# Windows: 从 https://nodejs.org/ 下载 LTS 版本
# Linux: sudo apt install nodejs npm  # Debian/Ubuntu
```

**2. 检查并安装 Obsidian**

```bash
# 检测用户操作系统
case "$(uname -s)" in
  Darwin)
    # macOS
    if [ ! -d "/Applications/Obsidian.app" ]; then
      echo "未检测到 Obsidian，正在引导安装..."
      echo "请访问 https://obsidian.md/ 下载 macOS 版本"
      echo "或使用 Homebrew Cask: brew install --cask obsidian"
    fi
    ;;
  Linux*)
    # Linux
    if ! command -v obsidian &> /dev/null; then
      echo "未检测到 Obsidian，正在引导安装..."
      echo "请访问 https://obsidian.md/ 下载 AppImage 版本"
      echo "或使用包管理器:"
      echo "  Arch: sudo pacman -S obsidian"
      echo "  Fedora: sudo dnf install obsidian"
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    # Windows
    if ! powershell -Command "Get-AppxPackage -Name 'Obsidian.MD'" &> /dev/null; then
      echo "未检测到 Obsidian，正在引导安装..."
      echo "请访问 https://obsidian.md/ 下载 Windows 版本"
      echo "或使用 winget: winget install Obsidian.MD.Obsidian"
    fi
    ;;
esac
```

**为 AI 助手提供的 Obsidian 安装命令参考**：

| 操作系统 | 安装方法 | 命令 |
|---------|---------|------|
| macOS | Homebrew | `brew install --cask obsidian` |
| macOS | 手动下载 | 访问 https://obsidian.md/ |
| Windows | winget | `winget install Obsidian.MD.Obsidian` |
| Windows | 手动下载 | 访问 https://obsidian.md/ |
| Arch Linux | pacman | `sudo pacman -S obsidian` |
| Fedora | dnf | `sudo dnf install obsidian` |
| Debian/Ubuntu | AppImage | 从官网下载 AppImage |
| 其他 Linux | AppImage | 访问 https://obsidian.md/ |

**检测和安装脚本**：
```bash
# macOS 检测
if [ ! -d "/Applications/Obsidian.app" ]; then
  echo "安装 Obsidian: brew install --cask obsidian"
fi

# Windows 检测
winget list | findstr Obsidian || echo "安装 Obsidian: winget install Obsidian.MD.Obsidian"

# Linux 检测
command -v obsidian || echo "请从 https://obsidian.md/ 下载 AppImage"
```

#### 第二步：初始化项目

```bash
# 使用 CLI 初始化项目
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
```

#### 第三步：初始化用户成员目录

```bash
# 询问用户的名字（用于创建个人收集箱）
# 假设用户名为 "Alex"
npx @our2ndbrain/cli@latest member Alex
```

这会创建：
- `10_Inbox/Alex/01_Tasks.md` - 个人任务看板
- `10_Inbox/Alex/09_Done.md` - 个人完成记录
- `.obsidian/daily-notes.json` - 配置日记保存到该成员目录

#### 第四步：验证设置

检查以下文件存在：

```bash
ls -la 00_Dashboard/01_All_Tasks.md
ls -la 10_Inbox/*/01_Tasks.md
ls -la 99_System/Templates/tpl_daily_note.md
```

#### 第五步：引导用户使用 Obsidian 打开

告诉用户：
1. 打开 Obsidian 应用
2. 选择「打开本地仓库」（Open folder as vault）
3. 选择刚才创建的 `my-brain` 目录
4. 点击「信任作者并启用插件」（Trust author and enable plugins）
   > 插件已预装，只需信任即可，无需手动安装

#### 第六步：创建第一篇日记

引导用户：
1. 按 `Cmd/Ctrl + P` 打开命令面板
2. 搜索「Daily notes: Open today's daily note」
3. 写下第一条待办：`- [ ] 探索 2ndBrain 系统 #next`

#### 完成确认

向用户展示：
- 打开 `00_Dashboard/01_All_Tasks.md` 看看任务看板效果
- 打开 `10_Inbox/{用户名}/01_Tasks.md` 看看个人看板

#### 注意事项

- 阅读 [AGENTS.md](AGENTS.md) 了解项目的 AI 助手指南
- 所有任务使用格式：`- [ ] 任务描述 #标签 📅 日期`
- 日记使用模板 `99_System/Templates/tpl_daily_note.md`

</details>

### 首次使用清单

- 用 Obsidian 打开模板
- 确认插件已启用（Settings → Community plugins）
- 创建第一篇日记
- 打开 `00_Dashboard/01_All_Tasks.md` 看看效果

## 👥 团队协作

多人共用一个 2ndBrain 仓库？用 Git 同步：

### 初始化 Git 仓库

```bash
cd my-brain
git init
git add .
git commit -m "🎉 init: 从 2ndBrain Template 开始"

# 推送到远程仓库（GitHub/GitLab 等）
git remote add origin <your-repo-url>
git push -u origin main
```

### 添加新成员

每个成员需要创建自己的目录：

```bash
# 成员 Alice 加入
npx @our2ndbrain/cli@latest member Alice --no-config

# 成员 Bob 加入
npx @our2ndbrain/cli@latest member Bob --no-config
```

> 💡 `--no-config` 选项不会修改 `.obsidian/daily-notes.json`，避免覆盖其他成员的配置。每个成员在本地手动配置自己的日记目录。

### 自动同步

安装 [Obsidian Git](https://github.com/denolehov/obsidian-git) 插件，自动备份和同步：

- 自动保存间隔：60 秒
- 启动时自动拉取：开启
- 文件变更后自动备份：开启

### 本地配置（不同步）

每个成员的 `.obsidian/daily-notes.json` 配置可能不同，建议将 `.obsidian/` 目录加入 `.gitignore`，或者只同步插件配置而不同步个人设置。

## 🔄 工作流程 (C-O-R-D)

四个字：**收集 → 整理 → 回顾 → 执行**。像流水线一样，让想法变成行动。

C-O-R-D 是 [GTD (Getting Things Done)](#gtd) 的现代轻量演进——保留核心精髓，去掉繁琐仪式。GTD 的「收集-处理-组织-回顾-执行」五步被简化为更符合直觉的四步：两分钟能解决的事立刻做，解决不了就扔进收集箱；利用碎片时间分类处理——马上做、交给别人、或过段时间再说。**每天把收集箱清零**，就像睡觉清空腺苷，第二天轻装上阵。

> 💬 *我不忙，我只是时间不够。*

### 1️⃣ 收集 (Collect)

有什么想法、待办、灵感？先扔进今天的日记（`10_Inbox/{你的名字}/`），别管分类，先记下来。

这是 **[Append-and-Review](#append-and-review)** 的核心实践：**所有内容先追加到单一收集点，不打断思考流程**。就像 Karpathy 说的，先记下来，分类和整理留到回顾时再做。

> 💡 **两分钟法则**：能立刻做完的就别记了，直接做掉。
>
> 💡 **小技巧**：打开日记后，先写"今天最想推进的一件事"，启动成本一下就降下来了。

### 2️⃣ 整理 (Organize)

定期回顾日记时，让任务能被"找到"：

- 打个标签：`#next`（马上做）/ `#waiting`（等别人）/ `#someday`（以后再说）
- 有截止日期的，加上 `📅 2026-01-15`
- 事情复杂？单独建个笔记放到 `30_Projects/`
- 长期关注的话题？移到 `20_Areas/` 对应领域
- 参考资料？放到 `40_Resources/` 相关分类

**实际例子**：
- 日记中写了"重构公司官网"，回顾时发现需要深入研究 → 创建 `30_Projects/网站重构/` 项目文件夹
- 日记中记录了"基金定投策略"，这是理财领域的知识 → 移到 `20_Areas/理财/基金定投.md`
- 日记中收藏了"番茄工作法"的笔记 → 整理到 `40_Resources/效率工具/番茄工作法.md`

> 💡 **养成习惯**：新任务至少打个标签或日期，不然就会变成"未分类黑洞"。
>
> 💡 **每周翻翻** `#someday`，捞 1-2 个变成 `#next`，别让手头事太多。

### 3️⃣ 回顾 (Review)

靠系统做选择，别靠脑子记：

打开你的个人看板 `10_Inbox/{你的名字}/01_Tasks.md`，扫一眼各个区块：
- **立即行动**：没分类的任务，赶紧处理或打标签
- **今日必达**：今天到期的，优先搞定
- **等待跟进**：在等别人的 `#waiting` 任务
- **未来计划**：还没到期的任务，以及所有 `#someday` 标签的任务（无论是否有截止日期）
- **下一步行动**：标了 `#next` 的，随时可以开干
- **阅读清单**：想看的文章、书籍

> 💡 **每天**至少扫一眼"今日必达"和"下一步行动"。
>
> 💡 **每周**看看个人 `09_Done.md` 回顾成就感；顺便清理一下项目，不活跃的挪到 `90_Archives/`。

### 4️⃣ 执行 (Do)

只做 `#next` 或到期的任务，做完就勾掉。

> 🎯 **核心心法**：不是所有事都要做完，只做"下一步"就够了。

## 📝 任务约定

### 怎么写任务？

```markdown
- [ ] 任务描述 #标签 📅 2026-01-08
```

完成后 Tasks 插件会自动加上 `✅ 2026-01-08`，方便回顾。

### 标签速查

| 标签 | 意思 | 什么时候用 |
|------|------|------------|
| `#next` | 下一步要做 | 随时可以开工的任务 |
| `#waiting` | 等别人 | 球在别人那儿 |
| `#someday` | 以后再说 | 想做但不急 |
| `#read` | 要读的 | 文章、书籍等文字内容 |
| `#watch` | 要看的 | 视频、课程等视觉内容 |
| `#listen` | 要听的 | 播客、音频等听觉内容 |
| `📅 YYYY-MM-DD` | 截止日期 | 必须在某天前完成 |

### 特殊标题

日记里用这些标题，看板会自动识别：

- `## 💼 Works`：工作任务（外部输入、需交付的事项）
- `## 💡 Thoughts`：想法（自驱探索、灵感，也可以带任务）
- `## 📚 Readings`：阅读清单

## 📁 目录结构 (PARA)

```
2ndBrain/
├── 00_Dashboard/          # 看板：任务聚合、进度回顾
│   ├── 01_All_Tasks.md    #   全局任务看板
│   └── 09_All_Done.md     #   全局完成记录
├── 10_Inbox/              # 收集箱：日记落这儿（单一收集点）
│   ├── Agents/            #   AI 助手共享工作区
│   │   └── Journal.md     #     Agent 工作日志（append-and-review）
│   └── {成员名}/          #   每个人类成员一个子目录
│       ├── 01_Tasks.md    #     个人任务看板
│       ├── 09_Done.md     #     个人完成记录
│       └── 2026-01-14.md  #     日记（按日期命名）
├── 20_Areas/              # 领域：长期关注的事（健康、财务…）
├── 30_Projects/           # 项目：有明确目标的事
├── 40_Resources/          # 资源：参考资料、方法论
├── 90_Archives/           # 归档：完成或不再活跃的
└── 99_System/             # 系统：模板、脚本和配置
    ├── Scripts/           #   自动化脚本
    └── Templates/         #   笔记模板
```

### 东西往哪放？

**决策流程**：所有内容先放 `10_Inbox/`（日记），回顾时再决定归属。

| 分类 | 放这里 | 实际例子 | 别放这儿 |
|------|--------|----------|----------|
| **项目** | `30_Projects/项目名/` | `30_Projects/网站重构/` - 有明确目标<br>`30_Projects/年度报告/` - 有截止日期 | 零散想法、临时待办（先放日记） |
| **领域** | `20_Areas/领域名/` | `20_Areas/理财/基金定投.md` - 长期关注<br>`20_Areas/健康/运动记录.md` - 持续维护 | 已经完成的项目（应归档） |
| **资源** | `40_Resources/分类/` | `40_Resources/效率工具/番茄工作法.md` - 方法论<br>`40_Resources/书单.md` - 参考资料 | 需要持续维护的事（应放领域或项目） |
| **归档** | `90_Archives/` | 完成的项目、不再关注的领域 | 还在进行中的任务 |
| **收集箱** | `10_Inbox/{成员}/` | `10_Inbox/G/2026-01-14.md` - 所有新内容先放这里 | 已整理好的内容（应移到对应目录） |

**判断标准**：
- **有明确目标和截止日期** → `30_Projects/`
- **需要长期维护但没有截止日期** → `20_Areas/`
- **参考资料、工具、方法论** → `40_Resources/`
- **不确定放哪** → 先放 `10_Inbox/`，回顾时再决定

## 🎯 核心入口

| 文件 | 干嘛用 |
|------|--------|
| `00_Dashboard/01_All_Tasks.md` | 全局任务看板，汇总所有成员的待办 |
| `00_Dashboard/09_All_Done.md` | 全局完成记录，回顾团队成就 |
| `10_Inbox/{成员}/01_Tasks.md` | 个人任务看板，每天看这个 |
| `10_Inbox/{成员}/09_Done.md` | 个人完成记录，回顾成就感 |
| `10_Inbox/Agents/Journal.md` | Agent 工作日志，记录 AI 助手的工作 |
| `99_System/Templates/tpl_daily_note.md` | 日记模板 |

## 🔌 Obsidian 插件配置

本模板已预装以下插件，初始化时自动包含在 `.obsidian/plugins/` 目录中，打开项目后信任作者即可启用：

### 预装插件

| 插件 | 用途 | 仓库 |
|------|------|------|
| **Tasks** | 任务过滤和聚合，支持标签、日期、循环任务等 | [obsidian-tasks-plugin](https://github.com/obsidian-tasks-group/obsidian-tasks) |
| **Calendar** | 日历视图，点击日期快速跳转到对应日记 | [obsidian-calendar-plugin](https://github.com/liamcain/obsidian-calendar-plugin) |
| **Git** | 自动备份到 Git 仓库，支持自动提交和拉取 | [obsidian-git](https://github.com/denolehov/obsidian-git) |
| **Custom Attachment Location** | 自动将附件整理到笔记同名目录 | [obsidian-custom-attachment-location](https://github.com/RainCat1998/obsidian-custom-attachment-location) |

### 手动安装插件

模板预装插件已足够使用，如需额外功能可手动安装：

```bash
# 社区插件需要在 Obsidian 设置中先启用「社区插件」浏览功能
# 设置 → Community plugins → Turn on community plugins
```

推荐的额外插件：
- [Dataview](https://github.com/blacksmithgu/obsidian-dataview) - 高级数据查询，可创建动态看板
- [Advanced Tables](https://github.com/tgrosinger/advanced-tables-obsidian) - 增强 Markdown 表格编辑

### 插件配置参考

<details>
<summary>点击展开配置详情</summary>

**Git 插件**
- 自动保存间隔：60 秒
- 启动时自动拉取：开启
- 文件变更后自动备份：开启
- 提交信息格式：`vault backup: {{date}}`

**Calendar 插件**
- 每周起始日：跟随系统
- 每点代表字数：250

**Custom Attachment Location 插件**
- 附件路径：`./assets/${noteFileName}`
- 附件命名：`file-${date:YYYYMMDDHHmmssSSS}`

**Tasks 插件**
- 全局任务过滤器：可在设置中自定义默认过滤条件

</details>

## 🔧 CLI 命令参考

2ndBrain 提供命令行工具来管理项目：

```bash
# 全局安装（可选）
npm install -g @our2ndbrain/cli

# 或使用 npx 直接运行
npx @our2ndbrain/cli@latest <command>
```

### 命令列表

| 命令 | 说明 |
|------|------|
| `2ndbrain init [path]` | 初始化新项目（或集成到已有知识库） |
| `2ndbrain member <name> [path]` | 添加成员目录 |
| `2ndbrain update [path]` | 更新框架文件（看板、模板等） |
| `2ndbrain remove [path]` | 移除框架文件 |
| `2ndbrain completion <shell>` | 生成 shell 补全脚本 |

### 更新框架文件

当模板有新版本时，可以使用 `update` 命令更新框架文件（看板、模板、脚本、文档等），同时保留你的个人数据不变。

**框架文件包括**：
- 文档：`AGENTS.md`、`README.md`、`CHANGELOG.md`、`CLAUDE.md`
- 看板：`00_Dashboard/01_All_Tasks.md`、`00_Dashboard/09_All_Done.md`
- 模板：`99_System/Templates/` 下的所有模板
- 脚本：`99_System/Scripts/` 下的所有脚本
- 配置：`.obsidian/` 目录（插件配置，智能合并）

```bash
# 1. 先预览将要更新的文件
npx @our2ndbrain/cli@latest update --dry-run

# 2. 确认无误后执行更新
npx @our2ndbrain/cli@latest update
```

更新过程中会显示差异预览，你可以选择：
- **全部更新**：一次性更新所有框架文件
- **逐个审查**：每个文件单独确认是否更新
- **跳过**：取消本次更新

> 💡 **重要说明**：`update` 命令只会更新框架文件（看板、模板、脚本等），**不会修改**你的个人数据目录（20_Areas、30_Projects、40_Resources、90_Archives）和成员日记。

### 常用选项

**init**
- `-f, --force`：强制覆盖已存在的项目
- `--reset-obsidian, --reset-obs`：完全重置 .obsidian 目录（覆盖所有配置）
- `-t, --template <path>`：使用自定义模板目录

### init 命令模式

`init` 命令支持两种模式：

1. **全新初始化**：在空目录创建完整项目
2. **集成模式**：在已有知识库中智能合并框架文件

```bash
# 全新初始化
mkdir my-brain && cd my-brain
npx @our2ndbrain/cli@latest init

# 集成到已有知识库
cd my-existing-vault
npx @our2ndbrain/cli@latest init
```

**集成模式会**：
- 只创建缺失的框架目录（00_Dashboard、10_Inbox、99_System）
- 跳过已存在的用户数据目录（20_Areas、30_Projects 等）
- 智能合并 .obsidian/ 配置，保留你的插件设置
- 添加缺失的框架文件（看板、模板、文档）

**member**
- `-f, --force`：强制覆盖已存在的成员目录
- `--no-config`：不更新 Obsidian daily-notes 配置（团队协作时使用）

**update**
- `-d, --dry-run`：预览将要更新的文件，不实际执行
- `-t, --template <path>`：使用自定义模板目录

**remove**
- `-d, --dry-run`：预览将要移除的文件，不实际执行
- `-f, --force`：跳过确认直接移除

### 命令补全

启用 Tab 补全，让命令输入更便捷：

```bash
# Bash
echo 'source <(2ndbrain completion bash)' >> ~/.bashrc

# Bash (macOS 使用文件方式，因为 bash 3.x 不支持 source <(...))
2ndbrain completion bash > ~/.2ndbrain-completion.bash
echo 'source ~/.2ndbrain-completion.bash' >> ~/.bash_profile
source ~/.bash_profile

# Zsh
echo 'source <(2ndbrain completion zsh)' >> ~/.zshrc
source ~/.zshrc

# Fish
2ndbrain completion fish > ~/.config/fish/completions/2ndbrain.fish
```

重新打开终端或执行 `source ~/.bashrc`（或对应 shell 配置文件）即可生效。

## 📚 延伸阅读

想深入了解背后的方法论？

- <span id="gtd"></span>**[GTD (Getting Things Done)](https://gettingthingsdone.com/)** - David Allen 的经典时间管理方法
  - C-O-R-D 是 GTD 的现代轻量演进，保留核心精髓，简化为四步

- <span id="para"></span>**[PARA 方法论](https://fortelabs.com/blog/para/)** - Tiago Forte 的知识管理框架
  - 本系统的目录结构（Projects、Areas、Resources、Archives）基于此框架

- <span id="append-and-review"></span>**[The Append-and-Review Note](https://karpathy.bearblog.dev/the-append-and-review-note/)** - Karpathy 的极简笔记法
  - **核心思想**：维护单一笔记，所有新内容追加到顶部，定期回顾时提升重要内容
  - **在本系统的实践**：
    - `10_Inbox/` 目录就是"单一收集点"（所有日记都在这里）
    - 收集阶段：所有想法、待办先追加到日记，不打断思考
    - 整理阶段：定期回顾日记，将重要内容提升到对应目录（Projects/Areas/Resources）
    - 这样既保持了记录的低门槛，又通过回顾实现了内容的自然筛选和整理

- <span id="cord"></span>**[C-O-R-D 工作流](https://fortelabs.com/blog/cord/)** - PARA 方法论的实践框架
  - Collect（收集）、Organize（整理）、Review（回顾）、Do（执行）
  - 本系统将这四步与 GTD 精髓结合，形成适合个人和团队的知识管理实践

- <span id="obsidian"></span>**[Obsidian](https://obsidian.md/)** - 当前推荐的实现工具，本地优先、插件生态丰富

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

- 🐛 发现问题？[提交 Issue](https://github.com/Our2ndBrain/2ndBrain-Template/issues)
- 💡 有改进建议？欢迎 PR
- ⭐ 觉得有用？给个 Star 支持一下

## 📄 开源协议

本项目采用 [Apache License 2.0](LICENSE) 开源协议。

---

<p align="center">
  <i>方法论是内核，工具只是载体。<br/>用系统承载混乱，让大脑专注思考。</i>
</p>
