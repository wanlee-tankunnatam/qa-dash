# QADash — Claude Code Context

QADash คือ Personal QA Sentinel: แอป macOS (Electron + Vue.js) ที่ Flag, จัดลำดับ, และวิเคราะห์งาน QA จาก Jira และไฟล์ `.md` ในโปรเจกต์ Local

> **Scope:** MVP 1.3 (shipped) + MVP 1.4 (Fast-Follow Epic 9) — ห้าม implement feature นอก approved roadmap โดยไม่ผ่าน `/pa` ก่อน
> **Freeze Gate:** Epic 9 (US-018–021, US-022 backlog) ถูกล็อกจนกว่า MVP 1.3 จะ ship + QA sign-off ✅

---

## Tech Stack

| ชั้น | เทคโนโลยี |
|---|---|
| Desktop | Electron 35+ ผ่าน electron-vite |
| Frontend | Vue 3 + Vite, Pinia, Vue Router 4 |
| Styling | Tailwind CSS 3 |
| Main Process | Node.js 26, TypeScript ESM |
| IPC | contextBridge + ipcMain/ipcRenderer (typed channels) |
| Jira | REST API v3, API Token (Basic auth: base64(email:token)) |
| AI | Anthropic SDK `@anthropic-ai/sdk`, model `claude-sonnet-4-6`, streaming |
| Storage | electron-store v10 (configs, snapshots, drafts, ignores) |
| Keychain | keytar (macOS Keychain — เฉพาะ credentials เท่านั้น) |
| Scheduler | node-schedule (09:00 วันจันทร์–ศุกร์ auto sync) |
| Packaging | electron-builder (.dmg, arm64 + x64) |

---

## โครงสร้างโปรเจกต์

```
src/
  shared/types/     # TypeScript interfaces ทั้งหมด (Project, Task, JiraTicket, etc.)
  shared/constants.ts
  main/
    index.ts        # Electron entry point
    window.ts       # BrowserWindow factory
    ipc/handlers.ts # ipcMain.handle() ทั้งหมด
    services/       # RepoScanner, JiraClient, DangerZoneTracker,
                    # DraftService, ConfigStore, IgnoreStore,
                    # KeychainService, Scheduler
    utils/          # markdown.ts (checklist parser), logger.ts
  preload/index.ts  # contextBridge เปิด window.qaApi
  renderer/
    pages/          # DashboardPage, ProjectPage, AITerminalPage,
                    # DraftReviewPage, SettingsPage
    stores/         # projects, tasks, jira, dangerZone, draft, settings
    components/     # layout/, dashboard/, tasks/, ai/, draft/, shared/
docs/               # PRD.md, AC.md, user-stories.md, architecture.md
.claude/commands/   # agent skill slash commands
```

---

## กฎที่ห้ามละเมิด (NEVER violate)

1. **ห้าม auto-create Jira ticket** — `JiraClient` ไม่มี POST/PUT/DELETE methods ไม่มี IPC channel สำหรับสร้าง ticket
2. **ห้ามเก็บ credentials ใน electron-store หรือ Pinia** — Jira token และ Anthropic key เก็บใน macOS Keychain ผ่าน `keytar` เท่านั้น
3. **ห้าม Anthropic SDK ใน renderer** — AI calls ทำจาก main process เท่านั้น renderer รับแค่ text chunks ผ่าน IPC events
4. **ห้ามเปลี่ยนสถานะ Jira โดยอัตโนมัติ** — การ check `[x]` ในแอปเป็น local state เท่านั้น ไม่กระทบ Jira จนกว่า user จะ confirm
5. **ต้อง** `contextIsolation: true, nodeIntegration: false` — enforced ใน `src/main/window.ts`

---

## Conventions หลัก

### IPC
- Channel ทั้งหมดประกาศเป็น `const enum IpcChannel` ใน `src/shared/types/ipc.ts`
- Preload wrap channel ทุกตัวเป็น typed functions บน `window.qaApi`
- Push events (main → renderer): prefix `event:*` เช่น `event:stream:chunk`
- Request events (renderer → main): รูปแบบ `category:action` เช่น `repo:scan`

