<template>
  <div class="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <!-- Local checkbox — does not affect Jira (CLAUDE.md rule #4) -->
    <input
      v-model="localChecked"
      type="checkbox"
      class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
    />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-if="ticket"
          class="text-xs font-mono font-medium text-blue-600 hover:underline"
          @click="openTicket"
        >
          {{ task.jiraKey }}
        </button>
        <span v-else class="text-xs font-mono text-gray-400">{{ task.jiraKey }}</span>

        <StatusBadge v-if="ticket" :status="ticket.status" />
        <PriorityBadge v-if="ticket" :priority="ticket.priority" />
      </div>
      <p class="text-sm text-gray-700 mt-1 break-words">
        {{ ticket?.summary ?? task.rawText }}
      </p>
      <p class="text-xs text-gray-400 mt-0.5">{{ task.fileRelativePath }}:{{ task.lineNumber }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LinkedTask } from '@shared/types/task'
import type { JiraTicket } from '@shared/types/jira'
import StatusBadge from '@renderer/components/shared/StatusBadge.vue'
import PriorityBadge from '@renderer/components/shared/PriorityBadge.vue'

interface Props {
  task: LinkedTask
  ticket: JiraTicket | null
}

const props = defineProps<Props>()

// Local state only
const localChecked = ref(props.task.isChecked)

function openTicket() {
  if (props.ticket?.url) {
    window.qaApi.openExternal(props.ticket.url)
  }
}
</script>
