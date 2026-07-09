# Acceptance Criteria — QADash

เวอร์ชัน: 1.0
อ้างอิง: [PRD.md](./PRD.md) | [user-stories.md](./user-stories.md)

---

## AC-001: การลงทะเบียนโปรเจกต์

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-001-01 | ผู้ใช้เพิ่มโปรเจกต์โดยเลือก Local Folder Path ได้ | UI: browse dialog เปิดได้, path ถูกบันทึก |
| AC-001-02 | ผู้ใช้กรอก Jira Project Key (เช่น `PROJ`) ได้ | UI: text input รับ alphanumeric + hyphen |
| AC-001-03 | Ticket Regex default คือ `[A-Z]+-\d+` | Unit: assertion ค่า default config |
| AC-001-04 | Exclude Patterns default: `node_modules/**`, `.git/**`, `dist/**`, `build/**` | Unit: assertion ค่า default config |
| AC-001-05 | โปรเจกต์ปรากฏใน Sidebar ทันทีหลัง save | UI: reactive list update |
| AC-001-06 | ลบโปรเจกต์ต้องมี confirmation dialog | UI: dialog render ก่อน delete |
| AC-001-07 | ข้อมูลโปรเจกต์ทั้งหมดถูกลบหลังยืนยัน | Integration: electron-store ไม่มี entry ของ project id นั้นแล้ว |

---

## AC-002: การสแกน Repo

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-002-01 | Scanner อ่านเฉพาะไฟล์ `.md` เท่านั้น | Unit: mock fs, assert เฉพาะ .md ถูก process |
| AC-002-02 | Checklist regex จับ `- [ ]` และ `- [x]` (รองรับ leading spaces) | Unit: regex test cases |
| AC-002-03 | Item ที่มี Ticket Key ตาม project regex → classified เป็น `LinkedTask` | Unit: classification test |
| AC-002-04 | Item ที่ไม่มี Ticket Key → classified เป็น `UntrackedTask` | Unit: classification test |
| AC-002-05 | Path ใน Exclude Patterns ไม่ถูกสแกน | Integration: ไฟล์ใน excluded path ไม่อยู่ใน results |
| AC-002-06 | Task ID ที่ stable สร้างจาก `sha1(filePath + ':' + lineNumber)` | Unit: file+line เดิม → ID เดิมเสมอ |
| AC-002-07 | `ScanResult` มี `filesScanned` count และ `errors` array | Unit: result shape assertion |

---

## AC-003: Ignore Mechanism

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-003-01 | Ignore task ทำให้ task ถูก exclude จาก active untracked **count** วันนี้ (`untrackedCount` ไม่นับ) และแสดงแบบหรี่ (de-emphasized) ใน list — ไม่ถูกลบออกจากมุมมอง | Integration: `untrackedCount` ลดลง + task แสดง dimmed หลัง ignore |
| AC-003-02 | Task ที่ Ignore ถูกเก็บใน electron-store ภายใต้ key วันที่วันนี้ | Unit: store key assertion |
| AC-003-03 | เที่ยงคืนถัดไป task ที่เคย Ignore ปรากฏใหม่ | Unit: simulate date change |
| AC-003-04 | Un-ignore task ทำให้ task ปรากฏใหม่ทันที | Integration: task กลับมาใน list หลัง unignore |
| AC-003-05 | การ Ignore ไม่แก้ไขไฟล์ `.md` | Integration: file content ไม่เปลี่ยนแปลง |

---

## AC-004: Jira Integration

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-004-01 | Jira credentials เก็บใน macOS Keychain ผ่าน keytar | Integration: keytar.getPassword คืนค่าที่ save |
| AC-004-02 | Credentials ไม่ถูกเก็บใน electron-store หรือ Pinia | Code review: grep หา credential ใน stores |
| AC-004-03 | `testConnection()` return true เมื่อ credentials ถูกต้อง | Integration: mock Jira `/myself` endpoint |
| AC-004-04 | `getTickets()` return `JiraTicket[]` พร้อม key, status, priority, dueDate | Integration: mock Jira `/search` endpoint |
| AC-004-05 | Jira API calls ทำจาก main process เท่านั้น (ไม่ใช่ renderer) | Code review: ไม่มี `fetch` ไป Jira ใน renderer code |
| AC-004-06 | Rate limiting: requests เว้น ≥100ms ต่อครั้ง | Unit: timing assertion on queue |

