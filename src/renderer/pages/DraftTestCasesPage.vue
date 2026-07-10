<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <h1 class="text-base font-semibold text-slate-800">Draft Test Cases with AI</h1>
    </div>

    <!-- Main content area -->
    <div class="flex-1 overflow-auto px-6 py-6 space-y-6">
      <!-- Input section -->
      <div v-if="!testCaseStore.loading && !testCaseStore.report" class="max-w-2xl space-y-4">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-slate-700">Source Type</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="sourceType"
                type="radio"
                value="jira"
                class="w-4 h-4"
              />
              <span class="text-sm text-slate-600">Jira Ticket</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="sourceType"
                type="radio"
                value="file"
                class="w-4 h-4"
              />
              <span class="text-sm text-slate-600">Upload File</span>
            </label>
          </div>
        </div>

        <!-- Source input -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">
            {{ sourceType === 'jira' ? 'Jira Ticket Key' : 'File Path' }}
          </label>
          <div v-if="sourceType === 'jira'" class="flex gap-2">
            <input
              v-model="ticketKey"
              type="text"
              placeholder="e.g., PROJ-123"
              class="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
          <div v-else class="flex gap-2">
            <input
              v-model="selectedFilePath"
              type="text"
              placeholder="No file selected"
              class="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
              readonly
            />
            <button
              class="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
              @click="pickFile"
            >
              Browse
            </button>
          </div>
        </div>

        <!-- Validation error -->
        <div v-if="validationError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ validationError }}
        </div>

        <!-- Submit button -->
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-800 hover:bg-slate-700 text-white"
          @click="generateTestCases"
        >
          Generate Test Cases
        </button>
      </div>

      <!-- Loading display -->
      <div v-if="testCaseStore.loading" class="max-w-4xl">
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-4 h-4 text-slate-400 animate-spin" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z"/>
            </svg>
            <span class="text-sm text-slate-600">Generating test cases...</span>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="testCaseStore.error && !testCaseStore.loading" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {{ testCaseStore.error }}
        <button class="ml-2 underline hover:no-underline" @click="testCaseStore.clearReport()">
          Dismiss
        </button>
      </div>

      <!-- Report display -->
      <div v-if="testCaseStore.report && !testCaseStore.loading" class="max-w-4xl space-y-6">
        <div class="pb-4 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">Test Cases</h2>
          <p class="text-xs text-slate-500 mt-1">
            Source: {{ testCaseStore.report.source.type === 'jira' ? 'Jira Ticket' : 'File' }} — {{ testCaseStore.report.source.value }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            These test cases are AI-generated drafts. Please review and adjust before using in production.
          </p>
        </div>

        <!-- Test cases list -->
        <div v-if="testCaseStore.report.testCases.length > 0">
          <div class="space-y-4">
            <div
              v-for="(testCase, i) in testCaseStore.report.testCases"
              :key="`test-${i}`"
              class="border border-slate-200 rounded-lg px-4 py-3 space-y-3"
            >
              <div class="flex items-start justify-between">
                <h3 class="text-sm font-semibold text-slate-800">Test Case {{ i + 1 }}</h3>
                <span class="text-xs px-2 py-1 rounded-full font-medium" :class="{
                  'bg-red-100 text-red-800': testCase.type === 'Boundary',
                  'bg-blue-100 text-blue-800': testCase.type === 'E2E',
                  'bg-amber-100 text-amber-800': testCase.type === 'Edge',
                  'bg-emerald-100 text-emerald-800': testCase.type === 'Functional',
                }">
                  {{ testCase.type }}
                </span>
              </div>

              <!-- Scenario (Given-When-Then) -->
              <div class="space-y-1">
                <label class="block text-xs font-medium text-slate-600">Scenario</label>
                <textarea
                  v-model="testCaseDrafts[i].scenario"
                  class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                  rows="3"
                />
              </div>

              <!-- Test Data -->
              <div class="space-y-1">
                <label class="block text-xs font-medium text-slate-600">Test Data</label>
                <textarea
                  v-model="testDataStrings[i]"
                  class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 font-mono text-xs"
                  rows="2"
                />
              </div>

              <!-- Expected Result -->
              <div class="space-y-1">
                <label class="block text-xs font-medium text-slate-600">Expected Result</label>
                <textarea
                  v-model="testCaseDrafts[i].expectedResult"
                  class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <!-- Copy button -->
          <div class="mt-6 flex gap-2">
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
              @click="copyToClipboard"
            >
              Copy Markdown
            </button>
            <button
              class="text-sm text-slate-600 hover:text-slate-800 underline"
              @click="resetForm"
            >
              Generate Another
            </button>
          </div>
        </div>

        <!-- No test cases -->
        <div v-if="testCaseStore.report.testCases.length === 0" class="text-center py-8 text-slate-500">
          <p class="text-sm">No test cases generated. Please try again.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTestCaseStore } from '@renderer/stores/testcase'
