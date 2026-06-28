<template>
  <div class="flex flex-col h-full p-6 gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800">AI Terminal</h1>
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
        :disabled="isStreaming"
        @click="startMyDay"
      >
        {{ isStreaming ? 'Streaming...' : 'Start My Day' }}
      </button>
    </div>

    <ErrorMessage v-if="streamError" :message="streamError" />

    <StreamingOutput :content="streamContent" :is-streaming="isStreaming" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useTasksStore } from '@renderer/stores/tasks'
import { useJiraStore } from '@renderer/stores/jira'
import StreamingOutput from '@renderer/components/ai/StreamingOutput.vue'
import ErrorMessage from '@renderer/components/shared/ErrorMessage.vue'
import type { StartMyDayContext } from '@shared/constants'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const jiraStore = useJiraStore()

const streamContent = ref('')
const isStreaming = ref(false)
const streamError = ref<string | null>(null)

function onStreamChunk(chunk: unknown) {
  streamContent.value += String(chunk)
}

function onStreamEnd() {
  isStreaming.value = false
}

function onStreamError(msg: unknown) {
  streamError.value = String(msg)
  isStreaming.value = false
}

async function startMyDay() {
  streamContent.value = ''
  streamError.value = null
  isStreaming.value = true

  const context: StartMyDayContext = {
    projects: projectsStore.projects,
    untrackedByProject: Object.fromEntries(
      projectsStore.projects.map((p) => [p.id, tasksStore.getUntracked(p.id)]),
    ),
    linkedByProject: Object.fromEntries(
      projectsStore.projects.map((p) => [p.id, tasksStore.getLinked(p.id)]),
    ),
    tickets: jiraStore.tickets,
    today: new Date().toISOString().slice(0, 10),
  }

  try {
    await window.qaApi.startMyDay(context)
  } catch (e) {
    streamError.value = (e as Error).message
    isStreaming.value = false
  }
}

onMounted(() => {
  window.qaApi.on('event:stream:chunk', onStreamChunk)
  window.qaApi.on('event:stream:end', onStreamEnd)
  window.qaApi.on('event:stream:error', onStreamError)
})

onUnmounted(() => {
  window.qaApi.off('event:stream:chunk', onStreamChunk)
  window.qaApi.off('event:stream:end', onStreamEnd)
  window.qaApi.off('event:stream:error', onStreamError)
})
</script>
