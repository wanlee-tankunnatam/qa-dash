export interface ProjectConfig {
  ticketRegex: string
  excludePatterns: string[]
  includePaths: string[]
  warningThresholdDays: number
  warningThresholdCount: number
}

export interface Project {
  id: string
  name: string
  rootPath: string
  jiraBoardId: string
  jiraBaseUrl: string
  addedAt: string
  config: ProjectConfig
}
