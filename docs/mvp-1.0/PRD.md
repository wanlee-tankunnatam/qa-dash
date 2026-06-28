# PRD: QADash (Personal QA Sentinel)

เวอร์ชัน: MVP 1.3 (Strict Control & Insightful Sentinel)
แพลตฟอร์ม: macOS App (Electron + Vue.js)

> **สถานะ:** MVP — ขอบเขตนี้คือทั้งหมดที่จะ deliver ใน version แรก
> Features ใหม่ที่ไม่อยู่ในเอกสารนี้ต้องผ่านกระบวนการ `/pa story` ก่อนเสมอ

---

## 1. วัตถุประสงค์

เครื่องมือเฝ้าระวังงานส่วนตัวที่ "ตรวจจับ (Flag), จัดลำดับ (Prioritize), และวิเคราะห์ (Analyze)" งานจาก Jira และ Local Repo แยกรายโปรเจกต์ โดยเน้นการคงไว้ซึ่ง **อำนาจการตัดสินใจของ QA 100%** เพื่อป้องกันงานหลุดโดยไม่สร้างขยะในระบบ Jira

---

## 2. ความต้องการหลักของระบบ

### 2.1 การตรวจจับและ Flag งาน (Detection & Flagging)

**AC 1.1 (Multi-Source Mapping):**
ระบบต้องดึงข้อมูลจาก Jira Board และสแกนไฟล์ `.md` ในทุก Local Repo ตามที่ลงทะเบียนไว้

**AC 1.2 (Unlinked Task Detection):**
ระบบต้องวิเคราะห์ Checklist `[ ]` ใน Repo:
- หาก Checklist มี Ticket Key (เช่น ABC-123) → จัดเป็น **"Linked Task"**
- หากไม่มี Ticket Key → จัดเป็น **"Untracked Task"** และต้องแสดงในหน้า Dashboard ทันที

**AC 1.3 (Ignore Mechanism):**
ผู้ใช้สามารถกด Ignore รายการ Untracked Task ได้ โดยระบบต้องบันทึกไว้ใน Local Storage เพื่อไม่ให้แจ้งเตือนซ้ำในวันนั้น

---

### 2.2 ระบบจัดลำดับความสำคัญ (Prioritization Engine)

**AC 2.1 (Urgency Calculation):**
งานจะถูกจัดลำดับตามความสำคัญดังนี้:
1. **Blocker/Failed** — ตั๋ว Jira ที่สถานะ Failed (ต้องแก้ไขด่วน)
2. **Overdue** — ตั๋วที่เลย Due Date
3. **Due Today** — ตั๋วที่ Due วันนี้

**AC 2.3 (Danger Zone Insight):**
หากโปรเจกต์ใดมียอด Untracked Tasks สะสมเกินค่าที่กำหนด (เช่น 5 รายการ) เกิน 3 วันติดต่อกัน ให้ขึ้น Badge **"Danger Zone"** ที่ชื่อโปรเจกต์นั้นเพื่อเตือนสถานะความไม่ปกติ

---

### 2.3 การควบคุมงาน (Management & Control)

**AC 3.1 (Manual Confirmation):**
ระบบ **ห้าม** สร้างตั๋ว Jira อัตโนมัติทุกกรณี ไม่มีข้อยกเว้น

**AC 3.2 (Draft & Review):**
การสร้างตั๋วจาก Untracked Task ต้องผ่านขั้นตอน:
```
Draft (AI ช่วยร่าง) → Review (ผู้ใช้ตรวจสอบ) → Create (ผู้ใช้กดส่งเองเท่านั้น)
```

**AC 3.3 (Local Task Status):**
การติ๊ก `[x]` ในแอปต้องมีผลแค่ในแอป (Local State) ไม่กระทบสถานะจริงใน Jira จนกว่าผู้ใช้จะกด "Update Jira" เอง

---

### 2.4 AI Terminal (The Strategic Partner)

**AC 4.1 (Contextual Prompting):**
ปุ่ม **"Start My Day"** ต้องเรียก Prompt สำเร็จรูปที่สั่งให้ Claude:
- วิเคราะห์งานวิกฤตที่ต้องเคลียร์ก่อนเที่ยง
- แยกงานที่ต้องนำไปคุยในที่ประชุม Standup
- แนะนำสเต็ปการเคลียร์ Untracked Tasks ที่เหลือ

