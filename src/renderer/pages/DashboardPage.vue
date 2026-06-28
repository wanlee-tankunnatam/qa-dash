<template>
  <div class="flex flex-col h-full">
    <DangerZoneBanner :projects="dangerZoneStore.activeProjects" />

    <div class="flex-1 overflow-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-800">Dashboard</h1>
        <button
          class="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          :disabled="isSyncing"
          @click="triggerSync"
        >
          {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
        </button>
      </div>

      <LoadingSpinner v-if="projectsStore.loading" size="lg" class="mx-auto mt-12" />

      <ErrorMessage
        v-else-if="projectsStore.error"
        :message="projectsStore.error"
        :retryable="true"
        @retry="loadProjects"
      />

      <div v-else-if="projectsStore.projects.length === 0" class="text-center mt-12">
        <p class="text-gray-500 text-sm">No projects yet. Add a project in Settings.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard
          v-for="project in projectsStore.projects"
          :key="project.id"
          :project="project"
          :untracked-count="tasksStore.untrackedCount(project.id)"
          :is-danger-zone="dangerZoneStore.isActive(project.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useTasksStore } from '@renderer/stores/tasks'
import { useDangerZoneStore } from '@renderer/stores/dangerZone'
import DangerZoneBanner from '@renderer/components/dashboard/DangerZoneBanner.vue'
import ProjectCard from '@renderer/components/dashboard/ProjectCard.vue'
import LoadingSpinner from '@renderer/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@renderer/components/shared/ErrorMessage.vue'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const dangerZoneStore = useDangerZoneStore()
const isSyncing = ref(false)

async function loadProjects() {
  await projectsStore.fetchProjects()
  // Scan all projects after fetching
  for (const project of projectsStore.projects) {
    tasksStore.scanProject(project.id)
  }
}

async function triggerSync() {
  isSyncing.value = true
  try {
    await window.qaApi.triggerSync()
    await loadProjects()
  } finally {
    isSyncing.value = false
  }
}

onMounted(() => {
  loadProjects()
})
</script>
