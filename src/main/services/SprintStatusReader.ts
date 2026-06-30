import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import type { EpicInfo, StoryInfo, StoryCoverage, SprintStatusResult } from '../../shared/types/sprint.js'

const execAsync = promisify(exec)

const SPRINT_STATUS_PATH = '_bmad-output/implementation-artifacts/sprint-status.yaml'

const ACRONYMS = new Set([
  'sso', 'jwt', 'pdpa', 'ml', 'rls', 'api', 'tos', 'cs', 'hud',
  'ux', 'ci', 'ui', 'oidc', 'worm', 'rbac', 's3', 'kpi', 'kpis',
])
const SMALL_WORDS = new Set(['via', 'at', 'of', 'the', 'in', 'on', 'for', 'and', 'or', 'to', 'a'])

function titleCase(words: string[]): string {
  return words.map((w, i) => {
    const lower = w.toLowerCase()
    if (ACRONYMS.has(lower)) return lower.toUpperCase()
    if (i > 0 && SMALL_WORDS.has(lower)) return lower
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }).join(' ')
}

function slugToLabel(slug: string): string {
  const m = slug.match(/^(\d+)-(\d+)-(.+)$/)
  if (m) {
    const words = m[3].split('-')
    return `${m[1]}.${m[2]} ${titleCase(words)}`
  }
  return titleCase(slug.split('-'))
}

export class SprintStatusReader {
  async getStatus(rootPath: string): Promise<SprintStatusResult> {
    const filePath = join(rootPath, SPRINT_STATUS_PATH)
    let content: string
    try {
      content = await readFile(filePath, 'utf-8')
    } catch {
      const tcCoverage = await this.scanTCCoverage(rootPath, [])
      const epicHierarchy = await this.buildFallbackHierarchy(rootPath, tcCoverage)
      const gitDateMap = await this.scanGitDates(rootPath, epicHierarchy)
      return { devStatusMap: {}, epicHierarchy, tcCoverage, gitDateMap }
    }

    const slugStatus: Record<string, string> = {}
    const jiraToSlug: Record<string, string> = {}
    const epicHierarchy: EpicInfo[] = []
    const epicByNum: Record<number, EpicInfo> = {}

    type Section = 'none' | 'devStatus' | 'stories' | 'epics'
    let section: Section = 'none'
    let inAssignments = false

    for (const rawLine of content.split('\n')) {
      const commentIdx = rawLine.indexOf('#')
      const commentPart = commentIdx >= 0 ? rawLine.slice(commentIdx + 1) : ''
      const line = (commentIdx >= 0 ? rawLine.slice(0, commentIdx) : rawLine).trimEnd()

      if (!line.trim()) continue

      if (/^\S/.test(line)) {
        inAssignments = false
        section = 'none'
        if (line.startsWith('development_status:')) section = 'devStatus'
        else if (line.startsWith('assignments:')) inAssignments = true
        continue
      }

      if (inAssignments && /^  \S/.test(line)) {
        const trimmed = line.trimStart()
        section = 'none'
        if (trimmed.startsWith('stories:')) section = 'stories'
        else if (trimmed.startsWith('epics:')) section = 'epics'
        continue
      }

      if (section === 'devStatus') {
        const m = line.match(/^  ([\w-]+):\s*([\w-]+)/)
        if (!m) continue
        const slug = m[1]
        const status = m[2]
        slugStatus[slug] = status

        // Extract Jira keys from inline comment (e.g. "# TI-24 · Jame" or "# TI-31 + TI-32")
        const jiraKeys = [...commentPart.matchAll(/\b([A-Z]+-\d+)\b/g)].map((k) => k[1])

        const epicMatch = slug.match(/^epic-(\d+)$/)
        if (epicMatch) {
          const num = parseInt(epicMatch[1])
          const epic: EpicInfo = { slug, number: num, status, stories: [] }
          epicHierarchy.push(epic)
          epicByNum[num] = epic
        } else if (!/^epic-\d+-/.test(slug)) {
          // Story slug (not epic-N-retrospective or similar sub-epic keys)
          const storyNumMatch = slug.match(/^(\d+)-\d+/)
          if (storyNumMatch) {
            const epicNum = parseInt(storyNumMatch[1])
            const epic = epicByNum[epicNum]
            if (epic) {
              const story: StoryInfo = {
                slug,
                label: slugToLabel(slug),
                status,
                jiraKeys,
                epicSlug: `epic-${epicNum}`,
              }
              epic.stories.push(story)
              for (const jk of jiraKeys) {
                jiraToSlug[jk] = slug
              }
            }
          }
        }
      }

      // assignments.stories (takra-rerun style with explicit jira: keys)
      if (section === 'stories') {
        const slugMatch = line.match(/^    ([\w-]+):/)
        if (slugMatch) {
          const slug = slugMatch[1]
          for (const km of line.matchAll(/\bjira(?:_\w+)?:\s*([A-Z]+-\d+)/g)) {
            jiraToSlug[km[1]] = slug
            for (const epic of epicHierarchy) {
              for (const story of epic.stories) {
                if (story.slug === slug && !story.jiraKeys.includes(km[1])) {
                  story.jiraKeys.push(km[1])
                }
              }
            }
          }
        }
      }

      if (section === 'epics') {
        const m = line.match(/^    ([\w-]+):\s*([A-Z]+-\d+)/)
        if (m) jiraToSlug[m[2]] = m[1]
      }
    }

    const devStatusMap: Record<string, string> = {}
    for (const [jiraKey, slug] of Object.entries(jiraToSlug)) {
      const status = slugStatus[slug]
      if (status) devStatusMap[jiraKey] = status
    }
    for (const [slug, status] of Object.entries(slugStatus)) {
      if (/^epic-\d+$/.test(slug)) devStatusMap[slug] = status
    }

    const tcCoverage = await this.scanTCCoverage(rootPath, epicHierarchy)
    const gitDateMap = await this.scanGitDates(rootPath, epicHierarchy)
    return { devStatusMap, epicHierarchy, tcCoverage, gitDateMap }
  }

