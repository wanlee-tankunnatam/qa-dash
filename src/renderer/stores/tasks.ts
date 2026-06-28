import { defineStore } from 'pinia'
import type { ScanResult, UntrackedTask, LinkedTask } from '@shared/types/task'

interface TasksState {
  byProject: Record<string, ScanResult>
  scanning: Record<string, boolean>
  error: string | null
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    byProject: {},
    scanning: {},
    error: null,
  }),

  getters: {
    getUntracked: (state) => (projectId: string): UntrackedTask[] =>
      state.byProject[projectId]?.untracked ?? [],

    getLinked: (state) => (projectId: string): LinkedTask[] =>
      state.byProject[projectId]?.linked ?? [],

    untrackedCount: (state) => (projectId: string): number =>
      state.byProject[projectId]?.untracked.filter((t) => !t.isIgnoredToday).length ?? 0,
  },

  actions: {
    async scanProject(projectId: string): Promise<void> {
      this.scanning[projectId] = true
      this.error = null
      try {
        const result = await window.qaApi.scanRepo(projectId)
        this.byProject[projectId] = result
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.scanning[projectId] = false
      }
    },

    async ignoreTask(taskId: string, projectId: string): Promise<void> {
      this.error = null
      try {
        await window.qaApi.ignoreTask(taskId)
        const result = this.byProject[projectId]
        if (result) {
          const task = result.untracked.find((t) => t.id === taskId)
          if (task) {
            task.isIgnoredToday = true
            task.ignoredAt = new Date().toISOString()
          }
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      }
    },

    async unignoreTask(taskId: string, projectId: string): Promise<void> {
      this.error = null
      try {
        await window.qaApi.unignoreTask(taskId)
        const result = this.byProject[projectId]
        if (result) {
          const task = result.untracked.find((t) => t.id === taskId)
          if (task) {
            task.isIgnoredToday = false
            task.ignoredAt = undefined
          }
        }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      }
    },
  },
})
