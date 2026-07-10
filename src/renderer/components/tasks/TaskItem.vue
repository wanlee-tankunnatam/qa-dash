<template>
  <div class="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <!-- Local checkbox — does not affect Jira -->
    <input
      v-model="localChecked"
      type="checkbox"
      class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
    />
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-700 break-words">{{ stripMd(task.rawText) }}</p>
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
        class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
        @click="emit('ignore', task.id)"
      >
        Ignore
      </button>
      <button
        class="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 font-medium"
        @click="emit('draft', task)"
      >
        Draft ticket
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { UntrackedTask } from '@shared/types/task'

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

interface Props {
  task: UntrackedTask
  projectId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  ignore: [taskId: string]
  draft: [task: UntrackedTask]
}>()

// Local state only — does not affect Jira (CLAUDE.md rule #4)
const localChecked = ref(props.task.isChecked)

function checkGap() {
  // AC-012-01: Navigate to Gap Check page with task context
  router.push('/gapcheck')
}
</script>
