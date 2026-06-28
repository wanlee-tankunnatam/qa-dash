import { defineStore } from 'pinia'
import type { JiraTicket } from '@shared/types/jira'
import type { JiraSettings } from '@shared/types/project'

interface JiraState {
  tickets: Record<string, JiraTicket>
  loading: boolean
  error: string | null
}

export const useJiraStore = defineStore('jira', {
  state: (): JiraState => ({
    tickets: {},
    loading: false,
    error: null,
  }),

  getters: {
    getTicket: (state) => (key: string): JiraTicket | undefined =>
      state.tickets[key],

    overdueTickets: (state): JiraTicket[] => {
      const today = new Date().toISOString().slice(0, 10)
      return Object.values(state.tickets).filter(
        (t) => t.dueDate && t.dueDate < today && t.status !== 'DONE',
      )
    },
  },

  actions: {
    async fetchTickets(keys: string[], projectId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const tickets = await window.qaApi.getTickets(keys, projectId)
        for (const ticket of tickets) {
          this.tickets[ticket.key] = ticket
        }
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
    },

    async testConnection(baseUrl: string, email: string): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        return await window.qaApi.testJiraConnection(baseUrl, email)
      } catch (e) {
        this.error = (e as Error).message
        return false
      } finally {
        this.loading = false
      }
    },

    async setJiraSettings(projectId: string, settings: JiraSettings): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.setJiraSettings(projectId, settings)
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
