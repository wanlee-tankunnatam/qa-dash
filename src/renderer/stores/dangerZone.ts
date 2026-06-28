import { defineStore } from 'pinia'
import type { DangerZoneState } from '@shared/types/snapshot'
import type { Project } from '@shared/types/project'
import { useProjectsStore } from './projects'

interface DangerZoneStoreState {
  states: Record<string, DangerZoneState>
}

export const useDangerZoneStore = defineStore('dangerZone', {
  state: (): DangerZoneStoreState => ({
    states: {},
  }),

  getters: {
    isActive: (state) => (projectId: string): boolean =>
      state.states[projectId]?.isActive ?? false,

    activeProjects(): Project[] {
      const projectsStore = useProjectsStore()
      return projectsStore.projects.filter((p) => this.isActive(p.id))
    },
  },

  actions: {
    updateFromScan(projectId: string, state: DangerZoneState): void {
      this.states[projectId] = state
    },
  },
})