---

## AC-005: การแสดง Priority Queue (US-008)

> **Precedence rule (บังคับ):** แต่ละ task ถูกจัดเข้า **section แรกสุดที่เข้าเกณฑ์เท่านั้น** ตามลำดับ Blocker/Failed → Overdue → Due Today เพื่อไม่ให้นับซ้ำข้าม section (mutually exclusive)
> **Data source:** section "Blocker/Failed" ใช้ได้เฉพาะ `LinkedTask` (ต้องมี Jira `priority`/`status`); section "Overdue"/"Due Today" ใช้ `dueDate` ได้ทั้ง `LinkedTask` และ `UntrackedTask` — *(รอ PA ยืนยัน ดู [BA→PA] flag)*

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-005-01 | Dashboard แสดง 3 section เรียงบน→ล่างเสมอ: (1) Blocker/Failed (2) Overdue (3) Due Today — ลำดับคงที่ ไม่ขึ้นกับข้อมูล | UI: visual order assertion |
| AC-005-02 | Task เข้า section "Blocker/Failed" เมื่อ linked ticket มี `priority === 'Blocker'` **หรือ** `status === 'FAILED'` **หรือ** `status === 'BLOCKED'` | Unit: classifier test |
| AC-005-03 | Task เข้า section "Overdue" เมื่อ `dueDate < todayISO` **และ** `status !== 'DONE'` **และ** ไม่เข้าเกณฑ์ Blocker/Failed | Unit: date + precedence test |
| AC-005-04 | Task เข้า section "Due Today" เมื่อ `dueDate === todayISO` **และ** ไม่เข้าเกณฑ์ Blocker/Failed หรือ Overdue | Unit: date + precedence test |
| AC-005-05 | แต่ละ section แสดง count badge = จำนวน task ใน section นั้น (mutually exclusive ไม่นับซ้ำ) | UI: badge number assertion |
| AC-005-06 | คลิก task ในคิว → navigate ไปหน้า Project (`/project/:id`) ของ task นั้น | UI: click → route assertion |
| AC-005-07 | Section ที่ไม่มี task → แสดง count badge `0` (ไม่ซ่อน header) เพื่อคง visual order คงที่ตาม AC-005-01 | UI: empty-section behavior |

---

## AC-006: Danger Zone

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-006-01 | `DaySnapshot` ถูกบันทึกหลังทุก scan พร้อม `untrackedCount` | Integration: snapshot ถูกเขียนลง store |
| AC-006-02 | Streak นับจาก consecutive days ที่ `untrackedCount >= threshold` | Unit: streak calculator test |
| AC-006-03 | `DangerZoneState.isActive = true` เมื่อ streak ≥ 3 วันติดต่อกัน (default) | Unit: state assertion |
| AC-006-04 | Badge "Danger Zone" render บน ProjectCard เมื่อ `isActive = true` | UI: badge มองเห็น |
| AC-006-05 | Badge หายเมื่อ `untrackedCount` ต่ำกว่า threshold | UI: badge ซ่อนหลัง fix |
| AC-006-06 | Snapshot window เป็น rolling 7 วัน (entry เก่ากว่าถูก prune) | Unit: store pruning test |

---

## AC-007: AI Terminal — Start My Day

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-007-01 | Anthropic API key เก็บใน macOS Keychain เท่านั้น | Integration: keytar assertion |
| AC-007-02 | API call ทำจาก main process เท่านั้น | Code review: ไม่มี Anthropic SDK imports ใน renderer |
| AC-007-03 | Prompt รวม: Blocker/Failed tickets, Overdue, Due Today, Untracked by project | Integration: prompt content assertion |
| AC-007-04 | Response เป็น streaming — chunks ปรากฏทีละส่วน | Integration: onStreamChunk fires หลายครั้ง |
| AC-007-05 | `STREAM_END` event fires เมื่อ streaming เสร็จ | Integration: event sequence assertion |
| AC-007-06 | `STREAM_ERROR` event fires เมื่อ API error | Integration: error path assertion |
| AC-007-07 | UI แสดง loading state ระหว่าง streaming | UI: spinner มองเห็นก่อน chunk แรก |
| AC-007-08 | Model ที่ใช้คือ `claude-sonnet-4-6` | Unit: constant assertion |

