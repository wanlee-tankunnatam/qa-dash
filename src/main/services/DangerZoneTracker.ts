import type { ConfigStore } from './ConfigStore.js'
import type { ScanResult } from '../../shared/types/task.js'
import type { ProjectConfig } from '../../shared/types/project.js'
import type { DangerZoneState, DaySnapshot } from '../../shared/types/snapshot.js'
import { DANGER_ZONE_SNAPSHOT_WINDOW } from '../../shared/constants.js'

export class DangerZoneTracker {
  constructor(private store: ConfigStore) {}

  recordAndEvaluate(scanResult: ScanResult, config: ProjectConfig): DangerZoneState {
    try {
      const today = new Date().toISOString().split('T')[0]
      const storeKey = `dangerzone.snapshots.${scanResult.projectId}` as const
      const snapshots: DaySnapshot[] = (this.store['store'].get(storeKey) as DaySnapshot[] | undefined) ?? []

      // Upsert today's snapshot
      const todayIdx = snapshots.findIndex((s) => s.date === today)
      const todaySnapshot: DaySnapshot = {
        projectId: scanResult.projectId,
        date: today,
        untrackedCount: scanResult.untracked.filter((t) => !t.isIgnoredToday).length,
        linkedCount: scanResult.linked.length,
      }
      if (todayIdx >= 0) {
        snapshots[todayIdx] = todaySnapshot
      } else {
        snapshots.push(todaySnapshot)
      }

      // Prune snapshots older than DANGER_ZONE_SNAPSHOT_WINDOW days
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - DANGER_ZONE_SNAPSHOT_WINDOW)
      const cutoffStr = cutoff.toISOString().split('T')[0]
      const pruned = snapshots.filter((s) => s.date >= cutoffStr)

      this.store['store'].set(storeKey, pruned)

      // Calculate streak: consecutive days back from today where untrackedCount >= threshold
      const sorted = [...pruned].sort((a, b) => b.date.localeCompare(a.date))
      let streak = 0
      let streakStartDate: string | undefined
      let currentDate = new Date()

      for (const snapshot of sorted) {
        const expectedDate = currentDate.toISOString().split('T')[0]
        if (snapshot.date !== expectedDate) break
        if (snapshot.untrackedCount >= config.warningThresholdCount) {
          streak++
          streakStartDate = snapshot.date
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }

      const isActive = streak >= config.warningThresholdDays

      return {
        projectId: scanResult.projectId,
        isActive,
        consecutiveDays: streak,
        streakStartDate,
        lastCheckedDate: today,
        snapshots: pruned,
      }
    } catch {
      return {
        projectId: scanResult.projectId,
        isActive: false,
        consecutiveDays: 0,
        lastCheckedDate: new Date().toISOString().split('T')[0],
        snapshots: [],
      }
    }
  }

  getState(projectId: string): DangerZoneState {
    try {
      const today = new Date().toISOString().split('T')[0]
      const storeKey = `dangerzone.snapshots.${projectId}` as const
      const snapshots: DaySnapshot[] =
        (this.store['store'].get(storeKey) as DaySnapshot[] | undefined) ?? []

      return {
        projectId,
        isActive: false,
        consecutiveDays: 0,
        lastCheckedDate: today,
        snapshots,
      }
    } catch {
      return {
        projectId,
        isActive: false,
        consecutiveDays: 0,
        lastCheckedDate: new Date().toISOString().split('T')[0],
        snapshots: [],
      }
    }
  }
}
