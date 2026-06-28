# User Stories — QADash

เวอร์ชัน: 1.0
ผู้ใช้หลัก: QA Engineer

---

## Epic 1: การลงทะเบียนและตั้งค่าโปรเจกต์

### US-001 — เพิ่มโปรเจกต์
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ลงทะเบียน Local Repo Path และเชื่อมกับ Jira Project Key,
**เพื่อที่** ระบบจะรู้ว่าต้องสแกน Repo ไหนและดึงข้อมูลจาก Jira Board อะไร

**เงื่อนไขการยอมรับ:**
- สามารถเลือก Local Folder Path ด้วย dialog เปิดไฟล์ได้
- สามารถกรอก Jira Project Key (เช่น `PROJ`) ได้
- สามารถตั้งค่า Ticket Regex Pattern ได้ (default: `[A-Z]+-\d+`)
- สามารถตั้งค่า Exclude Patterns ได้ (เช่น `node_modules/**`, `.git/**`)
- โปรเจกต์ที่เพิ่มปรากฏใน Sidebar ทันที

### US-002 — แก้ไขการตั้งค่าโปรเจกต์
**ในฐานะ** QA Engineer,
**ฉันต้องการ** แก้ไขการตั้งค่าของโปรเจกต์ที่ลงทะเบียนแล้ว,
**เพื่อที่** ฉันสามารถปรับพฤติกรรมการสแกนได้โดยไม่ต้องลบและเพิ่มโปรเจกต์ใหม่

**เงื่อนไขการยอมรับ:**
- สามารถเปลี่ยน Ticket Regex ได้
- สามารถเพิ่ม/ลบ Exclude Patterns ได้
- การเปลี่ยนแปลงมีผลในการสแกนครั้งถัดไป

### US-003 — ลบโปรเจกต์
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ลบโปรเจกต์ออกจาก QADash,
**เพื่อที่** โปรเจกต์นั้นไม่ปรากฏในการสแกนหรือ Dashboard อีกต่อไป

**เงื่อนไขการยอมรับ:**
- มี dialog ยืนยันก่อนลบ
- ข้อมูลทั้งหมด (snapshots, ignores) ถูกลบพร้อมกัน

---

## Epic 2: การตรวจจับและ Flag งาน

### US-004 — สแกน Repo หา Untracked Tasks
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ให้ระบบสแกนไฟล์ `.md` หา checklist items ที่ไม่มี Jira Ticket Key,
**เพื่อที่** ฉันจะได้เห็นงานที่อาจลืม log ใน Jira

**เงื่อนไขการยอมรับ:**
- ระบบอ่านไฟล์ `.md` ทั้งหมด โดยเว้นไฟล์ใน Exclude Patterns
- `- [ ]` ที่ไม่มี Ticket Key → แสดงเป็น "Untracked Task"
- `- [ ]` ที่มี Ticket Key (เช่น `PROJ-123`) → แสดงเป็น "Linked Task"
- ผลลัพธ์ปรากฏบน Dashboard ทันทีหลังสแกน

### US-005 — ดู Untracked Tasks รายโปรเจกต์
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ดู Untracked Tasks ทั้งหมดของโปรเจกต์ใดโปรเจกต์หนึ่งในหน้าเดียว,
**เพื่อที่** ฉันตัดสินใจได้ว่าจะทำอะไรกับแต่ละรายการ

**เงื่อนไขการยอมรับ:**
- หน้า Project แสดง Untracked Tasks พร้อม File Path และ Line Number
- Linked Tasks แสดง Jira Status Badge ควบคู่กัน

### US-006 — Ignore Untracked Task สำหรับวันนี้
**ในฐานะ** QA Engineer,
**ฉันต้องการ** กด Ignore งานที่ยังไม่ต้องการ log ในวันนี้,
**เพื่อที่** งานนั้นหยุดปรากฏในการแจ้งเตือนวันนี้โดยไม่ถูกลบถาวร

**เงื่อนไขการยอมรับ:**
- ปุ่ม "Ignore" อยู่บนแต่ละ Untracked Task row
- งานที่ Ignore ไม่ถูกนับในยอดวันนี้
- เที่ยงคืนผ่าน งานที่ Ignore ปรากฏใหม่อีกครั้ง
- การ Ignore **ไม่** แก้ไขไฟล์ `.md` และ **ไม่** กระทบ Jira

---

## Epic 3: การดึงข้อมูล Jira และจัดลำดับความสำคัญ