---

## AC-008: Draft Ticket

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-008-01 | Draft มี: summary, description, priority, labels | Unit: response parse assertion |
| AC-008-02 | Draft ใช้ context จากบรรทัดรอบข้างในไฟล์ `.md` | Integration: prompt มี file excerpt |
| AC-008-03 | ทุก field ใน draft แก้ไขได้ก่อน copy | UI: input fields ไม่ใช่ readonly |
| AC-008-04 | "Copy Jira Markup" copy text ที่ format แล้วไป clipboard | UI: clipboard content ตรง expected |
| AC-008-05 | ไม่มีปุ่ม "Submit to Jira" ที่ไหนในแอปเลย | Code review: grep หา submit-to-jira |
| AC-008-06 | Draft เก็บใน electron-store ภายใต้ task ID | Unit: store key assertion |
| AC-008-07 | การ Copy draft ไม่ทำให้ Jira API ถูกเรียก | Integration: ไม่มี Jira API call หลัง copy |

---

## AC-009: Morning Sync

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-009-01 | Sync ถูก schedule ไว้ที่ 09:00 วันจันทร์–ศุกร์ | Unit: node-schedule job pattern assertion |
| AC-009-02 | `SYNC_COMPLETED` IPC event fires หลัง sync เสร็จ | Integration: event ถูกรับใน renderer |
| AC-009-03 | Dashboard refresh stores หลัง `SYNC_COMPLETED` | UI: reactive store update triggers re-render |
| AC-009-04 | Manual "Sync Now" เรียก sync function เดิม | Integration: code path เดิมถูกเรียก |
| AC-009-05 | Toast notification แสดงหลัง sync เสร็จ | UI: toast มองเห็นหลัง SYNC_COMPLETED |

---

## AC-010: ความปลอดภัยและกฎที่ห้ามละเมิด

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-010-01 | `contextIsolation: true` บน BrowserWindow ทุกตัว | Code review: window creation options |
| AC-010-02 | `nodeIntegration: false` บน BrowserWindow ทุกตัว | Code review: window creation options |
| AC-010-03 | ไม่มี Jira write operations (POST/PUT/PATCH/DELETE) ใน JiraClient | Code review: มีแค่ GET/POST-for-search |
| AC-010-04 | Credentials ไม่ถูก log หรือส่งผ่าน error messages | Code review: audit logger usage |
| AC-010-05 | keytar native module ถูก exclude จาก asar packaging | Config: `asarUnpack` รวม keytar |

---

## AC-011: Window Focus หลัง Morning Sync (US-017)

