# 📋 {{MEMBER_NAME}}'s Tasks

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
path includes {{query.file.folder}}
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
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
path includes {{query.file.folder}}
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts" 
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
path includes {{query.file.folder}}
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
sort by path
limit 100
```

---

## 📅 未来计划 / Future Plans

```tasks
not done
(has due date due after today) OR (tag includes #someday)
tag does not include #waiting
tag does not include #next
heading does not include Readings
description regex matches /\S/
path includes {{query.file.folder}}
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
sort by due date
limit 100
```

---

## 🔥 下一步行动 / Next Actions

```tasks
not done
tag includes #next
heading does not include Readings
description regex matches /\S/
path includes {{query.file.folder}}
group by function !task.heading.includes("Thoughts") ? " 💼 Works" : "💡 Thoughts"
sort by priority
sort by due date
limit 100
```

---

## 📚 阅读清单 / Reading List

```tasks
not done
(heading includes Readings) OR (heading includes Reading) OR (tag includes #read) OR (tag includes #watch) OR (tag includes #listen)
description regex matches /\S/
path includes {{query.file.folder}}
sort by path desc
limit 100
```