### US-007 — ดูสถานะ Jira ของ Linked Task
**ในฐานะ** QA Engineer,
**ฉันต้องการ** เห็น Status, Priority และ Due Date ของ Linked Tasks ที่ดึงจาก Jira,
**เพื่อที่** ฉันรู้ว่างานไหนเร่งด่วนโดยไม่ต้องเปิด Jira

**เงื่อนไขการยอมรับ:**
- หลังสแกน ระบบดึงข้อมูล Ticket Keys ทั้งหมดจาก Jira REST API
- แสดง Status badge: TODO / IN_PROGRESS / BLOCKED / FAILED / DONE
- แสดง Priority chip: Blocker / Critical / Major / Minor
- Due date แสดงพร้อม highlight ถ้า overdue

### US-008 — ดู Priority Queue บน Dashboard
**ในฐานะ** QA Engineer,
**ฉันต้องการ** เห็นรายการงานเรียงตามความสำคัญจากทุกโปรเจกต์,
**เพื่อที่** ฉันรู้ทันทีว่าต้องทำอะไรก่อนตอนเช้า

**เงื่อนไขการยอมรับ:**
- Dashboard แสดง: Blocker/Failed → Overdue → Due Today (เรียงตามนี้เสมอ)
- แต่ละรายการ Link ไปยังหน้า Project
- Count badge แสดงบนแต่ละ section

---

## Epic 4: Danger Zone

### US-009 — เห็น Danger Zone Badge
**ในฐานะ** QA Engineer,
**ฉันต้องการ** เห็น badge เตือนเมื่อโปรเจกต์มี Untracked Tasks สะสมหลายวัน,
**เพื่อที่** ฉันสังเกตเห็นว่ามีงานที่ถูกละเลยอย่างเป็นระบบ

**เงื่อนไขการยอมรับ:**
- Badge "Danger Zone" ปรากฏบน ProjectCard เมื่อ:
  - Untracked count ≥ 5 (ตั้งค่าได้) **และ**
  - เป็นเช่นนี้ติดต่อกัน ≥ 3 วัน (ตั้งค่าได้)
- Badge มีสีแดงและกระพริบ (pulsing)
- Badge หายไปเมื่อจำนวน Untracked Tasks ลดลงต่ำกว่า threshold

---

## Epic 5: AI Terminal — Start My Day

### US-010 — รับ Briefing ประจำวันจาก Claude
**ในฐานะ** QA Engineer,
**ฉันต้องการ** กด "Start My Day" แล้วได้รับ Briefing สรุปงานจาก AI,
**เพื่อที่** ฉันมีแผนการทำงานที่ชัดเจนตั้งแต่ต้นวันโดยไม่ต้องตรวจสอบ Ticket ทุกใบเอง

**เงื่อนไขการยอมรับ:**
- ปุ่มอยู่บนหน้า AI Terminal และ Dashboard
- Claude ได้รับ: ผลสแกนทุกโปรเจกต์ + สถานะ Jira Tickets ทั้งหมด
- ผลลัพธ์ประกอบด้วย:
  1. งานวิกฤตที่ต้องเคลียร์ก่อนเที่ยง
  2. 3–5 bullet points สำหรับ Standup
  3. แผนขั้นตอนการจัดการ Untracked Tasks 3 อันดับแรก
- ผลลัพธ์แสดงแบบ Streaming (ข้อความปรากฏทีละส่วน)
- มี Loading state ระหว่าง Streaming

---

## Epic 6: การ Draft Ticket

### US-011 — ให้ Claude ร่าง Jira Ticket จาก Untracked Task
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ให้ Claude ร่าง Ticket จาก Untracked Task ให้ฉัน,
**เพื่อที่** ฉันไม่ต้องเขียน Ticket ตั้งแต่ศูนย์

**เงื่อนไขการยอมรับ:**
- ปุ่ม "Draft with AI" บน Untracked Task แต่ละรายการ
- Claude สร้าง: Summary, Description, Priority ที่แนะนำ, Labels ที่แนะนำ
- Draft ใช้ context จากไฟล์ `.md` (บรรทัดรอบข้าง, ชื่อไฟล์, ชื่อโปรเจกต์)
- ฉันแก้ไขทุก field ได้ก่อนนำไปใช้
- มีข้อความชัดเจน: "คุณต้องสร้าง Ticket นี้ด้วยตัวเองใน Jira"