import { useToastStore } from '@renderer/stores/toast'
import type { TestCaseDraft } from '@shared/types/draft'

const route = useRoute()
const testCaseStore = useTestCaseStore()
const toastStore = useToastStore()

const sourceType = ref<'jira' | 'file'>('jira')
const ticketKey = ref('')
const selectedFilePath = ref('')
const validationError = ref('')

// Pre-populate from route query params (AC-013-01 context)
if (route.query.source === 'jira' && route.query.key) {
  sourceType.value = 'jira'
  ticketKey.value = route.query.key as string
} else if (route.query.source === 'file' && route.query.path) {
  sourceType.value = 'file'
  selectedFilePath.value = route.query.path as string
}

const testCaseDrafts = computed(() => {
  if (!testCaseStore.report) return []
  return testCaseStore.report.testCases.map((tc) => ({ ...tc }))
})

const testDataStrings = computed(() => {
  if (!testCaseStore.report) return []
  return testCaseStore.report.testCases.map((tc) => JSON.stringify(tc.testData, null, 2))
})

const cleanups: Array<() => void> = []

function validateInput(): boolean {
  validationError.value = ''
  if (sourceType.value === 'jira') {
    if (!ticketKey.value.trim()) {
      validationError.value = 'Please enter a Jira ticket key (e.g., PROJ-123)'
      return false
    }
  } else {
    if (!selectedFilePath.value.trim()) {
      validationError.value = 'Please select a file'
      return false
    }
  }
  return true
}

async function generateTestCases(): Promise<void> {
  if (!validateInput()) return
  testCaseStore.clearReport()

  const sourceValue = sourceType.value === 'jira' ? ticketKey.value : selectedFilePath.value

  try {
    await testCaseStore.generateTestCases(sourceType.value, sourceValue)
  } catch (e) {
    toastStore.show((e as Error).message, 'error', 4000)
  }
}

async function pickFile(): Promise<void> {
  try {
    const path = await window.qaApi.dialogOpenFile()
    if (path) {
      selectedFilePath.value = path
    }
  } catch (e) {
    toastStore.show(`Failed to pick file: ${(e as Error).message}`, 'error', 4000)
  }
}

function resetForm(): void {
  sourceType.value = 'jira'
  ticketKey.value = ''
  selectedFilePath.value = ''
  validationError.value = ''
  testCaseStore.clearReport()
}

function copyToClipboard(): void {
  const markdown = testCaseStore.formattedOutput
  navigator.clipboard.writeText(markdown).then(() => {
    toastStore.show('Copied to clipboard', 'success', 2000)
  }).catch((e) => {
    toastStore.show(`Failed to copy: ${(e as Error).message}`, 'error', 4000)
  })
}

onMounted(() => {
  cleanups.push(
    window.qaApi.onStreamEnd((data?: unknown) => {
      if (data && typeof data === 'object' && 'testCases' in data) {
        testCaseStore.setReport(data as any)
      }
    })
  )
  cleanups.push(
    window.qaApi.onStreamError((msg) => {
      testCaseStore.loading = false
      testCaseStore.error = msg
      toastStore.show(msg, 'error', 4000)
    })
  )
})

onUnmounted(() => {
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>
