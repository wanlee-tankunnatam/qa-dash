# FE Spec — Renderer Process (Vue 3)

เอกสารนี้ระบุ component props/emits, Pinia store shape, Router config, และ IPC call patterns
ของทุกอย่างใน `src/renderer/`
Dev agent ต้องอ่านไฟล์นี้ก่อน implement ทุกครั้ง

---

## Router — src/renderer/router/index.ts

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',            name: 'dashboard',    component: () => import('@renderer/pages/DashboardPage.vue') },
  { path: '/project/:id', name: 'project',      component: () => import('@renderer/pages/ProjectPage.vue') },
  { path: '/ai',          name: 'ai-terminal',  component: () => import('@renderer/pages/AITerminalPage.vue') },
  { path: '/draft',       name: 'draft-review', component: () => import('@renderer/pages/DraftReviewPage.vue') },
  { path: '/settings',    name: 'settings',     component: () => import('@renderer/pages/SettingsPage.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
```

**หมายเหตุ:** ใช้ `createWebHashHistory()` เสมอ — Electron ไม่มี web server รองรับ path-based routing

---

## IPC Call Pattern — src/renderer/

window.qaApi มาจาก preload contextBridge — Dev ต้องเรียกผ่าน `window.qaApi` เท่านั้น

```typescript
// ✅ ถูก — ทุก IPC call ใน renderer
const result = await window.qaApi.scanRepo(projectId)

// ❌ ผิด — ห้าม import ipcRenderer หรือ electron ใน renderer
import { ipcRenderer } from 'electron'
```

**Pattern สำหรับ error handling ใน store actions:**
```typescript
async scanProject(projectId: string) {
  this.loading = true
  this.error = null
  try {
    const result = await window.qaApi.scanRepo(projectId)
    this.lastScanResult = result
  } catch (e) {
    this.error = (e as Error).message
  } finally {
    this.loading = false
  }
}
```

**Push events (main → renderer):** register ใน `onMounted` ของ root component (`App.vue`):
```typescript
onMounted(() => {
  window.qaApi.on('event:stream:chunk', (chunk: string) => { ... })
  window.qaApi.on('event:stream:end', () => { ... })
  window.qaApi.on('event:stream:error', (msg: string) => { ... })
  window.qaApi.on('event:sync:completed', (summary: SyncSummary) => { ... })
  window.qaApi.on('event:dangerzone:triggered', (projectId: string) => { ... })
})
```

---

## Preload Contract — src/preload/index.ts

window.qaApi expose methods ตาม IpcChannel ใน `src/shared/types/ipc.ts`:

```typescript
contextBridge.exposeInMainWorld('qaApi', {
  // Projects
  getProjects: () => ipcRenderer.invoke(IpcChannel.GET_PROJECTS),
  addProject: (rootPath: string) => ipcRenderer.invoke(IpcChannel.ADD_PROJECT, rootPath),
  removeProject: (id: string) => ipcRenderer.invoke(IpcChannel.REMOVE_PROJECT, id),
  updateConfig: (id: string, patch: Partial<ProjectConfig>) =>
    ipcRenderer.invoke(IpcChannel.UPDATE_CONFIG, id, patch),

  // Scanning
  scanRepo: (projectId: string) => ipcRenderer.invoke(IpcChannel.SCAN_REPO, projectId),
  triggerSync: () => ipcRenderer.invoke(IpcChannel.TRIGGER_SYNC),

  // Jira
  getTickets: (keys: string[], projectId: string) =>
    ipcRenderer.invoke(IpcChannel.GET_TICKETS, keys, projectId),
  testJiraConnection: (baseUrl: string, email: string) =>
    ipcRenderer.invoke(IpcChannel.TEST_JIRA_CONNECTION, baseUrl, email),
  setJiraSettings: (projectId: string, settings: JiraSettings) =>
    ipcRenderer.invoke(IpcChannel.SET_JIRA_SETTINGS, projectId, settings),

  // Ignore
  ignoreTask: (taskId: string) => ipcRenderer.invoke(IpcChannel.IGNORE_TASK, taskId),
  unignoreTask: (taskId: string) => ipcRenderer.invoke(IpcChannel.UNIGNORE_TASK, taskId),

  // AI
  startMyDay: (context: StartMyDayContext) =>
    ipcRenderer.invoke(IpcChannel.START_MY_DAY, context),
  draftTicket: (task: UntrackedTask, projectId: string, lines: string[]) =>
    ipcRenderer.invoke(IpcChannel.DRAFT_TICKET, task, projectId, lines),

  // Credentials
  setCredential: (key: CredentialKey, value: string) =>
    ipcRenderer.invoke(IpcChannel.SET_CREDENTIAL, key, value),
  deleteCredential: (key: CredentialKey) =>
    ipcRenderer.invoke(IpcChannel.DELETE_CREDENTIAL, key),

  // Push events listener
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },
})
```

---

## Pinia Stores

### src/renderer/stores/projects.ts

```typescript
interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

// Actions
fetchProjects(): Promise<void>
addProject(rootPath: string): Promise<Project>
removeProject(id: string): Promise<void>
updateConfig(id: string, patch: Partial<ProjectConfig>): Promise<void>

// Getters
getById: (id: string) => Project | undefined
```

### src/renderer/stores/tasks.ts

```typescript
interface TasksState {
  byProject: Record<string, ScanResult>  // projectId → ScanResult
  scanning: Record<string, boolean>       // projectId → true ถ้ากำลัง scan
  error: string | null
}

// Actions
scanProject(projectId: string): Promise<void>
ignoreTask(taskId: string, projectId: string): Promise<void>
unignoreTask(taskId: string, projectId: string): Promise<void>

// Getters
getUntracked: (projectId: string) => UntrackedTask[]
getLinked: (projectId: string) => LinkedTask[]
untrackedCount: (projectId: string) => number
```

### src/renderer/stores/jira.ts

```typescript
interface JiraState {
  tickets: Record<string, JiraTicket>  // key → JiraTicket
  loading: boolean
  error: string | null
}

// Actions
fetchTickets(keys: string[], projectId: string): Promise<void>
testConnection(baseUrl: string, email: string): Promise<boolean>
setJiraSettings(projectId: string, settings: JiraSettings): Promise<void>

// Getters
getTicket: (key: string) => JiraTicket | undefined
overdueTickets: JiraTicket[]          // dueDate < today AND status !== DONE
```

### src/renderer/stores/dangerZone.ts

```typescript
interface DangerZoneState {
  states: Record<string, DangerZoneState>  // projectId → DangerZoneState
}

// Actions
updateFromScan(projectId: string, state: DangerZoneState): void

// Getters
isActive: (projectId: string) => boolean
activeProjects: Project[]    // projects ที่ isActive = true
```

### src/renderer/stores/draft.ts

```typescript
interface DraftState {
  current: TicketDraft | null
  sourceTask: UntrackedTask | null
  loading: boolean
  error: string | null
}

// Actions
draftTicket(task: UntrackedTask, projectId: string, surroundingLines: string[]): Promise<void>
updateField(field: keyof TicketDraft, value: string): void
clearDraft(): void
```

### src/renderer/stores/settings.ts

```typescript
interface SettingsState {
  anthropicKeySet: boolean    // ไม่เก็บ key จริง — เช็คแค่ว่า set แล้วหรือยัง
  loading: boolean
  error: string | null
}

// Actions
saveAnthropicKey(key: string): Promise<void>
deleteAnthropicKey(): Promise<void>
checkKeysStatus(): Promise<void>   // เช็คว่า keys ถูก set แล้วหรือยัง
```

---

## Pages

### src/renderer/pages/DashboardPage.vue

**หน้าที่:** ภาพรวมทุกโปรเจกต์ — untracked count, danger zone banner, sync status

```typescript
// ไม่มี props (เป็น page)
// ใช้ store: projects, tasks, dangerZone
// เมื่อ mount: fetchProjects() → scan แต่ละ project
```

**Layout:**
```
┌─────────────────────────────────────────────┐
│ DangerZoneBanner (ถ้า isActive มีโปรเจกต์)  │
├──────────────┬──────────────────────────────┤
│ SideNav      │ ProjectCard (repeat)         │
│              │  ├── project name            │
│              │  ├── untracked count badge   │
│              │  └── danger zone indicator   │
└──────────────┴──────────────────────────────┘
```

---

### src/renderer/pages/ProjectPage.vue

**route param:** `:id` (projectId)

**หน้าที่:** รายการ tasks ของโปรเจกต์เดียว + Jira ticket info

```typescript
// ใช้ store: projects, tasks, jira
// เมื่อ mount: scanProject(id) → fetchTickets(linkedKeys, id)
```

**Layout:**
```
┌────────────────────────────────────────────────┐
│ ProjectHeader (name, scan button, last scan ts) │
├────────────────────────────────────────────────┤
│ TaskList (UntrackedTask[])                      │
│  └── TaskItem × N                               │
│       ├── checkbox (local state only)           │
│       ├── raw text                              │
│       ├── ignore button                         │
│       └── draft ticket button → /draft          │
├────────────────────────────────────────────────┤
│ LinkedTaskList (LinkedTask[] + JiraTicket)      │
│  └── LinkedTaskItem × N                         │
│       ├── checkbox (local state only)           │
│       ├── ticket key + summary                  │
│       ├── status badge                          │
│       └── priority badge                        │
└────────────────────────────────────────────────┘
```

---

### src/renderer/pages/AITerminalPage.vue

**หน้าที่:** Start My Day — streaming output

```typescript
// ใช้ store: projects, tasks, jira
// state: streamContent: string, isStreaming: boolean
```

**Behavior:**
1. User กด "Start My Day" button
2. เรียก `window.qaApi.startMyDay(context)`
3. Listen `event:stream:chunk` → append ไป `streamContent`
4. Listen `event:stream:end` → `isStreaming = false`
5. Listen `event:stream:error` → แสดง error toast

**Layout:**
```
┌─────────────────────────────────────┐
│ "Start My Day" button               │
├─────────────────────────────────────┤
│ StreamingOutput (pre-formatted)     │
│  └── แสดง Markdown render ไปเรื่อยๆ │
└─────────────────────────────────────┘
```

---

### src/renderer/pages/DraftReviewPage.vue

**หน้าที่:** Review และแก้ไข draft ticket ก่อน copy

```typescript
// ใช้ store: draft
// ถ้า draft.current === null: redirect → /
```

**Layout:**
```
┌────────────────────────────────────────────┐
│ DraftForm                                  │
│  ├── Summary (input, editable)             │
│  ├── Description (textarea, editable)      │
│  ├── Priority (select: Highest/High/...)   │
│  └── Labels (tag input)                    │
├────────────────────────────────────────────┤
│ [Copy to Clipboard] button                 │
│ (copy JSON ที่ Jira-compatible ไม่ใช่ POST) │
└────────────────────────────────────────────┘
```

---

### src/renderer/pages/SettingsPage.vue

**หน้าที่:** Jira credentials, Anthropic key, per-project config

```typescript
// ใช้ store: projects, settings
```

**Layout:**
```
┌──────────────────────────────────────────────┐
│ CredentialSection                            │
│  ├── Anthropic API Key (input type=password) │
│  └── [Save] / [Delete] buttons               │
├──────────────────────────────────────────────┤
│ ProjectConfigSection (per project)           │
│  ├── project selector                        │
│  ├── Jira Base URL                           │
│  ├── Jira Email                              │
│  ├── Jira API Token (input type=password)    │
│  ├── [Test Connection] button                │
│  ├── Ticket Regex                            │
│  ├── Exclude Patterns                        │
│  ├── Warning Threshold Days                  │
│  └── Warning Threshold Count                 │
└──────────────────────────────────────────────┘
```

---

## Components

### src/renderer/components/layout/SideNav.vue

```typescript
// Props: none
// Emits: none
// ใช้ router.currentRoute สำหรับ active state
```

**Nav items:**
- Dashboard (`/`)
- AI Terminal (`/ai`)
- Settings (`/settings`)

---

### src/renderer/components/dashboard/ProjectCard.vue

```typescript
interface Props {
  project: Project
  untrackedCount: number
  isDangerZone: boolean
}
// Emits: none
// click → router.push(`/project/${project.id}`)
```

---

### src/renderer/components/dashboard/DangerZoneBanner.vue

```typescript
interface Props {
  projects: Project[]   // projects ที่ isActive = true
}
// Emits: none
// แสดงเฉพาะเมื่อ projects.length > 0
```

---

### src/renderer/components/tasks/TaskItem.vue

```typescript
interface Props {
  task: UntrackedTask
  projectId: string
}
interface Emits {
  ignore: [taskId: string]
  draft: [task: UntrackedTask]
}
// checkbox: local v-model ไม่ส่งไป Jira
```

---

### src/renderer/components/tasks/LinkedTaskItem.vue

```typescript
interface Props {
  task: LinkedTask
  ticket: JiraTicket | null   // null ถ้ายังโหลดไม่เสร็จ
}
// Emits: none
// checkbox: local v-model ไม่ส่งไป Jira
// ticket key: เป็น link ไป ticket.url (เปิดใน default browser)
```

**เปิด external link:**
```typescript
// ใน preload ต้อง expose shell.openExternal ด้วย
window.qaApi.openExternal(ticket.url)

// ใน preload
openExternal: (url: string) => shell.openExternal(url)
```

---

### src/renderer/components/ai/StreamingOutput.vue

```typescript
interface Props {
  content: string
  isStreaming: boolean
}
// Emits: none
// render content เป็น Markdown (ใช้ library เช่น marked หรือ v-html ถ้า sanitized)
// auto-scroll ไปล่างเมื่อ content เปลี่ยน
```

---

### src/renderer/components/draft/DraftForm.vue

```typescript
interface Props {
  draft: TicketDraft
}
interface Emits {
  update: [field: keyof TicketDraft, value: string]
  copy: []
}
```

---

### src/renderer/components/shared/LoadingSpinner.vue

```typescript
interface Props {
  size?: 'sm' | 'md' | 'lg'   // default 'md'
}
```

---

### src/renderer/components/shared/ErrorMessage.vue

```typescript
interface Props {
  message: string
  retryable?: boolean   // default false
}
interface Emits {
  retry: []
}
```

---

### src/renderer/components/shared/StatusBadge.vue

```typescript
interface Props {
  status: JiraStatus
}
// color mapping:
// TODO → gray, IN_PROGRESS → blue, IN_REVIEW → purple
// DONE → green, BLOCKED → orange, FAILED → red
```

---

### src/renderer/components/shared/PriorityBadge.vue

```typescript
interface Props {
  priority: JiraPriority
}
// Highest → red, High → orange, Medium → yellow, Low → blue, Lowest → gray
```

---

## src/renderer/main.ts

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'   // Tailwind base

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## src/renderer/App.vue

```typescript
// register push event listeners ใน onMounted
// ใน onUnmounted: ลบ listeners ด้วย window.qaApi.off(...)
```

```html
<template>
  <div class="flex h-screen bg-gray-50">
    <SideNav />
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
```

---

## Tailwind Config — tailwind.config.js

```javascript
export default {
  content: ['./src/renderer/**/*.{vue,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## src/renderer/assets/main.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Global TypeScript Declaration — src/renderer/env.d.ts

```typescript
declare global {
  interface Window {
    qaApi: {
      getProjects: () => Promise<Project[]>
      addProject: (rootPath: string) => Promise<Project>
      removeProject: (id: string) => Promise<void>
      updateConfig: (id: string, patch: Partial<ProjectConfig>) => Promise<ProjectConfig>
      scanRepo: (projectId: string) => Promise<ScanResult>
      triggerSync: () => Promise<SyncSummary>
      getTickets: (keys: string[], projectId: string) => Promise<JiraTicket[]>
      testJiraConnection: (baseUrl: string, email: string) => Promise<boolean>
      setJiraSettings: (projectId: string, settings: JiraSettings) => Promise<void>
      ignoreTask: (taskId: string) => Promise<void>
      unignoreTask: (taskId: string) => Promise<void>
      startMyDay: (context: StartMyDayContext) => Promise<void>
      draftTicket: (task: UntrackedTask, projectId: string, lines: string[]) => Promise<DraftResult>
      setCredential: (key: CredentialKey, value: string) => Promise<void>
      deleteCredential: (key: CredentialKey) => Promise<void>
      openExternal: (url: string) => Promise<void>
      on: (channel: string, callback: (...args: unknown[]) => void) => void
      off: (channel: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

export {}
```
