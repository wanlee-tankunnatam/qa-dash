# BE Spec — Electron Main Process

เอกสารนี้ระบุ method signatures, input/output, และ error handling ของทุก service ใน `src/main/`
Dev agent ต้องอ่านไฟล์นี้ก่อน implement ทุกครั้ง

---

## src/main/services/RepoScanner.ts

```typescript
class RepoScanner {
  constructor(private ignoreStore: IgnoreStore) {}

  async scan(project: Project): Promise<ScanResult>
}
```

### `scan(project)`
- อ่านไฟล์ `.md` ทั้งหมดใน `project.rootPath` ยกเว้น `project.config.excludePatterns`
- ใช้ `glob('**/*.md', { cwd: rootPath, ignore: excludePatterns })`
- แต่ละไฟล์: parse ทีละบรรทัด หา checklist ด้วย regex `/^(\s*)-\s\[([ xX])\]\s+(.+)$/`
- ถ้าบรรทัดมี ticket key ตาม `project.config.ticketRegex` → `LinkedTask`
- ถ้าไม่มี → `UntrackedTask` (เช็ค `ignoreStore.isIgnored(id)` ก่อน set `isIgnoredToday`)
- Task ID: `crypto.createHash('sha1').update(absolutePath + ':' + lineNumber).digest('hex')`

**Return:**
```typescript
interface ScanResult {
  projectId: string
  scannedAt: string        // new Date().toISOString()
  untracked: UntrackedTask[]
  linked: LinkedTask[]
  filesScanned: number
  errors: string[]         // paths ที่ read ไม่ได้ — ไม่ throw, เก็บใน errors แทน
}
```

**Error handling:** ไฟล์ที่อ่านไม่ได้ (permission, encoding) → เพิ่มใน `errors[]` แล้วข้ามต่อ — ไม่ throw

---

## src/main/services/JiraClient.ts

```typescript
class JiraClient {
  constructor(private keychainService: KeychainService) {}

  async getTickets(keys: string[], baseUrl: string): Promise<JiraTicket[]>
  async testConnection(baseUrl: string, email: string): Promise<boolean>
}
```

### `getTickets(keys, baseUrl)`
- POST `/rest/api/3/search` ด้วย JQL: `key in (${keys.join(',')})`
- Header: `Authorization: Basic ${Buffer.from(email:token).toString('base64')}`
- Map Jira response fields:
  - `fields.summary` → `summary`
  - `fields.status.name` → map เป็น `JiraStatus` (ดู mapping ด้านล่าง)
  - `fields.priority.name` → `JiraPriority`
  - `fields.duedate` → `dueDate` (อาจเป็น null)
  - `fields.assignee?.displayName` → `assignee`
  - `fields.labels` → `labels`
- URL: `${baseUrl}/browse/${key}` → `url`
- Rate limit: ส่ง request ทีละ 10 keys, เว้น 100ms ระหว่าง batch

**Jira Status Mapping:**
```typescript
const STATUS_MAP: Record<string, JiraStatus> = {
  'To Do': 'TODO',
  'In Progress': 'IN_PROGRESS',
  'In Review': 'IN_REVIEW',
  'Done': 'DONE',
  'Blocked': 'BLOCKED',
  'Failed': 'FAILED',
}
// ถ้าไม่ match → default 'TODO'
```

**Error handling:**
- HTTP 401/403 → throw `new Error('JIRA_AUTH_FAILED')`
- HTTP 429 → รอ 1000ms แล้ว retry ครั้งเดียว
- Network error → throw ต่อ (caller จัดการ)
- keys ที่หาไม่เจอ → ไม่ปรากฏใน result (ไม่ throw)

### `testConnection(baseUrl, email)`
- GET `/rest/api/3/myself`
- Return `true` ถ้า 200, `false` ถ้าอื่น
- ไม่ throw ทุกกรณี

---

## src/main/services/DangerZoneTracker.ts

```typescript
class DangerZoneTracker {
  constructor(private store: ConfigStore) {}

  recordAndEvaluate(scanResult: ScanResult, config: ProjectConfig): DangerZoneState
  getState(projectId: string): DangerZoneState
}
```

### `recordAndEvaluate(scanResult, config)`
- วันที่วันนี้: `new Date().toISOString().split('T')[0]` → `YYYY-MM-DD`
- Upsert `DaySnapshot` สำหรับวันนี้ใน store key `dangerzone.${projectId}`
- Prune snapshots เก่ากว่า 7 วัน
- นับ streak: วันที่ติดต่อกันย้อนหลังที่ `untrackedCount >= config.warningThresholdCount`
- Set `isActive = streak >= config.warningThresholdDays`

**Store key:** `dangerzone.snapshots.${projectId}` → `DaySnapshot[]`

**Return:** `DangerZoneState` พร้อม `isActive`, `consecutiveDays`, `streakStartDate`

**Error handling:** ถ้า store เสีย → return state ที่ `isActive: false` ไม่ throw

---

## src/main/services/DraftService.ts

