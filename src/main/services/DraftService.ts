import Anthropic from '@anthropic-ai/sdk'
import { BrowserWindow } from 'electron'
import { AI_MODEL } from '../../shared/constants.js'
import { IpcChannel } from '../../shared/types/ipc.js'
import type { KeychainService } from './KeychainService.js'
import type { UntrackedTask, ScanResult } from '../../shared/types/task.js'
import type { Project } from '../../shared/types/project.js'
import type { JiraTicket } from '../../shared/types/jira.js'
import type { TicketDraft, DraftResult } from '../../shared/types/draft.js'
import type { JiraPriority } from '../../shared/types/jira.js'
import { randomUUID } from 'crypto'
import { getSurroundingLines } from '../utils/markdown.js'

export interface StartMyDayContext {
  date: string
  allScanResults: ScanResult[]
  jiraTickets: JiraTicket[]
  projects: Project[]
}

export class DraftService {
  constructor(private keychainService: KeychainService) {}

  private async getClient(): Promise<Anthropic> {
    const key = await this.keychainService.getCredential('anthropic-key')
    if (!key) throw new Error('DRAFT_FAILED: anthropic-key not found in keychain')
    return new Anthropic({ apiKey: key })
  }

  async draftTicket(
    task: UntrackedTask,
    project: Project,
    surroundingLines: string[]
  ): Promise<DraftResult> {
    const client = await this.getClient()
    const warnings: string[] = []

    const userPrompt = `Task: ${task.rawText}
File: ${task.fileRelativePath}
Project Jira Board: ${project.jiraBoardId}
Context lines:
${surroundingLines.join('\n')}

Please provide a JSON object with these fields: { "summary": string, "description": string, "priority": "Blocker"|"Critical"|"Major"|"Minor"|"Trivial", "labels": string[] }`

    const systemPrompt = 'คุณเป็น QA engineer ที่ช่วยร่าง Jira ticket จากงานที่ยังไม่ได้ track ใน Jira ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น'

    const rawPrompt = `${systemPrompt}\n\n${userPrompt}`

    let rawResponse: string
    let parsed: { summary: string; description: string; priority: string; labels: string[] }

    const attempt = async (prompt: string): Promise<string> => {
      const msg = await client.messages.create({
        model: AI_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      })
      const block = msg.content[0]
      if (block.type !== 'text') throw new Error('DRAFT_FAILED: unexpected response type')
      return block.text
    }

    try {
      rawResponse = await attempt(userPrompt)
      parsed = this.parseJson(rawResponse)
    } catch {
      // Retry once with stricter prompt
      try {
        const retryPrompt = userPrompt + '\n\nตอบ JSON เท่านั้น ไม่มีข้อความอื่น'
        rawResponse = await attempt(retryPrompt)
        parsed = this.parseJson(rawResponse)
      } catch (err) {
        throw new Error('DRAFT_FAILED: ' + (err as Error).message)
      }
    }

    const draft: TicketDraft = {
      id: randomUUID(),
      sourceTaskId: task.id,
      projectId: project.id,
      summary: parsed.summary,
      description: parsed.description,
      suggestedPriority: parsed.priority as JiraPriority,
      suggestedLabels: parsed.labels,
      generatedAt: new Date().toISOString(),
      rawPrompt,
      rawResponse,
    }

    return { draft, warnings }
  }

  private parseJson(text: string): { summary: string; description: string; priority: string; labels: string[] } {
    // Try to extract JSON block if model wraps it in markdown or prose
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no JSON block found in response')
    return JSON.parse(match[0])
  }

  async startMyDay(context: StartMyDayContext, window: BrowserWindow): Promise<void> {
    const client = await this.getClient().catch((err) => {
      window.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
      return null
    })
    if (!client) return

    const blockedTickets = context.jiraTickets.filter(
      (t) => t.status === 'BLOCKED' || t.status === 'FAILED'
    )
    const today = context.date
    const overdueTickets = context.jiraTickets.filter(
      (t) => t.dueDate && t.dueDate < today
    )
    const dueTodayTickets = context.jiraTickets.filter((t) => t.dueDate === today)

    const untrackedByProject = context.projects
      .map((p) => {
        const result = context.allScanResults.find((r) => r.projectId === p.id)
        if (!result) return ''
        const tasks = result.untracked.filter((t) => !t.isIgnoredToday)
        if (tasks.length === 0) return ''
        return `### ${p.name}\n${tasks.map((t) => `- ${t.rawText}`).join('\n')}`
      })
      .filter(Boolean)
      .join('\n\n')

    const userMessage = `วันนี้คือ ${today} นี่คือสถานะงาน QA ของฉัน:

## Blocker / Failed Tickets
${blockedTickets.map((t) => `- [${t.key}] ${t.summary} (${t.status})`).join('\n') || 'ไม่มี'}

## Overdue Tickets
${overdueTickets.map((t) => `- [${t.key}] ${t.summary} (due: ${t.dueDate})`).join('\n') || 'ไม่มี'}

## Due Today
${dueTodayTickets.map((t) => `- [${t.key}] ${t.summary}`).join('\n') || 'ไม่มี'}

## Untracked Tasks (ยังไม่มีใน Jira)
${untrackedByProject || 'ไม่มี'}

กรุณาสรุป:
1. CRITICAL ก่อนเที่ยง: งานอะไรที่ต้องจัดการใน 4 ชั่วโมงข้างหน้า?
2. STANDUP: 3-5 bullet points สำหรับรายงาน Standup
3. CLEAR UNTRACKED: แผนขั้นตอนการเปลี่ยน 3 Untracked Tasks แรกเป็น Jira ticket`

    try {
      const stream = client.messages.stream({
        model: AI_MODEL,
        max_tokens: 2048,
        system: 'คุณเป็น QA engineer\'s daily briefing assistant ที่เข้าถึงสถานะงาน QA ปัจจุบันได้\nตอบสั้นกระชับ เป็น bullet points ไม่มีข้อความที่ไม่จำเป็น',
        messages: [{ role: 'user', content: userMessage }],
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          if (!window.isDestroyed()) {
            window.webContents.send(IpcChannel.STREAM_CHUNK as string, event.delta.text)
          }
        }
      }

      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_END as string)
      }
    } catch (err) {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
      }
    }
  }
}
