# 📋 Dashboard

## 🚀 今日必达 / Today's Priority

```tasks
not done
has due date
due before tomorrow
tag does not include #someday
tag does not include #waiting
tag does not include #next
heading does not include Readings
description regex matches /\S/
path does not include Templates
path does not include 99_System
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
group by function task.file.folder.match(/10_Inbox\/([^\/]+)/)?.[1] ? (" " + task.file.folder.match(/10_Inbox\/([^\/]+)/)[1]) : "📝 NOTES"
sort by due date
limit 100
```

---

## 🎯 立即行动 / Immediate Action

```tasks
not done
no due date
tag does not include #next
tag does not include #waiting
tag does not include #someday
heading does not include Readings
description regex matches /\S/
path does not include Templates
path does not include 99_System
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
group by function task.file.folder.match(/10_Inbox\/([^\/]+)/)?.[1] ? (" " + task.file.folder.match(/10_Inbox\/([^\/]+)/)[1]) : "📝 NOTES"
sort by path
limit 100
```

---

## ⏳ 等待跟进 / Waiting For

```tasks
not done
tag includes #waiting
heading does not include Readings
description regex matches /\S/
path does not include Templates
path does not include 99_System
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
group by function task.file.folder.match(/10_Inbox\/([^\/]+)/)?.[1] ? (" " + task.file.folder.match(/10_Inbox\/([^\/]+)/)[1]) : "📝 NOTES"
sort by path
limit 100
```

---

## 🔥 下一步行动 / Next Actions

```tasks
not done
tag includes #next
heading does not include Readings
description regex matches /\S/
path does not include Templates
path does not include 99_System
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
group by function task.file.folder.match(/10_Inbox\/([^\/]+)/)?.[1] ? (" " + task.file.folder.match(/10_Inbox\/([^\/]+)/)[1]) : "📝 NOTES"
sort by priority
sort by due date
limit 100
```

---

## 📅 未来计划 / Future Plans

```tasks
not done
(due after today) OR (tag includes #someday)
tag does not include #waiting
tag does not include #next
heading does not include Readings
description regex matches /\S/
path does not include Templates
path does not include 99_System
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
group by function task.file.folder.match(/10_Inbox\/([^\/]+)/)?.[1] ? (" " + task.file.folder.match(/10_Inbox\/([^\/]+)/)[1]) : "📝 NOTES"
sort by due date
limit 100
```

---

## 📚 阅读清单 / Reading List

```tasks
not done
(heading includes Readings) OR (heading includes Reading) OR (tag includes #read) OR (tag includes #watch) OR (tag includes #listen)
description regex matches /\S/
sort by path desc
limit 100
```

---

## 🤖 Agent 待办 / Agent Todos

```tasks
not done
path includes 10_Inbox/Agents
description regex matches /\S/
sort by created reverse
limit 50
```
