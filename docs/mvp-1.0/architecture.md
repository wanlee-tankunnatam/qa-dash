# Architecture — QADash

เวอร์ชัน: 1.0

---

## โครงสร้างโฟลเดอร์

```
qa-dash/
├── electron.vite.config.ts
├── electron-builder.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json          # main + preload (Node target)
├── tsconfig.web.json           # renderer (browser target)
├── CLAUDE.md                   # context สำหรับ Claude Code
├── docs/                       # เอกสารโปรเจกต์
│   ├── PRD.md                  # Product Requirements Document
│   ├── AC.md                   # Acceptance Criteria
│   ├── user-stories.md         # User Stories (US-001 ถึง US-016)
│   └── architecture.md         # ไฟล์นี้
├── .claude/
│   └── commands/               # Claude Code slash commands
│       ├── pa.md               # Product Analyst role
│       ├── ba.md               # Business Analyst role
│       ├── dev.md              # Developer role
│       └── qa-role.md          # QA Reviewer role
└── src/
    ├── shared/                 # โค้ดที่ใช้ร่วมกันระหว่าง main และ renderer
    │   ├── types/
    │   │   ├── project.ts      # Project, ProjectConfig
    │   │   ├── task.ts         # UntrackedTask, LinkedTask, ScanResult
    │   │   ├── jira.ts         # JiraTicket, JiraStatus, JiraPriority
    │   │   ├── snapshot.ts     # DaySnapshot, DangerZoneState
    │   │   ├── draft.ts        # TicketDraft, DraftResult
    │   │   └── ipc.ts          # IpcChannel enum, IpcRequest/Response types
    │   └── constants.ts        # DANGER_ZONE_THRESHOLD, DEFAULT_PROJECT_CONFIG, AI_MODEL
    ├── main/                   # Electron main process (Node.js context)
    │   ├── index.ts            # App entry: createWindow, app lifecycle, scheduler
    │   ├── window.ts           # BrowserWindow factory พร้อม security options
    │   ├── ipc/
    │   │   └── handlers.ts     # ipcMain.handle() ทั้งหมด
    │   ├── services/
    │   │   ├── RepoScanner.ts      # สแกน .md files, classify tasks
    │   │   ├── JiraClient.ts       # Jira REST API v3 wrapper
    │   │   ├── DangerZoneTracker.ts # บันทึก daily snapshots, ตรวจ streak
    │   │   ├── DraftService.ts     # Claude API integration (streaming + non-streaming)
    │   │   ├── ConfigStore.ts      # เก็บ Project[] และ ProjectConfig ผ่าน electron-store
    │   │   ├── IgnoreStore.ts      # Day-scoped ignore list ผ่าน electron-store
    │   │   ├── KeychainService.ts  # keytar wrapper สำหรับ macOS Keychain
    │   │   └── Scheduler.ts        # node-schedule: morning sync 09:00
    │   └── utils/
    │       ├── markdown.ts     # checklist line parser (regex utilities)
    │       └── logger.ts       # electron-log wrapper
    ├── preload/
    │   └── index.ts            # contextBridge.exposeInMainWorld('qaApi', ...)
    └── renderer/               # Vue 3 SPA (browser context, ไม่มี Node access)
        ├── index.html
        ├── main.ts             # createApp, router, pinia
        ├── App.vue             # root shell: sidebar + router-view
        ├── router/
        │   └── index.ts        # createWebHashHistory + routes
        ├── stores/
        │   ├── projects.ts     # Pinia: project list, active project
        │   ├── tasks.ts        # Pinia: untracked/linked tasks, scan state
        │   ├── jira.ts         # Pinia: jira tickets cache, fetch state
        │   ├── dangerZone.ts   # Pinia: danger zone states per project
        │   ├── draft.ts        # Pinia: current draft, review state
        │   └── settings.ts     # Pinia: global + per-project settings
        ├── pages/
        │   ├── DashboardPage.vue   # "radar" view หลัก
        │   ├── ProjectPage.vue     # task list รายโปรเจกต์
        │   ├── AITerminalPage.vue  # "Start My Day" + streamed output
        │   ├── DraftReviewPage.vue # review draft ก่อน copy
        │   └── SettingsPage.vue    # global + project configuration
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.vue
        │   │   └── TopBar.vue
        │   ├── dashboard/
        │   │   ├── ProjectCard.vue      # card พร้อม danger zone badge
        │   │   ├── DangerZoneBadge.vue  # red pulsing badge
        │   │   ├── PriorityQueue.vue    # Blocker > Overdue > Due Today
        │   │   └── UntrackedAlert.vue   # "N untracked tasks" banner
        │   ├── tasks/
        │   │   ├── TaskRow.vue          # task แต่ละแถวพร้อม actions
        │   │   ├── TaskBadge.vue        # status/priority chip
        │   │   └── IgnoreButton.vue     # day-scope ignore action
        │   ├── ai/
        │   │   ├── StartMyDayButton.vue
        │   │   └── StreamingOutput.vue  # render streamed Claude text
        │   ├── draft/
        │   │   ├── DraftEditor.vue      # editable fields
        │   │   └── CopyToClipboard.vue  # copy formatted draft
        │   └── shared/
        │       ├── StatusIcon.vue
        │       ├── LoadingSpinner.vue
        │       └── ErrorBanner.vue
        └── styles/
            ├── main.css        # Tailwind imports
            └── variables.css   # CSS custom properties
```

