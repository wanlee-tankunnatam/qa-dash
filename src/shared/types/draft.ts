import type { JiraPriority } from './jira'

export interface TicketDraft {
  id: string
  sourceTaskId: string
  projectId: string
  summary: string
  description: string
  suggestedPriority: JiraPriority
  suggestedLabels: string[]
  generatedAt: string
  rawPrompt: string
  rawResponse: string
}

export interface DraftResult {
  draft: TicketDraft
  warnings: string[]
}
