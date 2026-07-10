import { defineStore } from 'pinia'
import { useTasksStore } from './tasks'
import { useTestCaseStore } from './testcase'
import type { LinkedTask, UntrackedTask } from '@shared/types/task'

interface CoverageItem {
  taskId: string
  taskType: 'untracked' | 'linked'
  jiraKey?: string
  summary: string
  hasCoverage: boolean
  testCaseCount: number
  filePath: string
  lineNumber: number
}

interface ProjectCoverageStats {
  projectId: string
  coveredCount: number
  totalCount: number
  coveragePercent: number
  items: CoverageItem[]
}

interface CoverageViewState {
  selectedProjectId: string | null
  showOnlyNoCoverage: boolean
}

export const useCoverageViewStore = defineStore('coverageview', {
  state: (): CoverageViewState => ({
    selectedProjectId: null,
    showOnlyNoCoverage: false,
  }),

  getters: {
    // Compute coverage for all projects (derived, not persisted)
    allProjectsCoverage(): ProjectCoverageStats[] {
      const tasksStore = useTasksStore()
      const testCaseStore = useTestCaseStore()

      return Object.entries(tasksStore.byProject).map(([projectId, scanResult]) => {
        const allTasks: CoverageItem[] = []

        // Process linked tasks
        const linkedTasks = scanResult.linked || []
        linkedTasks.forEach((task: LinkedTask) => {
          const hasCoverage = testCaseStore.hasCoverage('jira', task.jiraKey)
          allTasks.push({
            taskId: task.id,
            taskType: 'linked',
            jiraKey: task.jiraKey,
            summary: task.rawText,
            hasCoverage,
            testCaseCount: hasCoverage ? 1 : 0, // Simplified: 1 if has coverage
            filePath: task.fileRelativePath,
            lineNumber: task.lineNumber,
          })
        })

        // Process untracked tasks
        const untrackedTasks = scanResult.untracked || []
        untrackedTasks.forEach((task: UntrackedTask) => {
          const hasCoverage = testCaseStore.hasCoverage('file', task.fileRelativePath)
          allTasks.push({
            taskId: task.id,
            taskType: 'untracked',
            summary: task.rawText,
            hasCoverage,
            testCaseCount: hasCoverage ? 1 : 0,
            filePath: task.fileRelativePath,
            lineNumber: task.lineNumber,
          })
        })

        const coveredCount = allTasks.filter((t) => t.hasCoverage).length
        const totalCount = allTasks.length
        const coveragePercent = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0

        return {
          projectId,
          coveredCount,
          totalCount,
          coveragePercent,
          items: this.showOnlyNoCoverage ? allTasks.filter((t) => !t.hasCoverage) : allTasks,
        }
      })
    },

    // Coverage for selected project only
    selectedProjectCoverage(): ProjectCoverageStats | null {
      if (!this.selectedProjectId) return null
      return this.allProjectsCoverage.find((p) => p.projectId === this.selectedProjectId) || null
    },
  },

  actions: {
    selectProject(projectId: string): void {
      this.selectedProjectId = projectId
    },

    setShowOnlyNoCoverage(value: boolean): void {
      this.showOnlyNoCoverage = value
    },

    reset(): void {
      this.selectedProjectId = null
      this.showOnlyNoCoverage = false
    },
  },
})
