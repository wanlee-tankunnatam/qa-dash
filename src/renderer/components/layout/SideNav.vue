<template>
  <nav class="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col py-4">
    <div class="px-4 mb-6">
      <span class="text-lg font-bold text-gray-800">QADash</span>
    </div>

    <ul class="flex-1 space-y-1 px-2">
      <li>
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span>Dashboard</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/ai"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive('/ai') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span>AI Terminal</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/settings"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            isActive('/settings') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          "
        >
          <span>Settings</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
