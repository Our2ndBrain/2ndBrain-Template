# 🧠 2ndBrain

> A personal knowledge management methodology combining [PARA](#para), [C-O-R-D](#cord) workflow, and [Append-and-Review](#append-and-review) note-taking.

[English](README_en.md) | [简体中文](README.md)

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@our2ndbrain/cli.svg)](https://www.npmjs.com/package/@our2ndbrain/cli)

## ✨ What is this?

**2ndBrain** is a personal knowledge management methodology that combines **[PARA](#para)** organizational structure, **[C-O-R-D](#cord)** workflow, and **Karpathy's [Append-and-Review](#append-and-review)** note-taking method—**capture first, organize during review**. The system automatically aggregates tasks to dashboards, so you can focus on recording and executing.

> 🛠️ **About Tools**: Methodology is separate from implementation. This repository provides an out-of-the-box template based on [Obsidian](https://obsidian.md/)—it's local-first with a rich plugin ecosystem, making it a highly cost-effective choice. All data is plain text Markdown, portable to any tool you prefer.

The core approach is simple:

- 📥 **Capture first**—all inputs go to the inbox first, don't interrupt your flow
- 🏷️ **Just add tags**—let tasks be "caught" by the system, never lost
- 📋 **Dashboards help you choose**—review at a glance, no need to rely on memory
- ✅ **Just do the next step**—avoid choice paralysis, one thing at a time

## 📖 Table of Contents

- [Quick Start](#-quick-start)
- [Team Collaboration](#-team-collaboration)
- [Workflow](#-workflow-c-o-r-d)
- [Task Conventions](#-task-conventions)
- [Directory Structure](#-directory-structure-para)
- [Key Entry Points](#-key-entry-points)
- [Obsidian Plugin Configuration](#-obsidian-plugin-configuration)
- [CLI Command Reference](#-cli-command-reference)
- [Further Reading](#-further-reading)
- [Contributing](#-contributing)

## 🚀 Quick Start

### Installation

Recommended using **npx** (no installation needed):

```bash
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
```

Or install globally:

```bash
npm install -g @our2ndbrain/cli
2ndbrain init my-brain
```

### Initialize Your Knowledge Base

```bash
# 1. Create project (or use `2ndbrain` command if installed globally)
npx @our2ndbrain/cli@latest init my-brain
cd my-brain

# 2. Add your member directory
npx @our2ndbrain/cli@latest member yourname

# 3. Open my-brain with Obsidian and start using
```

<details>
<summary><strong>🤖 Let AI Assistant Help You Set Up</strong></summary>

Paste this to any AI assistant (Claude, ChatGPT, Cursor, etc.):

```
Help me set up the 2ndBrain knowledge management system, follow this document:
https://raw.githubusercontent.com/Our2ndBrain/2ndBrain-Template/main/README.md
```

</details>

<details>
<summary><strong>📋 Already Have a Knowledge Base? Manually Integrate 2ndBrain</strong></summary>

If you already have an Obsidian knowledge base:

1. Copy `00_Dashboard/`, `99_System/Templates/`, `.obsidian/` to your knowledge base
2. Create other directory structures (10_Inbox, 20_Areas, 30_Projects, etc.)
3. If you already have `.obsidian/` config, selectively merge plugin directories

</details>

<details>
<summary><strong>🔧 For LLM Agents (Detailed AI Assistant Guide)</strong></summary>

If you're an AI assistant helping users set up 2ndBrain, follow these steps:

#### Step 1: Verify Prerequisites

```bash
# Check if Node.js is available (need v16+)
node --version

# Check if Obsidian is installed (optional, user may already have it)
# macOS
ls /Applications/Obsidian.app

# If user doesn't have Obsidian, guide them to download from https://obsidian.md/
```

#### Step 2: Initialize Project

```bash
# Use CLI to initialize project
npx @our2ndbrain/cli@latest init my-brain
cd my-brain
```

#### Step 3: Initialize User Member Directory

```bash
# Ask user's name (for creating personal inbox)
# Assuming username is "Alex"
npx @our2ndbrain/cli@latest member Alex
```

This creates:
- `10_Inbox/Alex/01_Tasks.md` - Personal task dashboard
- `10_Inbox/Alex/09_Done.md` - Personal completion record
- `.obsidian/daily-notes.json` - Configures journal to save to that member directory

#### Step 4: Verify Setup

Check these files exist:

```bash
ls -la 00_Dashboard/01_All_Tasks.md
ls -la 10_Inbox/*/01_Tasks.md
ls -la 99_System/Templates/tpl_daily_note.md
```

#### Step 5: Guide User to Open with Obsidian

Tell the user:
1. Open Obsidian app
2. Select "Open folder as vault"
3. Choose the `my-brain` directory just created
4. Click "Trust author and enable plugins"
   > Plugins are pre-installed, just need to trust, no manual installation needed

#### Step 6: Create First Journal Entry

Guide the user:
1. Press `Cmd/Ctrl + P` to open command palette
2. Search "Daily notes: Open today's daily note"
3. Write first todo: `- [ ] Explore 2ndBrain system #next`

#### Completion Confirmation

Show the user:
- Open `00_Dashboard/01_All_Tasks.md` to see the task dashboard
- Open `10_Inbox/{username}/01_Tasks.md` to see personal dashboard

#### Notes

- Read [AGENTS.md](AGENTS.md) for AI assistant guidelines
- All tasks use format: `- [ ] Task description #tag 📅 date`
- Journals use template `99_System/Templates/tpl_daily_note.md`

</details>

### First-time Checklist

- Open template with Obsidian
- Confirm plugins are enabled (Settings → Community plugins)
- Create first journal entry
- Open `00_Dashboard/01_All_Tasks.md` to see the effect

## 👥 Team Collaboration

Multiple people sharing one 2ndBrain repository? Use Git for synchronization:

### Initialize Git Repository

```bash
cd my-brain
git init
git add .
git commit -m "🎉 init: Start from 2ndBrain Template"

# Push to remote repository (GitHub/GitLab, etc.)
git remote add origin <your-repo-url>
git push -u origin main
```

### Add New Members

Each member needs to create their own directory:

```bash
# Member Alice joins
npx @our2ndbrain/cli@latest member Alice --no-config

# Member Bob joins
npx @our2ndbrain/cli@latest member Bob --no-config
```

> 💡 The `--no-config` option won't modify `.obsidian/daily-notes.json`, avoiding overwriting other members' config. Each member manually configures their journal directory locally.

### Automatic Synchronization

Install [Obsidian Git](https://github.com/denolehov/obsidian-git) plugin for automatic backup and sync:

- Auto-save interval: 60 seconds
- Auto-pull on startup: enabled
- Auto-commit after file changes: enabled

### Local Configuration (Not Synced)

Each member's `.obsidian/daily-notes.json` config may differ. It's recommended to either add `.obsidian/` to `.gitignore`, or only sync plugin config without personal settings.

## 🔄 Workflow (C-O-R-D)

Four words: **Collect → Organize → Review → Do**. Like an assembly line turning ideas into actions.

C-O-R-D is a modern lightweight evolution of [GTD (Getting Things Done)](#gtd)—keeping the core essence while simplifying the rituals. GTD's "collect-process-organize-review-do" five steps are simplified to four more intuitive steps: if it takes two minutes, do it immediately; otherwise throw it in the inbox. Use fragmented time to categorize—do now, delegate, or do later. **Clear the inbox daily**, like clearing adenosin before sleep, start fresh the next day.

> 💬 *I'm not busy, I just don't have enough time.*

### 1️⃣ Collect

Have ideas, todos, inspiration? Throw them into today's journal (`10_Inbox/{your name}/`) first, don't worry about categorization, just capture them.

This is the core practice of **[Append-and-Review](#append-and-review)**: **append all content to a single collection point first, don't interrupt the thinking flow**. As Karpathy said, capture first, categorization and organization happen during review.

> 💡 **Two-minute rule**: If you can finish it immediately, don't record it, just do it.
>
> 💡 **Pro tip**: After opening journal, first write "one thing I want to advance most today", lowers the startup cost immediately.

### 2️⃣ Organize

When reviewing journals periodically, make tasks "findable":

- Add tags: `#next` (do soon) / `#waiting` (waiting on others) / `#someday` (later)
- For deadlines, add `📅 2026-01-15`
- Complex task? Create separate note in `30_Projects/`
- Long-term topic? Move to `20_Areas/` corresponding area
- Reference material? Put in `40_Resources/` relevant category

**Real examples**:
- Wrote "refactor company website" in journal, found during review it needs deep research → Create `30_Projects/Website Refactor/` project folder
- Recorded "fund investment strategy" in journal, this is finance domain knowledge → Move to `20_Areas/Finance/Fund Investment.md`
- Saved "Pomodoro Technique" notes in journal → Organize to `40_Resources/Productivity Tools/Pomodoro Technique.md`

> 💡 **Build habits**: New tasks need at least a tag or date, otherwise they become "uncategorized black hole".
>
> 💡 **Weekly check** `#someday`, pull 1-2 to become `#next`, don't keep too much on your plate.

### 3️⃣ Review

Let the system make choices, don't rely on memory:

Open your personal dashboard `10_Inbox/{your name}/01_Tasks.md`, scan each section:
- **Immediate Action**: Uncategorized tasks, handle or add tags quickly
- **Today's Priority**: Due today, prioritize
- **Waiting For**: `#waiting` tasks waiting on others
- **Future Plans**: Tasks not yet due, and all `#someday` tagged tasks (regardless of deadline)
- **Next Actions**: Tagged `#next`, ready to start anytime
- **Reading List**: Articles, books you want to read

> 💡 **Daily** at least glance at "Today's Priority" and "Next Actions".
>
> 💡 **Weekly** look at personal `09_Done.md` to review achievements; also clean up projects, move inactive ones to `90_Archives/`.

### 4️⃣ Do

Only do `#next` or due tasks, check off when done.

> 🎯 **Core principle**: Not everything needs to be done, just doing "the next step" is enough.

## 📝 Task Conventions

### How to Write Tasks?

```markdown
- [ ] Task description #tag 📅 2026-01-08
```

Tasks plugin automatically adds `✅ 2026-01-08` upon completion for easy review.

### Tag Quick Reference

| Tag | Meaning | When to Use |
|-----|---------|-------------|
| `#next` | Next to do | Tasks ready to start anytime |
| `#waiting` | Waiting for others | Ball is in someone else's court |
| `#someday` | Someday maybe | Want to do but not urgent |
| `#read` | To read | Articles, books and other text content |
| `#watch` | To watch | Videos, courses and other visual content |
| `#listen` | To listen | Podcasts, audio and other audio content |
| `📅 YYYY-MM-DD` | Due date | Must complete before a certain date |

### Special Headings

Use these headings in journals, dashboards will auto-recognize:

- `## 💼 Works`: Work tasks (external input, deliverable items)
- `## 💡 Thoughts`: Ideas (self-driven exploration, inspiration, can include tasks)
- `## 📚 Readings`: Reading list

## 📁 Directory Structure (PARA)

```
2ndBrain/
├── 00_Dashboard/          # Dashboards: task aggregation, progress review
│   ├── 01_All_Tasks.md    #   Global task dashboard
│   └── 09_All_Done.md     #   Global completion record
├── 10_Inbox/              # Inbox: journals land here (single collection point)
│   ├── Agents/            #   AI assistant shared workspace
│   │   └── Journal.md     #     Agent work log (append-and-review)
│   └── {Member Name}/     #   One subdirectory per human member
│       ├── 01_Tasks.md    #     Personal task dashboard
│       ├── 09_Done.md     #     Personal completion record
│       └── 2026-01-14.md  #     Journal (named by date)
├── 20_Areas/              # Areas: Long-term focus (health, finance...)
├── 30_Projects/           # Projects: Things with clear goals
├── 40_Resources/          # Resources: Reference materials, methodologies
├── 90_Archives/           # Archives: Completed or inactive
└── 99_System/             # System: Templates, scripts and config
    ├── Scripts/           #   Automation scripts
    └── Templates/         #   Note templates
```

### Where to Put Things?

**Decision Flow**: All content first goes to `10_Inbox/` (journal), decide归属 during review.

| Category | Put Here | Real Examples | Don't Put Here |
|----------|----------|---------------|----------------|
| **Projects** | `30_Projects/ProjectName/` | `30_Projects/Website Refactor/` - Clear goal<br>`30_Projects/Annual Report/` - Has deadline | Scattered ideas, temporary todos (put in journal first) |
| **Areas** | `20_Areas/AreaName/` | `20_Areas/Finance/Fund Investment.md` - Long-term focus<br>`20_Areas/Health/Exercise Record.md` - Ongoing maintenance | Completed projects (should archive) |
| **Resources** | `40_Resources/Category/` | `40_Resources/Productivity Tools/Pomodoro Technique.md` - Methodology<br>`40_Resources/Book List.md` - Reference material | Things needing ongoing maintenance (should be in areas or projects) |
| **Archives** | `90_Archives/` | Completed projects, inactive areas | Ongoing tasks |
| **Inbox** | `10_Inbox/{member}/` | `10_Inbox/G/2026-01-14.md` - All new content first | Already organized content (should move to corresponding directory) |

**Judgment Criteria**:
- **Clear goal and deadline** → `30_Projects/`
- **Long-term maintenance but no deadline** → `20_Areas/`
- **Reference materials, tools, methodologies** → `40_Resources/`
- **Not sure where** → Put in `10_Inbox/` first, decide during review

## 🎯 Key Entry Points

| File | Purpose |
|------|---------|
| `00_Dashboard/01_All_Tasks.md` | Global task dashboard, aggregates all members' todos |
| `00_Dashboard/09_All_Done.md` | Global completion record, review team achievements |
| `10_Inbox/{member}/01_Tasks.md` | Personal task dashboard, check this daily |
| `10_Inbox/{member}/09_Done.md` | Personal completion record, review achievements |
| `10_Inbox/Agents/Journal.md` | Agent work log, records AI assistant work |
| `99_System/Templates/tpl_daily_note.md` | Journal template |

## 🔌 Obsidian Plugin Configuration

This template comes with following plugins pre-installed, automatically included in `.obsidian/plugins/` directory during initialization. Just trust the author after opening the project:

### Pre-installed Plugins

| Plugin | Purpose | Repository |
|--------|---------|------------|
| **Tasks** | Task filtering and aggregation, supports tags, dates, recurring tasks, etc. | [obsidian-tasks-plugin](https://github.com/obsidian-tasks-group/obsidian-tasks) |
| **Calendar** | Calendar view, click dates to jump to corresponding journal | [obsidian-calendar-plugin](https://github.com/liamcain/obsidian-calendar-plugin) |
| **Git** | Auto backup to Git repository, supports auto commit and pull | [obsidian-git](https://github.com/denolehov/obsidian-git) |
| **Custom Attachment Location** | Auto organize attachments to note-named directory | [obsidian-custom-attachment-location](https://github.com/RainCat1998/obsidian-custom-attachment-location) |

### Manual Plugin Installation

Pre-installed plugins are sufficient. If you need extra features, install manually:

```bash
# Community plugins need to enable "Community plugins" browsing in Obsidian settings first
# Settings → Community plugins → Turn on community plugins
```

Recommended extra plugins:
- [Dataview](https://github.com/blacksmithgu/obsidian-dataview) - Advanced data queries, can create dynamic dashboards
- [Advanced Tables](https://github.com/tgrosinger/advanced-tables-obsidian) - Enhance Markdown table editing

### Plugin Configuration Reference

<details>
<summary>Click to expand configuration details</summary>

**Git Plugin**
- Auto save interval: 60 seconds
- Auto pull on startup: enabled
- Auto backup after file changes: enabled
- Commit message format: `vault backup: {{date}}`

**Calendar Plugin**
- Week start: Follow system
- Dots per pixel: 250

**Custom Attachment Location Plugin**
- Attachment path: `./assets/${noteFileName}`
- Attachment name: `file-${date:YYYYMMDDHHmmssSSS}`

**Tasks Plugin**
- Global task filter: Can customize default filter conditions in settings

</details>

## 🔧 CLI Command Reference

2ndBrain provides command-line tools for project management:

```bash
# Global install (optional)
npm install -g @our2ndbrain/cli

# Or use npx to run directly
npx @our2ndbrain/cli@latest <command>
```

### Command List

| Command | Description |
|---------|-------------|
| `2ndbrain init [path]` | Initialize new project |
| `2ndbrain member <name> [path]` | Add member directory |
| `2ndbrain update [path]` | Update framework files (dashboards, templates, etc.) |
| `2ndbrain remove [path]` | Remove framework files |
| `2ndbrain completion <shell>` | Generate shell completion script |

### Update Framework Files

When template has new version, use `update` command to update framework files (dashboards, templates, scripts, docs, etc.) while keeping your personal data unchanged.

**Framework files include**:
- Documentation: `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CLAUDE.md`
- Dashboards: `00_Dashboard/01_All_Tasks.md`, `00_Dashboard/09_All_Done.md`
- Templates: All templates under `99_System/Templates/`
- Scripts: All scripts under `99_System/Scripts/`
- Configuration: `.obsidian/` directory (plugin config, smart merge)

```bash
# 1. Preview files to update first
npx @our2ndbrain/cli@latest update --dry-run

# 2. Confirm and execute update
npx @our2ndbrain/cli@latest update
```

During update, difference preview is shown. You can choose:
- **Update all**: Update all framework files at once
- **Review individually**: Confirm each file separately
- **Skip**: Cancel this update

> 💡 **Important**: `update` command only updates framework files (dashboards, templates, scripts, etc.), **will not modify** your personal data directories (20_Areas, 30_Projects, 40_Resources, 90_Archives) and member journals.

### Common Options

**init**
- `-f, --force`: Force overwrite existing project
- `-t, --template <path>`: Use custom template directory

**member**
- `-f, --force`: Force overwrite existing member directory
- `--no-config`: Don't update Obsidian daily-notes config (use for team collaboration)

**update**
- `-d, --dry-run`: Preview files to update without actually executing
- `-t, --template <path>`: Use custom template directory

**remove**
- `-d, --dry-run`: Preview files to remove without actually executing
- `-f, --force`: Skip confirmation and remove directly

### Command Completion

Enable Tab completion for easier command input:

```bash
# Bash
echo 'source <(2ndbrain completion bash)' >> ~/.bashrc

# Bash (macOS use file method because bash 3.x doesn't support source <(...))
2ndbrain completion bash > ~/.2ndbrain-completion.bash
echo 'source ~/.2ndbrain-completion.bash' >> ~/.bash_profile
source ~/.bash_profile

# Zsh
echo 'source <(2ndbrain completion zsh)' >> ~/.zshrc
source ~/.zshrc

# Fish
2ndbrain completion fish > ~/.config/fish/completions/2ndbrain.fish
```

Restart terminal or execute `source ~/.bashrc` (or corresponding shell config file) to take effect.

## 📚 Further Reading

Want to deeply understand the methodology behind it?

- <span id="gtd"></span>**[GTD (Getting Things Done)](https://gettingthingsdone.com/)** - David Allen's classic time management method
  - C-O-R-D is a modern lightweight evolution of GTD, keeping core essence, simplified to four steps

- <span id="para"></span>**[PARA Method](https://fortelabs.com/blog/para/)** - Tiago Forte's knowledge management framework
  - This system's directory structure (Projects, Areas, Resources, Archives) is based on this framework

- <span id="append-and-review"></span>**[The Append-and-Review Note](https://karpathy.bearblog.dev/the-append-and-review-note/)** - Karpathy's minimalist note-taking method
  - **Core idea**: Maintain single note, append all new content to top, promote important content during periodic review
  - **Practice in this system**:
    - `10_Inbox/` directory is the "single collection point" (all journals are here)
    - Collection phase: All ideas, todos first appended to journal, don't interrupt thinking
    - Organization phase: Periodically review journal, promote important content to corresponding directories (Projects/Areas/Resources)
    - This maintains low recording threshold while achieving natural content filtering and organization through review

- <span id="cord"></span>**[C-O-R-D Workflow](https://fortelabs.com/blog/cord/)** - PARA method's practice framework
  - Collect, Organize, Review, Do
  - This system combines these four steps with GTD essence, forming knowledge management practice suitable for individuals and teams

- <span id="obsidian"></span>**[Obsidian](https://obsidian.md/)** - Currently recommended implementation tool, local-first, rich plugin ecosystem

## 🤝 Contributing

Issues and Pull Requests are welcome!

- 🐛 Found a problem? [Submit Issue](https://github.com/Our2ndBrain/2ndBrain-Template/issues)
- 💡 Have improvement suggestions? PRs welcome
- ⭐ Find it useful? Give a Star to support

## 📄 License

This project is licensed under [Apache License 2.0](LICENSE).

---

<p align="center">
  <i>Methodology is the core, tools are just the carrier.<br/>Use systems to carry chaos, let brains focus on thinking.</i>
</p>
