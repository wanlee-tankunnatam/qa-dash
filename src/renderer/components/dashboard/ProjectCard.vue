<template>
  <div
    class="bg-white rounded-xl border p-5 cursor-pointer transition-shadow hover:shadow-md"
    :class="isDangerZone ? 'border-red-300' : 'border-gray-200'"
    @click="handleClick"
  >
    <div class="flex items-start justify-between mb-3">
      <h3 class="text-base font-semibold text-gray-800 truncate">{{ project.name }}</h3>
      <span
        v-if="isDangerZone"
        class="ml-2 flex-shrink-0 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 animate-pulse"
      >
        Danger Zone
      </span>
    </div>
    <p class="text-xs text-gray-400 mb-3 truncate">{{ project.rootPath }}</p>
    <div class="flex items-center gap-2">
      <span
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
        :class="
          untrackedCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        "
      >
        {{ untrackedCount }} untracked
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Project } from '@shared/types/project'

interface Props {
  project: Project
  untrackedCount: number
  isDangerZone: boolean
}

const props = defineProps<Props>()
const router = useRouter()

function handleClick() {
  router.push(`/project/${props.project.id}`)
}
</script>
