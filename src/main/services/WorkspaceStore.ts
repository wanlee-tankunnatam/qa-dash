import Store from 'electron-store'
import { randomUUID } from 'crypto'
import type { Workspace } from '../../shared/types/workspace.js'

interface StoreSchema {
  workspaces: Workspace[]
  workspacePreference?: string
  [key: string]: unknown
}

export class WorkspaceStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'workspaces',
      defaults: { workspaces: [] },
    })
  }

  getWorkspaces(): Workspace[] {
    return this.store.get('workspaces') ?? []
  }

  getWorkspaceById(id: string): Workspace | undefined {
    return this.getWorkspaces().find((w) => w.id === id)
  }

  createWorkspace(name: string, description?: string): Workspace {
    const workspaces = this.getWorkspaces()
    const order = workspaces.length > 0 ? Math.max(...workspaces.map((w) => w.order)) + 1 : 0

    const workspace: Workspace = {
      id: randomUUID(),
      name: name.trim(),
      description: description?.trim(),
      projectIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order,
    }

    workspaces.push(workspace)
    this.store.set('workspaces', workspaces)
    return workspace
  }

  updateWorkspace(id: string, name: string, description?: string): void {
    const workspaces = this.getWorkspaces()
    const idx = workspaces.findIndex((w) => w.id === id)

    if (idx !== -1) {
      workspaces[idx] = {
        ...workspaces[idx],
        name: name.trim(),
        description: description?.trim(),
        updatedAt: new Date().toISOString(),
      }
      this.store.set('workspaces', workspaces)
    }
  }

  deleteWorkspace(id: string): void {
    const workspaces = this.getWorkspaces().filter((w) => w.id !== id)
    this.store.set('workspaces', workspaces)

    // Clear preference if it was pointing to the deleted workspace
    if (this.getWorkspacePreference() === id) {
      this.store.delete('workspacePreference' as never)
    }
  }

  reorderWorkspaces(orderedIds: string[]): void {
    const workspaces = this.getWorkspaces()
    const workspaceMap = new Map(workspaces.map((w) => [w.id, w]))

    const reordered = orderedIds
      .map((id) => workspaceMap.get(id))
      .filter((w) => w !== undefined) as Workspace[]

    // Preserve workspaces not in orderedIds (shouldn't happen in normal use)
    const missing = workspaces.filter((w) => !orderedIds.includes(w.id))
    reordered.push(...missing)

    // Update order field
    reordered.forEach((w, index) => {
      w.order = index
    })

    this.store.set('workspaces', reordered)
  }

  addProjectToWorkspace(workspaceId: string, projectId: string): void {
    const workspaces = this.getWorkspaces()
    const idx = workspaces.findIndex((w) => w.id === workspaceId)

    if (idx !== -1) {
      if (!workspaces[idx].projectIds.includes(projectId)) {
        workspaces[idx].projectIds.push(projectId)
        workspaces[idx].updatedAt = new Date().toISOString()
        this.store.set('workspaces', workspaces)
      }
    }
  }

  removeProjectFromWorkspace(workspaceId: string, projectId: string): void {
    const workspaces = this.getWorkspaces()
    const idx = workspaces.findIndex((w) => w.id === workspaceId)

    if (idx !== -1) {
      workspaces[idx].projectIds = workspaces[idx].projectIds.filter((id) => id !== projectId)
      workspaces[idx].updatedAt = new Date().toISOString()
      this.store.set('workspaces', workspaces)
    }
  }

  getWorkspacePreference(): string | null {
    return (this.store.get('workspacePreference') as string | undefined) ?? null
  }

  setWorkspacePreference(workspaceId: string): void {
    this.store.set('workspacePreference', workspaceId)
  }

  // Initialize with default workspace if none exist
  ensureDefaultWorkspace(): Workspace {
    const workspaces = this.getWorkspaces()
    if (workspaces.length === 0) {
      return this.createWorkspace('Default', 'Default workspace')
    }
    return workspaces[0]
  }
}
