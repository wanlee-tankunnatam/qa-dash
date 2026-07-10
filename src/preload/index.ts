import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '../shared/types/ipc.js'
import type { Project, ProjectConfig } from '../shared/types/project.js'
import type { JiraProject, ServiceCredential } from '../main/services/ConfigStore.js'
import type { ScanResult } from '../shared/types/task.js'
import type { JiraTicket } from '../shared/types/jira.js'
import type { DangerZoneState } from '../shared/types/snapshot.js'
import type { DraftResult } from '../shared/types/draft.js'
import type { SyncSummary } from '../main/services/Scheduler.js'
import type { StartMyDayContext } from '../main/services/DraftService.js'
import type { SprintStatusResult } from '../shared/types/sprint.js'

// qaApi — typed interface ที่ renderer เข้าถึงได้ผ่าน window.qaApi
const qaApi = {
  // Projects
  listProjects: (): Promise<Project[]> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_LIST as string),

  addProject: (rootPath: string): Promise<Project> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_ADD as string, rootPath),

  removeProject: (id: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_REMOVE as string, id),

  renameProject: (id: string, name: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_RENAME as string, id, name),

  updateProjectConfig: (projectId: string, patch: Partial<ProjectConfig>): Promise<ProjectConfig> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_CONFIG_UPDATE as string, projectId, patch),

  getProjectConfig: (projectId: string): Promise<ProjectConfig> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_CONFIG_GET as string, projectId),

  // Repo scanning
  scanRepo: (projectId: string): Promise<ScanResult> =>
    ipcRenderer.invoke(IpcChannel.REPO_SCAN as string, projectId),

  scanAll: (): Promise<ScanResult[]> =>
    ipcRenderer.invoke(IpcChannel.REPO_SCAN_ALL as string),

  // Jira
  fetchTickets: (keys: string[]): Promise<JiraTicket[]> =>
    ipcRenderer.invoke(IpcChannel.JIRA_TICKETS_FETCH as string, keys),

  testJiraConnection: (baseUrl: string, email: string): Promise<boolean> =>
    ipcRenderer.invoke(IpcChannel.JIRA_TEST as string, baseUrl, email),

  setJiraSettings: (settings: { email: string; site: string }): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.JIRA_SETTINGS_SET as string, settings),

  getJiraSettings: (): Promise<{ email: string; site: string } | null> =>
    ipcRenderer.invoke(IpcChannel.JIRA_SETTINGS_GET as string),

  setJiraProjects: (projects: JiraProject[]): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.JIRA_PROJECTS_SET as string, projects),

  getJiraProjects: (): Promise<JiraProject[]> =>
    ipcRenderer.invoke(IpcChannel.JIRA_PROJECTS_GET as string),

  // Tasks
  ignoreTask: (taskId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.TASK_IGNORE as string, taskId),

  unignoreTask: (taskId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.TASK_UNIGNORE as string, taskId),

  toggleTask: (filePath: string, lineNumber: number, checked: boolean): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.TASK_TOGGLE as string, filePath, lineNumber, checked),

  // Danger Zone
  getDangerZoneState: (projectId: string): Promise<DangerZoneState> =>
    ipcRenderer.invoke(IpcChannel.DANGERZONE_STATE as string, projectId),

  // Draft
  createDraft: (taskId: string, projectId: string): Promise<DraftResult> =>
    ipcRenderer.invoke(IpcChannel.DRAFT_CREATE as string, taskId, projectId),

  // AI
  startMyDay: (context: StartMyDayContext): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.AI_START_MY_DAY as string, context),

  // Keychain
  setCredential: (key: string, value: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.KEYCHAIN_SET as string, key, value),

  getCredential: (key: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.KEYCHAIN_GET as string, key),

  deleteCredential: (key: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.KEYCHAIN_DELETE as string, key),

  // Scheduler
  triggerSync: (): Promise<SyncSummary> =>
    ipcRenderer.invoke(IpcChannel.SCHEDULER_TRIGGER as string),

  // Sprint status (dev progress + epic hierarchy from sprint-status.yaml)
  getSprintStatus: (projectId: string): Promise<SprintStatusResult> =>
    ipcRenderer.invoke(IpcChannel.SPRINT_STATUS_GET as string, projectId),

  getActiveSprint: (projectId: string): Promise<{ id: number; name: string } | null> =>
    ipcRenderer.invoke(IpcChannel.JIRA_SPRINT_ACTIVE as string, projectId),

  // AI ask (free prompt)
  toggleDevTools: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.DEV_TOOLS_TOGGLE as string),

  ask: (prompt: string, imagePath?: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.AI_ASK as string, prompt, imagePath),

  gapCheck: (sourceType: 'jira' | 'file', sourceValue: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.AI_GAPCHECK as string, sourceType, sourceValue),

  draftTestCases: (sourceType: 'jira' | 'file', sourceValue: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.AI_DRAFT_TEST_CASES as string, sourceType, sourceValue),

  // Notes (daily freeform notes per date)
  getNote: (date: string): Promise<string> =>
    ipcRenderer.invoke(IpcChannel.NOTES_GET as string, date),

  setNote: (date: string, text: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.NOTES_SET as string, date, text),

  // Credentials vault
  listCredentials: (): Promise<ServiceCredential[]> =>
    ipcRenderer.invoke(IpcChannel.CREDENTIALS_LIST as string),

  upsertCredential: (entry: ServiceCredential, password: string, token: string, secret: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.CREDENTIALS_UPSERT as string, entry, password, token, secret),

  deleteCredential2: (id: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.CREDENTIALS_DELETE as string, id),

  getCredentialPassword: (id: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.CREDENTIALS_GET_PASSWORD as string, id),

  getCredentialToken: (id: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.CREDENTIALS_GET_TOKEN as string, id),

  getCredentialSecret: (id: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.CREDENTIALS_GET_SECRET as string, id),

  // Shell
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.SHELL_OPEN_EXTERNAL as string, url),

  // Dialog
  openFolderDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.DIALOG_OPEN_FOLDER as string),

  dialogOpenFile: (): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.DIALOG_OPEN_FILE as string),

  // Event listeners (Main → Renderer push events)
  onSyncCompleted: (callback: (summary: SyncSummary) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, summary: SyncSummary) => callback(summary)
    ipcRenderer.on(IpcChannel.SYNC_COMPLETED as string, handler)
    return () => ipcRenderer.removeListener(IpcChannel.SYNC_COMPLETED as string, handler)
  },

  onDangerZoneTriggered: (callback: (projectId: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, projectId: string) => callback(projectId)
    ipcRenderer.on(IpcChannel.DANGER_ZONE_TRIGGERED as string, handler)
    return () => ipcRenderer.removeListener(IpcChannel.DANGER_ZONE_TRIGGERED as string, handler)
  },

  onStreamChunk: (callback: (chunk: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, chunk: string) => callback(chunk)
    ipcRenderer.on(IpcChannel.STREAM_CHUNK as string, handler)
    return () => ipcRenderer.removeListener(IpcChannel.STREAM_CHUNK as string, handler)
  },

  onStreamEnd: (callback: (data?: unknown) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, data?: unknown) => callback(data)
    ipcRenderer.on(IpcChannel.STREAM_END as string, handler)
    return () => ipcRenderer.removeListener(IpcChannel.STREAM_END as string, handler)
  },

  onStreamError: (callback: (error: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, error: string) => callback(error)
    ipcRenderer.on(IpcChannel.STREAM_ERROR as string, handler)
    return () => ipcRenderer.removeListener(IpcChannel.STREAM_ERROR as string, handler)
  },
}

contextBridge.exposeInMainWorld('qaApi', qaApi)

export type QaApi = typeof qaApi
