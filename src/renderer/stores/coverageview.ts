import { defineStore } from 'pinia'
import { useTasksStore } from './tasks'
import { useTestCaseStore } from './testcase'
import { useProjectsStore } from './projects'
import { useWorkspacesStore } from './workspaces'
import type { LinkedTask, UntrackedTask } from '@shared/types/task'

interface TestCaseBreakdown {
  Functional: number
  E2E: number
  Edge: number
  Boundary: number
}

interface CoverageItem {
  taskId: string
  taskType: 'untracked' | 'linked'
  jiraKey?: string
  summary: string
  hasCoverage: boolean
  testCaseCount: number
  testCasesByType: TestCaseBreakdown
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

        // Helper function to get test case breakdown
        const getBreakdown = (sourceType: 'jira' | 'file', sourceValue: string): TestCaseBreakdown => {
          const breakdown: TestCaseBreakdown = {
            Functional: 0,
            E2E: 0,
            Edge: 0,
            Boundary: 0,
          }
          const key = `${sourceType}:${sourceValue}`
          if (!(key in testCaseStore.reports)) return breakdown
          const report = testCaseStore.reports[key]
          report.testCases.forEach((tc: any) => {
            if (tc.type in breakdown) {
              breakdown[tc.type as keyof TestCaseBreakdown]++
            }
          })
          return breakdown
        }

        // Process linked tasks
        const linkedTasks = scanResult.linked || []
        linkedTasks.forEach((task: LinkedTask) => {
          const hasCoverage = testCaseStore.hasCoverage('jira', task.jiraKey)
          const breakdown = getBreakdown('jira', task.jiraKey)
          const testCaseCount = Object.values(breakdown).reduce((sum, count) => sum + count, 0)
          allTasks.push({
            taskId: task.id,
            taskType: 'linked',
            jiraKey: task.jiraKey,
            summary: task.rawText,
            hasCoverage,
            testCaseCount,
            testCasesByType: breakdown,
            filePath: task.fileRelativePath,
            lineNumber: task.lineNumber,
          })
        })

        // Process untracked tasks
        const untrackedTasks = scanResult.untracked || []
        untrackedTasks.forEach((task: UntrackedTask) => {
          const hasCoverage = testCaseStore.hasCoverage('file', task.fileRelativePath)
          const breakdown = getBreakdown('file', task.fileRelativePath)
          const testCaseCount = Object.values(breakdown).reduce((sum, count) => sum + count, 0)
          allTasks.push({
            taskId: task.id,
            taskType: 'untracked',
            summary: task.rawText,
            hasCoverage,
            testCaseCount,
            testCasesByType: breakdown,
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

    // Coverage filtered by workspace (only test cases in current workspace)
    workspaceFilteredCoverage(): ProjectCoverageStats[] {
      const projectsStore = useProjectsStore()
      const workspacesStore = useWorkspacesStore()
      const currentWorkspace = workspacesStore.current

      if (!currentWorkspace) return this.allProjectsCoverage

      return this.allProjectsCoverage.filter((coverage) =>
        currentWorkspace.projectIds.includes(coverage.projectId)
      )
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
