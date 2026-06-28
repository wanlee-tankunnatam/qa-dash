<template>
  <div
    class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
    :class="sizeClass"
    role="status"
    aria-label="Loading"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  }
  return map[props.size]
})
</script>
