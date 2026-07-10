import { defineStore } from 'pinia'
import type { Workspace, WorkspaceWithProjects } from '@shared/types/workspace'

interface WorkspacesState {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
  loading: boolean
  error: string | null
}

export const useWorkspacesStore = defineStore('workspaces', {
  state: (): WorkspacesState => ({
    workspaces: [],
    currentWorkspaceId: null,
    loading: false,
    error: null,
  }),

  getters: {
    getById: (state) => (id: string): Workspace | undefined =>
      state.workspaces.find((w) => w.id === id),

    current: (state): Workspace | undefined => {
      if (!state.currentWorkspaceId) return undefined
      return state.workspaces.find((w) => w.id === state.currentWorkspaceId)
    },

    sorted: (state): Workspace[] => {
      return [...state.workspaces].sort((a, b) => a.order - b.order)
    },

    withProjectCounts: (state) => (): WorkspaceWithProjects[] => {
      return state.workspaces.map((w) => ({
        ...w,
        projectCount: w.projectIds.length,
      }))
    },
  },

  actions: {
    async fetchWorkspaces(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const workspaces = await window.qaApi.listWorkspaces()
        this.workspaces = workspaces
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
    },

    async createWorkspace(name: string, description?: string): Promise<Workspace> {
      this.loading = true
      this.error = null
      try {
        const workspace = await window.qaApi.createWorkspace(name, description)
        this.workspaces.push(workspace)
        return workspace
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateWorkspace(id: string, name: string, description?: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.updateWorkspace(id, name, description)
        const idx = this.workspaces.findIndex((w) => w.id === id)
        if (idx !== -1) {
          this.workspaces[idx] = {
            ...this.workspaces[idx],
            name,
            description,
            updatedAt: new Date().toISOString(),
          }
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteWorkspace(id: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.deleteWorkspace(id)
        this.workspaces = this.workspaces.filter((w) => w.id !== id)
        if (this.currentWorkspaceId === id) {
          this.currentWorkspaceId = this.workspaces[0]?.id || null
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async reorderWorkspaces(orderedIds: string[]): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.reorderWorkspaces(orderedIds)
        // Update order in local state
        orderedIds.forEach((id, index) => {
          const idx = this.workspaces.findIndex((w) => w.id === id)
          if (idx !== -1) {
            this.workspaces[idx].order = index
          }
        })
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async addProjectToWorkspace(workspaceId: string, projectId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.addProjectToWorkspace(workspaceId, projectId)
        const idx = this.workspaces.findIndex((w) => w.id === workspaceId)
        if (idx !== -1 && !this.workspaces[idx].projectIds.includes(projectId)) {
          this.workspaces[idx].projectIds.push(projectId)
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async removeProjectFromWorkspace(workspaceId: string, projectId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.removeProjectFromWorkspace(workspaceId, projectId)
        const idx = this.workspaces.findIndex((w) => w.id === workspaceId)
        if (idx !== -1) {
          this.workspaces[idx].projectIds = this.workspaces[idx].projectIds.filter(
            (id) => id !== projectId
          )
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentWorkspacePreference(): Promise<void> {
      this.error = null
      try {
        const workspaceId = await window.qaApi.getWorkspacePreference()
        this.currentWorkspaceId = workspaceId || (this.workspaces[0]?.id || null)
      } catch (e) {
        this.error = (e as Error).message
      }
    },

    async setCurrentWorkspace(workspaceId: string): Promise<void> {
      this.error = null
      try {
        await window.qaApi.setWorkspacePreference(workspaceId)
        this.currentWorkspaceId = workspaceId
      } catch (e) {
        this.error = (e as Error).message
        throw e
      }
    },

    setCurrentWorkspaceSync(workspaceId: string): void {
      this.currentWorkspaceId = workspaceId
    },
  },
})