### Task Classification
- Checklist regex: `/^(\s*)-\s\[([ xX])\]\s+(.+)$/`
- Ticket key ดึงจาก per-project `ticketRegex` (default `[A-Z]+-\d+`)
- Stable task ID: `sha1(absoluteFilePath + ':' + lineNumber)`

### Danger Zone
- Threshold: ≥5 untracked tasks เป็นเวลา ≥3 วันติดต่อกัน (ตั้งค่าได้ต่อโปรเจกต์)
- Snapshots เก็บเป็น rolling 7-day window ใน electron-store
- DangerZoneTracker รันหลังทุก scan

### AI Prompting
- `startMyDay`: streaming, structured sections (Critical Before Noon / Standup / Clear Untracked)
- `draftTicket`: non-streaming, JSON output parse เป็น `TicketDraft`
- Model: ใช้ `claude-sonnet-4-6` เสมอ (constant ใน `src/shared/constants.ts`)

---

## ทีมและ Agent Roles

โปรเจกต์นี้มี **9 roles** ใน 3 ระดับ — ทุก role เป็น Claude Code slash command ใน `.claude/commands/roles/`

### Flow หลัก

```
PM Lead
  ├── PA ───────────────────────────────────────────┐
  ├── BA ───────────────────────────────────────────┤
  ├── Dev Lead                                      │
  │     ├── Dev BE ──────────────────────(parallel)►│
  │     └── Dev FE ──────────────────────(parallel)►│
  └── QA Lead                                      │
        └── QA Role ◄─────────────────────────────-┘
```

### ตารางทีมทั้งหมด

| Command | Role | ระดับ | หน้าที่หลัก |
|---|---|---|---|
| `/roles:pm` | PM Lead | บริหาร | Scope, priority, decision, unblock |
| `/roles:pa` | Product Analyst | requirement | PRD, User Stories |
| `/roles:ba` | Business Analyst | requirement | AC, requirements mapping |
| `/roles:dev-lead` | Dev Lead | technical | Architecture, code review, technical decisions |
| `/roles:dev-be` | Dev BE | technical | Implement main process, services, IPC handlers |
| `/roles:dev-fe` | Dev FE | technical | Implement Vue pages, components, Pinia stores |
| `/roles:qa-lead` | QA Lead | quality | Test strategy, sign-off |
| `/roles:qa-role` | QA Reviewer | quality | Audit implementation vs AC |

### SDLC Flow ปกติ

```
PM Lead → PA → BA → Dev Lead → Dev BE + Dev FE (parallel) → Dev Lead review → QA Lead → QA Role → QA Lead sign-off
```

### กฎการ Handoff (TodoWrite prefix)

| From → To | Prefix | ใช้เมื่อ |
|---|---|---|
| PM → PA | `[PM→PA]` | ขอเพิ่ม/ตัด/ปรับ story |
| PM → BA | `[PM→BA]` | ขอปรับ AC หรือ scope |
| PM → Dev Lead | `[PM→DEV-LEAD]` | ส่ง direction technical |
| PM → QA Lead | `[PM→QA-LEAD]` | ส่ง test priority / deadline |
| PA → BA | `[PA→BA]` | Story ใหม่/แก้ไข พร้อมให้ BA เขียน AC |
| BA → PA | `[BA→PA]` | requirement ไม่ชัด ต้องการ clarify |
| BA → Dev Lead | `[BA→DEV-LEAD]` | AC พร้อมให้ plan technical approach |
| Dev Lead → Dev | `[DEV-LEAD→DEV]` | technical approach / คำแนะนำ |
| Dev Lead → BA | `[DEV-LEAD→BA]` | technical constraint ที่กระทบ AC |
| Dev Lead → QA Lead | `[DEV-LEAD→QA-LEAD]` | phase พร้อม QA review |
| Dev → Dev Lead | `[DEV→DEV-LEAD]` | ขอ technical guidance |
| Dev → BA | `[DEV→BA]` | spec ไม่ชัด ต้องการ clarify |
| Dev → PA | `[DEV→PA]` | พบ edge case ที่ไม่มีใน PRD |
| QA Lead → QA Role | `[QA-LEAD→QA-ROLE]` | มอบหมาย audit task |
| QA Lead → Dev Lead | `[QA-LEAD→DEV-LEAD]` | systemic issue ระดับ architecture |
| QA Lead → PM | `[QA-LEAD→PM]` | escalate quality risk |
| QA Role → QA Lead | `[QA-ROLE→QA-LEAD]` | findings ที่ต้องการ QA Lead decision |
| QA Role → Dev | `[QA-ROLE→DEV]` | bug ที่ต้องแก้ |
| QA Role → BA | `[QA-ROLE→BA]` | AC ที่กำกวม |

