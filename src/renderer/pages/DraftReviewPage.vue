<template>
  <div class="flex flex-col h-full overflow-auto p-6">
    <div class="flex items-center gap-4 mb-6">
      <button class="text-sm text-gray-500 hover:text-gray-700" @click="router.back()">
        &larr; Back
      </button>
      <h1 class="text-xl font-bold text-gray-800">Draft Review</h1>
    </div>

    <LoadingSpinner v-if="draftStore.loading" size="lg" class="mx-auto mt-12" />

    <ErrorMessage v-else-if="draftStore.error" :message="draftStore.error" />

    <div v-else-if="draftStore.current" class="max-w-2xl">
      <DraftForm
        :draft="draftStore.current"
        @update="handleUpdate"
        @copy="handleCopy"
      />
      <p v-if="copied" class="mt-3 text-sm text-green-600">Copied to clipboard!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDraftStore } from '@renderer/stores/draft'
import DraftForm from '@renderer/components/draft/DraftForm.vue'
import LoadingSpinner from '@renderer/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@renderer/components/shared/ErrorMessage.vue'
import type { TicketDraft } from '@shared/types/draft'

const router = useRouter()
const draftStore = useDraftStore()
const copied = ref(false)

function handleUpdate(field: keyof TicketDraft, value: string) {
  draftStore.updateField(field, value)
}

async function handleCopy() {
  if (!draftStore.current) return
  const payload = {
    summary: draftStore.current.summary,
    description: draftStore.current.description,
    priority: { name: draftStore.current.suggestedPriority },
    labels: draftStore.current.suggestedLabels,
  }
  await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(() => {
  // Redirect if no draft (e.g., direct navigation)
  if (!draftStore.current && !draftStore.loading) {
    router.replace('/')
  }
})
</script>