| รหัส | US | เงื่อนไข | ผลที่คาดหวัง | วิธีทดสอบ |
|---|---|---|---|---|
| AC-011-01 | US-017 | Cron job ถูก schedule ไว้ที่ 09:10 วันจันทร์–ศุกร์ | node-schedule สร้าง job ด้วย cron pattern `10 9 * * 1-5` | Unit: node-schedule job pattern assertion |
| AC-011-02 | US-017 | เวลา 09:10 วันจันทร์–ศุกร์ และ BrowserWindow กำลังแสดงอยู่ (ไม่ minimize) | `BrowserWindow.focus()` และ `BrowserWindow.show()` ถูกเรียก window ขึ้นมาข้างหน้าสุดของ macOS | Integration: mock BrowserWindow, assert focus() และ show() ถูกเรียก |
| AC-011-03 | US-017 | เวลา 09:10 และ BrowserWindow ถูก minimize อยู่ | `BrowserWindow.restore()` ถูกเรียกก่อน แล้วตามด้วย `BrowserWindow.focus()` และ `BrowserWindow.show()` | Integration: mock isMinimized()=true, assert restore() → focus() → show() ตามลำดับ |
| AC-011-04 | US-017 | เวลา 09:10 แต่แอปปิดอยู่ (BrowserWindow ถูก destroy หรือไม่มี instance) | ไม่มีการกระทำใดๆ เกิดขึ้น ไม่มีการ launch แอปใหม่ | Integration: BrowserWindow.getAllWindows() คืน [], assert ไม่มี window launch call |
| AC-011-05 | US-017 | เวลา 09:10 แต่เป็นวันเสาร์หรืออาทิตย์ | Cron job ไม่ trigger ไม่มีการเรียก focus()/show() | Unit: cron pattern ไม่ครอบคลุมวัน 0 และ 6 |
| AC-011-06 | US-017 | Window focus เกิดขึ้น (ทุก happy path) | ไม่มีการเปลี่ยน route, ไม่มี dialog ยืนยัน และไม่ใช้ macOS Notification Center | Code review: ไม่มี `router.push`, `dialog.show`, `Notification` ใน window-focus handler |

---

## AC-012: AI Gap Check เอกสาร Requirement (US-018)

> **Scope:** MVP 1.4 (Epic 9) — Freeze gate: ห้าม implement จน MVP 1.3 ship + QA sign-off

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-012-01 | ปุ่ม "Gap Check with AI" ปรากฏบน TaskRow และหัวไฟล์ `.md` ในหน้า Project | UI: ปุ่ม render บน task/file row |
| AC-012-02 | Gap Check เรียกผ่าน IPC `ai:gap-check` — AI call ทำจาก main process เท่านั้น | Code review: ไม่มี Anthropic SDK import ใน renderer |
| AC-012-03 | Prompt รวม context: เนื้อหาไฟล์ `.md` (บรรทัดรอบข้าง ±N), fileRelativePath, project name | Integration: prompt content assertion |
| AC-012-04 | Response เป็น JSON โครงสร้าง `{ missingAcceptanceCriteria: string[], missingEdgeCases: string[], missingValidationRules: string[] }` | Unit: response parse assertion |
| AC-012-05 | ผลลัพธ์แสดงแยก 3 หมวดใน UI (Missing AC / Edge Cases / Validation) | UI: 3 sections render จาก response |
| AC-012-06 | Gap Check **ไม่** แก้ไขไฟล์ `.md` | Integration: file content ไม่เปลี่ยนแปลงหลังเรียก |
| AC-012-07 | Gap Check **ไม่** เรียก Jira API และ **ไม่** เปลี่ยนสถานะ task | Integration: ไม่มี Jira API call ระหว่าง gap check |
| AC-012-08 | Model ที่ใช้คือ `claude-sonnet-4-6` (constant เดียวกับ AC-007-08) | Unit: constant assertion |
| AC-012-09 | กรณี response ไม่ใช่ JSON ที่ valid → แสดง error banner ไม่ crash | Integration: malformed response path |

---

## AC-013: AI ร่าง Test Case (US-019)

> **Scope:** MVP 1.4 (Epic 9) — Freeze gate เช่นเดียวกับ AC-012

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-013-01 | ปุ่ม "Draft Test Cases with AI" ปรากฏบน TaskRow และหัวไฟล์ `.md` | UI: ปุ่ม render |
| AC-013-02 | เรียกผ่าน IPC `ai:draft-test-cases` — non-streaming, AI call จาก main process เท่านั้น | Code review: main-process only |
| AC-013-03 | Response เป็น JSON array ของ `TestCaseDraft` — แต่ละเคสมี `scenario`, `testData`, `expectedResult`, `type` | Unit: response parse + shape assertion |
| AC-013-04 | `type` รับค่าจาก enum: `'Boundary' \| 'E2E' \| 'Edge' \| 'Functional'` | Unit: enum validation |
| AC-013-05 | ทุก field ของทุกเคสแก้ไขได้ก่อน copy (ไม่ readonly) | UI: editable inputs |
| AC-013-06 | ปุ่ม "Copy" คัดลอก test cases เป็น Markdown/plain text ไป clipboard | UI: clipboard content ตรง expected |
| AC-013-07 | **ไม่มีปุ่ม** submit/push ไป Jira หรือ test tool ใดๆ — copy-out เท่านั้น | Code review: grep หา submit/push |
| AC-013-08 | มีข้อความเตือน "Test case เหล่านี้เป็นเพียงร่าง — ตรวจสอบก่อนใช้งานจริง" ในหน้า review | UI: warning text มองเห็น |
| AC-013-09 | Test case draft เก็บใน electron-store ภายใต้ source task ID (ไว้ให้ Coverage View อ้าง) | Unit: store key assertion |
| AC-013-10 | การ Copy **ไม่** เรียก Jira API และ **ไม่** mark task เป็น handled | Integration: ไม่มี side effect หลัง copy |

