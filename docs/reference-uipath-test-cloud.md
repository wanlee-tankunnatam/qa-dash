# Reference — UiPath Test Cloud "Autopilot for Testers"

> **ที่มา:** คลิป YouTube *"พลิกโฉมงาน QA! Demo การใช้ AI ทดสอบระบบ Web App ด้วย UiPath Test Cloud"*
> ([youtube.com/watch?v=0jjr8zm_Yn0](https://www.youtube.com/watch?v=0jjr8zm_Yn0))
> **สถานะ:** เอกสารอ้างอิง (research) — เป็น **แรงบันดาลใจของ Epic 9 (MVP 1.4)** ไม่ใช่ spec ที่ต้อง implement ตรง ๆ
> **หมายเหตุ:** ดึง transcript คลิปตรง ๆ ไม่ได้ เนื้อหาด้านล่าง reconstruct จาก UiPath official docs หัวข้อ Autopilot for Testers (เนื้อหาเดียวกับที่คลิป demo)

---

## Autopilot for Testers — AI Testing Lifecycle (4 เฟส)

UiPath วาง AI agents ("Autopilot") ครอบคลุมทั้ง testing lifecycle:

| เฟส | ความสามารถ AI | อยู่ในเครื่องมือ |
|---|---|---|
| **1. Agentic Test Design** | ประเมิน requirement (clarity / completeness / consistency) + generate manual test case จาก user story / SAP transaction | Test Manager |
| **2. Agentic Test Automation** | แปลง manual test case → coded/low-code UI+API test, generate test data, refactor, fix validation error, fuzzy verification | Studio Desktop |
| **3. Agentic Test Execution** | self-healing: ซ่อม test ที่พังตอน runtime, หา root cause, ปรับ selector/logic อัตโนมัติ | Robot / runtime |
| **4. Agentic Test Management** | insight จากผลเทส, natural-language search, chat ช่วยงานทุกเฟส (requirement → generation → reporting) | Test Manager |

---

## Mapping เข้ากับ QADash (Epic 9 / MVP 1.4)

**ปรัชญาที่ยึด:** QADash หยิบเฉพาะ **"ครึ่งซ้าย" ของ lifecycle (Design / Analyze)** — **ไม่รวม** Execution / Automation / Robot / Studio เพราะขัดปรัชญา *read-only sentinel* (ห้าม auto-create/change, AI จาก main process เท่านั้น)

| เฟส UiPath | QADash Story | สถานะ |
|---|---|---|
| **1. Test Design** — ประเมิน requirement | **US-018** AI Gap Check เอกสาร Requirement | ✅ มีใน Epic 9 |
| **1. Test Design** — generate test case | **US-019** AI ร่าง Test Case จาก Requirement | ✅ มีใน Epic 9 |
| **4. Test Management** — insight / coverage | **US-020** Coverage View | ✅ มีใน Epic 9 |
| **4. Test Management** — actionable report | **US-021** Start My Day แบบ Analysis Report | ✅ มีใน Epic 9 |
| **2. Test Automation** (แปลง→coded test, gen data) | — | 🚫 **นอก scope** (ขัด read-only) |
| **3. Test Execution** (self-healing runtime) | — | 🚫 **นอก scope** (ต้องรัน robot) |

**สรุป:** Epic 9 ที่ร่างไว้ **ครอบคลุมครึ่งซ้ายของ UiPath lifecycle ครบแล้ว** (Design + Management) — feature ที่ QADash ตัดออก (Automation/Execution) เป็นการตัดโดยเจตนาตามปรัชญา sentinel ไม่ใช่ช่องโหว่

---

## ไอเดียเพิ่มเติมจากคลิป (ยังไม่มีใน Epic 9 — ต้องผ่าน `/roles:pa`)

แนวคิดจาก UiPath ที่ **อาจ**ต่อยอดได้โดยไม่ขัดปรัชญา read-only:

1. **Natural-language search over tasks/requirements** (จากเฟส 4) — ค้นหา task/story ด้วยภาษาธรรมชาติผ่าน AI แทน keyword filter
2. **Requirement consistency check ข้ามไฟล์** (ต่อยอด US-018) — ไม่ใช่แค่ gap ในไฟล์เดียว แต่หา requirement ที่ขัดกันเองข้าม `.md` หลายไฟล์
3. **Fuzzy coverage matching** (ต่อยอด US-020) — จับคู่ test ↔ requirement แบบ semantic ไม่ใช่แค่ ticket key exact match

> ⚠️ ทั้ง 3 เป็น **read-only insight** ทั้งหมด (ไม่แก้ไฟล์ ไม่แตะ Jira) — สอดคล้องกฎ NEVER แต่ยังต้องให้ PA ประเมิน scope ก่อนเข้า backlog

---

**Sources:**
- [Test Cloud — Autopilot for Testers (UiPath docs)](https://docs.uipath.com/test-cloud/automation-cloud/latest/user-guide/ai-powered-testing)
- [Agentic Testing Platform & Features (UiPath)](https://www.uipath.com/platform/agentic-testing)
- [3 ways UiPath Test Cloud paves the way for agentic, autonomous QA](https://www.uipath.com/blog/product-and-updates/how-uipath-test-cloud-paves-way-for-agentic-autonomous-qa)
- [UiPath Test Cloud: A Complete Guide for QA Teams (2026) — Accelirate](https://www.accelirate.com/uipath-test-cloud/)
