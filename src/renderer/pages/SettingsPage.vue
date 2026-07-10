<template>
  <div class="flex flex-col h-full bg-slate-50">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-slate-100">
      <h1 class="text-base font-semibold text-slate-800">Settings</h1>
      <p class="text-xs text-slate-400 mt-0.5">API keys, projects, and Jira configuration</p>
    </div>

    <div class="flex-1 overflow-auto p-6 space-y-5">

      <!-- ── AI Engine ── -->
      <section class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-700">AI Engine</h2>
        </div>
        <div class="p-5 flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm3.25 4.75a.75.75 0 0 0-1.06 0L7 8.94 5.81 7.75a.75.75 0 1 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0 0-1.06Z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-700">ใช้ Claude Code session ที่ login แล้ว</p>
            <p class="text-xs text-slate-400 mt-0.5">ไม่ต้องใส่ API key — แอปเรียก <span class="font-mono">claude</span> CLI โดยตรง</p>
          </div>
        </div>
      </section>

      <!-- ── Projects ── -->
      <section class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Projects</h2>
          <span class="text-xs text-slate-400">{{ projectsStore.projects.length }} project{{ projectsStore.projects.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Existing projects -->
        <div v-if="projectsStore.projects.length > 0" class="divide-y divide-slate-50">
          <div
            v-for="p in projectsStore.projects"
            :key="p.id"
            class="px-5 py-3 space-y-2"
          >
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1H5l1 1.5h3.5A1.5 1.5 0 0 1 11 4v5A1.5 1.5 0 0 1 9.5 10.5h-7A1.5 1.5 0 0 1 1 9V2.5Z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <input
                  :value="p.name"
                  type="text"
                  class="w-full text-sm font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-0 py-0.5 truncate"
                  @change="renameProject(p.id, ($event.target as HTMLInputElement).value)"
                />
                <p class="text-xs text-slate-400 truncate font-mono">{{ p.rootPath }}</p>
              </div>
              <button
                class="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                @click="removeProject(p.id)"
              >
                Remove
              </button>
            </div>
            <!-- Current sprint inline -->
            <div class="flex items-center gap-2 pl-10">
              <span class="text-xs text-slate-400 w-24 flex-shrink-0">Current Sprint</span>
              <input
                :value="projectConfigs[p.id]?.sprint ?? ''"
                type="text"
                placeholder="e.g. Sprint 3"
                class="flex-1 max-w-xs rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                @change="updateSprint(p.id, ($event.target as HTMLInputElement).value)"
              />
            </div>
            <!-- Include paths -->
            <div class="pl-10 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400">QA Scan Paths</span>
                <span class="text-xs text-slate-300">(ว่าง = scan ทั้ง repo)</span>
              </div>
              <div
                v-for="(path, idx) in (projectConfigs[p.id]?.includePaths ?? [])"
                :key="idx"
                class="flex items-center gap-2"
              >
                <span class="flex-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 truncate">{{ path }}</span>
                <button
                  class="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                  @click="removeIncludePath(p.id, idx)"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="currentColor"><path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z"/></svg>
                </button>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newIncludePath[p.id]"
                  type="text"
                  placeholder="qa/ หรือ test-plans/"
                  class="flex-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  @keydown.enter="addIncludePath(p.id)"
                />
                <button
                  class="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors whitespace-nowrap"
                  @click="browseIncludePath(p.id, p.rootPath)"
                >Browse…</button>
                <button
                  class="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  @click="addIncludePath(p.id)"
                >Add</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add project -->
        <div class="p-5" :class="projectsStore.projects.length > 0 ? 'border-t border-slate-100' : ''">
          <p class="text-xs font-medium text-slate-600 mb-2">Add Project</p>
          <div class="flex gap-2">
            <input
              v-model="newProjectPath"
              type="text"
              placeholder="/Users/you/projects/my-repo"
              class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              @keydown.enter="addProject"
            />
            <button
              class="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap"
              @click="pickFolder"
            >
              Browse…
            </button>
            <button
              class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              :class="
                !newProjectPath.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              "
              :disabled="!newProjectPath.trim() || projectsStore.loading"
              @click="addProject"
            >
              Add
            </button>
          </div>
          <p v-if="addError" class="mt-2 text-xs text-red-600">{{ addError }}</p>
          <p v-if="projectsStore.loading" class="mt-2 text-xs text-slate-400">Adding…</p>
        </div>
      </section>

      <!-- ── Workspaces ── -->
      <section class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Workspaces</h2>
          <span class="text-xs text-slate-400">{{ workspacesStore.workspaces.length }} workspace{{ workspacesStore.workspaces.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Existing workspaces -->
        <div v-if="workspacesStore.workspaces.length > 0" class="divide-y divide-slate-50">
          <div
            v-for="ws in workspacesStore.sorted"
            :key="ws.id"
            class="px-5 py-3 space-y-2"
          >
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5 text-purple-400" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 2c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1V2zm2 2h6v4H3V4z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <input
                    v-model="wsEdit[ws.id]"
                    type="text"
                    class="flex-1 text-sm font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-0 py-0.5"
                    @blur="updateWorkspaceInline(ws.id)"
                  />
                  <button
                    class="text-xs px-2 py-1 rounded transition-colors"
                    :class="workspacesStore.currentWorkspaceId === ws.id
                      ? 'bg-purple-100 text-purple-600 font-medium'
                      : 'text-slate-400 hover:text-purple-500 hover:bg-purple-50'"
                    @click="setDefaultWorkspace(ws.id)"
                  >
                    {{ workspacesStore.currentWorkspaceId === ws.id ? '★ Default' : 'Set Default' }}
                  </button>
                  <button
                    class="text-xs text-slate-400 hover:text-blue-500 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                    @click="wsEdit[ws.id] = ws.name"
                  >
                    Edit
                  </button>
                  <button
                    class="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                    @click="confirmDeleteWorkspace(ws.id)"
                  >
                    Delete
                  </button>
                </div>
                <p class="text-xs text-slate-400 mt-1">{{ ws.projectIds.length }} project{{ ws.projectIds.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <!-- Projects in this workspace (drop zone) -->
            <div
              class="pl-10 space-y-1 px-2 py-2 rounded border-2 border-dashed transition-colors"
              :class="dragOverWorkspaceId === ws.id ? 'border-purple-400 bg-purple-50' : 'border-transparent'"
              @dragover.prevent="dragOverWorkspaceId = ws.id"
              @dragleave.prevent="dragOverWorkspaceId = null"
              @drop.prevent="handleDropOnWorkspace($event, ws.id)"
            >
              <div
                v-if="ws.projectIds.length === 0"
                class="text-xs text-slate-300 italic"
              >
                (No projects assigned)
              </div>
              <div
                v-for="projId in ws.projectIds"
                :key="projId"
                class="flex items-center gap-2 px-2 py-1 bg-purple-50 rounded border border-purple-100"
              >
                <span class="text-xs font-mono text-slate-600 flex-1">{{ getProjectName(projId) }}</span>
                <button
                  class="text-slate-300 hover:text-red-400 text-xs"
                  @click="removeProjectFromWorkspace(ws.id, projId)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Unassigned projects (drag to assign) -->
        <div class="px-5 py-4 border-t border-slate-100 space-y-2">
          <p class="text-xs font-medium text-slate-600">Drag projects to assign to workspace:</p>
          <div
            v-if="unassignedProjects.length === 0"
            class="text-xs text-slate-400 italic"
          >
            (All projects assigned)
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="proj in unassignedProjects"
              :key="proj.id"
              draggable="true"
              class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-600 cursor-move hover:bg-slate-200 hover:border-slate-300 transition-colors"
              @dragstart="startDragProject($event, proj.id)"
            >
              {{ proj.name }}
            </div>
          </div>
        </div>

        <!-- Update workspace section to accept drops -->
        <div
          class="px-5 py-3 border-t border-slate-100 space-y-2"
          @dragover.prevent="dragOverWorkspaceId = 'all'"
          @dragleave.prevent="dragOverWorkspaceId = null"
          @drop.prevent="handleDropOnWorkspacePool"
        >
          <p class="text-xs font-medium text-slate-600">Or drop to unassign:</p>
          <div
            class="px-3 py-2 bg-slate-50 border-2 border-dashed transition-colors"
            :class="dragOverWorkspaceId === 'all' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'"
          >
            <span class="text-xs text-slate-400">Drop here to unassign from workspace</span>
          </div>
        </div>

        <!-- Create new workspace -->
        <div class="px-5 py-3 border-t border-slate-100">
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <label class="text-xs text-slate-500 font-medium">New Workspace Name</label>
              <input
                v-model="newWorkspaceName"
                type="text"
                placeholder="e.g., Sprint 1, Frontend, QA Team"
                class="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-400"
                @keyup.enter="createNewWorkspace"
              />
            </div>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded transition-all"
              :class="newWorkspaceName.trim()
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
              :disabled="!newWorkspaceName.trim()"
              @click="createNewWorkspace"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <!-- ── Jira Projects ── -->
      <section class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-700">Jira Projects</h2>
          <p class="text-xs text-slate-400 mt-0.5">Project keys ที่ใช้ดึง tickets — เพิ่มได้เรื่อยๆ</p>
        </div>

        <!-- existing project keys -->
        <div v-if="jiraProjects.length > 0" class="divide-y divide-slate-50">
          <div
            v-for="p in jiraProjects"
            :key="p.key"
            class="flex items-center gap-3 px-5 py-3"
          >
            <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-mono font-semibold">{{ p.key }}</span>
            <span class="flex-1 text-sm text-slate-600">{{ p.name }}</span>
            <button
              class="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
              @click="removeJiraProject(p.key)"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- add new key -->
        <div class="p-5" :class="jiraProjects.length > 0 ? 'border-t border-slate-100' : ''">
          <p class="text-xs font-medium text-slate-600 mb-2">Add Project</p>
          <div class="flex gap-2">
            <input
              v-model="newJiraKey"
              type="text"
              placeholder="TAK"
              class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @keydown.enter="addJiraProject"
            />
            <input
              v-model="newJiraName"
              type="text"
              placeholder="Project name (optional)"
              class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @keydown.enter="addJiraProject"
            />
            <button
              class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              :class="newJiraKey.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
              :disabled="!newJiraKey.trim()"
              @click="addJiraProject"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <!-- ── Jira Config ── -->
      <section class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-700">Jira</h2>
          <p class="text-xs text-slate-400 mt-0.5">ตั้งครั้งเดียว ใช้ได้ทุก project</p>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              v-model="jiraEmail"
              type="email"
              placeholder="you@company.com"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">
              Token
              <span v-if="jiraTokenSaved" class="ml-1.5 text-emerald-600 font-normal">✓ saved</span>
            </label>
            <input
              v-model="jiraToken"
              type="password"
              placeholder="ATATT3x..."
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p class="mt-1 text-xs text-slate-400">
              สร้างที่ <span class="font-mono">id.atlassian.com → Security → API tokens</span>
            </p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1.5">Site Key</label>
            <div class="flex items-center gap-1">
              <span class="text-xs text-slate-400 font-mono">https://</span>
              <input
                v-model="jiraSite"
                type="text"
                placeholder="yourorg"
                class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-xs text-slate-400 font-mono">.atlassian.net</span>
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <button
              class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              :class="canSaveJira ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
              :disabled="!canSaveJira"
              @click="saveJiraSettings"
            >
              Save
            </button>
            <button
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
              :disabled="jiraStore.loading || !jiraEmail || !jiraSite"
              @click="testConnection"
            >
              {{ jiraStore.loading ? 'Testing…' : 'Test Connection' }}
            </button>
          </div>

          <div v-if="connectionResult !== null" class="flex items-center gap-1.5 text-xs" :class="connectionResult ? 'text-emerald-600' : 'text-red-600'">
            <span>{{ connectionResult ? '✓ Connected' : '✗ Failed — ตรวจสอบ email, token, และ site key' }}</span>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useJiraStore } from '@renderer/stores/jira'
import { useWorkspacesStore } from '@renderer/stores/workspaces'

interface JiraProject { key: string; name: string }

const projectsStore = useProjectsStore()
const jiraStore = useJiraStore()
const workspacesStore = useWorkspacesStore()

// ── Projects ──
const newProjectPath = ref('')
const addError = ref('')
const projectConfigs = ref<Record<string, { sprint: string; includePaths: string[] }>>({})
const newIncludePath = ref<Record<string, string>>({})

async function updateSprint(projectId: string, value: string) {
  if (!projectConfigs.value[projectId]) projectConfigs.value[projectId] = { sprint: '', includePaths: [] }
  projectConfigs.value[projectId].sprint = value
  await window.qaApi.updateProjectConfig(projectId, { currentSprint: value || undefined })
}

async function browseIncludePath(projectId: string, rootPath: string) {
  const selected = await window.qaApi.openFolderDialog()
  if (!selected) return
  // แปลงเป็น relative path จาก rootPath
  const rel = selected.startsWith(rootPath)
    ? selected.slice(rootPath.endsWith('/') ? rootPath.length : rootPath.length + 1)
    : selected
  newIncludePath.value[projectId] = rel ? rel + '/' : ''
}

async function addIncludePath(projectId: string) {
  const raw = (newIncludePath.value[projectId] ?? '').trim()
  if (!raw) return
  if (!projectConfigs.value[projectId]) projectConfigs.value[projectId] = { sprint: '', includePaths: [] }
  const paths = [...projectConfigs.value[projectId].includePaths, raw]
  projectConfigs.value[projectId].includePaths = paths
  newIncludePath.value[projectId] = ''
  await window.qaApi.updateProjectConfig(projectId, { includePaths: paths })
}

async function removeIncludePath(projectId: string, idx: number) {
  const paths = projectConfigs.value[projectId].includePaths.filter((_, i) => i !== idx)
  projectConfigs.value[projectId].includePaths = paths
  await window.qaApi.updateProjectConfig(projectId, { includePaths: paths })
}

async function pickFolder() {
  try {
    const path = await window.qaApi.openFolderDialog()
    if (path) newProjectPath.value = path
  } catch (e) {
    addError.value = 'ไม่สามารถเปิด folder picker: ' + (e as Error).message
  }
}

async function addProject() {
  const path = newProjectPath.value.trim()
  if (!path) return
  addError.value = ''
  try {
    await projectsStore.addProject(path)
    newProjectPath.value = ''
  } catch (e) {
    addError.value = (e as Error).message
  }
}

async function removeProject(id: string) {
  await projectsStore.removeProject(id)
}

async function renameProject(id: string, name: string) {
  if (!name.trim()) return
  await window.qaApi.renameProject(id, name.trim())
  await projectsStore.fetchProjects()
}

// ── Workspaces ──
const newWorkspaceName = ref('')
const wsEdit = ref<Record<string, string>>({})
const dragOverWorkspaceId = ref<string | null>(null)
let draggedProjectId: string | null = null

const unassignedProjects = computed(() => {
  const assignedIds = new Set<string>()
  workspacesStore.workspaces.forEach((ws) => {
    ws.projectIds.forEach((pid) => assignedIds.add(pid))
  })
  return projectsStore.projects.filter((p) => !assignedIds.has(p.id))
})

async function createNewWorkspace() {
  const name = newWorkspaceName.value.trim()
  if (!name) return
  try {
    await workspacesStore.createWorkspace(name)
    newWorkspaceName.value = ''
  } catch (e) {
    console.error('Failed to create workspace:', e)
  }
}

async function updateWorkspaceInline(id: string) {
  const name = (wsEdit.value[id] ?? '').trim()
  if (!name) {
    const ws = workspacesStore.getById(id)
    if (ws) wsEdit.value[id] = ws.name
    return
  }
  try {
    await workspacesStore.updateWorkspace(id, name)
  } catch (e) {
    console.error('Failed to update workspace:', e)
    const ws = workspacesStore.getById(id)
    if (ws) wsEdit.value[id] = ws.name
  }
}

function confirmDeleteWorkspace(id: string) {
  const ws = workspacesStore.getById(id)
  if (!ws) return
  if (confirm(`Delete workspace "${ws.name}"? Projects will not be deleted.`)) {
    deleteWorkspace(id)
  }
}

async function deleteWorkspace(id: string) {
  try {
    await workspacesStore.deleteWorkspace(id)
  } catch (e) {
    console.error('Failed to delete workspace:', e)
  }
}

function getProjectName(projectId: string): string {
  return projectsStore.getById(projectId)?.name ?? 'Unknown'
}

async function setDefaultWorkspace(workspaceId: string) {
  try {
    await workspacesStore.setCurrentWorkspace(workspaceId)
  } catch (e) {
    console.error('Failed to set default workspace:', e)
  }
}

async function removeProjectFromWorkspace(workspaceId: string, projectId: string) {
  try {
    await workspacesStore.removeProjectFromWorkspace(workspaceId, projectId)
  } catch (e) {
    console.error('Failed to remove project from workspace:', e)
  }
}

function startDragProject(e: DragEvent, projectId: string) {
  draggedProjectId = projectId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', projectId)
  }
}

async function handleDropOnWorkspace(e: DragEvent, workspaceId: string) {
  e.preventDefault()
  dragOverWorkspaceId.value = null
  const projectId = draggedProjectId || e.dataTransfer?.getData('text/plain')
  if (projectId) {
    try {
      await workspacesStore.addProjectToWorkspace(workspaceId, projectId)
    } catch (err) {
      console.error('Failed to add project to workspace:', err)
    }
  }
  draggedProjectId = null
}

async function handleDropOnWorkspacePool() {
  dragOverWorkspaceId.value = null
  // Drop on unassigned area = remove from workspace (already handled by removal button)
  draggedProjectId = null
}

onMounted(() => {
  // Initialize wsEdit with current workspace names
  workspacesStore.workspaces.forEach((ws) => {
    wsEdit.value[ws.id] = ws.name
  })
})

// ── Jira Projects ──
const jiraProjects = ref<JiraProject[]>([])
const newJiraKey = ref('')
const newJiraName = ref('')

async function addJiraProject() {
  const key = newJiraKey.value.trim().toUpperCase()
  if (!key || jiraProjects.value.some((p) => p.key === key)) return
  jiraProjects.value.push({ key, name: newJiraName.value.trim() || key })
  await window.qaApi.setJiraProjects(jiraProjects.value)
  newJiraKey.value = ''
  newJiraName.value = ''
}

async function removeJiraProject(key: string) {
  jiraProjects.value = jiraProjects.value.filter((p) => p.key !== key)
  await window.qaApi.setJiraProjects(jiraProjects.value)
}

// ── Jira (global) ──
const jiraEmail = ref('')
const jiraToken = ref('')
const jiraSite = ref('')
const jiraTokenSaved = ref(false)
const connectionResult = ref<boolean | null>(null)

const canSaveJira = computed(() => !!(jiraEmail.value && jiraSite.value && jiraToken.value))

function buildBaseUrl(site: string): string {
  if (site.startsWith('http')) return site.replace(/\/$/, '')
  return `https://${site}.atlassian.net`
}

async function saveJiraSettings() {
  if (!canSaveJira.value) return
  await window.qaApi.setJiraSettings({ email: jiraEmail.value, site: jiraSite.value })
  await window.qaApi.setCredential('jira-token', jiraToken.value)
  jiraToken.value = ''
  jiraTokenSaved.value = true
}

async function testConnection() {
  connectionResult.value = null
  const baseUrl = buildBaseUrl(jiraSite.value)
  const result = await jiraStore.testConnection(baseUrl, jiraEmail.value)
  connectionResult.value = result
}

onMounted(async () => {
  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
  for (const p of projectsStore.projects) {
    const cfg = await window.qaApi.getProjectConfig(p.id)
    projectConfigs.value[p.id] = {
      sprint: cfg.currentSprint ?? '',
      includePaths: cfg.includePaths ?? [],
    }
  }
  const saved = await window.qaApi.getJiraSettings()
  if (saved) {
    jiraEmail.value = saved.email
    jiraSite.value = saved.site
    jiraTokenSaved.value = true
  }
  jiraProjects.value = await window.qaApi.getJiraProjects()
})
</script>
