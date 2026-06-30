import { spawn } from 'child_process'
import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc.js'
import type { UntrackedTask, ScanResult } from '../../shared/types/task.js'
import type { Project } from '../../shared/types/project.js'
import type { JiraTicket } from '../../shared/types/jira.js'
import type { TicketDraft, DraftResult } from '../../shared/types/draft.js'
import type { JiraPriority } from '../../shared/types/jira.js'
import { randomUUID } from 'crypto'

const CLAUDE_BIN = process.env.CLAUDE_BIN ?? '/Users/ice/.local/bin/claude'

export interface StartMyDayContext {
  date: string
  allScanResults: ScanResult[]
  jiraTickets: JiraTicket[]
  projects: Project[]
}

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let out = ''
    let err = ''
    const child = spawn(CLAUDE_BIN, ['-p', prompt, '--output-format', 'text'], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '' },
    })
    child.stdout.on('data', (d: Buffer) => { out += d.toString() })
    child.stderr.on('data', (d: Buffer) => { err += d.toString() })
    child.on('close', (code) => {
      if (code === 0) resolve(out.trim())
      else reject(new Error(err.trim() || `claude exited with code ${code}`))
    })
    child.on('error', reject)
  })
}

function streamClaude(prompt: string, onChunk: (text: string) => void, imagePath?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ['-p', prompt, '--output-format', 'text']
    if (imagePath) {
      const { dirname } = require('path') as typeof import('path')
      args.push('--add-dir', dirname(imagePath))
    }
    const child = spawn(CLAUDE_BIN, args, {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout.on('data', (d: Buffer) => { onChunk(d.toString()) })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`claude exited with code ${code}`))
    })
    child.on('error', reject)
  })
}

export class DraftService {
  constructor() {}

  async ask(prompt: string, window: BrowserWindow, imagePath?: string): Promise<void> {
    const fullPrompt = imagePath
      ? `${prompt}\n\n(Please read and analyze the image at: ${imagePath})`
      : prompt
    await streamClaude(fullPrompt, (chunk) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_CHUNK as string, chunk)
      }
    }, imagePath)
  }

  async draftTicket(
    task: UntrackedTask,
    project: Project,
    surroundingLines: string[]
  ): Promise<DraftResult> {
    const warnings: string[] = []

    const systemPrompt = 'คุณเป็น QA engineer ที่ช่วยร่าง Jira ticket จากงานที่ยังไม่ได้ track ใน Jira ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น'
    const userPrompt = `Task: ${task.rawText}
File: ${task.fileRelativePath}
Project Jira Board: ${project.jiraBoardId}
Context lines:
${surroundingLines.join('\n')}

Please provide a JSON object with these fields: { "summary": string, "description": string, "priority": "Blocker"|"Critical"|"Major"|"Minor"|"Trivial", "labels": string[] }`

    const rawPrompt = `${systemPrompt}\n\n${userPrompt}`

    let rawResponse: string
    let parsed: { summary: string; description: string; priority: string; labels: string[] }

    try {
      rawResponse = await runClaude(rawPrompt)
      parsed = this.parseJson(rawResponse)
    } catch {
      try {
        rawResponse = await runClaude(rawPrompt + '\n\nตอบ JSON เท่านั้น ไม่มีข้อความอื่น')
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
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no JSON block found in response')
    return JSON.parse(match[0])
  }

  async startMyDay(context: StartMyDayContext, window: BrowserWindow): Promise<void> {
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

    const prompt = `คุณเป็น QA engineer's daily briefing assistant ที่เข้าถึงสถานะงาน QA ปัจจุบันได้ ตอบสั้นกระชับ เป็น bullet points ไม่มีข้อความที่ไม่จำเป็น

วันนี้คือ ${today} นี่คือสถานะงาน QA ของฉัน:

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
      await streamClaude(prompt, (chunk) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IpcChannel.STREAM_CHUNK as string, chunk)
        }
      })
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
