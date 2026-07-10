export interface Workspace {
  id: string
  name: string
  description?: string
  projectIds: string[]
  createdAt: string
  updatedAt: string
  order: number
}

export interface WorkspaceWithProjects extends Workspace {
  projectCount: number
}
