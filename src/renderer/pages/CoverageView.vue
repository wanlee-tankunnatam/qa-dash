<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <h1 class="text-base font-semibold text-slate-800">Test Coverage</h1>
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          :checked="coverageStore.showOnlyNoCoverage"
          type="checkbox"
          class="w-4 h-4"
          @change="toggleFilter"
        />
        <span class="text-sm text-slate-600">Show only uncovered</span>
      </label>
    </div>

    <!-- Main content -->
    <div class="flex-1 overflow-auto px-6 py-6">
      <!-- Project coverage grid -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div
          v-for="project in coverageStore.allProjectsCoverage"
          :key="project.projectId"
          class="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
          @click="selectProject(project.projectId)"
        >
          <div class="flex items-start justify-between mb-3">
            <h2 class="font-semibold text-slate-800 flex-1">{{ project.projectId }}</h2>
            <CoverageBadge :percent="project.coveragePercent" />
          </div>
          <div class="text-sm text-slate-600">
            <p>{{ project.coveredCount }} / {{ project.totalCount }} tasks</p>
          </div>
        </div>
      </div>

      <!-- Detailed view for selected project -->
      <div v-if="selectedCoverage" class="border-t border-slate-100 pt-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-6">
          {{ selectedCoverage.projectId }} — Coverage Details
        </h2>

        <!-- Has coverage section -->
        <div v-if="selectedCoverage.items.some((i) => i.hasCoverage)" class="mb-8">
          <h3 class="font-semibold text-emerald-700 mb-3">
            Has Coverage ({{ selectedCoverage.items.filter((i) => i.hasCoverage).length }})
          </h3>
          <div class="space-y-2">
            <div
              v-for="item in selectedCoverage.items.filter((i) => i.hasCoverage)"
              :key="item.taskId"
              class="border border-emerald-200 rounded-lg px-4 py-3 bg-emerald-50 text-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p v-if="item.jiraKey" class="font-mono text-xs text-emerald-700 mb-1">
                    {{ item.jiraKey }}
                  </p>
                  <p class="text-slate-700 break-words">{{ stripMd(item.summary) }}</p>
                  <p class="text-[10px] text-slate-500 mt-1">{{ item.filePath }}:{{ item.lineNumber }}</p>
                </div>
                <span class="flex-shrink-0 px-2 py-1 rounded-full bg-emerald-200 text-emerald-800 text-xs font-medium">
                  ✓ Covered
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- No coverage section -->
        <div v-if="selectedCoverage.items.some((i) => !i.hasCoverage)" class="mb-8">
          <h3 class="font-semibold text-red-700 mb-3">
            No Coverage ({{ selectedCoverage.items.filter((i) => !i.hasCoverage).length }})
          </h3>
          <div class="space-y-2">
            <div
              v-for="item in selectedCoverage.items.filter((i) => !i.hasCoverage)"
              :key="item.taskId"
              class="border border-red-200 rounded-lg px-4 py-3 bg-red-50 text-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p v-if="item.jiraKey" class="font-mono text-xs text-red-700 mb-1">
                    {{ item.jiraKey }}
                  </p>
                  <p class="text-slate-700 break-words">{{ stripMd(item.summary) }}</p>
                  <p class="text-[10px] text-slate-500 mt-1">{{ item.filePath }}:{{ item.lineNumber }}</p>
                </div>
                <span class="flex-shrink-0 px-2 py-1 rounded-full bg-red-200 text-red-800 text-xs font-medium">
                  ✗ Uncovered
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="selectedCoverage.items.length === 0" class="text-center py-12 text-slate-500">
          <p class="text-sm">No tasks matching filter</p>
        </div>
      </div>

      <!-- No project selected message -->
      <div v-if="!selectedCoverage && coverageStore.allProjectsCoverage.length === 0" class="text-center py-12 text-slate-500">
        <p class="text-sm">No projects yet. Create projects to see coverage.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoverageViewStore } from '@renderer/stores/coverageview'
import CoverageBadge from '@renderer/components/dashboard/CoverageBadge.vue'

const coverageStore = useCoverageViewStore()

const selectedCoverage = computed(() => coverageStore.selectedProjectCoverage)

function stripMd(text: string): string {
  const clean = text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/^\s*#+\s*/, '')
    .trim()
  let s = clean.replace(/\s*\(AC[\d,\s:]+\)\s*$/i, '').trim()
  const dashIdx = s.indexOf(' — ')
  if (dashIdx > 15) s = s.slice(0, dashIdx)
  const parenIdx = s.search(/\s\(/)
  if (parenIdx > 20) s = s.slice(0, parenIdx)
  return s
}

function selectProject(projectId: string): void {
  coverageStore.selectProject(projectId)
}

function toggleFilter(e: Event): void {
  const checked = (e.target as HTMLInputElement).checked
  coverageStore.setShowOnlyNoCoverage(checked)
}
</script>