  private async scanGitDates(
    rootPath: string,
    epicHierarchy: EpicInfo[]
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    try {
      // One git log call: each line = "YYYY-MM-DD subject"
      const { stdout } = await execAsync(
        'git log --format="%cs %s" --no-merges -500',
        { cwd: rootPath }
      )
      const lines = stdout.split('\n').filter(Boolean)
      for (const epic of epicHierarchy) {
        for (const story of epic.stories) {
          for (const key of story.jiraKeys) {
            if (result[key]) continue
            const line = lines.find(l => l.includes(key))
            if (line) result[key] = line.slice(0, 10)
          }
        }
      }
    } catch { /* not a git repo or no commits */ }
    return result
  }

  private async buildFallbackHierarchy(
    rootPath: string,
    tcCoverage: Record<string, StoryCoverage>
  ): Promise<EpicInfo[]> {
    const casePath = join(rootPath, '_bmad-output/test-artifacts/case')
    let dirs: import('fs').Dirent[]
    try {
      dirs = await readdir(casePath, { withFileTypes: true })
    } catch {
      return []
    }
    const stories: StoryInfo[] = dirs
      .filter(d => d.isDirectory())
      .map(d => ({
        slug: d.name,
        label: titleCase(d.name.split('-')),
        status: 'done',
        jiraKeys: [],
        epicSlug: 'epic-0',
      }))
    if (!stories.length) return []
    return [{ slug: 'epic-0', number: 0, status: 'done', stories }]
  }

