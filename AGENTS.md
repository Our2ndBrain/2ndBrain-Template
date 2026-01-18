# AGENTS.md

> This is the project guide for AI assistants. When helping users operate this project, please follow these rules.

## Installing 2ndBrain CLI

```bash
# Use npx to run directly (recommended)
npx @our2ndbrain/cli@latest <command>

# Or install globally
npm install -g @our2ndbrain/cli
2ndbrain <command>
```

## Project Overview

**2ndBrain** is a personal knowledge management system based on PARA + C-O-R-D + Append-and-Review, using Obsidian as the frontend tool.

## Directory Structure Conventions

```
2ndBrain/
├── 00_Dashboard/          # Dashboards: task aggregation entry point
├── 10_Inbox/              # Inbox: journals land here
│   └── {MemberName}/      #   One subdirectory per member
├── 20_Areas/              # Areas: long-term focus areas
├── 30_Projects/           # Projects: things with clear goals
├── 40_Resources/          # Resources: reference materials
├── 90_Archives/           # Archives: completed or inactive items
└── 99_System/             # System: templates, scripts and config
    ├── Scripts/           #   Automation scripts
    └── Templates/         #   Note templates
```

## Core Rules

### 1. Task Format

All tasks use Markdown checkbox format:

```markdown
- [ ] Task description #tag 📅 2026-01-15
```

### 2. Tag Conventions

| Tag | Purpose |
|-----|---------|
| `#next` | Next task to do |
| `#waiting` | Waiting on others |
| `#someday` | Later task |
| `#read` / `#watch` / `#listen` | Read/watch/listen lists |
| `📅 YYYY-MM-DD` | Due date |

### 3. Journal Heading Structure

Use the following headings in journals to categorize content. Dashboards will auto-recognize them:

- `## 💼 Works` - Work tasks
- `## 💡 Thoughts` - Ideas and inspirations
- `## 📚 Readings` - Reading list

### 4. File Placement Rules

- **All new content** → First put in journals under `10_Inbox/{member}/`
- **Clear goals** → `30_Projects/`
- **Long-term maintenance** → `20_Areas/`
- **Reference materials** → `40_Resources/`
- **No longer active** → `90_Archives/`

## Common Operations

### Creating a New Member

Use CLI command:

```bash
npx @our2ndbrain/cli@latest member {MemberName}
```

This creates:
- `10_Inbox/{MemberName}/01_Tasks.md` - Personal task dashboard
- `10_Inbox/{MemberName}/09_Done.md` - Personal completion record
- `.obsidian/daily-notes.json` - Configures journal to save to that member directory

> 💡 Use `--no-config` option for team collaboration to avoid overwriting other members' config.

## AI Assistant Notes

1. **Don't modify Dataview queries in dashboard files**
   - Global dashboards: `00_Dashboard/01_All_Tasks.md` and `09_All_Done.md`
   - Personal dashboards: `10_Inbox/{member}/01_Tasks.md` and `09_Done.md`
   - These are auto-generated dashboards. Only modify tasks in journals, dashboards will auto-update.

2. **Use template when creating journals**
   - Template located at `99_System/Templates/tpl_daily_note.md`
   - Journal naming format: `YYYY-MM-DD.md`

3. **After task completion**
   - Change `- [ ]` to `- [x]`
   - Tasks plugin will auto-add completion date `✅ YYYY-MM-DD`

4. **Follow user's language preference**
   - Adapt responses to user's language settings
   - Match the language used in the conversation

## Agent Collaboration Design

AI assistants and humans **coexist collaboratively** in 2ndBrain. Agents can directly operate all directories (`20_Areas/`, `30_Projects/`, `40_Resources/`, etc.), only need a shared workspace to record work logs.

### Shared Workspace

All Agents share the `10_Inbox/Agents/` directory (note: plural), using a single-file Journal mode:

```
10_Inbox/Agents/
└── Journal.md    # All Agents' work logs (append-and-review)
```

### Journal Format

Uses **append-and-review** mode:
- **Append**: New content appended to file end, separated by delimiters per entry
- **Review**: Periodically review TODOs, check off when complete; valuable content can be output to other directories

```markdown
# Agent Journal

---
2026-01-14 15:30 | Cursor

Executed xxx task...

- [ ] Discovered issue #next

---
2026-01-14 16:45 | Claude Desktop

Optimized yyy...

## 💡 Improvement Suggestions

- Suggest zzz
```

### Why This Design?

| Feature | Reason |
|---------|--------|
| **Shared directory** | Agents aren't "people", don't need isolated personal spaces |
| **Single file** | Read once for full context, highest efficiency |
| **Append-and-Review** | Simple writing + periodic organization, follows C-O-R-D workflow |
| **Timestamp + Agent name** | Know who did what when |

### Review Workflow

Journal content can be output to other directories during review:

| Content Type | Output Target |
|-------------|---------------|
| Completed TODOs | Check off `[x]` stay in place |
| Discovered issues/solutions | → `30_Projects/` related projects |
| Reusable experience | → `40_Resources/` or `20_Areas/` |
| Error post-mortem | Keep in Journal as history |

### When to Write Journal

- After executing complex tasks (migration, refactoring, batch modifications)
- When discovering issues that need fixing
- When having improvement suggestions
- When encountering failures or anomalies

### Work Principles

1. **Prefer improving tools over bypassing them** - Manual operations are non-reproducible and error-prone. When encountering scenarios not supported by tools, improve the tool first then execute.
2. **Pay attention to naming consistency** - Tool design should consider naming differences to avoid sync failures due to inconsistent naming.

### Tasks in Journal

Agents can write todo tasks in Journal, Dashboard dashboards will auto-recognize:

```markdown
- [ ] Discovered xxx needs fixing #next
- [ ] Suggest adding yyy feature #someday 📅 2026-01-30
```

> 💡 **Note**: Tasks with `#someday` tag will appear in "Future Plans" section, regardless of whether they have a due date. This is the dedicated area for "later" tasks.

## Reference Links

- [README.md](README.md) - Complete project documentation
- [Template repository](https://github.com/Our2ndBrain/2ndBrain-Template) - Open source template
