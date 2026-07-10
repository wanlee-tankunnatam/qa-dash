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

export interface GapItem {
  title: string
  description: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  suggestedFix: string
}

export interface GapCheckReport {
  id: string
  source: {
    type: 'jira' | 'file'
    value: string // ticket key or file path
  }
  criticalGaps: GapItem[]
  ambiguities: GapItem[]
  niceToHaveGaps: GapItem[]
  createdAt: string
  rawPrompt: string
  rawResponse: string
}

export interface TestCaseDraft {
  scenario: string // Given-When-Then format
  testData: Record<string, any>
  expectedResult: string
  type: 'Boundary' | 'E2E' | 'Edge' | 'Functional'
}

export interface TestCaseReport {
  id: string
  source: {
    type: 'jira' | 'file'
    value: string // ticket key or file path
  }
  testCases: TestCaseDraft[]
  createdAt: string
  rawPrompt: string
  rawResponse: string
}
