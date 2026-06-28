import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc.js'
import type { ConfigStore } from '../services/ConfigStore.js'
import type { RepoScanner } from '../services/RepoScanner.js'
import type { JiraClient } from '../services/JiraClient.js'
import type { DangerZoneTracker } from '../services/DangerZoneTracker.js'
import type { DraftService } from '../services/DraftService.js'
import type { IgnoreStore } from '../services/IgnoreStore.js'
import type { KeychainService } from '../services/KeychainService.js'
import type { Scheduler } from '../services/Scheduler.js'
import type { StartMyDayContext } from '../services/DraftService.js'
import { getSurroundingLines } from '../utils/markdown.js'
import { readFile } from 'fs/promises'

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
): void {
  ipcMain.handle(IpcChannel.PROJECTS_LIST as string, async () => {
    return configStore.getProjects()
  })

  ipcMain.handle(IpcChannel.PROJECTS_ADD as string, async (_, rootPath: string) => {
    return configStore.addProject(rootPath)
  })

  ipcMain.handle(IpcChannel.PROJECTS_REMOVE as string, async (_, id: string) => {
    configStore.removeProject(id)
  })

  ipcMain.handle(
    IpcChannel.PROJECTS_CONFIG_UPDATE as string,
    async (_, projectId: string, patch: Record<string, unknown>) => {
      return configStore.updateConfig(projectId, patch as Parameters<ConfigStore['updateConfig']>[1])
    }
  )

  ipcMain.handle(IpcChannel.PROJECTS_CONFIG_GET as string, async (_, projectId: string) => {
    return configStore.getConfig(projectId)
  })

  ipcMain.handle(IpcChannel.REPO_SCAN as string, async (_, projectId: string) => {
    const project = configStore.getProjects().find((p) => p.id === projectId)
    if (!project) throw new Error(`Project not found: ${projectId}`)
    return repoScanner.scan(project)
  })

  ipcMain.handle(IpcChannel.REPO_SCAN_ALL as string, async () => {
    const projects = configStore.getProjects()
    const results = await Promise.allSettled(projects.map((p) => repoScanner.scan(p)))
    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value
      return { projectId: projects[i].id, error: r.reason?.message }
    })
  })

  ipcMain.handle(
    IpcChannel.JIRA_TICKETS_FETCH as string,
    async (_, keys: string[], baseUrl: string, email: string) => {
      return jiraClient.getTickets(keys, baseUrl, email)
    }
  )

  ipcMain.handle(IpcChannel.JIRA_TEST as string, async (_, baseUrl: string, email: string) => {
    return jiraClient.testConnection(baseUrl, email)
  })

  ipcMain.handle(IpcChannel.TASK_IGNORE as string, async (_, taskId: string) => {
    ignoreStore.ignore(taskId)
  })

  ipcMain.handle(IpcChannel.TASK_UNIGNORE as string, async (_, taskId: string) => {
    ignoreStore.unignore(taskId)
  })

  ipcMain.handle(IpcChannel.DANGERZONE_STATE as string, async (_, projectId: string) => {
    return dangerZoneTracker.getState(projectId)
  })

  ipcMain.handle(
    IpcChannel.DRAFT_CREATE as string,
    async (_, taskId: string, projectId: string) => {
      const project = configStore.getProjects().find((p) => p.id === projectId)
      if (!project) throw new Error(`Project not found: ${projectId}`)

      // Scan to find the task
      const result = await repoScanner.scan(project)
      const task = result.untracked.find((t) => t.id === taskId)
      if (!task) throw new Error(`Task not found: ${taskId}`)

      // Get surrounding lines
      let surroundingLines: string[] = []
      try {
        const content = await readFile(task.filePath, 'utf-8')
        const lines = content.split('\n')
        surroundingLines = getSurroundingLines(lines, task.lineNumber - 1, 5)
      } catch {
        // continue without surrounding lines
      }

      return draftService.draftTicket(task, project, surroundingLines)
    }
  )

  ipcMain.handle(IpcChannel.AI_START_MY_DAY as string, async (_, context: StartMyDayContext) => {
    const win = getWindow()
    await draftService.startMyDay(context, win)
  })

  ipcMain.handle(IpcChannel.KEYCHAIN_SET as string, async (_, key: string, value: string) => {
    await keychainService.setCredential(
      key as Parameters<KeychainService['setCredential']>[0],
      value
    )
  })

  ipcMain.handle(IpcChannel.KEYCHAIN_GET as string, async (_, key: string) => {
    return keychainService.getCredential(
      key as Parameters<KeychainService['getCredential']>[0]
    )
  })

  ipcMain.handle(IpcChannel.KEYCHAIN_DELETE as string, async (_, key: string) => {
    await keychainService.deleteCredential(
      key as Parameters<KeychainService['deleteCredential']>[0]
    )
  })

  ipcMain.handle(IpcChannel.SCHEDULER_TRIGGER as string, async () => {
    return scheduler.triggerSync()
  })
}
