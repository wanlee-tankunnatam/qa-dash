export type JiraStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED' | 'FAILED'
export type JiraPriority = 'Blocker' | 'Critical' | 'Major' | 'Minor' | 'Trivial'

export interface JiraTicket {
  key: string
  summary: string
  status: JiraStatus
  priority: JiraPriority
  dueDate?: string
  assignee?: string
  labels: string[]
  url: string
  fetchedAt: string
}
