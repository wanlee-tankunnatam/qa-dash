<template>
  <div
    class="group bg-white rounded-xl border cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-px"
    :class="isDangerZone ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-indigo-200'"
    @click="handleClick"
  >
    <!-- Card top stripe (danger zone indicator) -->
    <div
      v-if="isDangerZone"
      class="h-1 rounded-t-xl bg-gradient-to-r from-red-400 to-red-500"
    />

    <div class="p-4">
      <!-- Title row -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="text-sm font-semibold text-slate-800 truncate leading-tight">
          {{ project.name }}
        </h3>
        <span
          v-if="isDangerZone"
          class="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Danger
        </span>
      </div>

      <!-- Path -->
      <div class="flex items-center gap-1.5 mb-3">
        <svg class="w-3 h-3 text-slate-300 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1H5l1 1.5h3.5A1.5 1.5 0 0 1 11 4v5A1.5 1.5 0 0 1 9.5 10.5h-7A1.5 1.5 0 0 1 1 9V2.5Z"/>
        </svg>
        <p class="text-xs text-slate-400 truncate font-mono">{{ shortPath }}</p>
      </div>

      <!-- Stats row -->
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
          :class="
            untrackedCount > 0
              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          "
        >
          <span v-if="untrackedCount > 0">{{ untrackedCount }} untracked</span>
          <span v-else>All tracked</span>
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-2.5 border-t border-slate-50 flex items-center justify-between">
      <span class="text-xs text-slate-400">Click to view tasks</span>
      <svg
        class="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Project } from '@shared/types/project'

interface Props {
  project: Project
  untrackedCount: number
  isDangerZone: boolean
  isScanning?: boolean
}

const props = defineProps<Props>()
const router = useRouter()

const shortPath = computed(() => {
  const parts = props.project.rootPath.replace(/^\/Users\/[^/]+\//, '~/').split('/')
  return parts.length > 4 ? '~/' + parts.slice(-3).join('/') : props.project.rootPath.replace(/^\/Users\/[^/]+\//, '~/')
})

function handleClick() {
  router.push(`/project/${props.project.id}`)
}
</script>