**AC 4.2 (Memory):**
AI ต้องเข้าถึงโครงสร้างโครงการและสถานะงานค้างที่ระบบสรุปให้ในแต่ละวันได้

---

## 3. สรุปขั้นตอนการทำงาน

```
Morning Sync (09:00)
  → แอปดึงข้อมูลทุกโปรเจกต์
  → สแกน Repo
  → ดึง Jira
  → สรุปสถานะลงใน Dashboard

Detection
  → พบ Untracked Tasks → Flag ให้เห็นทันที

Human Verification
  → ตรวจสอบงาน: เลือก Ignore หรือ Draft Ticket
  → QA ตัดสินใจเสมอ

Action
  → เคลียร์งานตาม Priority List (Urgent → Overdue → Normal)

Review
  → ใช้ "Start My Day" เพื่อให้ Claude สรุปภาพรวมการบริหารเวลาในวันนี้
```

---

## 4. ความต้องการด้านการตั้งค่า

| รายการ | รายละเอียด |
|---|---|
| Exclude Patterns | รองรับการตั้งค่าไฟล์ที่ไม่ต้องการให้สแกน เช่น `node_modules/**`, `.git/**` |
| Ticket Pattern | รองรับการตั้งค่า Regex เพื่อระบุรูปแบบ Ticket Key เช่น `PROJ-[0-9]+` |

---

## 5. Tech Stack

| ชั้น | เทคโนโลยี |
|---|---|
| แพลตฟอร์ม | macOS (Electron 35+) |
| Frontend | Vue 3 + Vite (ผ่าน electron-vite) |
| State Management | Pinia |
| Routing | Vue Router 4 |
| Styling | Tailwind CSS 3 |
| Main Process | Node.js 26 (TypeScript ESM) |
| IPC | contextBridge + ipcRenderer/ipcMain (typed channels) |
| Jira | REST API v3, API Token authentication |
| AI | Anthropic SDK (claude-sonnet-4-6), streaming |
| Local Storage | electron-store (tasks, configs, ignore list, danger zone) |
| Keychain | keytar (macOS Keychain — เฉพาะ API keys เท่านั้น) |
| Scheduler | node-schedule (sync อัตโนมัติ 09:00) |
| Packaging | electron-builder (.dmg, arm64 + x64) |

---

## 6. ขอบเขต MVP และทีม

### สิ่งที่อยู่ใน MVP (In Scope)
- Epic 1–8 ทั้งหมด (US-001 ถึง US-016)
- แพลตฟอร์ม macOS เท่านั้น (ไม่มี Windows / Linux)
- Jira Cloud เท่านั้น (ไม่รองรับ Jira Server / Data Center)
- ผู้ใช้คนเดียวต่อ installation (ไม่มี multi-user)

### สิ่งที่ไม่อยู่ใน MVP (Out of Scope)
- การแก้ไขไฟล์ `.md` จากภายในแอป
- การ sync สถานะ checkbox กลับ Jira อัตโนมัติ
- Notification บน macOS Notification Center
- Dark/Light mode toggle
- Multiple Jira instances

### ทีม SDLC (Agent Roles)
โปรเจกต์นี้มี 4 roles ที่ทำงานเป็น Claude Code slash commands:

| Role | Command | หน้าที่ |
|---|---|---|
| Product Analyst | `/pa` | ดูแล PRD และ User Stories |
| Business Analyst | `/ba` | เขียนและดูแล Acceptance Criteria |
| Developer | `/dev` | Implement ตาม architecture plan |
| QA Reviewer | `/qa-role` | Audit implementation ตาม AC |

Flow: `/pa` → `/ba` → `/dev` → `/qa-role` → กลับ `/dev` ถ้ามี bug

---

## 7. กฎที่ห้ามละเมิด

1. **ห้าม** auto-create Jira ticket ทุกกรณี
2. **ห้าม** เก็บ credentials ใน electron-store หรือ Pinia — ใช้ macOS Keychain เท่านั้น
3. **ห้าม** เรียก Anthropic API จาก renderer — ผ่าน main process เท่านั้น
4. **ห้าม** เปลี่ยนสถานะ Jira โดยอัตโนมัติ — ผู้ใช้ต้อง confirm ทุกครั้ง
5. **ต้องเปิด** `contextIsolation: true` และ `nodeIntegration: false` บน BrowserWindow ทุกตัว
