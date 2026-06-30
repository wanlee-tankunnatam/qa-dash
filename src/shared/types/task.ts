export interface UntrackedTask {
  id: string
  projectId: string
  filePath: string
  fileRelativePath: string
  lineNumber: number
  rawText: string
  isChecked: boolean
  scannedAt: string
  type: 'untracked'
  isIgnoredToday: boolean
  ignoredAt?: string
  epic?: string
  section?: string
  sprint?: string
  dueDate?: string
}

export interface LinkedTask {
  id: string
  projectId: string
  filePath: string
  fileRelativePath: string
  lineNumber: number
  rawText: string
  isChecked: boolean
  scannedAt: string
  type: 'linked'
  jiraKey: string
  jiraTicket?: import('./jira').JiraTicket
  epic?: string
  section?: string
  sprint?: string
  dueDate?: string
}

export type Task = UntrackedTask | LinkedTask

export interface ScanResult {
  projectId: string
  scannedAt: string
  untracked: UntrackedTask[]
  linked: LinkedTask[]
  filesScanned: number
  errors: string[]
}
