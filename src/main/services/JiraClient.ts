import type { KeychainService } from './KeychainService.js'
import type { JiraTicket, JiraStatus, JiraPriority } from '../../shared/types/jira.js'
import { JIRA_BATCH_SIZE, JIRA_RATE_LIMIT_MS, JIRA_RETRY_DELAY_MS } from '../../shared/constants.js'

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

    const results: JiraTicket[] = []
    const batches: string[][] = []
    for (let i = 0; i < keys.length; i += JIRA_BATCH_SIZE) {
      batches.push(keys.slice(i, i + JIRA_BATCH_SIZE))
    }

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx]
      if (batchIdx > 0) {
        await sleep(JIRA_RATE_LIMIT_MS)
      }

      const tickets = await this.fetchBatch(batch, baseUrl, authHeader)
      results.push(...tickets)
    }

    return results
  }

  private async fetchBatch(
    keys: string[],
    baseUrl: string,
    authHeader: string,
    isRetry = false
  ): Promise<JiraTicket[]> {
    const jql = `key in (${keys.join(',')})`
    const url = `${baseUrl}/rest/api/3/search`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ jql, fields: ['summary', 'status', 'priority', 'duedate', 'assignee', 'labels'] }),
      })
    } catch (err) {
      throw err
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('JIRA_AUTH_FAILED')
    }

    if (response.status === 429) {
      if (!isRetry) {
        await sleep(JIRA_RETRY_DELAY_MS)
        return this.fetchBatch(keys, baseUrl, authHeader, true)
      }
      throw new Error('JIRA_RATE_LIMITED')
    }

    if (!response.ok) {
      throw new Error(`JIRA_HTTP_ERROR: ${response.status}`)
    }

    const data = await response.json() as { issues: JiraIssueRaw[] }
    const fetchedAt = new Date().toISOString()

    return (data.issues ?? []).map((issue) => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: STATUS_MAP[issue.fields.status.name] ?? 'TODO',
      priority: issue.fields.priority?.name as JiraPriority ?? 'Minor',
      dueDate: issue.fields.duedate ?? undefined,
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels ?? [],
      url: `${baseUrl}/browse/${issue.key}`,
      fetchedAt,
    }))
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
  key: string
  fields: {
    summary: string
    status: { name: string }
    priority?: { name: string }
    duedate?: string
    assignee?: { displayName: string }
    labels: string[]
  }
}
