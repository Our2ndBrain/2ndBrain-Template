# 任务格式约定

## 基本格式

```markdown
- [ ] 任务描述 #标签 📅 YYYY-MM-DD
```

完成后 Tasks 插件自动添加 `✅ YYYY-MM-DD`：

```markdown
- [x] 任务描述 #标签 📅 2026-04-01 ✅ 2026-04-01
```

## 标签速查

| 标签 | 含义 | 用法 |
|------|------|------|
| `#next` | 下一步要做 | 随时可以开工的任务 |
| `#waiting` | 等别人 | 球在别人那儿 |
| `#someday` | 以后再说 | 想做但不急 |
| `#read` | 要读的 | 文章、书籍等文字内容 |
| `#watch` | 要看的 | 视频、课程等视觉内容 |
| `#listen` | 要听的 | 播客、音频等听觉内容 |
| `📅 YYYY-MM-DD` | 截止日期 | 必须在某天前完成 |

## To-Do 文件结构

每个成员的 `00_To-Do.md`（`10_Inbox/<成员名>/00_To-Do.md`）：

```markdown
# To-Do

## Readings
- [ ] 《深度工作》 #read
- [ ] The Pragmatic Programmer #read 📅 2026-04-15

## 项目A
> [[30_Projects/项目A]]
- [ ] 完成原型设计 📅 2026-04-03
- [ ] 准备评审材料 #next
- [ ] 收集用户反馈 #waiting

## 项目B
> [[30_Projects/项目B]]
- [ ] 重写模板 📅 2026-04-02

## Inbox
- [ ] 买咖啡豆 📅 2026-04-05
- [ ] 回复张三邮件
- [ ] 看一下那个 API 文档
```

### 分区规则

- `## Readings` — 固定在顶部，阅读/观看/收听清单
- `## 项目名` — 中间区域，按需添加。第一行用 blockquote 链接到 `30_Projects/`
- `## Inbox` — **固定在文件最底部**，新任务默认落在这里

Inbox 在底部是因为 Obsidian CLI 的 `append` 命令只能追加到文件末尾，这样新任务自然进入 Inbox。

## 日记结构

每天的日记（`10_Inbox/<成员名>/YYYY-MM-DD.md`）：

```markdown
# 2026-04-01 Tuesday

## To-Do
（Tasks 插件自动查询：今天到期 + 过期未完成的任务，按项目 Heading 分组）

## Thoughts
（手写区：想法、灵感、反思、整理报告、行动计划等）
```

- `## To-Do` — Tasks 插件动态查询，不要手动修改
- `## Thoughts` — 自由写作区，Agent 的整理报告和日报也追加到这里

## 成员目录结构

```
10_Inbox/<成员名>/
├── 00_To-Do.md        # 待办清单（Append-only，Inbox 在底部）
├── 01_Tasks.md        # 个人看板（查询视图，不要修改）
├── 09_Done.md         # 完成归档
└── YYYY-MM-DD.md      # 日记（想法 + 今日看板）
```

## PARA 目录一览

```
2ndBrain/
├── 00_Dashboard/      # 全局看板（查询视图，不要修改）
│   ├── 01_All_Tasks.md
│   └── 09_All_Done.md
├── 10_Inbox/          # 收集箱
│   ├── Agents/        #   Agent 工作区
│   └── <成员名>/      #   人类成员
├── 20_Areas/          # 领域（长期关注）
├── 30_Projects/       # 项目（有目标）
├── 40_Resources/      # 资源（参考资料）
├── 90_Archives/       # 归档
└── 99_System/         # 系统（模板 + 脚本）
```

## 不要修改的文件

这些文件是 Tasks 插件的查询视图，由查询自动生成内容：

- `00_Dashboard/01_All_Tasks.md`
- `00_Dashboard/09_All_Done.md`
- `10_Inbox/<成员名>/01_Tasks.md`

只修改 `00_To-Do.md` 和 `09_Done.md`。
