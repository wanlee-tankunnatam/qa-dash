<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Summary</label>
      <input
        :value="draft.summary"
        type="text"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @input="emit('update', 'summary', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        :value="draft.description"
        rows="6"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        @input="emit('update', 'description', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
      <select
        :value="draft.suggestedPriority"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="emit('update', 'suggestedPriority', ($event.target as HTMLSelectElement).value)"
      >
        <option>Blocker</option>
        <option>Critical</option>
        <option>Major</option>
        <option>Minor</option>
        <option>Trivial</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Labels</label>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="label in draft.suggestedLabels"
          :key="label"
          class="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs text-blue-700"
        >
          {{ label }}
        </span>
      </div>
    </div>

    <div class="pt-2">
      <button
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        @click="emit('copy')"
      >
        Copy to Clipboard (Jira-compatible JSON)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TicketDraft } from '@shared/types/draft'

interface Props {
  draft: TicketDraft
}

defineProps<Props>()

const emit = defineEmits<{
  update: [field: keyof TicketDraft, value: string]
  copy: []
}>()
</script>
