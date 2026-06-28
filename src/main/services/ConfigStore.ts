import Store from 'electron-store'
import { randomUUID } from 'crypto'
import { DEFAULT_PROJECT_CONFIG } from '../../shared/constants.js'
import type { Project, ProjectConfig } from '../../shared/types/project.js'

interface JiraSettings {
  baseUrl: string
  email: string
  boardId: string
}

interface StoreSchema {
  projects: Project[]
  [key: string]: unknown
}

export class ConfigStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'config',
      defaults: { projects: [] },
    })
  }

  getProjects(): Project[] {
    return this.store.get('projects') ?? []
  }

  addProject(rootPath: string): Project {
    const project: Project = {
      id: randomUUID(),
      name: rootPath.split('/').pop() ?? rootPath,
      rootPath,
      jiraBoardId: '',
      jiraBaseUrl: '',
      addedAt: new Date().toISOString(),
      config: { ...DEFAULT_PROJECT_CONFIG },
    }
    const projects = this.getProjects()
    projects.push(project)
    this.store.set('projects', projects)
    return project
  }

  removeProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id)
    this.store.set('projects', projects)
  }

  getConfig(projectId: string): ProjectConfig {
    return (
      (this.store.get(`config.${projectId}`) as ProjectConfig | undefined) ??
      { ...DEFAULT_PROJECT_CONFIG }
    )
  }

  updateConfig(projectId: string, patch: Partial<ProjectConfig>): ProjectConfig {
    const current = this.getConfig(projectId)
    const updated = { ...current, ...patch }
    this.store.set(`config.${projectId}`, updated)
    return updated
  }

  setJiraSettings(projectId: string, settings: JiraSettings): void {
    this.store.set(`jira.${projectId}`, settings)
  }

  getJiraSettings(projectId: string): JiraSettings | null {
    return (this.store.get(`jira.${projectId}`) as JiraSettings | undefined) ?? null
  }
}
