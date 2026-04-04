# ✅ {{MEMBER_NAME}}'s Done

## ✅ 已完成任务 / Completed Tasks

```tasks
done
heading does not include Readings
heading does not include Reading
tag does not include #read
tag does not include #watch
tag does not include #listen
description regex matches /\S/
path includes {{query.file.folder}}
group by done reverse
sort by heading reverse
sort by filename
sort by done reverse
limit 100
```

---

## 📚 Readings 已完成 / Completed Readings

```tasks
done
(heading includes Readings) OR (heading includes Reading) OR (tag includes #read) OR (tag includes #watch) OR (tag includes #listen)
description regex matches /\S/
path includes {{query.file.folder}}
sort by done reverse
limit 100
```