### ขอบเขต MVP
- **MVP 1.3 (shipped):** US-001 ถึง US-016 ใน `docs/mvp-1.0/user-stories.md`
- **MVP 1.4 (Fast-Follow):** Epic 9 — US-018, US-019, US-020, US-021, US-022 (backlog) [ถูกล็อกจนกว่า MVP 1.3 ship + QA sign-off]
- **นอก scope:** features ใดๆ ที่ไม่อยู่ใน approved roadmap — ต้องผ่าน `/roles:pa story` ก่อนเสมอ
- **PM เป็นผู้ตัดสินใจสุดท้าย** เมื่อมี scope conflict

---

## วิธีใช้ระบบ (How to Run)

### สั่งงานแบบ Full-Auto (แนะนำ)
```
/kickoff <งานที่ต้องการ>
```
ตัวอย่าง: `/kickoff implement Phase 2 — data layer และ settings UI`

Pipeline รัน PA → BA → Dev Lead → Dev → Dev Lead review → QA Lead → QA Role → Sign-off อัตโนมัติ

### สั่งงานแบบ Manual (ต่อ role)
```
/roles:pm status          → ดูภาพรวม
/roles:pa review          → PA ตรวจ user stories
/roles:ba write US-XXX    → BA เขียน AC
/roles:dev phase 2        → Dev implement
/roles:qa-role audit 2    → QA audit
```

### ติดตาม Progress
- `.claude/workflow/status.md` — phase progress ทั้งหมด
- `.claude/workflow/flags.md` — handoff board ระหว่าง roles

---

## Jira Configuration

Jira project keys บันทึกใน electron-store ผ่าน Settings UI ของแอป (IpcChannel `jira:projects:get`)
Instance: `kitdi.atlassian.net`

---

## สถานะปัจจุบัน

Phase 1 — Project Scaffold (กำลัง implement)

---

## โครงสร้างเอกสาร

```
docs/
  mvp-1.0/              ← เอกสารทั้งหมดของ MVP version นี้
    PRD.md
    AC.md
    user-stories.md
    architecture.md
.claude/
  commands/
    roles/              ← slash commands ทุก role
      pm.md             /roles:pm
      pa.md             /roles:pa
      ba.md             /roles:ba
      dev-lead.md       /roles:dev-lead
      dev.md            /roles:dev
      qa-lead.md        /roles:qa-lead
      qa-role.md        /roles:qa-role
```

## เอกสารอ้างอิง

- [docs/mvp-1.0/PRD.md](docs/mvp-1.0/PRD.md) — Product Requirements Document
- [docs/mvp-1.0/AC.md](docs/mvp-1.0/AC.md) — Acceptance Criteria
- [docs/mvp-1.0/user-stories.md](docs/mvp-1.0/user-stories.md) — User Stories US-001 ถึง US-016
- [docs/mvp-1.0/architecture.md](docs/mvp-1.0/architecture.md) — Folder structure, IPC contract, Data models
- [docs/mvp-1.0/be-spec.md](docs/mvp-1.0/be-spec.md) — Backend spec: method signatures, error handling, store keys ทุก service
- [docs/mvp-1.0/fe-spec.md](docs/mvp-1.0/fe-spec.md) — Frontend spec: Vue pages, Pinia stores, component props/emits, IPC pattern
