import schedule, { Job } from 'node-schedule'
import { BrowserWindow } from 'electron'
import { IpcChannel } from '../../shared/types/ipc.js'
import type { ConfigStore } from './ConfigStore.js'
import type { RepoScanner } from './RepoScanner.js'
import type { JiraClient } from './JiraClient.js'
import type { DangerZoneTracker } from './DangerZoneTracker.js'
import type { ScanResult } from '../../shared/types/task.js'
import type { DangerZoneState } from '../../shared/types/snapshot.js'

export interface SyncSummary {
  syncedAt: string
  projectsScanned: number
  totalUntracked: number
  totalLinked: number
  dangerZoneProjects: string[]
  errors: string[]
}

export class Scheduler {
  private syncJob: Job | null = null
  private focusJob: Job | null = null

  // previousDangerZoneStates ใช้ track การเปลี่ยนจาก false → true
  private previousDangerZoneStates: Map<string, boolean> = new Map()

  constructor(
    private configStore: ConfigStore,
    private repoScanner: RepoScanner,
    private jiraClient: JiraClient,
    private dangerZoneTracker: DangerZoneTracker,
    private getWindow: () => BrowserWindow | null
  ) {}

  start(): void {
    // US-013: Morning sync 09:00 วันจันทร์–ศุกร์ (AC-009-01)
    this.syncJob = schedule.scheduleJob('0 9 * * 1-5', () => {
      this.triggerSync().catch((err: Error) => {
        console.error('[Scheduler] triggerSync error:', err)
      })
    })

    // US-017: Window focus 09:10 วันจันทร์–ศุกร์ (AC-011-01)
    this.focusJob = schedule.scheduleJob('10 9 * * 1-5', () => {
      this.focusWindow()
    })
  }

  stop(): void {
    if (this.syncJob) {
      this.syncJob.cancel()
      this.syncJob = null
    }
    if (this.focusJob) {
      this.focusJob.cancel()
      this.focusJob = null
    }
  }

  async triggerSync(): Promise<SyncSummary> {
    const syncedAt = new Date().toISOString()
    const errors: string[] = []
    const dangerZoneProjects: string[] = []
    let totalUntracked = 0
    let totalLinked = 0

    // 1. ดึง project list
    const projects = this.configStore.getProjects()

    // 2. Scan แต่ละ project
    const scanResults: ScanResult[] = []
    for (const project of projects) {
      try {
        const result = await this.repoScanner.scan(project)
        scanResults.push(result)
        totalUntracked += result.untracked.length
        totalLinked += result.linked.length
        if (result.errors.length > 0) {
          errors.push(...result.errors.map((e) => `[${project.id}] ${e}`))
        }
      } catch (err) {
        errors.push(`[${project.id}] scan failed: ${(err as Error).message}`)
      }
    }

    // 3. รวม linked keys ทั้งหมด → fetch Jira tickets
    // Group by baseUrl เพราะแต่ละ project อาจมี baseUrl ต่างกัน
    const keysByProject = new Map<string, { keys: string[]; baseUrl: string; email: string }>()
    for (const project of projects) {
      const result = scanResults.find((r) => r.projectId === project.id)
      if (!result) continue
      const keys = result.linked.map((t) => t.jiraKey)
      if (keys.length === 0) continue
      const settings = this.configStore.getJiraSettings(project.id)
      if (!settings) continue
      const existing = keysByProject.get(settings.baseUrl)
      if (existing) {
        existing.keys.push(...keys)
      } else {
        keysByProject.set(settings.baseUrl, { keys, baseUrl: settings.baseUrl, email: settings.email })
      }
    }

    for (const { keys, baseUrl, email } of keysByProject.values()) {
      try {
        await this.jiraClient.getTickets(keys, baseUrl, email)
      } catch (err) {
        errors.push(`[jira:${baseUrl}] fetch failed: ${(err as Error).message}`)
      }
    }

    // 4. DangerZone evaluate แต่ละ project
    for (const project of projects) {
      const result = scanResults.find((r) => r.projectId === project.id)
      if (!result) continue
      try {
        const state: DangerZoneState = this.dangerZoneTracker.recordAndEvaluate(
          result,
          project.config
        )

        // 5. ถ้า isActive เปลี่ยนจาก false → true: emit event:dangerzone:triggered
        const wasActive = this.previousDangerZoneStates.get(project.id) ?? false
        if (!wasActive && state.isActive) {
          this.sendToWindow(IpcChannel.DANGER_ZONE_TRIGGERED, project.id)
        }
        this.previousDangerZoneStates.set(project.id, state.isActive)

        if (state.isActive) {
          dangerZoneProjects.push(project.id)
        }
      } catch (err) {
        errors.push(
          `[dangerzone:${project.id}] evaluate failed: ${(err as Error).message}`
        )
      }
    }

    const summary: SyncSummary = {
      syncedAt,
      projectsScanned: projects.length,
      totalUntracked,
      totalLinked,
      dangerZoneProjects,
      errors,
    }

    // 6. emit event:sync:completed
    this.sendToWindow(IpcChannel.SYNC_COMPLETED, summary)

    return summary
  }

  // AC-011-01 ถึง AC-011-07: Window focus handler สำหรับ US-017
  private focusWindow(): void {
    // ใช้ BrowserWindow.getAllWindows() เพื่อ live state (ไม่ใช้ stored this.window ที่อาจ stale)
    const windows = BrowserWindow.getAllWindows()

    // AC-011-04: ไม่มี window instance → no-op (ไม่ launch ใหม่)
    if (windows.length === 0) return

    const win = windows[0]

    // Defensive guard: window destroyed (race condition protection)
    if (win.isDestroyed()) return

    // AC-011-03: window minimize อยู่ → restore() → show() → focus()
    if (win.isMinimized()) {
      win.restore()
      win.show()
      win.focus()
      return
    }

    // AC-011-07: window hidden (isVisible() = false) แต่ instance ยังอยู่ → show() → focus()
    if (!win.isVisible()) {
      win.show()
      win.focus()
      return
    }

    // AC-011-02: window แสดงอยู่แล้ว → show() + focus() (idempotent)
    win.show()
    win.focus()

    // AC-011-06: ห้าม router.push, dialog.show, Notification ในที่นี้
  }

  // Helper: ส่ง event ไป renderer ถ้า window ยังไม่ถูก destroy
  private sendToWindow(channel: IpcChannel, ...args: unknown[]): void {
    const win = this.getWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel as string, ...args)
    }
  }
}
