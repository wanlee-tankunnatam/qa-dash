<template>
  <div class="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
    <span class="text-red-500 mt-0.5">!</span>
    <div class="flex-1">
      <p class="text-sm text-red-700">{{ message }}</p>
      <button
        v-if="retryable"
        class="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  retryable?: boolean
}

withDefaults(defineProps<Props>(), {
  retryable: false,
})

const emit = defineEmits<{
  retry: []
}>()
</script>
