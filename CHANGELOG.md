# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses date-based release versions: `YYYY.M.D`, `YYYY.M.D-beta.N`,
and `YYYY.M.D-N`.

## [2026.4.5] - 2026-04-05

### Added
- automate protected-branch release flow (#16)

### Changed
- split repo docs from shipped template docs (#20)
- remove obsolete GitHub auto-merge setup script (#19)
- consolidate shipped vault assets under template directory (#18)

### Fixed
- publish release tarball from a local path (#15)

## [2026.4.4] - 2026-04-04

### Added
- add dependency doctor and install guidance to setup script
- split daily tasks into overdue and due-today views
- add 2ndbrain Agent Skill + CLI extensions (check, watch)
- refactor to "notes stay notes, tasks stay tasks, diary is the dashboard"

### Changed
- add todo refactor design spec

### Fixed
- pin daily note task query to note date
- correct file diff summary and add regression tests

## [1.1.3] - 2026-01-18

### Added
- reorder Next Actions before Future Plans in dashboard

## [1.1.2] - 2026-01-18

### Fixed
- improve member dashboard update reliability and fix query syntax

## [1.1.1] - 2026-01-18

### Fixed
- Fixed Tasks query syntax error in dashboard (changed `has due date due after today` to `due after today`)
- Added .gitignore rules for temporary scripts in root directory

### Changed
- Synchronized README_en.md with README.md (added integration mode, Obsidian installation guide)
- Added missing `-y, --yes` option to both README files

## [1.1.0] - 2026-01-18

### Added
- add --reset-obsidian option to init command

## [1.0.0] - 2026-01-18

### Major Release - 2ndBrain CLI

A personal knowledge management system CLI tool combining PARA, C-O-R-D, and Append-and-Review methodologies.

### Added
- **Changelog automation**: Automatic changelog generation from git commits via version.js
- **Interactive diff preview**: Colored unified diff output in update command
- **Smart file comparison**: Binary/large file detection using diff package
- **Interactive prompts**: User confirmation system for updates
- **Smart Obsidian merging**: Plugin manifest support for .obsidian directory
- **Shell completion**: bash, zsh, fish support via `completion` command
- **Member management**: Team member initialization with auto-updated dashboards
- **AI assistant integration**: CLAUDE.md for Claude Code guidance
- **Pre-configured plugins**: Recommended Obsidian plugins bundled

### Changed
- **Major refactor**: Enhanced update command with diff preview and review
- **Framework files**: CHANGELOG.md and CLAUDE.md now sync with updates
- **Documentation strategy**: README.md is Chinese-primary, English in README_en.md
- **Plugin documentation**: Restructured as required/optional lists
- **Package distribution**: Fixed npm packaging for all template files

### Fixed
- Changelog generation idempotency (no duplicate versions)
- Empty version entries in changelog generation
- Package.json bin and repository URL formats
- Task query syntax for #someday tag handling
- Bash completion EPIPE error handling

### Removed
- Bundled dataview plugin (now community plugin)
- README_zh.md (consolidated into README.md)
