# 🧠 2ndBrain

> A lightweight entrypoint for AI agents and human collaborators: use the 2ndBrain template, CLI, and Skill to operate an Obsidian knowledge base together.

[English](README_en.md) | [简体中文](README.md)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@our2ndbrain/cli.svg)](https://www.npmjs.com/package/@our2ndbrain/cli)

## What This Repository Is

If you hand this repository to an AI agent, this README should be the first file it reads.

2ndBrain ships three things:

- an Obsidian vault template with PARA folders, inboxes, and dashboards
- a CLI for checking the environment, initializing a vault, and updating framework files
- a 2ndBrain Skill that teaches the agent how to capture, organize, review, and process content

This README keeps only the minimum needed for AI collaboration. For the fuller project and methodology reference, see the [detailed guide](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/docs/guide_en.md).

## Quick Start

The default path is `npx`:

```bash
npx @our2ndbrain/cli@latest check
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
npx @our2ndbrain/cli@latest member Alice
```

If the CLI is already installed globally, you can also use:

```bash
2ndbrain check
2ndbrain init my-brain
cd my-brain
2ndbrain member Alice
```

## Initialize a Vault

### Create a new 2ndBrain vault

```bash
npx @our2ndbrain/cli@latest check
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
npx @our2ndbrain/cli@latest member Alice
```

### Integrate into an existing Obsidian vault

```bash
cd my-existing-vault
npx @our2ndbrain/cli@latest check
npx @our2ndbrain/cli@latest init
npx @our2ndbrain/cli@latest member Alice
```

After initialization, guide the user to:

1. open the directory in Obsidian
2. click "Trust author and enable plugins"
3. create the first daily note and start capturing tasks and thoughts

## Install the Skill

The preferred installation path is the SSH git URL form:

```bash
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain
```

To target a specific agent explicitly:

```bash
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain -a claude-code
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain -a cursor
npx skills add git@github.com:Our2ndBrain/2ndBrain-Template.git --skill 2ndbrain -a openclaw
```

If you are not using the `skills` CLI in that environment yet, you can still fall back to manually copying `skills/2ndbrain/`.

The skill entrypoint is [SKILL.md](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/SKILL.md).

## How AI Should Collaborate With Humans

An AI agent using this template should at least follow these rules:

- Run `2ndbrain check` or `npx @our2ndbrain/cli@latest check` before setup, initialization, or takeover.
- Capture before organizing. If placement is unclear, write it to `10_Inbox/{member}/` first.
- Write tasks to `10_Inbox/{member}/00_To-Do.md`. Do not hand-edit query-driven files such as `00_Dashboard/*.md` or `10_Inbox/*/01_Tasks.md`.
- Follow the user's language instead of switching languages on your own.
- Prefer the 2ndBrain Skill for capture, organize, review, content processing, and scheduled cleanup.
- When you need detailed rules, read the Skill and its references instead of inferring policy from this README.

## Deep Reading

- [Detailed Guide (English)](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/docs/guide_en.md)
- [详细指南（中文）](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/docs/guide.md)
- [2ndBrain Skill](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/SKILL.md)
- [Setup Reference](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/setup.md)
- [Operations and Daily Review](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/operations.md)
- [Content Processing](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/content-processing.md)
- [Scheduling and Automation](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/scheduling.md)
- [Task Conventions](https://github.com/Our2ndBrain/2ndBrain-Template/blob/main/skills/2ndbrain/references/task-conventions.md)
