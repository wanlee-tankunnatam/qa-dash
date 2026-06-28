export const CHECKLIST_REGEX = /^(\s*)-\s\[([ xX])\]\s+(.+)$/

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
