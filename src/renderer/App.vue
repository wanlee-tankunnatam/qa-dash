<template>
  <div class="flex h-screen bg-gray-50">
    <SideNav />
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import SideNav from './components/layout/SideNav.vue'
import type { SyncSummary } from '../../shared/constants'

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
