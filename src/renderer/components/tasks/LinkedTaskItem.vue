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
        {{ ticket?.summary ?? stripMd(task.rawText) }}
      </p>
      <p class="text-[10px] text-gray-300 font-mono mt-0.5">{{ task.fileRelativePath }}:{{ task.lineNumber }}</p>
    </div>
    <div class="flex-shrink-0 flex items-center gap-2">
      <button
        class="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50 font-medium"
        @click="checkGap"
        title="Analyze requirement for gaps"
      >
        Gap Check
      </button>
      <button
        class="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 font-medium"
        @click="draftTestCases"
        title="Generate test cases with AI"
      >
        Test Cases
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { LinkedTask } from '@shared/types/task'

const router = useRouter()

function stripMd(text: string): string {
  const clean = text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/^\s*#+\s*/, '')
    .trim()
  let s = clean.replace(/\s*\(AC[\d,\s:]+\)\s*$/i, '').trim()
  const dashIdx = s.indexOf(' — ')
  if (dashIdx > 15) s = s.slice(0, dashIdx)
  const parenIdx = s.search(/\s\(/)
  if (parenIdx > 20) s = s.slice(0, parenIdx)
  return s
}
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

function checkGap() {
  // AC-012-01: Navigate to Gap Check page with task context
  router.push('/gapcheck')
}

function draftTestCases() {
  // AC-013-01: Navigate to Test Cases page with task context
  router.push({
    name: 'test-cases',
    query: {
      source: 'jira',
      key: props.task.jiraKey
    }
  })
}
</script>
