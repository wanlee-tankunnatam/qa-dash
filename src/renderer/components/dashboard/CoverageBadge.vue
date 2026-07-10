<template>
  <div :class="['px-3 py-1 rounded-full text-xs font-semibold', colorClass]">
    {{ percent }}%
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percent: number
}

const props = defineProps<Props>()

const colorClass = computed(() => {
  if (props.percent >= 80) return 'bg-emerald-100 text-emerald-800'
  if (props.percent >= 50) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
})
</script>