```typescript
class DraftService {
  constructor(private keychainService: KeychainService) {}

  async draftTicket(task: UntrackedTask, project: Project, surroundingLines: string[]): Promise<DraftResult>
  async startMyDay(context: StartMyDayContext, window: BrowserWindow): Promise<void>
}

interface StartMyDayContext {
  date: string
  allScanResults: ScanResult[]
  jiraTickets: JiraTicket[]
  projects: Project[]
}
```

### `draftTicket(task, project, surroundingLines)`
- เรียก Anthropic API แบบ non-streaming
- Model: constant `AI_MODEL` จาก `src/shared/constants.ts`
- System prompt: "คุณเป็น QA engineer ที่ช่วยร่าง Jira ticket..."
- User prompt รวม: `task.rawText`, `task.fileRelativePath`, `surroundingLines` (5 บรรทัดก่อน/หลัง), `project.jiraBoardId`
- Expect JSON response: `{ summary, description, priority, labels }`
- Parse JSON จาก response (ใช้ regex หา JSON block ถ้า model ใส่ข้อความล้อมรอบ)

**Return:**
```typescript
interface DraftResult {
  draft: TicketDraft
  warnings: string[]   // เช่น "ไม่สามารถดึง context รอบข้างได้"
}
```

**Error handling:**
- JSON parse fail → retry ครั้งเดียวด้วย prompt ที่เพิ่ม "ตอบ JSON เท่านั้น"
- API error → throw `new Error('DRAFT_FAILED: ' + message)`

### `startMyDay(context, window)`
- เรียก Anthropic API แบบ streaming
- ใช้ `anthropic.messages.stream({...})`
- แต่ละ chunk: `window.webContents.send(IpcChannel.STREAM_CHUNK, chunk.text)`
- เมื่อเสร็จ: `window.webContents.send(IpcChannel.STREAM_END)`
- เมื่อ error: `window.webContents.send(IpcChannel.STREAM_ERROR, error.message)`
- ไม่ throw — ส่ง error ผ่าน IPC แทน

**Prompt structure:** ดู `docs/mvp-1.0/architecture.md` ส่วน "Prompt Structure สำหรับ Start My Day"

---

## src/main/services/ConfigStore.ts

```typescript
class ConfigStore {
  private store: Store  // electron-store instance

  getProjects(): Project[]
  addProject(rootPath: string): Project          // สร้าง uuid, ตั้ง default config
  removeProject(id: string): void
  getConfig(projectId: string): ProjectConfig
  updateConfig(projectId: string, patch: Partial<ProjectConfig>): ProjectConfig
  setJiraSettings(projectId: string, settings: JiraSettings): void
  getJiraSettings(projectId: string): JiraSettings | null
}

interface JiraSettings {
  baseUrl: string
  email: string
  boardId: string
}
```

**Store keys:**
- `projects` → `Project[]`
- `config.${projectId}` → `ProjectConfig`
- `jira.${projectId}` → `JiraSettings`

**Default ProjectConfig** (จาก `src/shared/constants.ts`):
```typescript
const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  ticketRegex: '[A-Z]+-\\d+',
  excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
  includePaths: [],
  warningThresholdDays: 3,
  warningThresholdCount: 5,
}
```

**Error handling:** electron-store จัดการ corruption เอง — ถ้า getProjects() คืน undefined → return `[]`

---

## src/main/services/IgnoreStore.ts

```typescript
class IgnoreStore {
  private store: Store

  ignore(taskId: string): void
  unignore(taskId: string): void
  isIgnored(taskId: string): boolean
  getIgnoredToday(): string[]
  clearStale(): void     // เรียก auto ใน constructor
}
```

**Store key:** `ignores` → `Record<'YYYY-MM-DD', string[]>`

**Logic:**
- `ignore/unignore/isIgnored` ทำงานกับ key ของวันนี้เท่านั้น
- `clearStale()`: ลบ keys ทั้งหมดที่ไม่ใช่วันนี้ (เรียกใน constructor)

**Error handling:** ถ้า store เสีย → `isIgnored()` return `false` ไม่ throw

---

## src/main/services/KeychainService.ts

```typescript
class KeychainService {
  private readonly SERVICE = 'QADash'

  async setCredential(key: 'jira-token' | 'anthropic-key', value: string): Promise<void>
  async getCredential(key: 'jira-token' | 'anthropic-key'): Promise<string | null>
  async deleteCredential(key: 'jira-token' | 'anthropic-key'): Promise<void>
}
```

**keytar calls:**
- `keytar.setPassword(this.SERVICE, key, value)`
- `keytar.getPassword(this.SERVICE, key)` → คืน `null` ถ้าไม่มี
- `keytar.deletePassword(this.SERVICE, key)`

**Error handling:** ทุก method wrap ใน try/catch — ถ้า keytar error (เช่น macOS keychain locked) → throw `new Error('KEYCHAIN_ERROR: ' + message)`

---

## src/main/services/Scheduler.ts

