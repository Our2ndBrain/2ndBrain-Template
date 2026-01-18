## ✅ 已完成任务 / Completed Tasks

```tasks
done
heading does not include Readings
heading does not include Reading
tag does not include #read
tag does not include #watch
tag does not include #listen
description regex matches /\S/
path does not include Templates
path does not include 99_System
group by done reverse
group by function task.file.folder.match(/10_Inbox\/([^\/]+)/)?.[1] ? (" " + task.file.folder.match(/10_Inbox\/([^\/]+)/)[1]) : "📝 NOTES"
sort by done reverse
limit 100
```

---

## 📚 Readings 已完成 / Completed Readings

```tasks
done
(heading includes Readings) OR (heading includes Reading) OR (tag includes #read) OR (tag includes #watch) OR (tag includes #listen)
description regex matches /\S/
sort by done reverse
limit 100
```

---

## 🤖 Agent 已完成 / Agent Completed

```tasks
done
path includes 10_Inbox/Agents
description regex matches /\S/
group by done reverse
sort by done reverse
limit 50
```