---

## AC-014: Coverage View (US-020)

> **Scope:** MVP 1.4 (Epic 9) — Freeze gate เช่นเดียวกับ AC-012

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-014-01 | Coverage View ใช้ข้อมูลจาก scan (US-004) และ Jira (US-007) เดิม — ไม่มี data source ใหม่ | Code review: ไม่มี fetch/scan เพิ่ม |
| AC-014-02 | LinkedTask ที่มี test case draft (จาก AC-013-09) → สถานะ "Has Coverage" | Unit: coverage classifier test |
| AC-014-03 | LinkedTask ที่ไม่มี test case draft → สถานะ "No Coverage" | Unit: coverage classifier test |
| AC-014-04 | UntrackedTask ทั้งหมด → "No Coverage" โดยปริยาย | Unit: default coverage assertion |
| AC-014-05 | Coverage View เป็น read-only — ไม่มี action ที่แก้ไขข้อมูล | Code review: ไม่มี mutation ใน view |
| AC-014-06 | มี filter "แสดงเฉพาะ No Coverage" (optional) | UI: filter toggle ทำงานถูกต้อง |
| AC-014-07 | Coverage computed แบบ derive จาก store — ไม่ persist สถานะ coverage แยก | Unit: ไม่มี store key ใหม่สำหรับ coverage |

---

## AC-015: Start My Day แบบ Analysis Report (US-021)

> **Scope:** MVP 1.4 (Epic 9) — ต่อยอด AC-007 (US-010) — Freeze gate เช่นเดียวกับ AC-012

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-015-01 | ใช้ปุ่ม "Start My Day" และ IPC `ai:start-my-day` เดิม — ไม่เพิ่ม flow/channel ใหม่ | Code review: reuse channel เดิม |
| AC-015-02 | Prompt เพิ่มคำสั่งให้สรุป 3 ส่วนใหม่: Top Risks, Common Patterns, Suggested Fix Order | Integration: prompt content assertion |
| AC-015-03 | Response ยังคงแสดงแบบ streaming (chunks ทีละส่วน) เหมือน AC-007-04 | Integration: onStreamChunk fires หลายครั้ง |
| AC-015-04 | ส่วนเดิมของ US-010 (Critical ก่อนเที่ยง / Standup / Clear Untracked) ยังแสดงครบ | Integration: backward-compat assertion |
| AC-015-05 | วิเคราะห์จากข้อมูลที่ระบบสรุปให้เท่านั้น — ไม่มีข้อมูลผลรันเทสจริง | Code review: prompt ไม่อ้าง execution result |
| AC-015-06 | Model ที่ใช้คือ `claude-sonnet-4-6` | Unit: constant assertion |

---

## Definition of Done (DoD)

Feature ถือว่า **Done** เมื่อ:
1. AC ทุกข้อของ feature นั้น Pass ครบ
2. ไม่มี TypeScript errors (`tsc --noEmit` ผ่าน)
3. Electron app เปิดได้ไม่มี console errors
4. ทดสอบ UI manual บน macOS (arm64) แล้ว
5. ไม่มีการ auto-create Jira ticket เกิดขึ้นระหว่าง test ใดๆ
