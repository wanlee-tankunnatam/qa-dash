import type { KeychainService } from './KeychainService.js'
import type { JiraTicket, JiraStatus, JiraPriority } from '../../shared/types/jira.js'
import { JIRA_RETRY_DELAY_MS } from '../../shared/constants.js'

const STATUS_MAP: Record<string, JiraStatus> = {
  'To Do': 'TODO',
  'In Progress': 'IN_PROGRESS',
  'In Review': 'IN_REVIEW',
  'Done': 'DONE',
  'Blocked': 'BLOCKED',
  'Failed': 'FAILED',
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class JiraClient {
  constructor(private keychainService: KeychainService) {}

  async getTickets(keys: string[], baseUrl: string, email: string): Promise<JiraTicket[]> {
    const token = await this.keychainService.getCredential('jira-token')
    if (!token) throw new Error('JIRA_AUTH_FAILED')
    if (!email) throw new Error('JIRA_AUTH_FAILED')

    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`
    const unique = [...new Set(keys)]

    const results = await Promise.all(
      unique.map(key => this.fetchIssue(key, baseUrl, authHeader))
    )
    return results.filter((t): t is JiraTicket => t !== null)
  }

  private async fetchIssue(
    key: string,
    baseUrl: string,
    authHeader: string,
    isRetry = false
  ): Promise<JiraTicket | null> {
    const url = `${baseUrl}/rest/api/3/issue/${key}?fields=summary,status,priority,duedate,updated,assignee,labels`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: authHeader, Accept: 'application/json' },
      })
    } catch {
      return null
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('JIRA_AUTH_FAILED')
    }

    if (response.status === 429) {
      if (!isRetry) {
        await sleep(JIRA_RETRY_DELAY_MS)
        return this.fetchIssue(key, baseUrl, authHeader, true)
      }
      return null
    }

    if (!response.ok) return null

    const issue = await response.json() as JiraIssueRaw
    const fetchedAt = new Date().toISOString()
    return {
      key,
      summary: issue.fields.summary,
      status: STATUS_MAP[issue.fields.status.name] ?? 'TODO',
      priority: issue.fields.priority?.name as JiraPriority ?? 'Minor',
      dueDate: issue.fields.duedate ?? undefined,
      updatedDate: issue.fields.updated ? issue.fields.updated.slice(0, 10) : undefined,
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels ?? [],
      url: `${baseUrl}/browse/${key}`,
      fetchedAt,
    }
  }

  async getActiveSprint(boardId: string, baseUrl: string, email: string): Promise<{ id: number; name: string } | null> {
    const token = await this.keychainService.getCredential('jira-token')
    if (!token || !email) return null
    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`
    try {
      const res = await fetch(`${baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
        headers: { Authorization: authHeader, Accept: 'application/json' },
      })
      if (!res.ok) return null
      const data = await res.json() as { values: Array<{ id: number; name: string }> }
      return data.values?.[0] ?? null
    } catch {
      return null
    }
  }

  async testConnection(baseUrl: string, email: string): Promise<boolean> {
    try {
      const token = await this.keychainService.getCredential('jira-token')
      if (!token) return false
      const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        headers: { Authorization: authHeader },
      })
      return response.status === 200
    } catch {
      return false
    }
  }
}

interface JiraIssueRaw {
  fields: {
    summary: string
    status: { name: string }
    priority?: { name: string }
    duedate?: string
    updated?: string
    assignee?: { displayName: string }
    labels: string[]
  }
}
