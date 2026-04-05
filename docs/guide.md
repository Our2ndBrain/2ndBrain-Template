# 2ndBrain Guide

> 这是 2ndBrain 的长文档版本，面向想了解完整方法论、目录约定、CLI 用法和架构背景的人类读者与 AI Agent。

[返回轻量 README](../README.md) | [English](guide_en.md)

## 这是什么

2ndBrain 是一套融合 PARA、C-O-R-D 工作流与 Append-and-Review 的个人知识管理方法。这个仓库同时包含：

- 一个基于 Obsidian 的模板
- 一个 CLI，用于初始化、检查、更新与移除框架文件
- 一个 2ndBrain Skill，用于指导 AI Agent 与知识库协作

根目录 README 面向 AI-first 场景，只保留最小入口；本文件保留完整背景和参考内容。

## 方法论概览

### PARA

目录按四类长期归档目标组织：

- `30_Projects/`：有明确目标与结束条件的项目
- `20_Areas/`：长期维护但没有明确截止日期的领域
- `40_Resources/`：参考资料、方法论、工具和笔记
- `90_Archives/`：已经完成或不再活跃的内容

### C-O-R-D

日常工作流分成四步：

1. Collect：先记下来，不打断当前思路
2. Organize：给任务打标签，移动到合适的项目或栏目
3. Review：通过日记和看板查看今日到期、遗留和下一步任务
4. Do：只做当前的下一步

### Append-and-Review

记录时优先追加，整理时再分类。这个约束让 AI 和人类都能快速捕获信息，而不是卡在“应该放哪”。

## 快速开始

### 安装 CLI

推荐：

```bash
npx @our2ndbrain/cli@latest check
```

如果要长期使用，可以全局安装：

```bash
npm install -g @our2ndbrain/cli
2ndbrain check
```

### 初始化知识库

新建一个 vault：

```bash
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
npx @our2ndbrain/cli@latest member Alice
```

集成到已有 vault：

```bash
cd my-existing-vault
npx @our2ndbrain/cli@latest init
npx @our2ndbrain/cli@latest member Alice
```

初始化后，用 Obsidian 打开目录并信任预装插件。

## 协作工作流

### 记录

- 想法、反思、决策：写到当天日记的 `## Thoughts`
- 待办任务：写到 `10_Inbox/{成员名}/00_To-Do.md`
- Agent 工作日志：写到 `10_Inbox/Agents/Journal.md`

### 整理

- 给任务加上 `#next`、`#waiting`、`#someday` 等标签
- 把 `## Inbox` 里的任务移动到项目 Heading、`## Readings` 或保留在 Inbox
- 新项目放到 `30_Projects/`
- 长期维护话题放到 `20_Areas/`
- 资料与方法论放到 `40_Resources/`

### 回顾

- 当日日记中的 `## To-Do` 查询块会展示今日到期与过期任务
- `10_Inbox/{成员名}/01_Tasks.md` 提供个人任务看板
- `00_Dashboard/01_All_Tasks.md` 提供全局看板

### 执行

- 优先处理到期任务与 `#next`
- 完成后将 `- [ ]` 改成 `- [x]`

## 任务约定

标准任务格式：

```markdown
- [ ] 任务描述 #标签 📅 2026-04-05
```

常用标签：

- `#next`：下一步就能做
- `#waiting`：等待别人推进
- `#someday`：以后再说
- `#read`：阅读清单
- `#watch`：观看清单
- `#listen`：收听清单

关键约束：

- `00_To-Do.md` 的 `## Inbox` 必须在文件底部
- `00_Dashboard/*.md` 与 `01_Tasks.md` 是查询文件，不应手改
- 不确定归类时，先写入 Inbox

## 目录结构

```text
2ndBrain/
├── 00_Dashboard/
├── 10_Inbox/
│   ├── Agents/
│   └── {成员名}/
├── 20_Areas/
├── 30_Projects/
├── 40_Resources/
├── 90_Archives/
└── 99_System/
```

核心入口：

- `00_Dashboard/01_All_Tasks.md`
- `10_Inbox/{成员名}/00_To-Do.md`
- `10_Inbox/{成员名}/01_Tasks.md`
- `10_Inbox/{成员名}/09_Done.md`
- `10_Inbox/Agents/Journal.md`
- `99_System/Templates/tpl_daily_note.md`

## Obsidian 与插件

模板会预装这些插件：

- Tasks：任务聚合和筛选
- Calendar：按日期浏览日记
- Git：自动备份与同步
- Custom Attachment Location：整理附件路径

可选启用 Obsidian CLI，用于从终端操作 vault。AI Agent 在 Obsidian 运行时可优先使用它来追加任务、读取日记和搜索内容。

## CLI 命令参考

常用命令：

- `2ndbrain check [path]`
- `2ndbrain init [path]`
- `2ndbrain member <name> [path]`
- `2ndbrain update [path]`
- `2ndbrain remove [path]`
- `2ndbrain watch [path]`
- `2ndbrain completion <shell>`

典型场景：

- 初始化新仓库：`2ndbrain init my-brain`
- 集成已有 vault：进入目录后执行 `2ndbrain init`
- 添加成员：`2ndbrain member Alice`
- 预览更新：`2ndbrain update --dry-run`

## Skill 与 AI Assistant

2ndBrain Skill 负责让 AI Agent 学会以下行为：

- 记录用户任务、想法和决策
- 整理收集箱、归档完成项
- 生成今日行动计划
- 处理文章、URL、文件并自动路由到 PARA 目录
- 持久化 Agent 自己的工作日志与产出

推荐安装方式：

```bash
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain
```

如果需要限定到某个 Agent，可加 `-a claude-code`、`-a cursor` 或 `-a openclaw`。

推荐阅读：

- [Skill 主入口](../skills/2ndbrain/SKILL.md)
- [安装引导](../skills/2ndbrain/references/setup.md)
- [整理与日报](../skills/2ndbrain/references/operations.md)
- [内容处理](../skills/2ndbrain/references/content-processing.md)
- [调度策略](../skills/2ndbrain/references/scheduling.md)
- [任务约定](../skills/2ndbrain/references/task-conventions.md)

## AI 协作规则

AI Assistant 操作本项目时，应遵循这些硬约束：

- 先运行 `2ndbrain check`
- 跟随用户语言
- 只修改任务源文件，不修改查询看板
- 记录优先于整理
- 通过 Skill 获取细节规则，而不是在 README 中臆测

## 架构说明

仓库分成三层：

- `bin/`：CLI 入口
- `src/`：命令实现与共享库
- `template/`：真正分发到用户 vault 的模板资产

目前根目录文档属于 npm 包根目录资源，`template/` 只放 vault 资产。这样 CLI 代码、分发模板和仓库级文档彼此职责清晰。

## 延伸阅读

- [PARA](https://fortelabs.com/blog/para/)
- [C-O-R-D](https://fortelabs.com/blog/cord/)
- [The Append-and-Review Note](https://karpathy.bearblog.dev/the-append-and-review-note/)
- [Obsidian](https://obsidian.md/)

## 贡献

- 问题与建议请提交 Issue
- 变更模板或 CLI 时，同时考虑 AI 协作入口是否仍然清晰
- 文档分层原则：根 README 保持轻量，长文档放在 `docs/`
