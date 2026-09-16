// Daily summary — สรุปงานรายวันต่อโปรเจกต์ (git commits + Jira) เรียบเรียงเป็นภาษาคน
// เก็บใน electron-store key `summary.<YYYY-MM-DD>` — generate วันละครั้ง, กด Sync เพื่อ regenerate

export interface DailyCommit {
  hash: string
  subject: string
}

export interface DailyJiraIssue {
  key: string
  summary: string
  /** ชื่อ status ดิบจาก Jira เช่น "In Progress", "Done" */
  status: string
  url: string
}

export interface ProjectDailySummary {
  projectId: string
  /** บุลเล็ตภาษาคน — array ว่าง = วันนั้นไม่มีงาน */
  bullets: string[]
  /** ข้อมูลดิบ เก็บไว้ให้ไล่ย้อนได้ (แสดงเป็นบรรทัดเล็กใต้บุลเล็ต) */
  commits: DailyCommit[]
  jira: DailyJiraIssue[]
  /** true = เรียบเรียงด้วย AI, false = fallback ใช้ commit subject ดิบ */
  aiGenerated: boolean
}

export interface DailySummary {
  /** YYYY-MM-DD (local time) */
  date: string
  /** ISO timestamp ตอน generate */
  generatedAt: string
  projects: ProjectDailySummary[]
  /** Jira ที่ map เข้าโปรเจกต์ไหนไม่ได้ (prefix ไม่ตรง repo ไหนเลย) */
  unmatchedJira: DailyJiraIssue[]
  errors: string[]
}
