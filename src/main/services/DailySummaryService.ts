import { execFile } from 'child_process'
import { promisify } from 'util'
import type { ConfigStore } from './ConfigStore.js'
import type { JiraClient, WorkedIssue } from './JiraClient.js'
import type { ClaudeCliService } from './ClaudeCliService.js'
import type { Project } from '../../shared/types/project.js'
import type {
  DailySummary,
  ProjectDailySummary,
  DailyCommit,
  DailyJiraIssue,
} from '../../shared/types/summary.js'

const execFileAsync = promisify(execFile)

// separator ที่ commit subject ไม่มีทางมี (unit separator)
const SEP = '\x1f'
const KEY_RE = /\b([A-Z]{2,})-\d+\b/g
// prefix ที่เป็น noise ทั่วไป ไม่ใช่ Jira project key จริง — กันไม่ให้ถูกเลือกเป็น dominant
const PREFIX_DENYLIST = new Set([
  'MVP', 'CVE', 'ADR', 'DEV', 'TC', 'RA', 'US', 'AC', 'EPIC', 'PR', 'WIP', 'DAIL',
])

export class DailySummaryService {
  constructor(
    private configStore: ConfigStore,
    private jiraClient: JiraClient,
    private claudeCli: ClaudeCliService
  ) {}

  /** generate + persist สรุปของวัน date (YYYY-MM-DD, local) แล้วคืนผล */
  async generate(date: string): Promise<DailySummary> {
    const projects = this.configStore.getProjects()
    const errors: string[] = []

    // 1. git ต่อโปรเจกต์ (commits ของ author = ฉัน + dominant Jira prefix)
    const perProject = await Promise.all(
      projects.map(async (p) => {
        try {
          const [commits, prefix] = await Promise.all([
            this.getCommits(p.rootPath, date),
            this.getDominantPrefix(p.rootPath),
          ])
          return { project: p, commits, prefix }
        } catch (err) {
          errors.push(`[${p.name}] git: ${(err as Error).message}`)
          return { project: p, commits: [] as DailyCommit[], prefix: null as string | null }
        }
      })
    )

    // 2. Jira — query ครั้งเดียว (issue ที่ฉันแตะวันนั้น) แล้ว bucket ตาม prefix → โปรเจกต์
    const prefixToProjectId = new Map<string, string>()
    for (const { project, prefix } of perProject) {
      if (prefix) prefixToProjectId.set(prefix, project.id)
    }
    const jiraByProject = new Map<string, DailyJiraIssue[]>()
    const unmatchedJira: DailyJiraIssue[] = []
    const jira = this.configStore.getGlobalJira()
    if (jira?.site && jira?.email) {
      const baseUrl = toBaseUrl(jira.site)
      let worked: WorkedIssue[] = []
      try {
        worked = await this.jiraClient.searchWorkedOn(date, baseUrl, jira.email)
      } catch (err) {
        errors.push(`[jira] ${(err as Error).message}`)
      }
      for (const issue of worked) {
        const prefix = issue.key.split('-')[0]
        const pid = prefixToProjectId.get(prefix)
        const entry: DailyJiraIssue = issue
        if (pid) {
          const list = jiraByProject.get(pid) ?? []
          list.push(entry)
          jiraByProject.set(pid, list)
        } else {
          unmatchedJira.push(entry)
        }
      }
    }

    // 3. เรียบเรียงเป็นภาษาคนต่อโปรเจกต์ (AI; fallback = commit subject ดิบ)
    const projectSummaries: ProjectDailySummary[] = await Promise.all(
      perProject.map(({ project, commits }) =>
        this.buildProjectSummary(project, commits, jiraByProject.get(project.id) ?? [])
      )
    )

    const summary: DailySummary = {
      date,
      generatedAt: new Date().toISOString(),
      projects: projectSummaries,
      unmatchedJira,
      errors,
    }
    this.configStore.setSummary(date, summary)
    return summary
  }

  private async buildProjectSummary(
    project: Project,
    commits: DailyCommit[],
    jira: DailyJiraIssue[]
  ): Promise<ProjectDailySummary> {
    if (commits.length === 0 && jira.length === 0) {
      return { projectId: project.id, bullets: [], commits, jira, aiGenerated: false }
    }

    const raw = this.rawBullets(commits, jira)
    try {
      const bullets = await this.aiSummarize(project.name, commits, jira)
      if (bullets.length) {
        return { projectId: project.id, bullets, commits, jira, aiGenerated: true }
      }
    } catch {
      // ตกไป fallback ด้านล่าง (ไม่มี API key / network พลาด)
    }
    return { projectId: project.id, bullets: raw, commits, jira, aiGenerated: false }
  }

  // ---- git ----

