<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="colorClass"
  >
    {{ priority }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JiraPriority } from '@shared/types/jira'

interface Props {
  priority: JiraPriority
}

const props = defineProps<Props>()

const colorClass = computed(() => {
  const map: Record<JiraPriority, string> = {
    Blocker: 'bg-red-100 text-red-700',
    Critical: 'bg-red-100 text-red-700',
    Major: 'bg-orange-100 text-orange-700',
    Minor: 'bg-yellow-100 text-yellow-700',
    Trivial: 'bg-blue-100 text-blue-700',
  }
  return map[props.priority] ?? 'bg-gray-100 text-gray-700'
})
</script>
