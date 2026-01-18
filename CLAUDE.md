# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**2ndBrain** is a personal knowledge management system CLI tool published as `@our2ndbrain/cli`. It combines three methodologies:
- **PARA**: Projects, Areas, Resources, Archives organizational structure
- **C-O-R-D**: Collect → Organize → Review → Do workflow
- **Append-and-Review**: Karpathy's note-taking approach (append first, organize during review)

The CLI provides an Obsidian-based template with a Node.js CLI tool for setup and management. The tool is designed for both individual and team use, with Git integration for synchronization.

## CLI Commands

### Installation and Usage
```bash
# Use npx directly (recommended)
npx @our2ndbrain/cli@latest <command>

# Or install globally
npm install -g @our2ndbrain/cli
2ndbrain <command>
```

### Available Commands
- `2ndbrain init [path]` - Initialize new project from template
- `2ndbrain member <name> [path]` - Add new member directory
- `2ndbrain update [path]` - Update framework files with diff preview
- `2ndbrain remove [path]` - Remove framework files

### Command Options
**init**: `-f, --force` (overwrite), `-t, --template <path>` (custom template)
**member**: `-f, --force` (overwrite), `--no-config` (skip Obsidian config)
**update**: `-d, --dry-run` (preview), `-t, --template <path>` (custom template)
**remove**: `-d, --dry-run` (preview), `-f, --force` (skip confirmation)

### Publishing
```bash
npm version <major|minor|patch>  # Updates CHANGELOG.md via scripts/version.js
# postversion hook runs: git push && git push --tags && npm publish
```

## Architecture

### Entry Points
- `bin/2ndbrain.js` - CLI entry point (Commander.js)
- `src/index.js` - Main module that exports commands

### Core Modules

**src/lib/config.js** - Framework file definitions
- `FRAMEWORK_FILES`: Files managed by init/update/remove (AGENTS.md, README.md, CHANGELOG.md, CLAUDE.md, dashboards, templates)
- `FRAMEWORK_DIRS`: Directories created during init (00_Dashboard, 10_Inbox/Agents, 99_System)
- `USER_DATA_DIRS`: Never touched by CLI (20_Areas, 30_Projects, 40_Resources, 90_Archives)
- `COPY_DIRS`: Directories copied entirely (e.g., .obsidian with plugins)
- `MARKER_FILE`: `AGENTS.md` - identifies a 2ndBrain project

**src/lib/files.js** - File operations
- `copyFiles()` - Basic file copying
- `copyFilesSmart()` - Copy with comparison, dry-run support, change tracking
- `removeFiles()` - File removal with tracking
- `ensureDirs()` / `removeEmptyDirs()` - Directory management

**src/lib/diff.js** - File comparison utilities
- Uses `diff` npm package for line/word comparison
- `compareFiles()` - Detects binary/large files, compares contents
- `summarizeChanges()` - Returns added/removed line counts
- `generateDiff()` / `formatDiffForTerminal()` - Unified diff with colors
- Large file threshold: 100KB

**src/lib/prompt.js** - Interactive prompts
- `confirm()` - Yes/no prompts with defaults
- `select()` - Multi-option selection
- `confirmBatchUpdates()` - Bulk update confirmation
- Special handling for binary/large files

**src/commands/init.js** - Project initialization
- Validates target directory (checks for existing 2ndBrain projects or non-empty dirs)
- Creates framework and user data directories
- Copies framework files and .obsidian config
- Creates init-only files (e.g., 10_Inbox/Agents/Journal.md)

**src/commands/member.js** - Member directory creation
- Validates project is a 2ndBrain project
- Creates `10_Inbox/{member}/` directory
- Processes template files with `{{MEMBER_NAME}}` placeholder replacement
- Updates `.obsidian/daily-notes.json` (unless `--no-config`)

**src/commands/update.js** - Framework file updates
- Compares template files with existing files
- Shows diff with colored output for changes
- Supports batch (all), review (individual), or skip modes
- Also updates member dashboards using latest templates

**src/commands/remove.js** - Framework file removal
- Removes only framework files (never user data directories)
- Cleans up empty directories

### Key Design Patterns

**Smart File Management**: Files are compared before copying to avoid unnecessary writes. Binary and large files are detected and handled specially.

**Template System**: Member files use `{{MEMBER_NAME}}` placeholder that gets replaced during `member` command execution.

**Framework vs User Data Separation**:
- Framework files: Managed by CLI, can be updated/removed
- User data directories: Created during init, never modified by CLI
- This allows users to keep their content while updating framework

**Dry Run Mode**: Both `update` and `remove` support `--dry-run` to preview changes before applying.

## Directory Structure (PARA)

```
2ndBrain/
├── 00_Dashboard/          # Task aggregation dashboards (Dataview/Tasks queries)
├── 10_Inbox/              # Collection point (daily journals)
│   ├── Agents/            # AI assistant shared workspace
│   └── {MemberName}/      # Each member's personal directory
├── 20_Areas/              # Long-term focus areas
├── 30_Projects/           # Goal-oriented work
├── 40_Resources/          # Reference materials
├── 90_Archives/           # Completed/inactive content
└── 99_System/             # Templates and scripts
```

## Task Format Convention

Tasks use Markdown checkbox format with tags and dates:
```markdown
- [ ] Task description #tag 📅 YYYY-MM-DD
```

Tags: `#next` (do next), `#waiting` (waiting on others), `#someday` (later), `#read`/`#watch`/`#listen` (consume lists)

## Dependencies

- `commander` - CLI framework
- `chalk` - Terminal colors
- `fs-extra` - Enhanced file system operations
- `diff` - File comparison/diff generation

## Node.js Requirement

Node.js >= 16.0.0 (specified in package.json `engines`)

## Important Notes

- The CLI is published as an npm package, so template files are bundled via `package.json` `files` field
- `.obsidian/` directory is included in the package to provide pre-configured plugins
- `AGENTS.md` serves as both documentation and the marker file for identifying 2ndBrain projects
- Member directories are excluded from automatic updates (must be re-run manually if needed)
