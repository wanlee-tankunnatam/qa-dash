<template>
  <div class="flex flex-col h-full overflow-auto p-6">
    <div class="flex items-center gap-4 mb-6">
      <button class="text-sm text-gray-500 hover:text-gray-700" @click="router.back()">
        &larr; Back
      </button>
      <h1 class="text-xl font-bold text-gray-800">{{ project?.name ?? 'Project' }}</h1>
      <button
        class="ml-auto text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
        :disabled="tasksStore.scanning[projectId]"
        @click="rescan"
      >
        {{ tasksStore.scanning[projectId] ? 'Scanning...' : 'Re-scan' }}
      </button>
    </div>

    <LoadingSpinner v-if="tasksStore.scanning[projectId]" size="lg" class="mx-auto mt-12" />

    <ErrorMessage
      v-else-if="tasksStore.error"
      :message="tasksStore.error"
      :retryable="true"
      @retry="rescan"
    />

    <template v-else>
      <!-- Untracked Tasks -->
      <section class="mb-6">
        <h2 class="text-base font-semibold text-gray-700 mb-3">
          Untracked Tasks
          <span class="ml-2 text-sm font-normal text-gray-400">
            ({{ visibleUntracked.length }})
          </span>
        </h2>
        <div v-if="visibleUntracked.length === 0" class="text-sm text-gray-400">
          No untracked tasks.
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100">
          <TaskItem
            v-for="task in visibleUntracked"
            :key="task.id"
            :task="task"
            :project-id="projectId"
            @ignore="handleIgnore"
            @draft="handleDraft"
          />
        </div>
      </section>

      <!-- Linked Tasks -->
      <section>
        <h2 class="text-base font-semibold text-gray-700 mb-3">
          Linked Tasks
          <span class="ml-2 text-sm font-normal text-gray-400">
            ({{ linkedTasks.length }})
          </span>
        </h2>
        <div v-if="linkedTasks.length === 0" class="text-sm text-gray-400">
          No linked tasks.
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100">
          <LinkedTaskItem
            v-for="task in linkedTasks"
            :key="task.id"
            :task="task"
            :ticket="jiraStore.getTicket(task.jiraKey) ?? null"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@renderer/stores/projects'
import { useTasksStore } from '@renderer/stores/tasks'
import { useJiraStore } from '@renderer/stores/jira'
import { useDraftStore } from '@renderer/stores/draft'
import TaskItem from '@renderer/components/tasks/TaskItem.vue'
import LinkedTaskItem from '@renderer/components/tasks/LinkedTaskItem.vue'
import LoadingSpinner from '@renderer/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@renderer/components/shared/ErrorMessage.vue'
import type { UntrackedTask } from '@shared/types/task'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const jiraStore = useJiraStore()
const draftStore = useDraftStore()

const projectId = route.params.id as string
const project = computed(() => projectsStore.getById(projectId))

const visibleUntracked = computed(() =>
  tasksStore.getUntracked(projectId).filter((t) => !t.isIgnoredToday),
)

const linkedTasks = computed(() => tasksStore.getLinked(projectId))

async function rescan() {
  await tasksStore.scanProject(projectId)
  const keys = linkedTasks.value.map((t) => t.jiraKey)
  if (keys.length > 0) {
    jiraStore.fetchTickets(keys, projectId)
  }
}

async function handleIgnore(taskId: string) {
  await tasksStore.ignoreTask(taskId, projectId)
}

async function handleDraft(task: UntrackedTask) {
  await draftStore.draftTicket(task, projectId, [])
  router.push('/draft')
}

onMounted(async () => {
  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
  await tasksStore.scanProject(projectId)
  const keys = linkedTasks.value.map((t) => t.jiraKey)
  if (keys.length > 0) {
    jiraStore.fetchTickets(keys, projectId)
  }
})
</script>
