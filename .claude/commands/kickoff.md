# Kickoff — สั่ง SDLC Pipeline

เรียกใช้ Multi-Agent SDLC Pipeline ที่ chain ทุก role อัตโนมัติ:
PA → BA → Dev Lead → Dev → Dev Lead review → QA Lead → QA Role → QA Lead sign-off

---

## วิธีใช้

```
/kickoff <งานที่ต้องการ>
```

ตัวอย่าง:
- `/kickoff implement Phase 2 — data layer และ settings UI`
- `/kickoff implement US-004 repo scanner`
- `/kickoff fix bug: RepoScanner ไม่ scan ไฟล์ที่มี space ใน path`

---

## สิ่งที่จะเกิดขึ้น

เมื่อ invoke command นี้ ให้ Claude รัน Workflow script ที่ `.claude/workflows/sdlc-pipeline.js` โดยส่ง args:

```json
{
  "task": "<งานที่ระบุ>"
}
```

Pipeline จะรัน 5 phases:

| Phase | Roles | Output |
|---|---|---|
| 1. Requirements | PA + BA | ยืนยัน scope + AC list |
| 2. Technical Planning | Dev Lead | implementation plan |
| 3. Implementation | Dev | โค้ดจริงใน isolated worktree |
| 4. Code Review | Dev Lead | approve/reject |
| 5. QA | QA Lead + QA Role + QA Lead | audit + sign-off |

---

## ผลลัพธ์ที่เป็นไปได้

| Status | ความหมาย | ขั้นตอนต่อไป |
|---|---|---|
| `SIGNED_OFF` | ทุก role approve แล้ว | Merge โค้ดเข้า main, อัพเดท status.md |
| `REJECTED` | QA Lead ไม่ sign-off | อ่าน rejection reason, แก้ไข, รัน kickoff ใหม่ |
| `NEEDS_REVISION` | Dev Lead ไม่ approve code | แก้โค้ดตาม review, รัน kickoff ใหม่ |
| `STOPPED_BY_PA` | task นอก MVP scope | คุยกับ PM ก่อน หรือรัน `/roles:pa story` สร้าง US ใหม่ |

---

## หลัง Pipeline เสร็จ

อัพเดท `.claude/workflow/status.md` ด้วยผลลัพธ์

---

## หมายเหตุ

- Pipeline นี้ใช้ isolated worktree สำหรับ Dev — โค้ดจะไม่ถูก merge อัตโนมัติ ต้อง merge เอง
- ถ้า pipeline ล้มเหลวกลางทาง สามารถ resume ได้จาก runId ที่ได้รับ
- ดู progress แบบ real-time ที่ `/workflows`
