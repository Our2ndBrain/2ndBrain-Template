# 🧠 2ndBrain

> 面向 AI Agent 与人类协作者的轻量入口：用 2ndBrain 模板、CLI 和 Skill 搭建一个可协作的 Obsidian 知识库。

[简体中文](README.md) | [English](README_en.md)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@our2ndbrain/cli.svg)](https://www.npmjs.com/package/@our2ndbrain/cli)

## 这是什么

如果你要把这个仓库交给 AI Agent，这份 README 应该是它的第一入口。

2ndBrain 提供三样东西：

- 一个基于 Obsidian 的知识库模板，用来承载 PARA 目录、收集箱和看板
- 一个 CLI，用来初始化、更新和检查知识库环境
- 一个 2ndBrain Skill，用来指导 AI 记录、整理、回顾和处理内容

这份 README 只保留 AI 协作所需的最小信息。更完整的方法论、目录约定、CLI 参考和架构说明见 [详细指南](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/docs/guide.md)。

## Quick Start

推荐直接使用 `npx`：

```bash
npx @our2ndbrain/cli@latest check
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
npx @our2ndbrain/cli@latest member Alice
```

如果你已经全局安装过 CLI，也可以使用：

```bash
2ndbrain check
2ndbrain init my-brain
cd my-brain
2ndbrain member Alice
```

## 初始化知识库

### 新建一个 2ndBrain 仓库

```bash
npx @our2ndbrain/cli@latest check
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
npx @our2ndbrain/cli@latest member Alice
```

### 集成到已有 Obsidian vault

```bash
cd my-existing-vault
npx @our2ndbrain/cli@latest check
npx @our2ndbrain/cli@latest init
npx @our2ndbrain/cli@latest member Alice
```

初始化完成后，让用户：

1. 用 Obsidian 打开刚创建或集成后的目录。
2. 点击“Trust author and enable plugins”。
3. 创建第一篇日记，开始记录任务和想法。

## 安装 Skill

推荐使用 SSH git URL 形式安装这个仓库中的 `2ndbrain` Skill：

```bash
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain
```

按目标 Agent 安装时，可以显式指定：

```bash
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain -a claude-code
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain -a cursor
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain -a openclaw
```

如果你的环境暂时不用 `skills` CLI，再退回到手动复制 `skills/2ndbrain/` 目录的方式。

Skill 主入口见 [SKILL.md](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/SKILL.md)。

## AI 如何与人协作

AI Agent 使用这个模板时，至少遵循这些规则：

- 在安装、初始化或接管知识库前，先运行 `2ndbrain check` 或 `npx @our2ndbrain/cli@latest check`。
- 记录优先于整理。不确定归类时，先放到 `10_Inbox/{成员名}/`。
- 任务写到 `10_Inbox/{成员名}/00_To-Do.md`，不要手改 `00_Dashboard/*.md` 或 `10_Inbox/*/01_Tasks.md` 这类查询文件。
- 跟随用户语言，不要擅自切换中英文。
- 优先通过 2ndBrain Skill 处理这些动作：记录、整理、回顾、内容处理、定时整理。
- 需要细节时，不要在 README 里猜，直接阅读 Skill 和 references。

## 深入阅读

- [详细指南（中文）](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/docs/guide.md)
- [Detailed Guide (English)](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/docs/guide_en.md)
- [2ndBrain Skill](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/SKILL.md)
- [安装参考](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/setup.md)
- [整理与日报](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/operations.md)
- [内容处理](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/content-processing.md)
- [调度与自动整理](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/scheduling.md)
- [任务约定](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/task-conventions.md)
