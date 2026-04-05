# 2ndBrain Guide

> This is the long-form guide for 2ndBrain. It is intended for humans and AI agents that need the full methodology, directory conventions, CLI reference, and repository context.

[Back to lightweight README](../README_en.md) | [简体中文](guide.md)

## What 2ndBrain Is

2ndBrain combines PARA, the C-O-R-D workflow, and Append-and-Review into one operating model for personal knowledge management. This repository ships:

- an Obsidian vault template
- a CLI for checking, initializing, updating, and removing framework files
- a 2ndBrain Skill that teaches AI agents how to work with the vault

The root README is now AI-first and intentionally lightweight. This guide keeps the fuller project and methodology reference.

## Method Overview

### PARA

Long-lived content is organized into four buckets:

- `30_Projects/`: goal-oriented work with an end state
- `20_Areas/`: ongoing areas without a fixed deadline
- `40_Resources/`: reference material, tools, and notes
- `90_Archives/`: completed or inactive material

### C-O-R-D

Daily work follows four steps:

1. Collect: capture first without breaking flow
2. Organize: tag and move tasks into the right place
3. Review: inspect journals and dashboards
4. Do: focus on the next actionable step

### Append-and-Review

Capture by appending first, then organize during review. This keeps recording cheap for both humans and AI agents.

## Quick Start

### Install the CLI

Recommended:

```bash
npx @our2ndbrain/cli@latest check
```

For regular use, install globally:

```bash
npm install -g @our2ndbrain/cli
2ndbrain check
```

### Initialize a Vault

Create a new vault:

```bash
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
npx @our2ndbrain/cli@latest member Alice
```

Integrate into an existing vault:

```bash
cd my-existing-vault
npx @our2ndbrain/cli@latest init
npx @our2ndbrain/cli@latest member Alice
```

Then open the directory in Obsidian and trust the bundled plugins.

## Collaboration Workflow

### Capture

- thoughts, reflections, and decisions go into the current daily note under `## Thoughts`
- tasks go into `10_Inbox/{member}/00_To-Do.md`
- agent logs go into `10_Inbox/Agents/Journal.md`

### Organize

- add tags such as `#next`, `#waiting`, and `#someday`
- move tasks out of `## Inbox` into project headings or `## Readings`
- put new project material in `30_Projects/`
- put ongoing topics in `20_Areas/`
- put references and methods in `40_Resources/`

### Review

- the daily note shows due and overdue work through its query block
- `10_Inbox/{member}/01_Tasks.md` is the personal board
- `00_Dashboard/01_All_Tasks.md` is the global board

### Do

- prefer due tasks and `#next`
- mark completion by changing `- [ ]` to `- [x]`

## Task Conventions

Standard task format:

```markdown
- [ ] Task description #tag 📅 2026-04-05
```

Common tags:

- `#next`: immediately actionable
- `#waiting`: waiting on someone else
- `#someday`: deferred work
- `#read`: reading queue
- `#watch`: watch queue
- `#listen`: listening queue

Important constraints:

- keep `## Inbox` at the bottom of `00_To-Do.md`
- do not hand-edit query files such as `00_Dashboard/*.md` and `01_Tasks.md`
- if placement is unclear, capture to Inbox first

## Directory Structure

```text
2ndBrain/
├── 00_Dashboard/
├── 10_Inbox/
│   ├── Agents/
│   └── {member}/
├── 20_Areas/
├── 30_Projects/
├── 40_Resources/
├── 90_Archives/
└── 99_System/
```

Key entry points:

- `00_Dashboard/01_All_Tasks.md`
- `10_Inbox/{member}/00_To-Do.md`
- `10_Inbox/{member}/01_Tasks.md`
- `10_Inbox/{member}/09_Done.md`
- `10_Inbox/Agents/Journal.md`
- `99_System/Templates/tpl_daily_note.md`

## Obsidian and Plugins

The template ships with:

- Tasks for task filtering and aggregation
- Calendar for date-based navigation
- Git for backup and sync
- Custom Attachment Location for attachment organization

Obsidian CLI is optional but recommended. When Obsidian is running, AI agents can use it to append tasks, read daily notes, and search the vault.

## CLI Reference

Common commands:

- `2ndbrain check [path]`
- `2ndbrain init [path]`
- `2ndbrain member <name> [path]`
- `2ndbrain update [path]`
- `2ndbrain remove [path]`
- `2ndbrain watch [path]`
- `2ndbrain completion <shell>`

Typical flows:

- initialize a new vault: `2ndbrain init my-brain`
- integrate into an existing vault: run `2ndbrain init` inside it
- add a member: `2ndbrain member Alice`
- preview updates: `2ndbrain update --dry-run`

## Skill and AI Assistant

The 2ndBrain Skill teaches agents to:

- capture tasks, thoughts, and decisions
- organize inboxes and archive completed work
- generate daily action plans
- process articles, URLs, and files into PARA destinations
- persist their own work logs and outputs

Recommended installation path:

```bash
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain
```

If needed, limit installation to a specific agent with `-a claude-code`, `-a cursor`, or `-a openclaw`.

Recommended references:

- [Skill entrypoint](../skills/2ndbrain/SKILL.md)
- [Setup reference](../skills/2ndbrain/references/setup.md)
- [Operations and daily review](../skills/2ndbrain/references/operations.md)
- [Content processing](../skills/2ndbrain/references/content-processing.md)
- [Scheduling](../skills/2ndbrain/references/scheduling.md)
- [Task conventions](../skills/2ndbrain/references/task-conventions.md)

## AI Collaboration Rules

AI assistants operating this project should follow these hard rules:

- run `2ndbrain check` first
- follow the user's language
- modify task source files, not query dashboards
- capture before organizing
- consult the Skill for detailed policy instead of inferring from README

## Architecture

The repository is split into three layers:

- `bin/`: CLI entrypoint
- `src/`: commands and shared libraries
- `template/`: the vault assets actually distributed to user vaults

Root docs now live at the package root, while `template/` contains only vault assets. That keeps CLI code, distributed template content, and repository-only docs separate.

## Further Reading

- [PARA](https://fortelabs.com/blog/para/)
- [C-O-R-D](https://fortelabs.com/blog/cord/)
- [The Append-and-Review Note](https://karpathy.bearblog.dev/the-append-and-review-note/)
- [Obsidian](https://obsidian.md/)

## Contributing

- open issues for bugs or improvements
- when changing the CLI or template, also check whether the AI collaboration entrypoint stays clear
- keep the root README lightweight; move long-form material into `docs/`
