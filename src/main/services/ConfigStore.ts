import Store from 'electron-store'
import { randomUUID } from 'crypto'
import { execSync } from 'child_process'
import { DEFAULT_PROJECT_CONFIG } from '../../shared/constants.js'
import type { Project, ProjectConfig } from '../../shared/types/project.js'

interface JiraSettings {
  baseUrl: string
  email: string
  boardId: string
}

interface GlobalJiraSettings {
  email: string
  site: string
}

export interface JiraProject {
  key: string
  name: string
}

export interface ServiceCredential {
  id: string
  service: string
  url?: string
  username: string
  email?: string
  clientId?: string
  hasPassword?: boolean
  hasToken?: boolean
  hasSecret?: boolean
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

  private deriveProjectName(rootPath: string): string {
    try {
      const gitRoot = execSync('git rev-parse --show-toplevel', { cwd: rootPath, encoding: 'utf-8' }).trim()
      return gitRoot.split('/').pop() ?? rootPath.split('/').pop() ?? rootPath
    } catch {
      return rootPath.split('/').pop() ?? rootPath
    }
  }

  addProject(rootPath: string): Project {
    const project: Project = {
      id: randomUUID(),
      name: this.deriveProjectName(rootPath),
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

  renameProject(id: string, name: string): void {
    const projects = this.getProjects()
    const p = projects.find((x) => x.id === id)
    if (p) { p.name = name.trim() || p.name; this.store.set('projects', projects) }
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

  getNote(date: string): string {
    return (this.store.get(`notes.${date}`) as string | undefined) ?? ''
  }

  setNote(date: string, text: string): void {
    if (text) this.store.set(`notes.${date}`, text)
    else this.store.delete(`notes.${date}` as never)
  }

  setGlobalJira(settings: GlobalJiraSettings): void {
    this.store.set('jira.global', settings)
  }

  getGlobalJira(): GlobalJiraSettings | null {
    return (this.store.get('jira.global') as GlobalJiraSettings | undefined) ?? null
  }

  getJiraProjects(): JiraProject[] {
    return (this.store.get('jira.projects') as JiraProject[] | undefined) ?? []
  }

  setJiraProjects(projects: JiraProject[]): void {
    this.store.set('jira.projects', projects)
  }

  getServiceCredentials(): ServiceCredential[] {
    return (this.store.get('credentials') as ServiceCredential[] | undefined) ?? []
  }

  upsertServiceCredential(entry: ServiceCredential): void {
    const list = this.getServiceCredentials()
    const idx = list.findIndex(c => c.id === entry.id)
    if (idx >= 0) list[idx] = entry
    else list.push(entry)
    this.store.set('credentials', list)
  }

  deleteServiceCredential(id: string): void {
    const list = this.getServiceCredentials().filter(c => c.id !== id)
    this.store.set('credentials', list)
  }
}
