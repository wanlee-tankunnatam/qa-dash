import { createHash } from 'crypto'
import { readFile } from 'fs/promises'
import { glob } from 'glob'
import { resolve, relative } from 'path'
import type { IgnoreStore } from './IgnoreStore.js'
import type { Project } from '../../shared/types/project.js'
import type { ScanResult, UntrackedTask, LinkedTask } from '../../shared/types/task.js'
import { parseChecklist, extractTicketKey, extractHeading, extractDueDate, extractSprint } from '../utils/markdown.js'

export class RepoScanner {
  constructor(private ignoreStore: IgnoreStore) {}

  async scan(project: Project): Promise<ScanResult> {
    const scannedAt = new Date().toISOString()
    const errors: string[] = []
    const untracked: UntrackedTask[] = []
    const linked: LinkedTask[] = []

    let files: string[]
    try {
      const patterns =
        project.config.includePaths?.length
          ? project.config.includePaths.map((p) => (p.endsWith('.md') ? p : `${p.replace(/\/$/, '')}/**/*.md`))
          : ['_bmad-output/test-artifacts/epic-*/*.md']
      files = (
        await Promise.all(
          patterns.map((pattern) =>
            glob(pattern, {
              cwd: project.rootPath,
              ignore: project.config.excludePatterns,
              absolute: false,
            })
          )
        )
      ).flat()
      files = [...new Set(files)]
    } catch (err) {
      return {
        projectId: project.id,
        scannedAt,
        untracked: [],
        linked: [],
        filesScanned: 0,
        errors: [`glob error: ${(err as Error).message}`],
      }
    }

    for (const relPath of files) {
      const absPath = resolve(project.rootPath, relPath)
      let content: string
      try {
        content = await readFile(absPath, 'utf-8')
      } catch (err) {
        errors.push(`${relPath}: ${(err as Error).message}`)
        continue
      }

      const lines = content.split('\n')
      let currentEpic: string | undefined
      let currentSection: string | undefined
      for (let i = 0; i < lines.length; i++) {
        const heading = extractHeading(lines[i])
        if (heading) {
          if (heading.level === 1) {
            currentEpic = heading.text
            currentSection = undefined
          } else if (heading.level === 2) {
            currentSection = heading.text
          } else if (heading.level === 3) {
            // H3 "Story N.M ..." overrides section for story-level grouping
            if (/Story\s+\d+\.\d+/i.test(heading.text)) {
              currentSection = heading.text
            }
          }
          continue
        }

        const parsed = parseChecklist(lines[i])
        if (!parsed) continue

        const lineNumber = i + 1
        const id = createHash('sha1')
          .update(absPath + ':' + lineNumber)
          .digest('hex')

        const ticketKey = extractTicketKey(parsed.text, project.config.ticketRegex)
        const dueDate = extractDueDate(parsed.text) ?? undefined
        const sprint = extractSprint(parsed.text, relPath) ?? undefined

        if (ticketKey) {
          const task: LinkedTask = {
            id,
            projectId: project.id,
            filePath: absPath,
            fileRelativePath: relative(project.rootPath, absPath),
            lineNumber,
            rawText: parsed.text,
            isChecked: parsed.isChecked,
            scannedAt,
            type: 'linked',
            jiraKey: ticketKey,
            epic: currentEpic,
            section: currentSection,
            dueDate,
            sprint,
          }
          linked.push(task)
        } else {
          const isIgnoredToday = this.ignoreStore.isIgnored(id)
          const task: UntrackedTask = {
            id,
            projectId: project.id,
            filePath: absPath,
            fileRelativePath: relative(project.rootPath, absPath),
            lineNumber,
            rawText: parsed.text,
            isChecked: parsed.isChecked,
            scannedAt,
            type: 'untracked',
            isIgnoredToday,
            epic: currentEpic,
            section: currentSection,
            dueDate,
            sprint,
          }
          if (isIgnoredToday) {
            task.ignoredAt = new Date().toISOString()
          }
          untracked.push(task)
        }
      }
    }

    return {
      projectId: project.id,
      scannedAt,
      untracked,
      linked,
      filesScanned: files.length,
      errors,
    }
  }
}
