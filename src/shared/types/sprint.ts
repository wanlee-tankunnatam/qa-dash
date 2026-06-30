export interface StoryInfo {
  slug: string
  label: string
  status: string
  jiraKeys: string[]
  epicSlug: string
}

export interface EpicInfo {
  slug: string
  number: number
  status: string
  stories: StoryInfo[]
}

export interface StoryCoverage {
  hasAPI: boolean         // api.md
  hasIntegration: boolean // integration.md
  hasUI: boolean          // ui.md
  hasE2E: boolean         // fullloop-e2e.md (E2E test case spec)
  hasScript: boolean      // web/e2e/*.spec.ts (automation script)
  hasTC: boolean          // any TC type
  featureSlug: string
}

export interface SprintStatusResult {
  devStatusMap: Record<string, string>
  epicHierarchy: EpicInfo[]
  tcCoverage: Record<string, StoryCoverage>   // storySlug → coverage
  gitDateMap: Record<string, string>          // jiraKey → last commit date YYYY-MM-DD
}
