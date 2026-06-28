<template>
  <div
    v-if="projects.length > 0"
    class="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3"
  >
    <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
    <p class="text-sm font-medium text-red-700">
      Danger Zone:
      <span class="font-normal">
        {{ projectNames }} — untracked tasks for 3+ consecutive days
      </span>
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

const projectNames = computed(() =>
  props.projects.map((p) => p.name).join(', '),
)
</script>