```typescript
class Scheduler {
  constructor(
    private configStore: ConfigStore,
    private repoScanner: RepoScanner,
    private jiraClient: JiraClient,
    private dangerZoneTracker: DangerZoneTracker,
    private window: BrowserWindow
  ) {}

  start(): void       // เริ่ม cron job
  stop(): void        // หยุด cron job
  async triggerSync(): Promise<SyncSummary>  // เรียก manually ได้
}

interface SyncSummary {
  syncedAt: string
  projectsScanned: number
  totalUntracked: number
  totalLinked: number
  dangerZoneProjects: string[]   // project IDs ที่ isActive = true
  errors: string[]
}
```

**Cron schedule:** `'0 9 * * 1-5'` (09:00 วันจันทร์–ศุกร์)

**`triggerSync()` sequence:**
1. `configStore.getProjects()` → project list
2. สำหรับแต่ละ project: `repoScanner.scan(project)`
3. รวม linked keys ทั้งหมด → `jiraClient.getTickets(allKeys, baseUrl)`
4. สำหรับแต่ละ project: `dangerZoneTracker.recordAndEvaluate(result, config)`
5. ถ้ามี project ที่ `isActive` เปลี่ยนจาก false → true: `window.webContents.send(IpcChannel.DANGER_ZONE_TRIGGERED, projectId)`
6. `window.webContents.send(IpcChannel.SYNC_COMPLETED, syncSummary)`

**Error handling:** error ของแต่ละ project เก็บใน `errors[]` ไม่หยุด sync projects อื่น

---

## src/main/utils/markdown.ts

```typescript
export const CHECKLIST_REGEX = /^(\s*)-\s\[([ xX])\]\s+(.+)$/

export function parseChecklist(line: string): { isChecked: boolean; text: string } | null
export function extractTicketKey(text: string, regex: string): string | null
export function getSurroundingLines(lines: string[], lineIndex: number, count: number): string[]
```

### `parseChecklist(line)`
- Match กับ `CHECKLIST_REGEX`
- Return `{ isChecked: match[2] !== ' ', text: match[3].trim() }` หรือ `null`

### `extractTicketKey(text, regex)`
- `new RegExp(regex).exec(text)`
- Return match[0] หรือ `null`

### `getSurroundingLines(lines, lineIndex, count)`
- Return `count` บรรทัดก่อน + `count` บรรทัดหลัง lineIndex
- Clamp ที่ขอบ array

---

## src/main/ipc/handlers.ts

register handlers ทั้งหมดในฟังก์ชันเดียว:

```typescript
export function registerHandlers(
  configStore: ConfigStore,
  repoScanner: RepoScanner,
  jiraClient: JiraClient,
  dangerZoneTracker: DangerZoneTracker,
  draftService: DraftService,
  ignoreStore: IgnoreStore,
  keychainService: KeychainService,
  scheduler: Scheduler,
  getWindow: () => BrowserWindow
): void
```

**Pattern สำหรับทุก handler:**
```typescript
ipcMain.handle(IpcChannel.SCAN_REPO, async (_, projectId: string) => {
  const project = configStore.getProjects().find(p => p.id === projectId)
  if (!project) throw new Error(`Project not found: ${projectId}`)
  return repoScanner.scan(project)
})
```

**Error ทุก handler:** throw error → ipcRenderer จะได้รับเป็น rejected Promise โดยอัตโนมัติ

---

## src/main/index.ts

```typescript
// ลำดับ initialization
app.whenReady().then(async () => {
  // 1. สร้าง services
  const keychainService = new KeychainService()
  const configStore = new ConfigStore()
  const ignoreStore = new IgnoreStore()
  const repoScanner = new RepoScanner(ignoreStore)
  const jiraClient = new JiraClient(keychainService)
  const dangerZoneTracker = new DangerZoneTracker(configStore)
  const draftService = new DraftService(keychainService)

  // 2. สร้าง window
  const mainWindow = createWindow()

  // 3. สร้าง scheduler
  const scheduler = new Scheduler(configStore, repoScanner, jiraClient, dangerZoneTracker, mainWindow)

  // 4. Register IPC handlers
  registerHandlers(configStore, repoScanner, jiraClient, dangerZoneTracker,
                   draftService, ignoreStore, keychainService, scheduler, () => mainWindow)

  // 5. Start scheduler
  scheduler.start()
})

// macOS: เปิด window ใหม่เมื่อ click dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// ไม่ quit เมื่อปิด window บน macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

---

## src/main/window.ts

```typescript
export function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,           // ต้องการสำหรับ preload ที่ใช้ contextBridge
    },
  })

  if (is.dev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return win
}
```

---

## src/shared/constants.ts

```typescript
export const AI_MODEL = 'claude-sonnet-4-6'

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  ticketRegex: '[A-Z]+-\\d+',
  excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
  includePaths: [],
  warningThresholdDays: 3,
  warningThresholdCount: 5,
}

export const DANGER_ZONE_SNAPSHOT_WINDOW = 7   // วัน

export const JIRA_RATE_LIMIT_MS = 100          // ms ระหว่าง batch requests
export const JIRA_BATCH_SIZE = 10              // keys ต่อ request
export const JIRA_RETRY_DELAY_MS = 1000        // ms ก่อน retry เมื่อ 429
