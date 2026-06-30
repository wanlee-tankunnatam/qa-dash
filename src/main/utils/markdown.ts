export const CHECKLIST_REGEX = /^(\s*)-\s\[([ xX])\]\s+(.+)$/
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/

export function extractHeading(line: string): { level: number; text: string } | null {
  const match = HEADING_REGEX.exec(line)
  if (!match) return null
  return { level: match[1].length, text: match[2].trim() }
}

export function extractDueDate(text: string): string | null {
  const m =
    /(?:due[:\s]+|by\s+)(\d{4}-\d{2}-\d{2})/i.exec(text) ??
    /\((\d{4}-\d{2}-\d{2})\)/.exec(text) ??
    /\b(\d{4}-\d{2}-\d{2})\b/.exec(text)
  return m ? m[1] : null
}

export function extractSprint(text: string, filePath?: string): string | null {
  const inText = /sprint[\s-](\w+)/i.exec(text)
  if (inText) return `Sprint ${inText[1]}`
  if (filePath) {
    const inFile = /sprint[-_](\w+)/i.exec(filePath)
    if (inFile) return `Sprint ${inFile[1]}`
  }
  return null
}

export function parseChecklist(line: string): { isChecked: boolean; text: string } | null {
  const match = CHECKLIST_REGEX.exec(line)
  if (!match) return null
  return {
    isChecked: match[2] !== ' ',
    text: match[3].trim(),
  }
}

export function extractTicketKey(text: string, regex: string): string | null {
  try {
    const match = new RegExp(regex).exec(text)
    return match ? match[0] : null
  } catch {
    return null
  }
}

export function getSurroundingLines(lines: string[], lineIndex: number, count: number): string[] {
  const start = Math.max(0, lineIndex - count)
  const end = Math.min(lines.length - 1, lineIndex + count)
  return lines.slice(start, end + 1)
}