---

## IPC Channels

Channel ทั้งหมดประกาศเป็น `const enum IpcChannel` ใน `src/shared/types/ipc.ts`

### Renderer → Main (invoke/handle)

| Channel | ความหมาย |
|---|---|
| `projects:list` | ดึงรายการโปรเจกต์ทั้งหมด |
| `projects:add` | เพิ่มโปรเจกต์ใหม่ |
| `projects:remove` | ลบโปรเจกต์ |
| `projects:config:update` | อัพเดท config รายโปรเจกต์ |
| `projects:config:get` | ดึง config รายโปรเจกต์ |
| `repo:scan` | สแกน single project |
| `repo:scan:all` | สแกนทุกโปรเจกต์ |
| `jira:tickets:fetch` | ดึง tickets ตาม key array |
| `jira:board:fetch` | ดึงข้อมูล board |
| `jira:test` | ทดสอบ Jira connection |
| `task:ignore` | Ignore task (day-scoped) |
| `task:unignore` | Un-ignore task |
| `dangerzone:state` | ดึง danger zone state ของโปรเจกต์ |
| `draft:create` | สร้าง AI draft สำหรับ untracked task |
| `ai:start-my-day` | เริ่ม streaming "Start My Day" |
| `keychain:set` | เก็บ credential ใน Keychain |
| `keychain:get` | ดึง credential จาก Keychain |
| `keychain:delete` | ลบ credential จาก Keychain |
| `scheduler:trigger` | Manual morning sync |

### Main → Renderer (webContents.send) — push events

| Channel | ความหมาย |
|---|---|
| `event:sync:completed` | Morning sync เสร็จแล้ว |
| `event:dangerzone:triggered` | โปรเจกต์เข้าสู่ Danger Zone |
| `event:stream:chunk` | AI response text chunk |
| `event:stream:end` | AI response streaming เสร็จ |
| `event:stream:error` | AI response streaming error |

---

## Data Models

### Project & Config
```typescript
interface Project {
  id: string             // uuid
  name: string           // ชื่อที่แสดง
  rootPath: string       // absolute local path
  jiraBoardId: string    // Jira project key เช่น "PROJ"
  jiraBaseUrl: string    // เช่น "https://org.atlassian.net"
  addedAt: string        // ISO date
  config: ProjectConfig
}

interface ProjectConfig {
  ticketRegex: string           // default: "[A-Z]+-\\d+"
  excludePatterns: string[]     // glob patterns
  includePaths: string[]        // ว่าง = scan ทั้งหมด
  warningThresholdDays: number  // default: 3
  warningThresholdCount: number // default: 5
}
```

### Tasks
```typescript
type Task = UntrackedTask | LinkedTask

interface UntrackedTask {
  id: string             // sha1(filePath:lineNumber)
  projectId: string
  filePath: string       // absolute path
  fileRelativePath: string
  lineNumber: number
  rawText: string        // ข้อความเดิมจาก .md file
  isChecked: boolean
  scannedAt: string
  type: 'untracked'
  isIgnoredToday: boolean
  ignoredAt?: string
}

interface LinkedTask {
  id: string
  projectId: string
  filePath: string
  fileRelativePath: string
  lineNumber: number
  rawText: string
  isChecked: boolean
  scannedAt: string
  type: 'linked'
  jiraKey: string        // เช่น "PROJ-123"
  jiraTicket?: JiraTicket
}
```

