import { defineStore } from 'pinia'
import type { TestCaseReport } from '@shared/types/draft'

interface TestCaseState {
  report: TestCaseReport | null
  loading: boolean
  error: string | null
}

export const useTestCaseStore = defineStore('testcase', {
  state: (): TestCaseState => ({
    report: null,
    loading: false,
    error: null,
  }),

  getters: {
    formattedOutput(): string {
      if (!this.report) return ''
      const lines: string[] = []

      lines.push(`## Test Case Report\n`)
      lines.push(`**Source:** ${this.report.source.type === 'jira' ? 'Jira Ticket' : 'File'} — ${this.report.source.value}`)
      lines.push(`**Generated:** ${new Date(this.report.createdAt).toLocaleString()}\n`)

      if (this.report.testCases.length > 0) {
        lines.push(`### Test Cases (${this.report.testCases.length})`)
        this.report.testCases.forEach((tc, i) => {
          lines.push(`#### Test Case ${i + 1}: ${tc.type}`)
          lines.push(`**Scenario:** ${tc.scenario}`)
          lines.push(`**Test Data:** ${JSON.stringify(tc.testData)}`)
          lines.push(`**Expected Result:** ${tc.expectedResult}`)
          lines.push('')
        })
      }

      return lines.join('\n')
    },

    totalTestCases(): number {
      if (!this.report) return 0
      return this.report.testCases.length
    },
  },

  actions: {
    async generateTestCases(sourceType: 'jira' | 'file', sourceValue: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.draftTestCases(sourceType, sourceValue)
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    setReport(report: TestCaseReport): void {
      this.report = report
      this.loading = false
    },

    clearReport(): void {
      this.report = null
      this.error = null
    },
  },
})
