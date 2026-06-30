<template>
  <div
    v-if="projects.length > 0"
    class="flex items-center gap-3 px-6 py-2.5 bg-red-950 border-b border-red-900"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
    <p class="text-xs font-medium text-red-300">
      Danger Zone ·
      <span class="font-semibold text-red-200">{{ projectNames }}</span>
      <span class="text-red-400"> — untracked tasks for 3+ consecutive days</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@shared/types/project'

interface Props {
  projects: Project[]
}

const props = defineProps<Props>()

const projectNames = computed(() => props.projects.map((p) => p.name).join(', '))
</script>
