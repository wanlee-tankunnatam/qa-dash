<template>
  <div class="flex h-screen overflow-hidden bg-slate-900 select-none">
    <SideNav />
    <main class="flex-1 overflow-hidden flex flex-col min-w-0">
      <RouterView />
    </main>

    <!-- Bottom terminal panel -->
    <Transition name="terminal-slide">
      <div
        v-if="terminalOpen"
        class="fixed bottom-0 left-52 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl flex flex-col"
        :style="{ height: terminalHeight + 'px' }"
      >
        <!-- Panel header / resize handle -->
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50 cursor-ns-resize select-none flex-shrink-0"
          @mousedown="startResize"
        >
          <div class="flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 9a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 6 9ZM3.854 4.146a.5.5 0 1 0-.708.708L4.793 6.5 3.146 8.146a.5.5 0 1 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2Z"/>
              <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2Zm12 1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12Z"/>
            </svg>
            <span class="text-xs font-semibold text-slate-600">AI Terminal</span>
            <span class="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">{{ currentPageLabel }}</span>
          </div>
          <button class="text-slate-300 hover:text-slate-600 transition-colors text-sm" @click="terminalOpen = false">✕</button>
        </div>
        <!-- Terminal content -->
        <AITerminalPanel :page-label="currentPageLabel" :page-path="route.fullPath" class="flex-1 min-h-0" />
      </div>
    </Transition>

    <!-- Floating buttons -->
    <div class="fixed bottom-20 right-4 z-50 flex items-center gap-2">
      <button
        class="w-8 h-8 rounded-full shadow-lg transition-all flex items-center justify-center"
        :class="terminalOpen
          ? 'bg-slate-800 text-white opacity-100'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white opacity-60 hover:opacity-100'"
        title="AI Terminal"
        @click="terminalOpen = !terminalOpen"
      >
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 9a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 6 9ZM3.854 4.146a.5.5 0 1 0-.708.708L4.793 6.5 3.146 8.146a.5.5 0 1 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2Z"/>
          <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2Zm12 1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12Z"/>
        </svg>
      </button>
      <button
        v-if="isDev"
        class="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center shadow-lg transition-all opacity-40 hover:opacity-100"
        title="Toggle DevTools"
        @click="toggleDevTools"
      >{}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import SideNav from './components/layout/SideNav.vue'
import AITerminalPanel from './components/ai/AITerminalPanel.vue'
import type { SyncSummary } from '../../shared/constants'

const route = useRoute()

const PAGE_LABELS: Record<string, string> = {
  home: 'หน้าแรก (ตารางงานรายวัน)',
  dashboard: 'Dashboard',
  weekly: 'Weekly View',
  today: 'Today View',
  yesterday: 'Yesterday View',
  project: 'Project Detail',
  'ai-terminal': 'AI Terminal',
  'draft-review': 'Draft Review',
  sprint: 'Sprint Status',
  settings: 'Settings',
}

const currentPageLabel = computed(() => {
  const name = route.name as string
  return PAGE_LABELS[name] ?? name ?? 'unknown'
})

const isDev = import.meta.env.DEV
const terminalOpen = ref(false)
const terminalHeight = ref(360)

function toggleDevTools() {
  window.qaApi.toggleDevTools()
}

function startResize(e: MouseEvent) {
  const startY = e.clientY
  const startH = terminalHeight.value
  const onMove = (ev: MouseEvent) => {
    terminalHeight.value = Math.max(200, Math.min(window.innerHeight - 100, startH - (ev.clientY - startY)))
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

let cleanupSync: (() => void) | null = null
let cleanupDangerZone: (() => void) | null = null

onMounted(() => {
  cleanupSync = window.qaApi.onSyncCompleted((summary: SyncSummary) => {
    console.log('[App] sync completed', summary)
  })
  cleanupDangerZone = window.qaApi.onDangerZoneTriggered((projectId: string) => {
    console.log('[App] danger zone triggered for', projectId)
  })
})

onUnmounted(() => {
  cleanupSync?.()
  cleanupDangerZone?.()
})
</script>

<style scoped>
.terminal-slide-enter-active,
.terminal-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.terminal-slide-enter-from,
.terminal-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
