import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc.js'
import type { UntrackedTask, ScanResult } from '../../shared/types/task.js'
import type { Project } from '../../shared/types/project.js'
import type { JiraTicket } from '../../shared/types/jira.js'
import type { TicketDraft, DraftResult, GapCheckReport, GapItem, TestCaseDraft, TestCaseReport } from '../../shared/types/draft.js'
import type { JiraPriority } from '../../shared/types/jira.js'
import type { DangerZoneState } from '../../shared/types/snapshot.js'
import { randomUUID } from 'crypto'
import { readFile } from 'fs/promises'
import { AIService } from './AIService.js'
import { JiraClient } from './JiraClient.js'
import { ConfigStore } from './ConfigStore.js'
import { DangerZoneTracker } from './DangerZoneTracker.js'

export interface StartMyDayContext {
  date: string
  allScanResults: ScanResult[]
  jiraTickets: JiraTicket[]
  projects: Project[]
  dangerZoneStates?: Record<string, DangerZoneState> // indexed by projectId
}


export class DraftService {
  private aiService: AIService
  private jiraClient: JiraClient
  private configStore: ConfigStore
  private dangerZoneTracker: DangerZoneTracker

  constructor(jiraClient: JiraClient, configStore: ConfigStore, dangerZoneTracker: DangerZoneTracker) {
    this.aiService = new AIService()
    this.jiraClient = jiraClient
    this.configStore = configStore
    this.dangerZoneTracker = dangerZoneTracker
  }

  async ask(prompt: string, window: BrowserWindow, _imagePath?: string): Promise<void> {
    const fullPrompt = _imagePath
      ? `${prompt}\n\n(Please analyze the image at: ${_imagePath})`
      : prompt

    try {
      await this.aiService.stream(fullPrompt, (chunk) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IpcChannel.STREAM_CHUNK as string, chunk)
        }
      })
    } catch (err) {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
      }
    }
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
      rawResponse = await this.aiService.ask(rawPrompt, systemPrompt)
      parsed = this.parseJson(rawResponse)
    } catch {
      try {
        rawResponse = await this.aiService.ask(rawPrompt + '\n\nตอบ JSON เท่านั้น ไม่มีข้อความอื่น', systemPrompt)
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
        if (!result) return `### ${p.name}\nไม่มี`
        const tasks = result.untracked.filter((t) => !t.isIgnoredToday)
        if (tasks.length === 0) return `### ${p.name}\nไม่มี`
        return `### ${p.name}\n${tasks.map((t) => `- ${t.rawText}`).join('\n')}`
      })
      .join('\n\n')

    // Build danger zone context for Top Risks analysis (AC-021-02, 07, 08)
    // Sort by consecutiveDays DESC (highest risk first) per AC-021-08
    const dangerZoneContext = context.dangerZoneStates
      ? Object.entries(context.dangerZoneStates)
          .sort((a, b) => (b[1].consecutiveDays || 0) - (a[1].consecutiveDays || 0))
          .map(([projectId, state]) => {
            const project = context.projects.find((p) => p.id === projectId)
            const status = state.isActive ? `🔴 DANGER (${state.consecutiveDays} days)` : '✅ Safe'
            const recentSnapshots = state.snapshots.slice(-7) // last 7 days
            const untrackedCounts = recentSnapshots.map((s) => s.untrackedCount)
            const untrackedTrend = untrackedCounts.join(' → ')

            // Compute trend analysis for Common Patterns (AC-021-11)
            const deltas = untrackedCounts.slice(1).map((val, i) => val - untrackedCounts[i])
            const avgDelta = deltas.length > 0 ? (deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1) : '0'
            const trend = parseFloat(avgDelta as string) > 0 ? 'increasing' : parseFloat(avgDelta as string) < 0 ? 'decreasing' : 'stable'

            return `${project?.name || 'Unknown'}: ${untrackedTrend} (avg: ${avgDelta}/day, ${trend}) — ${status}`
          })
          .join('\n')
      : 'No danger zone data available'

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

## Danger Zone Status (7-day rolling snapshot)
${dangerZoneContext}

กรุณาสรุปตามลำดับต่อไปนี้ (หากข้อมูลว่าง ให้ตอบ "ไม่มี"):

## 1. CRITICAL ก่อนเที่ยง
งานอะไรที่ต้องจัดการใน 4 ชั่วโมงข้างหน้า?

## 2. STANDUP
3-5 bullet points สำหรับรายงาน Standup

## 3. CLEAR UNTRACKED
แผนขั้นตอนการเปลี่ยน 3 Untracked Tasks แรกเป็น Jira ticket

## 4. TOP RISKS
ระบุ 2-3 โปรเจกต์ที่เสี่ยงที่สุด (Blocker + Danger Zone + Overdue รวม) — เรียงลำดับ risk สูงสุด

## 5. COMMON PATTERNS
จาก Danger Zone tracking — มีลักษณะซ้ำ (เช่น "Every Monday มี untracked surge") หรือไม่?

