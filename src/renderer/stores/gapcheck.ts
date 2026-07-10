import { defineStore } from 'pinia'
import type { GapCheckReport } from '@shared/types/draft'

interface GapCheckState {
  report: GapCheckReport | null
  loading: boolean
  error: string | null
}

export const useGapCheckStore = defineStore('gapcheck', {
  state: (): GapCheckState => ({
    report: null,
    loading: false,
    error: null,
  }),

  getters: {
    formattedReport(): string {
      if (!this.report) return ''
      const lines: string[] = []

      lines.push(`## Gap Check Report\n`)
      lines.push(`**Source:** ${this.report.source.type === 'jira' ? 'Jira Ticket' : 'File'} — ${this.report.source.value}`)
      lines.push(`**Generated:** ${new Date(this.report.createdAt).toLocaleString()}\n`)

      if (this.report.criticalGaps.length > 0) {
        lines.push(`### Critical Gaps (${this.report.criticalGaps.length})`)
        this.report.criticalGaps.forEach((gap) => {
          lines.push(`- **${gap.title}** (${gap.severity})`)
          lines.push(`  ${gap.description}`)
          lines.push(`  _Fix:_ ${gap.suggestedFix}`)
        })
        lines.push('')
      }

      if (this.report.ambiguities.length > 0) {
        lines.push(`### Ambiguities (${this.report.ambiguities.length})`)
        this.report.ambiguities.forEach((gap) => {
          lines.push(`- **${gap.title}** (${gap.severity})`)
          lines.push(`  ${gap.description}`)
          lines.push(`  _Fix:_ ${gap.suggestedFix}`)
        })
        lines.push('')
      }

      if (this.report.niceToHaveGaps.length > 0) {
        lines.push(`### Nice-to-Have Gaps (${this.report.niceToHaveGaps.length})`)
        this.report.niceToHaveGaps.forEach((gap) => {
          lines.push(`- **${gap.title}** (${gap.severity})`)
          lines.push(`  ${gap.description}`)
          lines.push(`  _Fix:_ ${gap.suggestedFix}`)
        })
        lines.push('')
      }

      return lines.join('\n')
    },

    totalGaps(): number {
      if (!this.report) return 0
      return this.report.criticalGaps.length + this.report.ambiguities.length + this.report.niceToHaveGaps.length
    },
  },

  actions: {
    async analyzeRequirement(sourceType: 'jira' | 'file', sourceValue: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await window.qaApi.gapCheck(sourceType, sourceValue)
      } catch (e) {
        this.error = (e as Error).message
        throw e
      } finally {
        this.loading = false
      }
    },

    setReport(report: GapCheckReport): void {
      this.report = report
    },

    clearReport(): void {
      this.report = null
      this.error = null
    },
  },
})
