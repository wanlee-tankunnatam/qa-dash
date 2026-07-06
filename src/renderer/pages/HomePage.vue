<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div>
        <h1 class="text-base font-semibold text-slate-800">Home</h1>
        <p class="text-xs text-slate-400 mt-0.5">{{ todayLabel }}</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Date nav -->
        <div class="flex items-center rounded-md border border-slate-200 overflow-hidden">
          <button
            class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 text-sm leading-none transition-colors"
            @click="navigate(-1)"
          >‹</button>
          <input
            type="date"
            :value="anchorStr"
            :max="dateStr(0)"
            class="text-xs border-l border-r border-slate-200 px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none"
            @change="onDateChange"
          />
          <button
            class="px-2.5 py-1.5 text-sm leading-none transition-colors"
            :class="offsetDays >= 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'"
            :disabled="offsetDays >= 0"
            @click="navigate(1)"
          >›</button>
        </div>
        <!-- view mode toggle -->
        <div class="flex rounded-md border border-slate-200 overflow-hidden text-xs font-medium">
          <button
            class="px-3 py-1.5 transition-colors"
            :class="viewMode === 'daily' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'"
            @click="setViewMode('daily')"
          >Daily</button>
          <button
            class="px-3 py-1.5 border-l border-slate-200 transition-colors"
            :class="viewMode === 'week' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'"
            @click="setViewMode('week')"
          >Week</button>
        </div>

        <button
          class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all"
          :class="isSyncing
            ? 'border-slate-100 text-slate-300 cursor-not-allowed'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
          :disabled="isSyncing"
          @click="triggerSync"
        >
          <svg class="w-3.5 h-3.5" :class="isSyncing ? 'animate-spin' : ''" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z"/>
          </svg>
          {{ isSyncing ? '…' : 'Sync' }}
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" size="lg" class="mx-auto mt-16" />

    <div v-else-if="projects.length === 0" class="flex flex-col items-center justify-center flex-1 gap-4">
      <p class="text-sm font-medium text-slate-500">ยังไม่มี project</p>
      <RouterLink to="/settings" class="text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg transition-colors">
        ไปที่ Settings →
      </RouterLink>
    </div>

    <!-- Main table — projects เป็นแถว, วันเป็นคอลัมน์ -->
    <div v-else class="flex-1 overflow-auto p-5">
      <table class="w-full table-fixed text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
        <thead>
          <tr class="border-b border-slate-200 sticky top-0 z-10 bg-white">
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28 border-r border-slate-200">โปรเจกต์</th>
            <th
              v-for="(date, idx) in visibleDates" :key="date"
              class="text-left px-3 py-3 text-xs font-semibold border-r border-slate-200 last:border-r-0"
              :class="(viewMode === 'daily' ? idx === visibleDates.length - 1 : date === anchorStr) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'"
            >
              <span class="uppercase tracking-wider">{{
                viewMode === 'daily'
                  ? (idx === visibleDates.length - 1 ? 'วันนี้' : 'เมื่อวาน')
                  : dayLabel(date)
              }}</span>
              <p class="text-[10px] font-mono font-normal mt-0.5">{{ date }}</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- แถว project -->
          <tr v-for="p in projects" :key="p.id" class="border-b border-slate-200 align-top">
            <td class="px-4 py-3 border-r border-slate-200 align-top">
              <div class="flex items-center gap-1.5">
                <span class="font-semibold text-slate-700">{{ p.name }}</span>
                <span v-if="tasksStore.scanning[p.id]" class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
              </div>
            </td>
            <td
              v-for="date in visibleDates" :key="date"
              class="px-3 py-3 border-r border-slate-200 last:border-r-0 align-top min-h-[6rem]"
              :class="(viewMode === 'daily' ? date === visibleDates[visibleDates.length - 1] : date === anchorStr) ? 'bg-indigo-50/30' : ''"
            >
              <div class="space-y-1.5">
                <div v-for="task in tasksOnDate(p.id, date)" :key="task.id" class="flex items-start gap-1.5">
                  <svg class="w-3 h-3 text-slate-300 flex-shrink-0 mt-px" viewBox="0 0 12 12" fill="currentColor">
                    <path v-if="task.isChecked" d="M10.28 3.28 4.5 9.06 1.72 6.28a.75.75 0 0 0-1.06 1.06l3.34 3.34a.75.75 0 0 0 1.06 0l6.28-6.34a.75.75 0 0 0-1.06-1.06Z"/>
                    <circle v-else cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  </svg>
                  <span class="leading-relaxed" :class="task.isChecked ? 'line-through text-slate-300' : 'text-slate-600'">{{ strip(task.rawText) }}</span>
                </div>
                <div
                  v-for="(e, i) in getEntries(p.id, date)" :key="'fe-'+i"
                  class="flex items-start gap-1.5 group cursor-grab active:cursor-grabbing select-none rounded transition-colors"
                  :class="dragOverKey === `${p.id}:${date}:${i}` ? 'bg-slate-100' : ''"
                  draggable="true"
                  @dragstart="onDragStart(p.id, date, i)"
                  @dragover="onDragOver($event, p.id, date, i)"
                  @drop="onDrop(p.id, date, i)"
                  @dragend="dragSrc = null; dragOverKey = null"
                >
                  <span class="text-slate-500 text-base mt-0.5 flex-shrink-0 cursor-grab leading-none">⠿</span>
                  <span class="leading-relaxed text-slate-600 flex-1 whitespace-pre-wrap" :class="editingRef?.projectId === p.id && editingRef?.date === date && editingRef?.idx === i ? 'text-slate-300' : ''">{{ e }}</span>
                  <button class="text-slate-500 hover:text-slate-800 text-[10px] flex-shrink-0 px-1 transition-colors" @click.stop="startEdit(p.id, date, i, e)">✎</button>
                  <span v-if="confirmDelete?.projectId === p.id && confirmDelete?.date === date && confirmDelete?.idx === i" class="flex items-center gap-1 flex-shrink-0">
                    <button class="text-[10px] text-white bg-red-500 hover:bg-red-600 rounded px-1.5 py-0.5 transition-colors" @click.stop="removeEntry(p.id, date, i); confirmDelete = null">ลบ</button>
                    <button class="text-[10px] text-slate-500 hover:text-slate-700 transition-colors" @click.stop="confirmDelete = null">ยกเลิก</button>
                  </span>
                  <button v-else class="text-slate-500 hover:text-red-500 text-[10px] flex-shrink-0 transition-colors" @click.stop="confirmDelete = { projectId: p.id, date, idx: i }">✕</button>
                </div>
                <span v-if="!tasksOnDate(p.id, date).length && !getEntries(p.id, date).length" class="text-slate-200">—</span>
              </div>
            </td>
          </tr>

          <!-- แถว บันทึก -->
          <tr class="align-top border-t border-slate-200">
            <td class="px-4 py-3 border-r border-slate-200 align-top">
              <span class="font-semibold text-slate-500">บันทึก</span>
            </td>
            <td
              v-for="date in visibleDates" :key="date"
              class="px-3 py-3 border-r border-slate-200 last:border-r-0 align-top"
              :class="(viewMode === 'daily' ? date === visibleDates[visibleDates.length - 1] : date === anchorStr) ? 'bg-indigo-50/30' : ''"
            >
              <div class="space-y-2">
                <div
                  v-for="(e, i) in getEntries('__note__', date)" :key="'n-'+i"
                  class="flex items-start gap-1.5 group cursor-grab active:cursor-grabbing select-none rounded transition-colors"
                  :class="dragOverKey === `__note__:${date}:${i}` ? 'bg-slate-100' : ''"
                  draggable="true"
                  @dragstart="onDragStart('__note__', date, i)"
                  @dragover="onDragOver($event, '__note__', date, i)"
                  @drop="onDrop('__note__', date, i)"
                  @dragend="dragSrc = null; dragOverKey = null"
                >
                  <span class="text-slate-500 text-base mt-0.5 flex-shrink-0 cursor-grab leading-none">⠿</span>
                  <span class="leading-relaxed text-slate-600 flex-1 whitespace-pre-wrap" :class="editingRef?.projectId === '__note__' && editingRef?.date === date && editingRef?.idx === i ? 'text-slate-300' : ''">{{ e }}</span>
                  <button class="text-slate-500 hover:text-slate-800 text-[10px] flex-shrink-0 px-1 transition-colors" @click.stop="startEdit('__note__', date, i, e)">✎</button>
                  <span v-if="confirmDelete?.projectId === '__note__' && confirmDelete?.date === date && confirmDelete?.idx === i" class="flex items-center gap-1 flex-shrink-0">
                    <button class="text-[10px] text-white bg-red-500 hover:bg-red-600 rounded px-1.5 py-0.5 transition-colors" @click.stop="removeEntry('__note__', date, i); confirmDelete = null">ลบ</button>
                    <button class="text-[10px] text-slate-500 hover:text-slate-700 transition-colors" @click.stop="confirmDelete = null">ยกเลิก</button>
                  </span>
                  <button v-else class="text-slate-500 hover:text-red-500 text-[10px] flex-shrink-0 transition-colors" @click.stop="confirmDelete = { projectId: '__note__', date, idx: i }">✕</button>
                </div>
                <span v-if="!getEntries('__note__', date).length" class="text-slate-200">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Floating footer input bar -->
    <div
      v-if="projects.length"
      class="relative border-t border-slate-200 bg-white px-5 py-3 flex items-start gap-2 flex-shrink-0"
      :style="{ height: inputBarHeight + 'px' }"
    >
      <!-- Drag handle -->
      <div
        class="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-indigo-100 transition-colors"
        @mousedown.prevent="startResize"
      />
      <select
        v-model="inputProjectId"
        class="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[120px]"
      >
        <option value="" disabled>เลือก project</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        <option value="__note__">บันทึก</option>
      </select>

      <input
        type="date"
        v-model="inputDate"
        class="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
      />

      <textarea
        v-model="inputText"
        placeholder="รายละเอียด…"
        class="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none leading-relaxed self-stretch"
        @keydown.enter.exact.prevent="addEntry"
      />

      <button
        v-if="editingRef"
        class="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
        @click="inputText = ''; editingRef = null"
      >ยกเลิก</button>
      <button
        class="text-xs font-medium px-4 py-2 rounded-lg transition-all"
        :class="inputText.trim() && inputProjectId
          ? 'bg-slate-800 text-white hover:bg-slate-700'
          : 'bg-slate-100 text-slate-300 cursor-not-allowed'"
        :disabled="!inputText.trim() || !inputProjectId"
        @click="addEntry"
      >{{ editingRef ? 'บันทึก' : 'เพิ่ม' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useTasksStore } from '@renderer/stores/tasks'
import LoadingSpinner from '@renderer/components/shared/LoadingSpinner.vue'
import type { Task } from '@shared/types/task'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const loading = ref(false)
const isSyncing = ref(false)
const notes = ref<Record<string, string>>({})
const offsetDays = ref(0) // 0 = today, -1 = yesterday relative, etc.

// freeform entries: key = `${projectId}:${date}`, value = string[]
const viewMode = ref<'daily' | 'week'>('daily')
const entries = ref<Record<string, string[]>>({})
const inputText = ref('')
const inputProjectId = ref('')
const inputDate = ref(dateStr(0))
const inputBarHeight = ref(88)

function startResize(e: MouseEvent) {
  const startY = e.clientY
  const startH = inputBarHeight.value
  const onMove = (ev: MouseEvent) => {
    inputBarHeight.value = Math.max(64, Math.min(400, startH - (ev.clientY - startY)))
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
const editingRef = ref<{ projectId: string; date: string; idx: number } | null>(null)
const dragSrc = ref<{ projectId: string; date: string; idx: number } | null>(null)
const dragOverKey = ref<string | null>(null)
const confirmDelete = ref<{ projectId: string; date: string; idx: number } | null>(null)

// ใช้ local date string (YYYY-MM-DD) แทน toISOString() ที่ให้ UTC
function localYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dateStr(daysFromToday: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return localYMD(d)
}

const anchorStr = computed(() => dateStr(offsetDays.value))
const prevStr = computed(() => dateStr(offsetDays.value - 1))

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
function dayLabel(date: string): string {
  return DAY_NAMES[new Date(date + 'T00:00:00').getDay()]
}

function rollingWorkdays(anchor: string, n: number): string[] {
  const result: string[] = []
  const d = new Date(anchor + 'T00:00:00')
  while (result.length < n) {
    if (d.getDay() !== 0 && d.getDay() !== 6) result.unshift(localYMD(d))
    d.setDate(d.getDate() - 1)
  }
  return result
}

const visibleDates = computed(() => {
  if (viewMode.value !== 'week') return rollingWorkdays(anchorStr.value, 2)

  // Mon–Fri ของสัปดาห์ที่มี anchor
  const anchor = new Date(anchorStr.value + 'T00:00:00')
  const day = anchor.getDay()
  const monday = new Date(anchor)
  if (day === 0) monday.setDate(anchor.getDate() + 1)       // อา → จ ถัดไป
  else if (day === 6) monday.setDate(anchor.getDate() + 2)  // ส → จ ถัดไป
  else monday.setDate(anchor.getDate() - (day - 1))         // weekday → จ สัปดาห์นี้
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return localYMD(d)
  })
})

const todayLabel = computed(() => {
  const d = new Date(anchorStr.value + 'T00:00:00')
  return d.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})
const todayShort = computed(() => anchorStr.value)
const yesterdayLabel = computed(() => prevStr.value)

async function loadNotes() {
  const [prev, anchor] = [prevStr.value, anchorStr.value]
  const [prevNote, anchorNote] = await Promise.all([
    window.qaApi.getNote(prev),
    window.qaApi.getNote(anchor),
  ])
  // migrate legacy notes → entries (ถ้ายังไม่ได้ migrate)
  for (const [date, text] of [[prev, prevNote], [anchor, anchorNote]] as [string, string][]) {
    if (!text) continue
    const existingRaw = await window.qaApi.getNote(entriesKey('__note__', date))
    let existing: string[] = []
    try { existing = existingRaw ? JSON.parse(existingRaw) : [] } catch { existing = [] }
    if (existing.length === 0) {
      const list = [text]
      entries.value = { ...entries.value, [`__note__:${date}`]: list }
      await window.qaApi.setNote(entriesKey('__note__', date), JSON.stringify(list))
      await window.qaApi.setNote(date, '')
    }
  }
  notes.value = { ...notes.value, [prev]: '', [anchor]: '' }
}

async function saveNote(date: string, text: string) {
  notes.value[date] = text
  await window.qaApi.setNote(date, text)
}

function onDateChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (!val) return
  const today = dateStr(0)
  const diffMs = new Date(val + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()
  offsetDays.value = Math.min(0, Math.round(diffMs / 86400000))
}

function setViewMode(mode: 'daily' | 'week') {
  if (mode === 'daily') offsetDays.value = 0  // daily กลับมาที่วันนี้เสมอ
  viewMode.value = mode
}

function navigate(direction: 1 | -1) {
  const todayMs = new Date(dateStr(0) + 'T00:00:00').getTime()
  if (viewMode.value === 'week') {
    offsetDays.value = Math.min(0, offsetDays.value + direction * 7)
  } else {
    const d = new Date(anchorStr.value + 'T00:00:00')
    d.setDate(d.getDate() + direction)
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + direction)
    const newOffset = Math.round((d.getTime() - todayMs) / 86400000)
    offsetDays.value = Math.min(0, newOffset)
  }
}

