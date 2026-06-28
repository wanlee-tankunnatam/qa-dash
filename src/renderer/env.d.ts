import type { Project, ProjectConfig, JiraSettings } from '@shared/types/project'
import type { ScanResult, UntrackedTask } from '@shared/types/task'
import type { JiraTicket } from '@shared/types/jira'
import type { DraftResult } from '@shared/types/draft'
import type { CredentialKey, StartMyDayContext, SyncSummary } from '@shared/constants'

declare global {
  interface Window {
    qaApi: {
      // Projects
      getProjects: () => Promise<Project[]>
      addProject: (rootPath: string) => Promise<Project>
      removeProject: (id: string) => Promise<void>
      updateConfig: (id: string, patch: Partial<ProjectConfig>) => Promise<ProjectConfig>

      // Scanning
      scanRepo: (projectId: string) => Promise<ScanResult>
      triggerSync: () => Promise<SyncSummary>

      // Jira
      getTickets: (keys: string[], projectId: string) => Promise<JiraTicket[]>
      testJiraConnection: (baseUrl: string, email: string) => Promise<boolean>
      setJiraSettings: (projectId: string, settings: JiraSettings) => Promise<void>

      // Tasks
      ignoreTask: (taskId: string) => Promise<void>
      unignoreTask: (taskId: string) => Promise<void>

      // AI
      startMyDay: (context: StartMyDayContext) => Promise<void>
      draftTicket: (task: UntrackedTask, projectId: string, lines: string[]) => Promise<DraftResult>

      // Credentials (no values stored in renderer — Keychain only)
      setCredential: (key: CredentialKey, value: string) => Promise<void>
      deleteCredential: (key: CredentialKey) => Promise<void>

      // Shell
      openExternal: (url: string) => Promise<void>

      // Push event listeners
      on: (channel: string, callback: (...args: unknown[]) => void) => void
      off: (channel: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

export {}