  private async scanTCCoverage(
    rootPath: string,
    epicHierarchy: EpicInfo[]
  ): Promise<Record<string, StoryCoverage>> {
    const testArtifactsPath = join(rootPath, '_bmad-output/test-artifacts')
    const coverage: Record<string, StoryCoverage> = {}

    // Scan web/e2e/*.spec.ts → set of spec base names (e.g. "delete-guard")
    const specSlugs = new Set<string>()
    try {
      const specFiles = await readdir(join(rootPath, 'web', 'e2e'))
      for (const f of specFiles) {
        const m = f.match(/^(.+)\.spec\.[tj]s$/)
        if (m) specSlugs.add(m[1])
      }
    } catch { /* no web/e2e folder */ }

    // Scan case/ folder: feature slug → per-type coverage
    const caseFeatures = new Map<string, { hasAPI: boolean; hasIntegration: boolean; hasUI: boolean; hasE2E: boolean; hasTC: boolean }>()
    try {
      const dirs = await readdir(join(testArtifactsPath, 'case'), { withFileTypes: true })
      for (const entry of dirs) {
        if (!entry.isDirectory()) continue
        const files = await readdir(join(testArtifactsPath, 'case', entry.name))
        const hasAPI = files.includes('api.md')
        const hasIntegration = files.includes('integration.md')
        const hasUI = files.includes('ui.md')
        const hasE2E = files.includes('fullloop-e2e.md')
        const hasTC = hasAPI || hasIntegration || hasUI || hasE2E
        caseFeatures.set(entry.name, { hasAPI, hasIntegration, hasUI, hasE2E, hasTC })
      }
    } catch {
      return coverage
    }

    // Build storyNum → featureSlug from each epic's test-plan.md
    const storyNumToFeature = new Map<string, string>() // "2.1" → "login-sso"
    for (const epic of epicHierarchy) {
      try {
        const testPlan = await readFile(
          join(testArtifactsPath, `epic-${epic.number}`, 'test-plan.md'),
          'utf-8'
        )
        for (const line of testPlan.split('\n')) {
          // Match "featureSlug (Story N.M" anywhere in the line (headings, tables, bold text)
          for (const m of line.matchAll(/([\w-]+)\s+\(Story\s+(\d+)\.(\d+)/g)) {
            const key = `${m[2]}.${m[3]}`
            if (!storyNumToFeature.has(key)) storyNumToFeature.set(key, m[1])
          }
          // Also match "### Story N.M — Feature Name" for epics that use heading-per-story
          const mH = line.match(/^###\s+Story\s+(\d+)\.(\d+)\s+[—–-]+\s+([\w\s-]+?)(?:\s*\(|\s*$)/)
          if (mH) {
            const derived = mH[3].trim().toLowerCase().replace(/\s+/g, '-')
            const key = `${mH[1]}.${mH[2]}`
            if (!storyNumToFeature.has(key) && caseFeatures.has(derived)) {
              storyNumToFeature.set(key, derived)
            }
          }
        }
      } catch { /* test-plan.md doesn't exist for this epic */ }
    }

    // Map each story slug to its coverage
    for (const epic of epicHierarchy) {
      for (const story of epic.stories) {
        const numMatch = story.slug.match(/^(\d+)-(\d+)-/)

        let featureSlug: string | undefined

        if (numMatch) {
          const storyNum = `${numMatch[1]}.${numMatch[2]}`
          // 1st: explicit mapping from test-plan.md
          featureSlug = storyNumToFeature.get(storyNum)
          // 2nd: substring match against case folder names
          if (!featureSlug) {
            for (const caseDir of caseFeatures.keys()) {
              if (story.slug.includes(caseDir)) { featureSlug = caseDir; break }
            }
          }
        } else {
          // Fallback mode: story slug IS the feature slug
          featureSlug = caseFeatures.has(story.slug) ? story.slug : undefined
        }

        if (featureSlug && caseFeatures.has(featureSlug)) {
          const cf = caseFeatures.get(featureSlug)!
          const hasScript = specSlugs.has(featureSlug)
          coverage[story.slug] = { hasAPI: cf.hasAPI, hasIntegration: cf.hasIntegration, hasUI: cf.hasUI, hasE2E: cf.hasE2E, hasTC: cf.hasTC, hasScript, featureSlug }
        }
      }
    }

    return coverage
  }

  async getDevStatusMap(rootPath: string): Promise<Record<string, string>> {
    return (await this.getStatus(rootPath)).devStatusMap
  }
}
