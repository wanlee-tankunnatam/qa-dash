<template>
  <div
    ref="containerRef"
    class="flex-1 overflow-auto bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100"
  >
    <pre class="whitespace-pre-wrap break-words">{{ content }}<span v-if="isStreaming" class="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5" /></pre>
    <p v-if="!content && !isStreaming" class="text-gray-500 italic">
      Press "Start My Day" to begin...
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  content: string
  isStreaming: boolean
}

const props = defineProps<Props>()
const containerRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when content changes
watch(
  () => props.content,
  async () => {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  },
)
</script>
