<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="colorClass"
  >
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JiraStatus } from '@shared/types/jira'

interface Props {
  status: JiraStatus
}

const props = defineProps<Props>()

const colorClass = computed(() => {
  const map: Record<JiraStatus, string> = {
    TODO: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-purple-100 text-purple-700',
    DONE: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-orange-100 text-orange-700',
    FAILED: 'bg-red-100 text-red-700',
  }
  return map[props.status] ?? 'bg-gray-100 text-gray-700'
})
</script>