  private async getCommits(rootPath: string, date: string): Promise<DailyCommit[]> {
    const email = await this.gitAuthorEmail(rootPath)
    const args = [
      '-C', rootPath, 'log', '--no-merges',
      `--since=${date}T00:00:00`, `--until=${nextDay(date)}T00:00:00`,
      `--pretty=format:%h${SEP}%s`,
    ]
    if (email) args.push(`--author=${email}`)
    const { stdout } = await execFileAsync('git', args, { maxBuffer: 4 * 1024 * 1024 })
    return stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, subject] = line.split(SEP)
        return { hash, subject: subject ?? '' }
      })
  }

  private async gitAuthorEmail(rootPath: string): Promise<string | null> {
    try {
      const { stdout } = await execFileAsync('git', ['-C', rootPath, 'config', 'user.email'])
      return stdout.trim() || null
    } catch {
      return null
    }
  }

  /** Jira project key ที่ commit ใน 300 ตัวล่าสุดใช้มากสุด (เว้น noise) — ใช้จับคู่ issue → โปรเจกต์ */
  private async getDominantPrefix(rootPath: string): Promise<string | null> {
    let stdout = ''
    try {
      ;({ stdout } = await execFileAsync(
        'git',
        ['-C', rootPath, 'log', '-300', '--pretty=format:%s'],
        { maxBuffer: 4 * 1024 * 1024 }
      ))
    } catch {
      return null
    }
    const counts = new Map<string, number>()
    for (const m of stdout.matchAll(KEY_RE)) {
      const prefix = m[1]
      if (PREFIX_DENYLIST.has(prefix)) continue
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1)
    }
    let best: string | null = null
    let bestN = 0
    for (const [prefix, n] of counts) {
      if (n > bestN) { best = prefix; bestN = n }
    }
    return best
  }

  // ---- เรียบเรียง ----

  // fallback ตอนไม่มี AI — ทำให้อ่านง่ายเท่าที่ทำได้: ตัด prefix conventional-commit,
  // ไม่ทิ้ง Jira เป็นบุลเล็ตยาว ๆ (โชว์แค่จำนวน) — รายละเอียด Jira ไปอยู่บรรทัด meta แทน
  private rawBullets(commits: DailyCommit[], jira: DailyJiraIssue[]): string[] {
    const out = commits.map((c) => cleanSubject(c.subject)).slice(0, 8)
    if (commits.length > 8) out.push(`… และอีก ${commits.length - 8} commit`)
    if (jira.length) out.push(`แตะ Jira ${jira.length} รายการ`)
    return out
  }

  private async aiSummarize(
    projectName: string,
    commits: DailyCommit[],
    jira: DailyJiraIssue[]
  ): Promise<string[]> {
    const commitBlock = commits.map((c) => `- ${c.subject}`).join('\n') || '(ไม่มี commit)'
    const jiraBlock =
      jira.map((j) => `- ${j.key} ${j.summary} [${j.status}]`).join('\n') || '(ไม่มี)'
    const prompt = `คุณช่วยสรุปงาน QA/dev รายวันจาก git commit และ Jira ให้เป็นภาษาคนอ่านเข้าใจง่าย
กติกาการตอบ:
- ตอบเป็นบุลเล็ตภาษาไทยล้วน ขึ้นต้นแต่ละบรรทัดด้วย "- " เท่านั้น
- ห้ามใส่ commit hash, ห้ามคัด commit message ดิบมาตรง ๆ, ห้ามมีหัวข้อหรือคำนำ
- รวม commit/ticket ที่เกี่ยวข้องกันเป็นข้อเดียว กระชับ 3-5 ข้อ ถ้างานน้อยให้น้อยข้อได้
- ตอบเฉพาะบุลเล็ต ไม่ต้องมีคำอธิบายอื่น

โปรเจกต์: ${projectName}

Git commits วันนี้:
${commitBlock}

Jira ที่แตะวันนี้:
${jiraBlock}

สรุปว่าวันนี้ทำอะไรไปบ้าง:`
    const text = await this.claudeCli.run(prompt)
    return text
      .split('\n')
      .map((l) => l.replace(/^[-*•]\s*/, '').trim())
      .filter((l) => l && !/^```/.test(l))
      .slice(0, 6)
  }
}

// ตัด prefix แบบ conventional commit ออก: "docs(qa): x" → "x", "feat: y" → "y"
function cleanSubject(subject: string): string {
  return subject.replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, '').trim() || subject
}

function nextDay(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// "kitdi" → https://kitdi.atlassian.net ; ถ้าใส่ full URL มาก็ normalize
function toBaseUrl(site: string): string {
  return site.startsWith('http') ? site.replace(/\/$/, '') : `https://${site}.atlassian.net`
}
