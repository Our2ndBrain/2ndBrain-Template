# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

