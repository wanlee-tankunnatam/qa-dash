import { defineStore } from 'pinia'
import type { Project, ProjectConfig } from '@shared/types/project'

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    projects: [],
    loading: false,
    error: null,
  }),

  getters: {
    getById: (state) => (id: string): Project | undefined =>
      state.projects.find((p) => p.id === id),
  },

  actions: {
    async fetchProjects(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const projects = await window.qaApi.getProjects()
        this.projects = projects
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
    },

    async addProject(rootPath: string): Promise<Project> {
      this.loading = true
      this.error = null
      try {
        const project = await window.qaApi.addProject(rootPath)
        this.projects.push(project)
        return project
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async removeProject(id: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.removeProject(id)
        this.projects = this.projects.filter((p) => p.id !== id)
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateConfig(id: string, patch: Partial<ProjectConfig>): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const updated = await window.qaApi.updateConfig(id, patch)
        const idx = this.projects.findIndex((p) => p.id === id)
        if (idx !== -1) {
          this.projects[idx] = { ...this.projects[idx], config: updated }
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