### Jira
```typescript
type JiraStatus   = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED' | 'FAILED'
type JiraPriority = 'Blocker' | 'Critical' | 'Major' | 'Minor' | 'Trivial'

interface JiraTicket {
  key: string
  summary: string
  status: JiraStatus
  priority: JiraPriority
  dueDate?: string       // ISO date
  assignee?: string
  labels: string[]
  url: string            // direct browse URL
  fetchedAt: string
}
```

### Danger Zone
```typescript
interface DaySnapshot {
  projectId: string
  date: string           // YYYY-MM-DD
  untrackedCount: number
  linkedCount: number
}

interface DangerZoneState {
  projectId: string
  isActive: boolean
  consecutiveDays: number
  streakStartDate?: string
  lastCheckedDate: string
  snapshots: DaySnapshot[]  // rolling 7-day window
}
```

### Draft
```typescript
interface TicketDraft {
  id: string
  sourceTaskId: string
  projectId: string
  summary: string
  description: string
  suggestedPriority: JiraPriority
  suggestedLabels: string[]
  generatedAt: string
  rawPrompt: string
  rawResponse: string
}
```

---

## Security Model

| กฎ | การ implement |
|---|---|
| ไม่มี Node.js ใน renderer | `nodeIntegration: false`, `contextIsolation: true` |
| ไม่มี credentials ใน app storage | keytar only; ไม่เก็บใน electron-store หรือ Pinia |
| ไม่มี Jira writes | JiraClient ไม่มี POST/PUT/DELETE methods |
| AI calls จาก main เท่านั้น | Anthropic SDK ใน main process; renderer รับแค่ text chunks |
| ไม่มี auto-create Jira | ไม่มี IPC channel สำหรับสร้าง ticket |

---

## แผนการ Implement ทั้ง 10 Phase

| Phase | เป้าหมาย | ไฟล์หลัก |
|---|---|---|
| 1 | Scaffold: shell ที่รันได้ พร้อม IPC ping-pong | electron.vite.config.ts, src/main/index.ts, src/preload/index.ts, src/renderer/App.vue |
| 2 | Data layer: types, ConfigStore, KeychainService, Settings UI | src/shared/types/*, ConfigStore.ts, KeychainService.ts |
| 3 | Repo scanning: RepoScanner, IgnoreStore, Task list UI | RepoScanner.ts, IgnoreStore.ts, ProjectPage.vue |
| 4 | Jira: JiraClient, ticket hydration, priority badges | JiraClient.ts, jira store, TaskBadge.vue |
| 5 | Dashboard + DangerZoneTracker | DangerZoneTracker.ts, DashboardPage.vue, ProjectCard.vue |
| 6 | Scheduler (09:00 auto sync + manual trigger) | Scheduler.ts, TopBar.vue |
| 7 | AI Terminal: DraftService.startMyDay() + streaming UI | DraftService.ts, AITerminalPage.vue, StreamingOutput.vue |
| 8 | Draft Ticket flow: AI drafts, review, copy-only | DraftService.draftTicket(), DraftReviewPage.vue |
| 9 | Settings polish: per-project config, regex validator | SettingsPage.vue |
| 10 | Packaging: electron-builder .dmg (arm64 + x64) | electron-builder.config.ts, resources/icon.icns |

---

## Prompt Structure สำหรับ "Start My Day"

**System prompt:**
```
คุณเป็น QA engineer's daily briefing assistant ที่เข้าถึงสถานะงาน QA ปัจจุบันได้
ตอบสั้นกระชับ เป็น bullet points ไม่มีข้อความที่ไม่จำเป็น
```

**User message (สร้างจากข้อมูล runtime):**
```
วันนี้คือ {date} นี่คือสถานะงาน QA ของฉัน:

## Blocker / Failed Tickets
{รายการ JiraTickets ที่ status BLOCKED หรือ FAILED}

## Overdue Tickets
{รายการ linked tasks ที่ dueDate < วันนี้}

## Due Today
{รายการ linked tasks ที่ dueDate = วันนี้}

## Untracked Tasks (ยังไม่มีใน Jira)
{แยกตามโปรเจกต์: รายการ UntrackedTask.rawText}

กรุณาสรุป:
1. CRITICAL ก่อนเที่ยง: งานอะไรที่ต้องจัดการใน 4 ชั่วโมงข้างหน้า?
2. STANDUP: 3-5 bullet points สำหรับรายงาน Standup
3. CLEAR UNTRACKED: แผนขั้นตอนการเปลี่ยน 3 Untracked Tasks แรกเป็น Jira ticket
```
