import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel } from '../shared/types/ipc.js'
import type { Project, ProjectConfig } from '../shared/types/project.js'
import type { ScanResult } from '../shared/types/task.js'
import type { JiraTicket } from '../shared/types/jira.js'
import type { DangerZoneState } from '../shared/types/snapshot.js'
import type { DraftResult } from '../shared/types/draft.js'
import type { SyncSummary } from '../main/services/Scheduler.js'
import type { StartMyDayContext } from '../main/services/DraftService.js'

// qaApi — typed interface ที่ renderer เข้าถึงได้ผ่าน window.qaApi
const qaApi = {
  // Projects
  listProjects: (): Promise<Project[]> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_LIST as string),

  addProject: (rootPath: string): Promise<Project> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_ADD as string, rootPath),

  removeProject: (id: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.PROJECTS_REMOVE as string, id),

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
  fetchTickets: (keys: string[], baseUrl: string): Promise<JiraTicket[]> =>
    ipcRenderer.invoke(IpcChannel.JIRA_TICKETS_FETCH as string, keys, baseUrl),

  testJiraConnection: (baseUrl: string, email: string): Promise<boolean> =>
    ipcRenderer.invoke(IpcChannel.JIRA_TEST as string, baseUrl, email),

  // Tasks
  ignoreTask: (taskId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.TASK_IGNORE as string, taskId),

  unignoreTask: (taskId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.TASK_UNIGNORE as string, taskId),

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

  onStreamEnd: (callback: () => void): (() => void) => {
    const handler = () => callback()
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
