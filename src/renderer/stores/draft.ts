import { defineStore } from 'pinia'
import type { TicketDraft } from '@shared/types/draft'
import type { UntrackedTask } from '@shared/types/task'

interface DraftState {
  current: TicketDraft | null
  sourceTask: UntrackedTask | null
  loading: boolean
  error: string | null
}

export const useDraftStore = defineStore('draft', {
  state: (): DraftState => ({
    current: null,
    sourceTask: null,
    loading: false,
    error: null,
  }),

  actions: {
    async draftTicket(
      task: UntrackedTask,
      projectId: string,
      surroundingLines: string[],
    ): Promise<void> {
      this.loading = true
      this.error = null
      this.sourceTask = task
      try {
        const result = await window.qaApi.draftTicket(task, projectId, surroundingLines)
        this.current = result.draft
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    updateField(field: keyof TicketDraft, value: string): void {
      if (this.current) {
        (this.current as Record<string, unknown>)[field] = value
      }
    },

    clearDraft(): void {
      this.current = null
      this.sourceTask = null
      this.error = null
    },
  },
})