### US-012 — ตรวจสอบและ Copy Draft
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ตรวจสอบ Draft ที่ AI สร้างและ Copy ไปวางใน Jira,
**เพื่อที่** ฉันควบคุมทุกขั้นตอนก่อนข้อมูลเข้า Jira

**เงื่อนไขการยอมรับ:**
- หน้า Draft Review แสดง field ที่แก้ไขได้: Summary, Description, Priority, Labels
- ปุ่ม "Copy Jira Markup" คัดลอก content ที่ format แล้ว
- **ไม่มีปุ่ม** "Submit to Jira" ที่ไหนในแอปเลย
- หลัง Copy งานจะ **ไม่** ถูก mark เป็น handled อัตโนมัติ

---

## Epic 7: Morning Auto-Sync

### US-013 — Auto Sync เช้า 09:00
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ให้แอป Sync อัตโนมัติตอน 09:00,
**เพื่อที่** Dashboard พร้อมใช้งานตอนเริ่มทำงานโดยไม่ต้องกด Manual

**เงื่อนไขการยอมรับ:**
- Sync ทำงาน 09:00 วันจันทร์–ศุกร์
- มี Toast notification หลัง Sync เสร็จ
- Dashboard Refresh อัตโนมัติ

### US-014 — Manual Sync
**ในฐานะ** QA Engineer,
**ฉันต้องการ** Trigger Sync เองได้,
**เพื่อที่** ฉัน Refresh ข้อมูลนอกเวลา 09:00 ได้เมื่อต้องการ

**เงื่อนไขการยอมรับ:**
- ปุ่ม "Sync Now" อยู่ใน Top Bar
- Sync ทำงานทันทีและ Dashboard Refresh
- มี Loading indicator ระหว่าง Sync

---

## Epic 8: จัดการ Credentials

### US-015 — เก็บ Jira API Token
**ในฐานะ** QA Engineer,
**ฉันต้องการ** กรอก Jira API Token ครั้งเดียวใน Settings,
**เพื่อที่** แอป Authenticate กับ Jira ได้โดยไม่ถามซ้ำ

**เงื่อนไขการยอมรับ:**
- Settings > Global: กรอก Jira Base URL, Email, API Token
- Token เก็บใน macOS Keychain (ไม่ใช่ App Storage)
- ปุ่ม "Test Connection" ตรวจสอบ credentials ทันที
- Token ไม่แสดงเป็น plaintext หลัง save

### US-016 — เก็บ Anthropic API Key
**ในฐานะ** QA Engineer,
**ฉันต้องการ** กรอก Anthropic API Key ครั้งเดียว,
**เพื่อที่** ฟีเจอร์ AI ทำงานได้โดยไม่ต้องกรอก credentials ซ้ำ

**เงื่อนไขการยอมรับ:**
- Settings > Global: กรอก Anthropic API Key
- Key เก็บใน macOS Keychain
- ไม่ส่ง Key ไปยัง Renderer Process เลย

---

## Epic 7: Morning Auto-Sync (ต่อ)

### US-017 — เด้งหน้าต่างแอปมาข้างหน้าหลัง Morning Sync เสร็จ
**ในฐานะ** QA Engineer,
**ฉันต้องการ** ให้แอปเด้งหน้าต่างขึ้นมาข้างหน้าสุดอัตโนมัติที่เวลา 09:10,
**เพื่อที่** ฉันเห็น Dashboard ที่อัปเดตแล้วทันทีหลังจบ Morning Sync โดยไม่ต้องสลับ Window เอง

**เงื่อนไขการยอมรับ:**
- เวลา 09:10 วันจันทร์–ศุกร์ แอปเรียก `BrowserWindow.focus()` และ `BrowserWindow.show()` เพื่อนำหน้าต่างมาข้างหน้าสุดของ macOS
- พฤติกรรมนี้ทำงานเฉพาะเมื่อแอปกำลังรันอยู่ (ไม่ launch แอปใหม่หากปิดอยู่)
- ไม่มีการเปลี่ยน route หรือ UI — แสดง Dashboard ตามสถานะปัจจุบัน
- ถ้าหน้าต่างถูก minimize อยู่ ให้ restore ก่อนแล้วค่อย focus
- ไม่ใช้ macOS Notification Center และไม่มี dialog ยืนยัน

**Dependencies:**
- US-013 (Auto Sync 09:00) — Sync ต้องเสร็จก่อน 09:10 จึงจะ focus window
