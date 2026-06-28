import type { ProjectConfig } from './types/project'

export const AI_MODEL = 'claude-sonnet-4-6'

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  ticketRegex: '[A-Z]+-\\d+',
  excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
  includePaths: [],
  warningThresholdDays: 3,
  warningThresholdCount: 5,
}

export const DANGER_ZONE_SNAPSHOT_WINDOW = 7

export const JIRA_RATE_LIMIT_MS = 100
export const JIRA_BATCH_SIZE = 10
export const JIRA_RETRY_DELAY_MS = 1000
