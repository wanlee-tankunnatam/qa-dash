<template>
  <div class="flex flex-col h-full overflow-auto p-6">
    <h1 class="text-xl font-bold text-gray-800 mb-6">Settings</h1>

    <!-- Anthropic API Key -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 mb-5">
      <h2 class="text-base font-semibold text-gray-700 mb-4">AI Credentials</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Anthropic API Key
          <span v-if="settingsStore.anthropicKeySet" class="ml-2 text-xs text-green-600">
            (set)
          </span>
        </label>
        <input
          v-model="anthropicKey"
          type="password"
          placeholder="sk-ant-..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="flex gap-2">
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:bg-gray-400"
          :disabled="!anthropicKey || settingsStore.loading"
          @click="saveKey"
        >
          Save Key
        </button>
        <button
          v-if="settingsStore.anthropicKeySet"
          class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg border border-red-200"
          :disabled="settingsStore.loading"
          @click="deleteKey"
        >
          Delete Key
        </button>
      </div>

      <ErrorMessage v-if="settingsStore.error" :message="settingsStore.error" class="mt-3" />
    </section>

    <!-- Per-project Jira Config -->
    <section class="bg-white rounded-xl border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-700 mb-4">Project Configuration</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Project</label>
        <select
          v-model="selectedProjectId"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a project...</option>
          <option v-for="p in projectsStore.projects" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>

      <template v-if="selectedProject">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jira Base URL</label>
            <input
              v-model="jiraBaseUrl"
              type="text"
              placeholder="https://org.atlassian.net"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jira Email</label>
            <input
              v-model="jiraEmail"
              type="email"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jira API Token</label>
            <input
              v-model="jiraToken"
              type="password"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex gap-2">
            <button
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
              @click="saveJiraSettings"
            >
              Save Jira Settings
            </button>
            <button
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg border border-gray-200"
              @click="testConnection"
            >
              {{ jiraStore.loading ? 'Testing...' : 'Test Connection' }}
            </button>
          </div>

          <p v-if="connectionResult !== null" class="text-sm" :class="connectionResult ? 'text-green-600' : 'text-red-600'">
            {{ connectionResult ? 'Connection successful!' : 'Connection failed. Check credentials.' }}
          </p>

          <div class="border-t border-gray-100 pt-3 mt-3 space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ticket Regex</label>
              <input
                v-model="ticketRegex"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Warning Threshold (days)
              </label>
              <input
                v-model.number="warningDays"
                type="number"
                min="1"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Warning Threshold (count)
              </label>
              <input
                v-model.number="warningCount"
                type="number"
                min="1"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg"
              @click="saveProjectConfig"
            >
              Save Project Config
            </button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useSettingsStore } from '@renderer/stores/settings'
import { useJiraStore } from '@renderer/stores/jira'
import ErrorMessage from '@renderer/components/shared/ErrorMessage.vue'
import type { JiraSettings } from '@shared/types/project'

const projectsStore = useProjectsStore()
const settingsStore = useSettingsStore()
const jiraStore = useJiraStore()

const anthropicKey = ref('')
const selectedProjectId = ref('')
const jiraBaseUrl = ref('')
const jiraEmail = ref('')
const jiraToken = ref('')
const ticketRegex = ref('[A-Z]+-\\d+')
const warningDays = ref(3)
const warningCount = ref(5)
const connectionResult = ref<boolean | null>(null)

const selectedProject = computed(() =>
  projectsStore.getById(selectedProjectId.value),
)

watch(selectedProject, (project) => {
  if (project) {
    jiraBaseUrl.value = project.jiraBaseUrl ?? ''
    ticketRegex.value = project.config.ticketRegex
    warningDays.value = project.config.warningThresholdDays
    warningCount.value = project.config.warningThresholdCount
  }
})

async function saveKey() {
  await settingsStore.saveAnthropicKey(anthropicKey.value)
  anthropicKey.value = ''
}

async function deleteKey() {
  await settingsStore.deleteAnthropicKey()
}

async function saveJiraSettings() {
  if (!selectedProjectId.value) return
  const settings: JiraSettings = {
    baseUrl: jiraBaseUrl.value,
    email: jiraEmail.value,
    boardId: selectedProject.value?.jiraBoardId ?? '',
  }
  await jiraStore.setJiraSettings(selectedProjectId.value, settings)
  // Credential stored via IPC → Keychain
  if (jiraToken.value) {
    await window.qaApi.setCredential(
      `jira-token:${selectedProjectId.value}`,
      jiraToken.value,
    )
    jiraToken.value = ''
  }
}

async function testConnection() {
  connectionResult.value = null
  const result = await jiraStore.testConnection(jiraBaseUrl.value, jiraEmail.value)
  connectionResult.value = result
}

async function saveProjectConfig() {
  if (!selectedProjectId.value) return
  await projectsStore.updateConfig(selectedProjectId.value, {
    ticketRegex: ticketRegex.value,
    warningThresholdDays: warningDays.value,
    warningThresholdCount: warningCount.value,
  })
}

onMounted(async () => {
  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
})
</script>
