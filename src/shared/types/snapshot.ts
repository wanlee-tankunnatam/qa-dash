export interface DaySnapshot {
  projectId: string
  date: string
  untrackedCount: number
  linkedCount: number
}

export interface DangerZoneState {
  projectId: string
  isActive: boolean
  consecutiveDays: number
  streakStartDate?: string
  lastCheckedDate: string
  snapshots: DaySnapshot[]
}
