import { ipcMain, BrowserWindow, dialog, shell } from 'electron'
import { IpcChannel } from '../../shared/types/ipc.js'
import type { ConfigStore, JiraProject, ServiceCredential } from '../services/ConfigStore.js'
import type { RepoScanner } from '../services/RepoScanner.js'
import type { JiraClient } from '../services/JiraClient.js'
import type { DangerZoneTracker } from '../services/DangerZoneTracker.js'
import type { DraftService } from '../services/DraftService.js'
import type { IgnoreStore } from '../services/IgnoreStore.js'
import type { KeychainService } from '../services/KeychainService.js'
import type { Scheduler } from '../services/Scheduler.js'
import type { SprintStatusReader } from '../services/SprintStatusReader.js'
import type { WorkspaceStore } from '../services/WorkspaceStore.js'
import type { StartMyDayContext } from '../services/DraftService.js'
import { getSurroundingLines } from '../utils/markdown.js'
import { readFile, writeFile } from 'fs/promises'

export function registerHandlers(
  configStore: ConfigStore,
  repoScanner: RepoScanner,
  jiraClient: JiraClient,
  dangerZoneTracker: DangerZoneTracker,
  draftService: DraftService,
  ignoreStore: IgnoreStore,
  keychainService: KeychainService,
  scheduler: Scheduler,
  sprintStatusReader: SprintStatusReader,
  workspaceStore: WorkspaceStore,
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

  ipcMain.handle(IpcChannel.PROJECTS_RENAME as string, async (_, id: string, name: string) => {
    configStore.renameProject(id, name)
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
    async (_, keys: string[]) => {
      const jira = configStore.getGlobalJira()
      if (!jira?.site || !jira?.email) throw new Error('JIRA_NOT_CONFIGURED')
      const baseUrl = jira.site.startsWith('http') ? jira.site.replace(/\/$/, '') : `https://${jira.site}.atlassian.net`
      return jiraClient.getTickets(keys, baseUrl, jira.email)
    }
  )

  ipcMain.handle(IpcChannel.JIRA_TEST as string, async (_, baseUrl: string, email: string) => {
    return jiraClient.testConnection(baseUrl, email)
  })

  ipcMain.handle(
    IpcChannel.JIRA_SETTINGS_SET as string,
    async (_, settings: { email: string; site: string }) => {
      configStore.setGlobalJira(settings)
    }
  )

  ipcMain.handle(IpcChannel.JIRA_SETTINGS_GET as string, async () => {
    return configStore.getGlobalJira()
  })

  ipcMain.handle(IpcChannel.JIRA_PROJECTS_SET as string, async (_, projects: JiraProject[]) => {
    configStore.setJiraProjects(projects)
  })

  ipcMain.handle(IpcChannel.JIRA_PROJECTS_GET as string, async () => {
    return configStore.getJiraProjects()
  })

  ipcMain.handle(IpcChannel.TASK_IGNORE as string, async (_, taskId: string) => {
    ignoreStore.ignore(taskId)
  })

  ipcMain.handle(IpcChannel.TASK_UNIGNORE as string, async (_, taskId: string) => {
    ignoreStore.unignore(taskId)
  })

  ipcMain.handle(
    IpcChannel.TASK_TOGGLE as string,
    async (_, filePath: string, lineNumber: number, checked: boolean) => {
      const content = await readFile(filePath, 'utf-8')
      const lines = content.split('\n')
      const idx = lineNumber - 1
      if (idx < 0 || idx >= lines.length) throw new Error('Line out of range')
      lines[idx] = lines[idx].replace(
        checked ? /^(\s*-\s\[)\s(\])/ : /^(\s*-\s\[)[xX](\])/,
        `$1${checked ? 'x' : ' '}$2`
      )
      await writeFile(filePath, lines.join('\n'), 'utf-8')
    }
  )

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

  ipcMain.handle(IpcChannel.JIRA_SPRINT_ACTIVE as string, async (_, projectId: string) => {
    const project = configStore.getProjects().find((p) => p.id === projectId)
    if (!project?.jiraBoardId || !project?.jiraBaseUrl) return null
    const jiraSettings = configStore.getGlobalJira()
    if (!jiraSettings?.email) return null
    return jiraClient.getActiveSprint(project.jiraBoardId, project.jiraBaseUrl, jiraSettings.email)
  })

  ipcMain.handle(IpcChannel.SPRINT_STATUS_GET as string, async (_, projectId: string) => {
    const project = configStore.getProjects().find((p) => p.id === projectId)
    if (!project) return { devStatusMap: {}, epicHierarchy: [] }
    return sprintStatusReader.getStatus(project.rootPath)
  })

  ipcMain.handle(IpcChannel.DEV_TOOLS_TOGGLE as string, () => {
    const win = getWindow()
    if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
    else win.webContents.openDevTools()
  })

  ipcMain.handle(IpcChannel.AI_ASK as string, async (_, prompt: string, imagePath?: string) => {
    const win = getWindow()
    try {
      await draftService.ask(prompt, win, imagePath)
      if (!win.isDestroyed()) win.webContents.send(IpcChannel.STREAM_END as string)
    } catch (err) {
      if (!win.isDestroyed()) win.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
    }
  })

  ipcMain.handle(IpcChannel.AI_GAPCHECK as string, async (_, sourceType: string, sourceValue: string) => {
    const win = getWindow()
    if (!sourceType || !sourceValue) {
      win.webContents.send(IpcChannel.STREAM_ERROR as string, 'Source type and value are required')
      return
    }
    try {
      await draftService.gapCheck(sourceType as 'jira' | 'file', sourceValue, win)
    } catch (err) {
      if (!win.isDestroyed()) win.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
    }
  })

  ipcMain.handle(IpcChannel.AI_DRAFT_TEST_CASES as string, async (_, sourceType: string, sourceValue: string) => {
    const win = getWindow()
    if (!sourceType || !sourceValue) {
      win.webContents.send(IpcChannel.STREAM_ERROR as string, 'Source type and value are required')
      return
    }
    try {
      await draftService.draftTestCases(sourceType as 'jira' | 'file', sourceValue, win)
    } catch (err) {
      if (!win.isDestroyed()) win.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
    }
  })

  ipcMain.handle(IpcChannel.NOTES_GET as string, (_event, date: string) => {
    return configStore.getNote(date)
  })

  ipcMain.handle(IpcChannel.NOTES_SET as string, (_event, date: string, text: string) => {
    configStore.setNote(date, text)
  })

  ipcMain.handle(IpcChannel.SHELL_OPEN_EXTERNAL as string, async (_, url: string) => {
    await shell.openExternal(url)
  })

  ipcMain.handle(IpcChannel.CREDENTIALS_LIST as string, () => {
    return configStore.getServiceCredentials()
  })

  ipcMain.handle(IpcChannel.CREDENTIALS_UPSERT as string, async (_, entry: ServiceCredential, password: string, token: string, secret: string) => {
    configStore.upsertServiceCredential(entry)
    if (password) await keychainService.setServicePassword(entry.id, password)
    if (token) await keychainService.setServiceToken(entry.id, token)
    if (secret) await keychainService.setServiceSecret(entry.id, secret)
  })

  ipcMain.handle(IpcChannel.CREDENTIALS_DELETE as string, async (_, id: string) => {
    configStore.deleteServiceCredential(id)
    await keychainService.deleteServicePassword(id)
    await keychainService.deleteServiceToken(id)
    await keychainService.deleteServiceSecret(id)
  })

  ipcMain.handle(IpcChannel.CREDENTIALS_GET_PASSWORD as string, async (_, id: string) => {
    return keychainService.getServicePassword(id)
  })

  ipcMain.handle(IpcChannel.CREDENTIALS_GET_TOKEN as string, async (_, id: string) => {
    return keychainService.getServiceToken(id)
  })

  ipcMain.handle(IpcChannel.CREDENTIALS_GET_SECRET as string, async (_, id: string) => {
    return keychainService.getServiceSecret(id)
  })

  ipcMain.handle(IpcChannel.DIALOG_OPEN_FOLDER as string, async () => {
    const win = getWindow()
    // Focus window first so dialog appears on top on macOS Sequoia
    if (!win.isDestroyed()) win.focus()
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Project Folder',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle(IpcChannel.DIALOG_OPEN_FILE as string, async () => {
    const win = getWindow()
    if (!win.isDestroyed()) win.focus()
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'Text', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      title: 'Select Requirement File',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Workspaces
  ipcMain.handle(IpcChannel.WORKSPACES_LIST as string, async () => {
    // AC-022-08: Ensure default workspace exists
    workspaceStore.ensureDefaultWorkspace()
    return workspaceStore.getWorkspaces()
  })

  ipcMain.handle(
    IpcChannel.WORKSPACES_CREATE as string,
    async (_, name: string, description?: string) => {
      return workspaceStore.createWorkspace(name, description)
    }
  )

  ipcMain.handle(
    IpcChannel.WORKSPACES_UPDATE as string,
    async (_, id: string, name: string, description?: string) => {
      workspaceStore.updateWorkspace(id, name, description)
    }
  )

  ipcMain.handle(IpcChannel.WORKSPACES_DELETE as string, async (_, id: string) => {
    workspaceStore.deleteWorkspace(id)
  })

  ipcMain.handle(IpcChannel.WORKSPACES_REORDER as string, async (_, orderedIds: string[]) => {
    workspaceStore.reorderWorkspaces(orderedIds)
  })

  ipcMain.handle(
    IpcChannel.WORKSPACES_ADD_PROJECT as string,
    async (_, workspaceId: string, projectId: string) => {
      workspaceStore.addProjectToWorkspace(workspaceId, projectId)
    }
  )

  ipcMain.handle(
    IpcChannel.WORKSPACES_REMOVE_PROJECT as string,
    async (_, workspaceId: string, projectId: string) => {
      workspaceStore.removeProjectFromWorkspace(workspaceId, projectId)
    }
  )

  ipcMain.handle(IpcChannel.WORKSPACES_PREFERENCE_GET as string, async () => {
    return workspaceStore.getWorkspacePreference()
  })

  ipcMain.handle(
    IpcChannel.WORKSPACES_PREFERENCE_SET as string,
    async (_, workspaceId: string) => {
      workspaceStore.setWorkspacePreference(workspaceId)
    }
  )
}
