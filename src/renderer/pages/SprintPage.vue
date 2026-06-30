<template>
  <div class="flex flex-col h-full bg-slate-50">
    <!-- Header -->
    <div class="flex flex-col gap-0 bg-white border-b border-slate-100">
      <div class="flex items-center justify-between px-6 pt-4 pb-2">
        <div class="flex items-center gap-3">
          <h1 class="text-base font-semibold text-slate-800">Sprint</h1>
          <span v-if="activeSprint" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
            {{ activeSprint.name }}
          </span>
        </div>
        <p class="text-xs text-slate-400">QA coverage per epic / story</p>
      </div>
      <!-- Project tabs -->
      <div class="flex items-center gap-0 px-4 overflow-x-auto">
        <button
          v-for="p in projectsStore.projects" :key="p.id"
          class="px-4 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap"
          :class="activeProjectId === p.id
            ? 'text-indigo-600 border-indigo-500'
            : 'text-slate-400 border-transparent hover:text-slate-600'"
          @click="activeProjectId = p.id"
        >{{ p.name }}</button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" size="lg" class="mx-auto mt-16" />

    <div v-else-if="!epicHierarchy.length" class="flex flex-col items-center justify-center mt-20 gap-3 text-center">
      <svg class="w-10 h-10 text-slate-200" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9H3.75v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"/>
      </svg>
      <p class="text-sm font-medium text-slate-500">ไม่พบ sprint-status.yaml</p>
      <p class="text-xs text-slate-400 max-w-xs">วาง <span class="font-mono">sprint-status.yaml</span> ไว้ที่ root ของ project เพื่อแสดง epic/story breakdown</p>
    </div>

    <div v-else class="flex-1 overflow-auto p-5 space-y-4">
      <!-- Summary chips -->
      <div class="flex items-center gap-2 flex-wrap">
        <span v-for="chip in summaryChips" :key="chip.label"
          :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1', chip.cls]">
          <span class="w-1.5 h-1.5 rounded-full" :class="chip.dot" />
          {{ chip.label }}: {{ chip.count }}
        </span>
      </div>

      <!-- Epic cards -->
      <div v-for="epic in epicHierarchy" :key="epic.slug" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <!-- Epic header -->
        <div
          class="flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer select-none hover:bg-slate-50"
          @click="toggleEpic(epic.slug)"
        >
          <svg
            class="w-3 h-3 text-slate-400 flex-shrink-0 transition-transform"
            :class="collapsed.has(epic.slug) ? '-rotate-90' : ''"
            viewBox="0 0 12 12" fill="currentColor"
          ><path d="M6 8.5 1.5 4h9L6 8.5Z"/></svg>
          <span class="text-xs font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Epic {{ epic.number }}</span>
          <span class="text-sm font-semibold text-slate-700 flex-1 truncate">{{ epicLabel(epic) }}</span>
          <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1', statusBadge(epic.status).cls]">
            {{ statusBadge(epic.status).label }}
          </span>
          <span class="text-xs text-slate-400">{{ epic.stories.length }} stories</span>
        </div>

        <!-- Story rows -->
        <table v-if="!collapsed.has(epic.slug)" class="w-full text-xs">
          <thead>
            <tr class="border-b border-slate-50 text-[10px] text-slate-400 uppercase tracking-wider text-left">
              <th class="px-4 py-2">Story</th>
              <th class="px-3 py-2 text-center w-16">Dev</th>
              <th class="px-3 py-2 text-center w-14">API</th>
              <th class="px-3 py-2 text-center w-20">Integ.</th>
              <th class="px-3 py-2 text-center w-10">UI</th>
              <th class="px-3 py-2 text-center w-10">E2E</th>
              <th class="px-3 py-2 text-center w-14">Script</th>
              <th class="px-3 py-2 text-right w-24">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="story in epic.stories"
              :key="story.slug"
              class="border-b border-slate-50 hover:bg-slate-50"
            >
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <span class="text-slate-700 font-medium">{{ story.label }}</span>
                  <button
                    v-for="k in [...new Set(story.jiraKeys)].filter(k => jiraStore.getTicket(k)).slice(0, 2)" :key="k"
                    class="text-indigo-500 font-mono bg-indigo-50 hover:bg-indigo-100 hover:underline px-1 py-0.5 rounded text-[10px]"
                    @click="openJira(k)"
                  >{{ k }}</button>
                </div>
              </td>
              <td class="px-3 py-2.5 text-center">
                <span :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1', statusBadge(story.status).cls]">
                  {{ statusBadge(story.status).label }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-center">
                <CheckMark :has="coverage(story.slug)?.hasAPI" />
              </td>
              <td class="px-3 py-2.5 text-center">
                <CheckMark :has="coverage(story.slug)?.hasIntegration" />
              </td>
              <td class="px-3 py-2.5 text-center">
                <CheckMark :has="coverage(story.slug)?.hasUI" />
              </td>
              <td class="px-3 py-2.5 text-center">
                <CheckMark :has="coverage(story.slug)?.hasE2E" color="teal" />
              </td>
              <td class="px-3 py-2.5 text-center">
                <CheckMark :has="coverage(story.slug)?.hasScript" color="indigo" />
              </td>
              <td class="px-3 py-2.5 text-right font-mono text-slate-400">
                {{ latestDate(story.jiraKeys) ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useJiraStore } from '@renderer/stores/jira'
import LoadingSpinner from '@renderer/components/shared/LoadingSpinner.vue'
import type { EpicInfo, StoryCoverage, SprintStatusResult } from '@shared/types/sprint'

const projectsStore = useProjectsStore()
const jiraStore = useJiraStore()
const loading = ref(false)
const activeProjectId = ref('')
const activeSprint = ref<{ id: number; name: string } | null>(null)
const epicHierarchy = ref<EpicInfo[]>([])
const tcCoverage = ref<Record<string, StoryCoverage>>({})
const gitDateMap = ref<Record<string, string>>({})
const collapsed = ref<Set<string>>(new Set())
const jiraSite = ref('')

function buildJiraBase(site: string): string {
  if (!site) return ''
  return site.startsWith('http') ? site.replace(/\/$/, '') : `https://${site}.atlassian.net`
}

function openJira(key: string) {
  if (!jiraSite.value || !key) return
  const base = buildJiraBase(jiraSite.value)
  if (!base) return
  window.qaApi.openExternal(`${base}/browse/${key}`)
}

const DEV_STATUS: Record<string, { label: string; cls: string }> = {
  done:            { label: 'Done',      cls: 'bg-slate-100 text-slate-600 ring-slate-300' },
  'in-progress':   { label: 'In Prog',  cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  review:          { label: 'Review',   cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  'ready-for-dev': { label: 'Ready',    cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  backlog:         { label: 'Backlog',  cls: 'bg-slate-50 text-slate-400 ring-slate-200' },
  descoped:        { label: 'Descoped', cls: 'bg-gray-100 text-gray-400 ring-gray-200' },
  optional:        { label: 'Optional', cls: 'bg-gray-100 text-gray-400 ring-gray-200' },
}

function statusBadge(status: string) {
  return DEV_STATUS[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500 ring-slate-200' }
}

function coverage(slug: string): StoryCoverage | undefined {
  return tcCoverage.value[slug]
}

function latestDate(jiraKeys: string[]): string | undefined {
  return jiraKeys.map(k => gitDateMap.value[k]).filter(Boolean).sort().pop()
}

function epicLabel(epic: EpicInfo): string {
  const story = epic.stories[0]
  if (!story) return `Epic ${epic.number}`
  const m = story.slug.match(/^(\d+)-([^-]+)-(.+)/)
  return m ? m[3].replace(/-/g, ' ') : `Epic ${epic.number}`
}

function toggleEpic(slug: string) {
  const s = new Set(collapsed.value)
  s.has(slug) ? s.delete(slug) : s.add(slug)
  collapsed.value = s
}

const summaryChips = computed(() => {
  const stories = epicHierarchy.value.flatMap(e => e.stories)
  const done = stories.filter(s => s.status === 'done').length
  const inProgress = stories.filter(s => s.status === 'in-progress' || s.status === 'review').length
  const waiting = stories.filter(s => !['done', 'in-progress', 'review', 'descoped'].includes(s.status)).length
  return [
    { label: 'Done', count: done, dot: 'bg-emerald-400', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    { label: 'In Progress', count: inProgress, dot: 'bg-blue-400', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
    { label: 'Waiting', count: waiting, dot: 'bg-slate-300', cls: 'bg-slate-100 text-slate-500 ring-slate-200' },
    { label: 'Total', count: stories.length, dot: 'bg-indigo-400', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  ]
})

// Inline checkmark component
const CheckMark = (props: { has?: boolean; color?: string }) => {
  if (props.has) {
    const color = props.color === 'teal' ? 'text-teal-500' : props.color === 'indigo' ? 'text-indigo-500' : 'text-purple-500'
    return h('span', { class: `${color} font-bold text-sm` }, '✓')
  }
  return h('span', { class: 'text-slate-200' }, '—')
}

async function loadSprint(projectId: string) {
  if (!projectId) return
  loading.value = true
  activeSprint.value = null
  try {
    const [result, sprint] = await Promise.all([
      window.qaApi.getSprintStatus(projectId),
      window.qaApi.getActiveSprint(projectId),
    ])
    epicHierarchy.value = result.epicHierarchy
    tcCoverage.value = result.tcCoverage ?? {}
    gitDateMap.value = result.gitDateMap ?? {}
    activeSprint.value = sprint
    const allKeys = result.epicHierarchy.flatMap(e => e.stories.flatMap(s => s.jiraKeys))
    if (allKeys.length > 0) {
      jiraStore.fetchTickets(allKeys).catch(() => {})
    }
  } finally {
    loading.value = false
  }
}

watch(activeProjectId, loadSprint)

onMounted(async () => {
  const settings = await window.qaApi.getJiraSettings()
  if (settings?.site) jiraSite.value = settings.site

  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
  if (projectsStore.projects.length > 0) {
    activeProjectId.value = projectsStore.projects[0].id
  }
})
</script>