const projects = computed(() => projectsStore.projects)

function allTasks(projectId: string): Task[] {
  const result = tasksStore.byProject[projectId]
  if (!result) return []
  return [...result.untracked, ...result.linked]
}

function tasksOnDate(projectId: string, date: string): Task[] {
  return allTasks(projectId).filter(t => t.dueDate === date)
}

function strip(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s*\(AC[\d,\s:]+\)\s*$/i, '')
    .trim()
}

async function load() {
  loading.value = true
  try {
    await projectsStore.fetchProjects()
    for (const p of projectsStore.projects) {
      tasksStore.scanProject(p.id)
    }
  } finally {
    loading.value = false
  }
}

async function triggerSync() {
  isSyncing.value = true
  try {
    await window.qaApi.triggerSync()
    await load()
  } finally {
    isSyncing.value = false
  }
}

function entriesKey(projectId: string, date: string) {
  return `freeform:${projectId}:${date}`
}

function getEntries(projectId: string, date: string): string[] {
  return entries.value[`${projectId}:${date}`] ?? []
}

async function loadEntries() {
  const dates = visibleDates.value
  const ps = projectsStore.projects
  const keys = [
    ...ps.flatMap(p => dates.map(d => ({ ek: `${p.id}:${d}`, sk: entriesKey(p.id, d) }))),
    ...dates.map(d => ({ ek: `__note__:${d}`, sk: entriesKey('__note__', d) })),
  ]
  const values = await Promise.all(keys.map(k => window.qaApi.getNote(k.sk)))
  const patch: Record<string, string[]> = {}
  keys.forEach(({ ek }, i) => {
    try { patch[ek] = values[i] ? JSON.parse(values[i]) : [] } catch { patch[ek] = [] }
  })
  entries.value = { ...entries.value, ...patch }
}

