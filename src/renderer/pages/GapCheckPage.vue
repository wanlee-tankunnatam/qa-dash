<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <h1 class="text-base font-semibold text-slate-800">Requirement Gap Check</h1>
    </div>

    <!-- Main content area -->
    <div class="flex-1 overflow-auto px-6 py-6 space-y-6">
      <!-- Input section -->
      <div v-if="!gapCheckStore.loading && !gapCheckStore.report" class="max-w-2xl space-y-4">
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
          @click="analyzeGap"
        >
          Analyze Requirement
        </button>
      </div>

      <!-- Streaming display -->
      <div v-if="gapCheckStore.loading" class="max-w-4xl">
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-4 h-4 text-slate-400 animate-spin" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z"/>
            </svg>
            <span class="text-sm text-slate-600">Analyzing requirement...</span>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <pre class="text-sm text-slate-700 whitespace-pre-wrap break-words font-sans leading-relaxed">{{ streamingText }}<span class="inline-block w-1.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" /></pre>
          </div>
        </div>
      </div>

      <!-- Stream error -->
      <div v-if="gapCheckStore.error && !gapCheckStore.loading" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {{ gapCheckStore.error }}
        <button class="ml-2 underline hover:no-underline" @click="gapCheckStore.clearReport()">
          Dismiss
        </button>
      </div>

      <!-- Report display -->
      <div v-if="gapCheckStore.report && !gapCheckStore.loading" class="max-w-4xl space-y-6">
        <div class="pb-4 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">Gap Analysis Report</h2>
          <p class="text-xs text-slate-500 mt-1">
            Source: {{ gapCheckStore.report.source.type === 'jira' ? 'Jira Ticket' : 'File' }} — {{ gapCheckStore.report.source.value }}
          </p>
        </div>

        <!-- Critical gaps -->
        <div v-if="gapCheckStore.report.criticalGaps.length > 0">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
            <span class="inline-block w-2 h-2 rounded-full bg-red-500" />
            Critical Gaps
            <span class="text-xs font-normal text-slate-500 ml-auto">{{ gapCheckStore.report.criticalGaps.length }}</span>
          </h3>
          <div class="space-y-3">
            <div
              v-for="(gap, i) in gapCheckStore.report.criticalGaps"
              :key="`critical-${i}`"
              class="border border-red-200 bg-red-50 rounded-lg px-4 py-3 space-y-2"
            >
              <h4 class="text-sm font-semibold text-red-800">{{ gap.title }}</h4>
              <p class="text-xs text-slate-700">{{ gap.description }}</p>
              <p class="text-xs text-slate-600 italic">Suggested fix: {{ gap.suggestedFix }}</p>
            </div>
          </div>
        </div>

        <!-- Ambiguities -->
        <div v-if="gapCheckStore.report.ambiguities.length > 0">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-500" />
            Ambiguities
            <span class="text-xs font-normal text-slate-500 ml-auto">{{ gapCheckStore.report.ambiguities.length }}</span>
          </h3>
          <div class="space-y-3">
            <div
              v-for="(gap, i) in gapCheckStore.report.ambiguities"
              :key="`ambiguity-${i}`"
              class="border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 space-y-2"
            >
              <h4 class="text-sm font-semibold text-amber-800">{{ gap.title }}</h4>
              <p class="text-xs text-slate-700">{{ gap.description }}</p>
              <p class="text-xs text-slate-600 italic">Suggested fix: {{ gap.suggestedFix }}</p>
            </div>
          </div>
        </div>

        <!-- Nice-to-have gaps -->
        <div v-if="gapCheckStore.report.niceToHaveGaps.length > 0">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Nice-to-Have Gaps
            <span class="text-xs font-normal text-slate-500 ml-auto">{{ gapCheckStore.report.niceToHaveGaps.length }}</span>
          </h3>
          <div class="space-y-3">
            <div
              v-for="(gap, i) in gapCheckStore.report.niceToHaveGaps"
              :key="`nice-${i}`"
              class="border border-emerald-200 bg-emerald-50 rounded-lg px-4 py-3 space-y-2"
            >
              <h4 class="text-sm font-semibold text-emerald-800">{{ gap.title }}</h4>
              <p class="text-xs text-slate-700">{{ gap.description }}</p>
              <p class="text-xs text-slate-600 italic">Suggested fix: {{ gap.suggestedFix }}</p>
            </div>
          </div>
        </div>

        <!-- No gaps found -->
        <div v-if="gapCheckStore.totalGaps === 0" class="text-center py-8 text-slate-500">
          <p class="text-sm">No gaps found in this requirement. Great job!</p>
        </div>

        <!-- Clear button -->
        <button
          class="text-sm text-slate-600 hover:text-slate-800 underline"
          @click="resetForm"
        >
          Analyze Another
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGapCheckStore } from '@renderer/stores/gapcheck'
import { useToastStore } from '@renderer/stores/toast'

const gapCheckStore = useGapCheckStore()
const toastStore = useToastStore()

const sourceType = ref<'jira' | 'file'>('jira')
const ticketKey = ref('')
const selectedFilePath = ref('')
const streamingText = ref('')
const validationError = ref('')

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

async function analyzeGap(): Promise<void> {
  if (!validateInput()) return
  streamingText.value = ''
  gapCheckStore.clearReport()

  const sourceValue = sourceType.value === 'jira' ? ticketKey.value : selectedFilePath.value

  try {
    await window.qaApi.gapCheck(sourceType.value, sourceValue)
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
  streamingText.value = ''
  validationError.value = ''
  gapCheckStore.clearReport()
}

onMounted(() => {
  cleanups.push(
    window.qaApi.onStreamChunk((chunk) => {
      streamingText.value += chunk
    })
  )
  cleanups.push(
    window.qaApi.onStreamEnd((data?: unknown) => {
      if (data && typeof data === 'object' && 'criticalGaps' in data) {
        gapCheckStore.setReport(data as any)
      }
    })
  )
  cleanups.push(
    window.qaApi.onStreamError((msg) => {
      toastStore.show(msg, 'error', 4000)
    })
  )
})

onUnmounted(() => {
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>