## 6. SUGGESTED FIX ORDER
ลำดับ 1-5 ของ action items ที่ควรทำเป็นอันดับแรก (Blocker → Overdue → Due Today → Danger Zone → Pattern)`

    try {
      await this.aiService.stream(prompt, (chunk) => {
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

  async gapCheck(
    sourceType: 'jira' | 'file',
    sourceValue: string,
    window: BrowserWindow,
    projectId?: string
  ): Promise<void> {
    let requirementText: string

    try {
      // Fetch or read requirement text
      if (sourceType === 'jira') {
        // For Jira mode, sourceValue is the ticket key as requirement text
        // AC-012-07: read-only gap check (no Jira API calls)
        requirementText = `Jira Ticket Key: ${sourceValue}\n\nPlease analyze this Jira ticket for requirement gaps and ambiguities.`
      } else {
        // For file, sourceValue is a file path
        try {
          requirementText = await readFile(sourceValue, 'utf-8')
        } catch (err) {
          throw new Error(`Failed to read file: ${(err as Error).message}`)
        }
      }

      if (!requirementText || requirementText.trim().length === 0) {
        throw new Error('Requirement text is empty')
      }

      const systemPrompt = `คุณเป็น QA requirements analyst ที่ตรวจสอบคุณภาพของ requirement เพื่อหา gap ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น`

      const sourceContext = sourceType === 'jira'
        ? `Source: Jira Ticket (${sourceValue})`
        : `Source: Uploaded Markdown File`

      const userPrompt = `${sourceContext}

Requirement:
${requirementText}

Please analyze this requirement for gaps and provide a JSON object with this structure:
{
  "criticalGaps": [
    {
      "title": "string",
      "description": "string",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "suggestedFix": "string"
    }
  ],
  "ambiguities": [...],
  "niceToHaveGaps": [...]
}`

      let fullResponse = ''

      await this.aiService.stream(
        userPrompt,
        (chunk) => {
          fullResponse += chunk
          if (!window.isDestroyed()) {
            window.webContents.send(IpcChannel.STREAM_CHUNK as string, chunk)
          }
        },
        systemPrompt
      )

      // Parse the response
      const parsed = this.parseGapCheckResponse(fullResponse)

      const report: GapCheckReport = {
        id: randomUUID(),
        source: {
          type: sourceType,
          value: sourceValue,
        },
        criticalGaps: parsed.criticalGaps,
        ambiguities: parsed.ambiguities,
        niceToHaveGaps: parsed.niceToHaveGaps,
        createdAt: new Date().toISOString(),
        rawPrompt: `${systemPrompt}\n\n${userPrompt}`,
        rawResponse: fullResponse,
      }

      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_END as string, report)
      }
    } catch (err) {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
      }
    }
  }

  private parseGapCheckResponse(text: string): {
    criticalGaps: GapItem[]
    ambiguities: GapItem[]
    niceToHaveGaps: GapItem[]
  } {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('no JSON block found in response')
      const parsed = JSON.parse(match[0])

      return {
        criticalGaps: parsed.criticalGaps || [],
        ambiguities: parsed.ambiguities || [],
        niceToHaveGaps: parsed.niceToHaveGaps || [],
      }
    } catch (err) {
      throw new Error(`Failed to parse AI response: ${(err as Error).message}`)
    }
  }

  async draftTestCases(
    sourceType: 'jira' | 'file',
    sourceValue: string,
    window: BrowserWindow
  ): Promise<void> {
    let requirementText: string

    try {
      // Fetch or read requirement text
      if (sourceType === 'jira') {
        // For Jira mode, sourceValue is the ticket key
        requirementText = `Jira Ticket Key: ${sourceValue}\n\nPlease generate test cases for this Jira ticket.`
      } else {
        // For file, sourceValue is a file path
        try {
          requirementText = await readFile(sourceValue, 'utf-8')
        } catch (err) {
          throw new Error(`Failed to read file: ${(err as Error).message}`)
        }
      }

      if (!requirementText || requirementText.trim().length === 0) {
        throw new Error('Requirement text is empty')
      }

      const systemPrompt = `คุณเป็น QA test engineer ที่ร่าง test cases จากเอกสารข้อมูลประกอบฉัน ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น`

      const sourceContext = sourceType === 'jira'
        ? `Source: Jira Ticket (${sourceValue})`
        : `Source: Requirement File`

      const userPrompt = `${sourceContext}

Requirement:
${requirementText}

Please generate test cases in Given-When-Then format and provide a JSON object with this structure:
{
  "testCases": [
    {
      "scenario": "Given [precondition] / When [action] / Then [expected result]",
      "testData": { "key": "value" },
      "expectedResult": "string",
      "type": "Boundary" | "E2E" | "Edge" | "Functional"
    }
  ]
}`

      let fullResponse = ''

      const response = await this.aiService.ask(userPrompt, systemPrompt)
      fullResponse = response

      // Parse the response
      const parsed = this.parseTestCaseResponse(fullResponse)

      const report: TestCaseReport = {
        id: randomUUID(),
        source: {
          type: sourceType,
          value: sourceValue,
        },
        testCases: parsed.testCases,
        createdAt: new Date().toISOString(),
        rawPrompt: `${systemPrompt}\n\n${userPrompt}`,
        rawResponse: fullResponse,
      }

      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_END as string, report)
      }
    } catch (err) {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_ERROR as string, (err as Error).message)
      }
    }
  }

  private parseTestCaseResponse(text: string): {
    testCases: TestCaseDraft[]
  } {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('no JSON block found in response')
      const parsed = JSON.parse(match[0])

      return {
        testCases: parsed.testCases || [],
      }
    } catch (err) {
      throw new Error(`Failed to parse AI response: ${(err as Error).message}`)
    }
  }
}