function startEdit(projectId: string, date: string, idx: number, text: string) {
  inputProjectId.value = projectId
  inputDate.value = date
  inputText.value = text
  editingRef.value = { projectId, date, idx }
}

async function addEntry() {
  const text = inputText.value.trim()
  const pid = inputProjectId.value
  if (!text || !pid) return
  const date = inputDate.value
  const key = `${pid}:${date}`

  if (editingRef.value && editingRef.value.projectId === pid && editingRef.value.date === date) {
    await updateEntry(pid, date, editingRef.value.idx, text)
  } else {
    const list = [...(entries.value[key] ?? []), text]
    entries.value = { ...entries.value, [key]: list }
    await window.qaApi.setNote(entriesKey(pid, date), JSON.stringify(list))
  }
  inputText.value = ''
  editingRef.value = null
}

function onDragStart(projectId: string, date: string, idx: number) {
  dragSrc.value = { projectId, date, idx }
}

function onDragOver(e: DragEvent, projectId: string, date: string, idx: number) {
  e.preventDefault()
  dragOverKey.value = `${projectId}:${date}:${idx}`
}

async function onDrop(projectId: string, date: string, idx: number) {
  const src = dragSrc.value
  if (!src || src.projectId !== projectId || src.date !== date || src.idx === idx) {
    dragSrc.value = null; dragOverKey.value = null; return
  }
  const key = `${projectId}:${date}`
  const list = [...(entries.value[key] ?? [])]
  const [item] = list.splice(src.idx, 1)
  list.splice(idx, 0, item)
  entries.value = { ...entries.value, [key]: list }
  await window.qaApi.setNote(entriesKey(projectId, date), JSON.stringify(list))
  dragSrc.value = null; dragOverKey.value = null
}

async function updateEntry(projectId: string, date: string, idx: number, text: string) {
  const key = `${projectId}:${date}`
  const list = [...(entries.value[key] ?? [])]
  list[idx] = text
  entries.value = { ...entries.value, [key]: list }
  await window.qaApi.setNote(entriesKey(projectId, date), JSON.stringify(list))
}

async function removeEntry(projectId: string, date: string, idx: number) {
  const key = `${projectId}:${date}`
  const list = (entries.value[key] ?? []).filter((_, i) => i !== idx)
  entries.value = { ...entries.value, [key]: list }
  await window.qaApi.setNote(entriesKey(projectId, date), JSON.stringify(list))
}

watch([anchorStr, viewMode], () => {
  inputDate.value = anchorStr.value
  loadNotes()
  loadEntries()
})
watch(() => projectsStore.projects, loadEntries)

onMounted(() => { load(); loadNotes(); loadEntries() })
</script>
