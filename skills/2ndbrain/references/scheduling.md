# 调度策略

## 概述

三层触发策略，从高频到低频：

| 层级 | 方式 | 频率 | 用途 | Token 成本 |
|------|------|------|------|-----------|
| L1 | `openclaw cron` 定时任务 | 每天 1-2 次 | 完整回顾 + 智能日报 + 全自动整理 | 中 |
| L2 | 用户主动对话 | 按需 | 任何操作 | 低 |
| L3 | `2ndbrain watch` 文件监听 | 实时 | 轻量 Inbox 分拣 | 极低 |

不建议高频定时任务（半小时/1小时）：Token 消耗高且大多数时间 vault 没有变化。

## L1 — OpenClaw Cron 定时任务

OpenClaw 内置 cron 调度器，不需要系统 cron。

### 配置晨间简报（推荐）

```
openclaw cron add \
  --name "2ndbrain-morning" \
  --cron "0 9 * * *" \
  --session isolated \
  --message "你已安装 2ndbrain skill。执行每日整理：1.读取所有 10_Inbox/*/00_To-Do.md 中 ## Inbox 下的未分类任务 2.分类、打标签、移动到项目 Heading 3.完成的任务归档到 09_Done.md 4.生成今日优先级 Top 3 写入日记 5.整理报告写入日记 ## Thoughts"
```

### 可选：午后回顾

```
openclaw cron add \
  --name "2ndbrain-afternoon" \
  --cron "0 14 * * *" \
  --session isolated \
  --message "你已安装 2ndbrain skill。执行午后回顾：1.读取所有 To-Do 文件 2.检查今天到期但未完成的任务 3.更新今日行动计划 4.将回顾写入日记"
```

### 管理 cron 任务

```
openclaw cron list                          # 查看所有定时任务
openclaw cron remove 2ndbrain-morning       # 删除任务
openclaw cron run 2ndbrain-morning --force  # 手动触发一次
```

任务持久化在 `~/.openclaw/cron/jobs.json`，重启不丢失。

### Claude Code Desktop 用户

如果用户不用 OpenClaw 而用 Claude Code Desktop，引导他们在 Desktop 侧栏 Schedule 中创建定时任务，prompt 内容和上面的 `--message` 相同。

## L2 — 用户主动触发

无需配置。用户随时可以跟 Agent 说：

- "帮我整理一下任务"
- "今天做什么"
- "看看我的 To-Do"
- "清理一下收集箱"

可以指定范围：
- "整理 Alice 的任务" → 只处理 `10_Inbox/Alice/00_To-Do.md`
- "整理项目A的任务" → 只处理标记为项目A的任务
- "全局整理" → 处理所有成员的 To-Do

## L3 — `2ndbrain watch` 文件监听

实时监听 To-Do 文件变化，自动触发轻量整理。

### 启动

```
2ndbrain watch [vault-path]
```

### 工作原理

1. 监听 `10_Inbox/*/00_To-Do.md` 的文件变化
2. 检测到变化后，启动 5 分钟防抖计时
3. 5 分钟内无新变化 → 触发轻量 Inbox 分拣
4. 通过 `openclaw agent --agent main --message "..." --local` 调用 Agent
5. Agent 按 2ndbrain skill 执行整理
6. 继续监听

### 选项

```
2ndbrain watch --interval 3   # 防抖间隔改为 3 分钟
2ndbrain watch --once          # 检测到一次变化后整理并退出
```

### 停止

按 `Ctrl+C` 退出。

### 注意事项

- 需要 `openclaw` 或 `claude` CLI 可用（watch 会自动检测用哪个）
- 防抖避免用户正在编辑时触发整理
- 同一时刻只会有一个整理任务在运行
- watch 触发的整理**不需要用户确认**（只做轻量 Inbox 分拣，不做破坏性操作）

## 推荐组合

| 用户类型 | 推荐方案 |
|---------|---------|
| 重度用户（每天大量任务） | L1 晨间简报 + L3 watch 实时监听 |
| 普通用户（每天几个任务） | L1 晨间简报 + L2 按需对话 |
| 轻度用户 | 只用 L2 按需对话 |

## Prompt 模板

watch 和 cron 发出的 message 直接内嵌完整操作指令，确保即使 skill 未自动匹配也能正确执行。

### 整理 Prompt

```
你已安装 2ndbrain skill。请按照该 skill 的整理指令集执行：
1. 读取所有 10_Inbox/*/00_To-Do.md 中 ## Inbox 下的未分类任务
2. 分类、打标签、移动到项目 Heading
3. 完成的任务归档到 09_Done.md
4. 生成整理报告写入当日日记
Vault 路径: <vault-path>
```

### 日报 Prompt

```
你已安装 2ndbrain skill。请按照该 skill 的智能日报指令执行：
1. 读取所有 10_Inbox/*/00_To-Do.md 中的未完成任务
2. 按紧急/重要矩阵排序
3. 生成今日 Top 3 + 完整优先级列表
4. 写入当日日记 ## Thoughts 区
Vault 路径: <vault-path>
```
