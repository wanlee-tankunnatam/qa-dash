<template>
  <div class="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast-slide" tag="div" class="flex flex-col gap-2">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm pointer-events-auto',
          toast.type === 'success' && 'bg-emerald-500',
          toast.type === 'error' && 'bg-red-500',
          toast.type === 'warning' && 'bg-amber-500',
          toast.type === 'info' && 'bg-blue-500',
        ]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@renderer/stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
