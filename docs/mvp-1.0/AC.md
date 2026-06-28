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
| AC-003-01 | Ignore task ทำให้ task หายจาก active untracked list วันนี้ | Integration: task ไม่อยู่ใน results หลัง ignore |
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

## AC-005: การแสดง Priority

| รหัส | เกณฑ์การยอมรับ | วิธีทดสอบ |
|---|---|---|
| AC-005-01 | Dashboard priority order: Blocker/Failed → Overdue → Due Today | UI: visual order ตรงกับเกณฑ์ |
| AC-005-02 | Priority "Blocker" หรือ status "FAILED"/"BLOCKED" → อยู่ section แรก | Unit: classifier test |
| AC-005-03 | Due date < วันนี้ → section "Overdue" | Unit: date comparison test |
| AC-005-04 | Due date = วันนี้ → section "Due Today" | Unit: date comparison test |
| AC-005-05 | แต่ละ priority section แสดง count badge | UI: badge แสดงตัวเลขที่ถูกต้อง |

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

## Definition of Done (DoD)

Feature ถือว่า **Done** เมื่อ:
1. AC ทุกข้อของ feature นั้น Pass ครบ
2. ไม่มี TypeScript errors (`tsc --noEmit` ผ่าน)
3. Electron app เปิดได้ไม่มี console errors
4. ทดสอบ UI manual บน macOS (arm64) แล้ว
5. ไม่มีการ auto-create Jira ticket เกิดขึ้นระหว่าง test ใดๆ
