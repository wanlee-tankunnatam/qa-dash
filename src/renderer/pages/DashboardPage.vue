<template>
  <div class="flex flex-col h-full bg-slate-50">
    <DangerZoneBanner :projects="dangerZoneStore.activeProjects" />

    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
      <div>
        <h1 class="text-base font-semibold text-slate-800">Tasks</h1>
        <p class="text-xs text-slate-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all"
        :class="
          isSyncing
            ? 'border-indigo-200 bg-indigo-50 text-indigo-500 cursor-not-allowed'
            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
        "
        :disabled="isSyncing"
        @click="triggerSync"
      >
        <svg class="w-3.5 h-3.5" :class="isSyncing ? 'animate-spin' : ''" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z" />
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z" />
        </svg>
        {{ isSyncing ? 'Syncing…' : 'Sync Now' }}
      </button>
    </div>

    <!-- Loading / empty -->
    <LoadingSpinner v-if="projectsStore.loading" size="lg" class="mx-auto mt-16" />
    <ErrorMessage v-else-if="projectsStore.error" :message="projectsStore.error" :retryable="true" @retry="loadProjects" />

    <div v-else-if="projectsStore.projects.length === 0" class="flex flex-col items-center justify-center mt-20 gap-4">
      <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg class="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3Zm0 10h8v8H3v-8Zm10-10h8v8h-8V3Zm0 10h8v8h-8v-8Z"/>
        </svg>
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-slate-700">No projects yet</p>
        <p class="text-xs text-slate-400 mt-1">Go to Settings and add your first project</p>
      </div>
      <RouterLink to="/settings" class="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
        Open Settings →
      </RouterLink>
    </div>

    <!-- Tabs + Table -->
    <template v-else>
      <!-- Project tabs -->
      <div class="flex items-end gap-0 px-6 bg-white border-b border-slate-100 overflow-x-auto">
        <button
          v-for="project in projectsStore.projects"
          :key="project.id"
          class="relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0"
          :class="
            activeProjectId === project.id
              ? 'text-indigo-600 border-indigo-500'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          "
          @click="activeProjectId = project.id"
        >
          <!-- danger dot -->
          <span
            v-if="dangerZoneStore.isActive(project.id)"
            class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
          />
          {{ project.name }}
          <!-- current sprint chip -->
          <span
            v-if="project.config.currentSprint"
            class="px-1.5 py-0.5 rounded text-xs font-mono"
            :class="
              activeProjectId === project.id
                ? 'bg-indigo-50 text-indigo-500'
                : 'bg-slate-50 text-slate-400'
            "
          >{{ project.config.currentSprint }}</span>
          <!-- untracked badge -->
          <span
            v-if="tasksStore.untrackedCount(project.id) > 0"
            class="px-1.5 py-0.5 rounded-full text-xs font-semibold"
            :class="
              activeProjectId === project.id
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-slate-100 text-slate-400'
            "
          >{{ tasksStore.untrackedCount(project.id) }}</span>
        </button>
      </div>

      <!-- View tabs: hidden when view is set by route -->
      <div v-if="!props.initialView || props.initialView === 'qa'" class="flex items-center gap-0 px-4 pt-2 bg-white border-b border-slate-100">
        <button
          v-for="tab in VIEW_TABS" :key="tab.id"
          class="px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap"
          :class="viewTab === tab.id
            ? 'text-indigo-600 border-indigo-500'
            : 'text-slate-400 border-transparent hover:text-slate-600'"
          @click="viewTab = tab.id"
        >{{ tab.label }}</button>
      </div>

      <!-- Search + filter bar -->
      <div class="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-100 flex-wrap">
        <!-- search -->
        <div class="relative flex-1 min-w-40 max-w-72">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.868-3.833ZM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหา task..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <button v-if="searchQuery" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" @click="searchQuery = ''">
            <svg class="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z"/></svg>
          </button>
        </div>
        <!-- role chips -->
        <div class="flex items-center gap-1 border-r border-slate-200 pr-2">
          <button
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 transition-all cursor-pointer"
            :class="activeRole === 'QA' ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-indigo-50 text-indigo-700 ring-indigo-200 opacity-60 hover:opacity-100'"
            @click="toggleRole('QA')"
          >QA</button>
          <button
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 transition-all cursor-pointer"
            :class="activeRole === 'DEV' ? 'bg-rose-600 text-white ring-rose-600' : 'bg-rose-50 text-rose-700 ring-rose-200 opacity-60 hover:opacity-100'"
            @click="toggleRole('DEV')"
          >DEV</button>
        </div>
        <!-- category chips -->
        <div class="flex items-center gap-1 flex-wrap">
          <button
            v-for="cat in QA_CATEGORIES"
            :key="cat.id"
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 transition-opacity cursor-pointer"
            :class="[cat.badge, activeCategories.size > 0 && !activeCategories.has(cat.id) ? 'opacity-30' : '']"
            @click="toggleCategory(cat.id)"
          >{{ cat.label }}</button>
          <button
            v-if="activeCategories.size > 0 || activeRole || searchQuery"
            class="text-xs text-slate-400 hover:text-slate-600 px-1"
            @click="activeCategories = new Set(); activeRole = null; searchQuery = ''"
          >Clear</button>
        </div>
      </div>

      <!-- Table for active project -->
      <div class="flex-1 overflow-auto">
        <!-- scanning -->
        <div v-if="tasksStore.scanning[activeProjectId]" class="flex items-center justify-center mt-16">
          <LoadingSpinner size="md" />
        </div>

        <!-- no tasks (skip if hierarchy available — show structure even with no tasks) -->
        <div v-else-if="activeUntracked.length === 0 && activeLinked.length === 0 && !epicHierarchy.length" class="flex flex-col items-center justify-center mt-16 gap-2">
          <svg class="w-10 h-10 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm font-medium text-slate-600">All tracked</p>
          <p class="text-xs text-slate-400">No untracked tasks in this project</p>
        </div>

        <!-- no results after filter (skip in hierarchy mode — show empty story rows instead) -->
        <div v-else-if="groupedTasks.length === 0 && !epicHierarchy.length" class="flex flex-col items-center justify-center mt-16 gap-2">
          <svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"/>
          </svg>
          <p class="text-sm font-medium text-slate-500">ไม่พบ task ที่ตรงกับ filter</p>
          <button class="text-xs text-indigo-500 hover:text-indigo-700" @click="activeCategories = new Set(); activeRole = null; searchQuery = ''">ล้าง filter</button>
        </div>

        <!-- QA View: stories grouped by action needed (shared by all views) -->
        <div v-else-if="epicHierarchy.length" class="p-4 space-y-6">
          <div v-for="group in qaGroups" :key="group.id">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm">{{ group.dot }}</span>
              <span :class="['text-sm font-semibold', group.color]">{{ group.label }}</span>
              <span class="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{{ group.stories.length }}</span>
            </div>
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-slate-100 text-left text-[10px] text-slate-400 uppercase tracking-wide">
                  <th class="px-3 pb-1.5 w-16">Epic</th>
                  <th class="px-3 pb-1.5">Story</th>
                  <th class="px-3 pb-1.5 w-24 text-center">Dev</th>
                  <th class="px-3 pb-1.5 w-14 text-center">API</th>
                  <th class="px-3 pb-1.5 w-16 text-center">Integ.</th>
                  <th class="px-3 pb-1.5 w-12 text-center">UI</th>
                  <th class="px-3 pb-1.5 w-14 text-center">E2E</th>
                  <th class="px-3 pb-1.5 w-14 text-center">Script</th>
                  <th class="px-3 pb-1.5 w-20 text-right">Due</th>
                  <th class="px-3 pb-1.5 w-24 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in group.stories" :key="row.epicLabel + row.storyLabel"
                  class="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td class="py-2 px-3 w-16 whitespace-nowrap">
                    <span class="text-slate-400 font-mono">{{ row.epicLabel }}</span>
                  </td>
                  <td class="py-2 px-3">
                    <span class="text-slate-700">{{ row.storyLabel }}</span>
                  </td>
                  <td class="py-2 px-3 w-24 text-center">
                    <template v-if="row.devStatus && DEV_STATUS_BADGE[row.devStatus]">
                      <span :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1', DEV_STATUS_BADGE[row.devStatus].cls]">
                        {{ DEV_STATUS_BADGE[row.devStatus].label }}
                      </span>
                    </template>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-14 text-center">
                    <span v-if="row.hasAPI" class="text-purple-600 font-bold text-sm">✓</span>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-20 text-center">
                    <span v-if="row.hasIntegration" class="text-purple-600 font-bold text-sm">✓</span>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-12 text-center">
                    <span v-if="row.hasUI" class="text-purple-600 font-bold text-sm">✓</span>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-14 text-center">
                    <span v-if="row.hasE2E" class="text-teal-600 font-bold text-sm">✓</span>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-14 text-center">
                    <span v-if="row.hasScript" class="text-indigo-600 font-bold text-sm">✓</span>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-24 text-right">
                    <span v-if="row.dueDate" class="text-slate-500 font-mono text-[10px]">{{ row.dueDate }}</span>
                    <span v-else class="text-slate-200">—</span>
                  </td>
                  <td class="py-2 px-3 w-32 text-right">
                    <span class="text-slate-500 font-mono text-[10px]">{{ row.updatedDate ?? row.gitDate ?? '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- tasks grouped by epic/section -->
        <div v-else>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-white sticky top-0 z-10">
                <th class="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 w-[400px] max-w-[400px]">Task</th>
                <th class="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 w-24">Type</th>
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 w-28">Sprint</th>
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 w-28">Due Date</th>
                <th class="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 w-24">Dev</th>
                <th class="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 w-24">QA</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(epicGroup, epicIndex) in groupedTasks" :key="epicGroup.epic">
                <!-- ── Epic row ── -->
                <tr
                  class="bg-indigo-50 border-y border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors select-none"
                  @click="toggleCollapse('epic:' + epicGroup.epic)"
                >
                  <td colspan="7" class="px-5 py-2">
                    <div class="flex items-start gap-2">
                      <svg
                        class="w-3 h-3 text-indigo-400 flex-shrink-0 transition-transform mt-0.5"
                        :class="collapsedCategories.has('epic:' + epicGroup.epic) ? '-rotate-90' : ''"
                        viewBox="0 0 12 12" fill="currentColor"
                      ><path d="M6 8.5 1.5 4h9L6 8.5Z"/></svg>
                      <span class="text-xs font-semibold uppercase tracking-wide text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded flex-shrink-0">
                        {{ viewTab === 'weekly' ? epicGroup.epic : epicBadgeLabel(epicGroup.epic) }}
                      </span>
                      <div class="flex flex-col gap-1 min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs font-bold text-indigo-700 leading-tight">{{ epicGroup.epic }}</span>
                          <template v-if="epicGroup.epicStatus || (epicDevSlug(epicGroup.epic) && devStatusMap[epicDevSlug(epicGroup.epic)!])">
                            <span :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1', (DEV_STATUS_BADGE[epicGroup.epicStatus ?? devStatusMap[epicDevSlug(epicGroup.epic)!]] ?? { cls: 'bg-slate-100 text-slate-400 ring-slate-200' }).cls]">
                              {{ (DEV_STATUS_BADGE[epicGroup.epicStatus ?? devStatusMap[epicDevSlug(epicGroup.epic)!]] ?? { label: epicGroup.epicStatus ?? devStatusMap[epicDevSlug(epicGroup.epic)!] }).label }}
                            </span>
                          </template>
                        </div>
                        <div class="flex flex-wrap gap-1">
                          <span
                            v-for="sec in epicGroup.sections"
                            :key="sec.section"
                            class="inline-flex items-center gap-1 text-xs text-indigo-500 bg-white border border-indigo-100 rounded px-1.5 py-0.5 leading-none"
                          >
                            {{ sec.section === '—' ? '(ไม่มีหมวด)' : sec.section }}
                            <span class="text-indigo-300 font-mono">{{ sec.tasks.length }}</span>
                          </span>
                        </div>
                      </div>
                      <span class="ml-auto text-xs text-indigo-400 flex-shrink-0 mt-0.5">{{ epicGroup.total }} items</span>
                    </div>
                  </td>
                </tr>

                <template v-if="!collapsedCategories.has('epic:' + epicGroup.epic)">
                  <template v-for="secGroup in epicGroup.sections" :key="epicGroup.epic + ':' + secGroup.section">
                    <!-- ── Section row ── -->
                    <tr
                      class="bg-slate-50 border-y border-slate-100 transition-colors select-none"
                      :class="secGroup.tasks.length > 0 ? 'cursor-pointer hover:bg-slate-100' : ''"
                      @click="secGroup.tasks.length > 0 && toggleCollapse(epicGroup.epic + ':' + secGroup.section)"
                    >
                      <td colspan="7" class="px-6 py-1.5 pl-10">
                        <div class="flex items-center gap-2">
                          <svg
                            v-if="secGroup.tasks.length > 0"
                            class="w-2.5 h-2.5 text-slate-400 flex-shrink-0 transition-transform"
                            :class="collapsedCategories.has(epicGroup.epic + ':' + secGroup.section) ? '-rotate-90' : ''"
                            viewBox="0 0 12 12" fill="currentColor"
                          ><path d="M6 8.5 1.5 4h9L6 8.5Z"/></svg>
                          <span v-else class="w-2.5 h-2.5 flex-shrink-0"/>
                          <span class="text-xs font-medium text-slate-600">{{ secGroup.section }}</span>
                          <template v-if="secGroup.storyStatus && DEV_STATUS_BADGE[secGroup.storyStatus]">
                            <span :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1', DEV_STATUS_BADGE[secGroup.storyStatus].cls]">
                              Dev {{ DEV_STATUS_BADGE[secGroup.storyStatus].label }}
                            </span>
                          </template>
                          <span v-if="secGroup.hasTC" class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200">TC</span>
                          <span v-if="secGroup.hasE2E" class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 ring-1 ring-teal-200">E2E</span>
                          <span class="ml-auto text-xs text-slate-400">{{ secGroup.tasks.length }}</span>
                        </div>
                      </td>
                    </tr>

                    <!-- ── Task rows ── -->
                    <template v-if="secGroup.tasks.length > 0 && !collapsedCategories.has(epicGroup.epic + ':' + secGroup.section)">
                      <tr v-if="false" class="bg-white border-b border-slate-50">
                        <td colspan="7" class="px-6 py-2 pl-14">
                          <span class="text-xs text-slate-400 italic">ยังไม่มี QA task สำหรับ story นี้</span>
                        </td>
                      </tr>
                      <tr
                        v-for="task in secGroup.tasks"
                        :key="task.id"
                        class="bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
                        :class="(task as any).isIgnoredToday ? 'opacity-40' : ''"
                      >
                        <td class="px-6 py-2.5 pl-14 w-[400px] max-w-[400px]">
                          <div class="flex items-center gap-2 min-w-0">
                            <!-- done/pending toggle -->
                            <button
                              class="flex-shrink-0 hover:scale-110 transition-transform"
                              @click.stop="tasksStore.toggleTask(task.id, activeProjectId, !task.isChecked)"
                            >
                              <svg v-if="task.isChecked" class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0Z"/>
                                <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z" clip-rule="evenodd"/>
                              </svg>
                              <svg v-else class="w-3.5 h-3.5 text-slate-300 hover:text-slate-400" viewBox="0 0 16 16" fill="currentColor">
                                <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z" clip-rule="evenodd"/>
                              </svg>
                            </button>
                            <span
                              v-if="task.isLinked"
                              class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-mono font-semibold flex-shrink-0"
                            >{{ (task as any).jiraKey }}</span>
                            <div class="flex flex-col min-w-0">
                              <span
                                class="line-clamp-2 text-xs leading-relaxed"
                                :class="task.isChecked ? 'line-through text-slate-400' : 'text-slate-700'"
                              >{{ stripMd(task.rawText) }}</span>
                              <span class="text-[10px] text-slate-300 font-mono truncate">{{ task.fileRelativePath }}:{{ task.lineNumber }}</span>
                            </div>
                            <span
                              v-if="extractRole(task.rawText) === 'QA'"
                              class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold bg-indigo-600 text-white flex-shrink-0"
                            >QA</span>
                            <span
                              v-else-if="extractRole(task.rawText) === 'DEV'"
                              class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold bg-rose-500 text-white flex-shrink-0"
                            >DEV</span>
                          </div>
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <span
                            v-if="classifyTask(task.rawText)"
                            :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1',
                              QA_CATEGORIES.find(c => c.id === classifyTask(task.rawText))?.badge ?? '']"
                          >{{ QA_CATEGORIES.find(c => c.id === classifyTask(task.rawText))?.label }}</span>
                          <span v-else class="text-xs text-slate-300">—</span>
                        </td>
                        <td class="px-4 py-2.5">
                          <span v-if="task.sprint" class="text-xs text-slate-500 whitespace-nowrap">{{ task.sprint }}</span>
                          <span v-else class="text-xs text-slate-300">—</span>
                        </td>
                        <td class="px-4 py-2.5">
                          <span v-if="task.dueDate" class="text-xs text-slate-500 font-mono whitespace-nowrap">{{ task.dueDate }}</span>
                          <span v-else class="text-xs text-slate-300">—</span>
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <template v-if="devStatusBadge(task)">
                            <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1', devStatusBadge(task)!.cls]">
                              {{ devStatusBadge(task)!.label }}
                            </span>
                          </template>
                          <span v-else class="text-xs text-slate-300">—</span>
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1', qaWorkBadge(task).cls]">
                            {{ qaWorkBadge(task).label }}
                          </span>
                        </td>
                      </tr>
                    </template>
                  </template>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props { initialView?: ViewTab }
const props = withDefaults(defineProps<Props>(), { initialView: 'qa' })
import { useProjectsStore } from '@renderer/stores/projects'
import { useTasksStore } from '@renderer/stores/tasks'
import { useDangerZoneStore } from '@renderer/stores/dangerZone'
import { useJiraStore } from '@renderer/stores/jira'
import DangerZoneBanner from '@renderer/components/dashboard/DangerZoneBanner.vue'
import LoadingSpinner from '@renderer/components/shared/LoadingSpinner.vue'
import ErrorMessage from '@renderer/components/shared/ErrorMessage.vue'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const jiraStore = useJiraStore()
const dangerZoneStore = useDangerZoneStore()
const isSyncing = ref(false)
const activeProjectId = ref<string>('')

const activeUntracked = computed(() => tasksStore.getUntracked(activeProjectId.value))
const activeLinked = computed(() => tasksStore.getLinked(activeProjectId.value))

type QaCategory = 'test-plan' | 'integration-test' | 'e2e' | 'script' | 'manual' | 'other-qa'
type TaskRole = 'QA' | 'DEV'

function extractRole(text: string): TaskRole | null {
  if (/\(QA\)/i.test(text)) return 'QA'
  if (/\(DEV\)/i.test(text)) return 'DEV'
  return null
}

const QA_CATEGORIES: Array<{
  id: QaCategory
  label: string
  badge: string
  patterns: RegExp
}> = [
  {
    id: 'test-plan',
    label: 'Test Plan',
    badge: 'bg-purple-50 text-purple-700 ring-purple-200',
    patterns: /test\s*plan|test\s*strategy|test\s*suite|test\s*case|แผนทดสอบ|acceptance\s*criteria/i,
  },
  {
    id: 'integration-test',
    label: 'Integration',
    badge: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    patterns: /integration\s*test|integ(r|ress)ation|api\s*test|contract\s*test/i,
  },
  {
    id: 'e2e',
    label: 'E2E',
    badge: 'bg-teal-50 text-teal-700 ring-teal-200',
    patterns: /\be2e\b|playwright|cypress|end.to.end|e2e\s*spec/i,
  },
  {
    id: 'script',
    label: 'Script',
    badge: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    patterns: /\bscript\b|automation|automate|automated\s*test/i,
  },
  {
    id: 'manual',
    label: 'Manual',
    badge: 'bg-orange-50 text-orange-700 ring-orange-200',
    patterns: /manual\s*test|manual\s*qa|แมนนัว|ทดสอบมือ|manual\s*check|manual\s*verify/i,
  },
]

interface StoryInfo {
  slug: string
  label: string
  status: string
  jiraKeys: string[]
  epicSlug: string
}

interface EpicInfo {
  slug: string
  number: number
  status: string
  stories: StoryInfo[]
}

interface StoryCoverage {
  hasTC: boolean
  hasE2E: boolean
  featureSlug: string
}

const devStatusMap = ref<Record<string, string>>({})
const gitDateMap = ref<Record<string, string>>({})
const epicHierarchy = ref<EpicInfo[]>([])
const tcCoverage = ref<Record<string, StoryCoverage>>({})

const DEV_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  done:            { label: 'Done',       cls: 'bg-slate-100 text-slate-600 ring-slate-300' },
  'in-progress':   { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  review:          { label: 'In Review',  cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  'ready-for-dev': { label: 'Ready',      cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  backlog:         { label: 'Backlog',    cls: 'bg-slate-100 text-slate-500 ring-slate-200' },
  descoped:        { label: 'Descoped',   cls: 'bg-gray-100 text-gray-400 ring-gray-200' },
  optional:        { label: 'Optional',   cls: 'bg-gray-100 text-gray-400 ring-gray-200' },
}

function devStatusBadge(task: { isLinked: boolean }): { label: string; cls: string } | null {
  const key = (task as any).jiraKey as string | undefined
  if (!key) return null
  const status = devStatusMap.value[key]
  if (!status) return null
  return DEV_STATUS_BADGE[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500 ring-slate-200' }
}

const JIRA_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  TODO:        { label: 'Todo',        cls: 'bg-slate-100 text-slate-600 ring-slate-200' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  IN_REVIEW:   { label: 'In Review',   cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  DONE:        { label: 'Done',        cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  BLOCKED:     { label: 'Blocked',     cls: 'bg-red-50 text-red-700 ring-red-200' },
  FAILED:      { label: 'Failed',      cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
}

function qaWorkBadge(task: { isChecked: boolean }): { label: string; cls: string } {
  if (task.isChecked) return { label: 'Done', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
  return { label: 'Pending', cls: 'bg-slate-100 text-slate-500 ring-slate-200' }
}

function jiraStatusBadge(task: { isLinked: boolean }): { label: string; cls: string } {
  const jiraTicket = (task as any).jiraTicket
  if (task.isLinked && jiraTicket?.status) {
    return JIRA_STATUS_BADGE[jiraTicket.status] ?? { label: jiraTicket.status, cls: 'bg-slate-100 text-slate-600 ring-slate-200' }
  }
  if (task.isLinked) return { label: 'Linked', cls: 'bg-indigo-50 text-indigo-600 ring-indigo-200' }
  return { label: 'ยังไม่สร้าง', cls: 'bg-amber-50 text-amber-700 ring-amber-200' }
}

function classifyTask(text: string): QaCategory | null {
  for (const cat of QA_CATEGORIES) {
    if (cat.patterns.test(text)) return cat.id
  }
  return null
}

const collapsedCategories = ref<Set<string>>(new Set())
const searchQuery = ref('')
const activeCategories = ref<Set<QaCategory>>(new Set())
const activeRole = ref<TaskRole | null>(null)

type ViewTab = 'today' | 'yesterday' | 'weekly' | 'qa'
const VIEW_TABS: { id: ViewTab; label: string }[] = [
  { id: 'qa', label: 'QA View' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'today', label: 'Today' },
]
const viewTab = ref<ViewTab>(props.initialView)

const DEV_DONE_STATUSES = new Set(['done', 'in-review'])

interface QaStoryRow {
  epicNum: number
  epicLabel: string
  storyLabel: string
  jiraKeys: string[]
  hasAPI: boolean
  hasIntegration: boolean
  hasUI: boolean
  hasE2E: boolean
  hasScript: boolean
  dueDate?: string
  updatedDate?: string
  gitDate?: string
  devStatus?: string
}
type QaGroup = { id: string; label: string; color: string; dot: string; stories: QaStoryRow[] }

const qaGroups = computed<QaGroup[]>(() => {
  if (!epicHierarchy.value.length) return []
  const groups: QaGroup[] = [
    { id: 'needs-tc',  label: 'ต้องเขียน TC',   color: 'text-red-600',    dot: '🔴', stories: [] },
    { id: 'needs-e2e', label: 'ต้องเขียน E2E',  color: 'text-amber-600',  dot: '🟡', stories: [] },
    { id: 'ready',     label: 'พร้อมทดสอบ',      color: 'text-emerald-600',dot: '🟢', stories: [] },
    { id: 'waiting',   label: 'รอ Dev',           color: 'text-slate-400',  dot: '⚪', stories: [] },
  ]
  for (const epic of epicHierarchy.value) {
    for (const story of epic.stories) {
      const cov = tcCoverage.value[story.slug]
      const isDone = DEV_DONE_STATUSES.has(story.status)
      const dueDate = story.jiraKeys
        .map(k => jiraStore.getTicket(k)?.dueDate)
        .find(d => !!d)
      const updatedDate = story.jiraKeys
        .map(k => jiraStore.getTicket(k)?.updatedDate)
        .find(d => !!d)
      const gitDate = story.jiraKeys
        .map(k => gitDateMap.value[k])
        .find(d => !!d)
      const row: QaStoryRow = {
        epicNum: epic.number,
        epicLabel: `Epic ${epic.number}`,
        storyLabel: story.label,
        jiraKeys: story.jiraKeys,
        hasAPI: cov?.hasAPI ?? false,
        hasIntegration: cov?.hasIntegration ?? false,
        hasUI: cov?.hasUI ?? false,
        hasE2E: cov?.hasE2E ?? false,
        hasScript: cov?.hasScript ?? false,
        dueDate,
        updatedDate,
        gitDate,
        devStatus: devStatusMap.value[story.slug] ?? story.status,
      }
      // Date filter for non-QA views
      const tab = viewTab.value
      if (tab === 'today' && dueDate !== todayStr) continue
      if (tab === 'yesterday' && dueDate !== yesterdayStr) continue
      if (tab === 'weekly' && (!dueDate || dueDate < todayStr || dueDate > weekEndStr)) continue

      const hasAnyTC = (cov?.hasAPI || cov?.hasIntegration || cov?.hasUI) ?? false
      if (!isDone) groups[3].stories.push(row)
      else if (!hasAnyTC) groups[0].stories.push(row)
      else if (!cov?.hasE2E) groups[1].stories.push(row)
      else groups[2].stories.push(row)
    }
  }
  return groups.filter(g => g.stories.length > 0)
})

const todayStr = new Date().toISOString().slice(0, 10)
const yesterdayStr = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) })()
const weekEndStr = (() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10) })()

function toggleCollapse(id: string) {
  const s = new Set(collapsedCategories.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsedCategories.value = s
}

function toggleCategory(id: QaCategory) {
  const s = new Set(activeCategories.value)
  s.has(id) ? s.delete(id) : s.add(id)
  activeCategories.value = s
}

function toggleRole(role: TaskRole) {
  activeRole.value = activeRole.value === role ? null : role
}

function stripMd(text: string): string {
  let s = text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/^\s*#+\s*/, '')
    .trim()
  // Remove trailing "(AC1)", "(AC1, AC3)", "(AC: 1, 4)"
  s = s.replace(/\s*\(AC[\d,\s:]+\)\s*$/i, '').trim()
  // Cut at " — " when there's enough prefix (> 15 chars) — strips JSON/code after em-dash
  const dashIdx = s.indexOf(' — ')
  if (dashIdx > 15) s = s.slice(0, dashIdx)
  // Cut at " (" when there's enough prefix (> 20 chars) — strips inline notes
  const parenIdx = s.search(/\s\(/)
  if (parenIdx > 20) s = s.slice(0, parenIdx)
  return s
}

const jiraSiteBase = ref('')

function buildJiraBase(site: string): string {
  if (!site) return ''
  return site.startsWith('http') ? site.replace(/\/$/, '') : `https://${site}.atlassian.net`
}

function openJira(keyOrUrl: string) {
  if (!keyOrUrl) return
  const url = keyOrUrl.startsWith('http')
    ? keyOrUrl
    : `${jiraSiteBase.value}/browse/${keyOrUrl}`
  if (!url.startsWith('http')) return
  window.qaApi.openExternal(url)
}

function fileLabel(fileRelativePath: string): string {
  const name = fileRelativePath.split('/').pop()?.replace(/\.md$/i, '') ?? fileRelativePath
  return name.replace(/^\d+[-_.]\d*[-_.]?/, '').replace(/[-_]/g, ' ').trim() || name
}

function epicBadgeLabel(epicText: string): string {
  const m = epicText.match(/\bepic\s+(\d+)\b/i)
  return m ? `Epic ${m[1]}` : epicText.slice(0, 12)
}

function epicDevSlug(epicText: string): string | null {
  const m = epicText.match(/\bepic\s+(\d+)\b/i)
  return m ? `epic-${m[1]}` : null
}

const activeProject = computed(() =>
  projectsStore.projects.find((p) => p.id === activeProjectId.value)
)

const groupedTasks = computed(() => {
  const allTasks = [
    ...activeUntracked.value.map((t) => ({ ...t, isLinked: false as const })),
    ...activeLinked.value.map((t) => ({ ...t, isLinked: true as const })),
  ]

  type TaskItem = (typeof allTasks)[number]
  type SectionGroup = { section: string; tasks: TaskItem[]; storyStatus?: string; hasTC?: boolean; hasE2E?: boolean; storySlug?: string }
  type EpicGroup = { epic: string; epicStatus?: string; sections: SectionGroup[]; total: number }

  const q = searchQuery.value.toLowerCase().trim()
  const cats = activeCategories.value
  const role = activeRole.value
  const tab = viewTab.value
  const currentSprint = activeProject.value?.config.currentSprint

  const weekLater = new Date()
  weekLater.setDate(weekLater.getDate() + 7)
  const weekLaterStr = weekLater.toISOString().slice(0, 10)

  const filtered: TaskItem[] = []
  for (const t of allTasks) {
    if (q && !t.rawText.toLowerCase().includes(q)) continue
    if (cats.size > 0) {
      const cat = classifyTask(t.rawText)
      if (!cat || !cats.has(cat)) continue
    }
    if (role && extractRole(t.rawText) !== role) continue

    if (tab === 'yesterday') {
      if (t.dueDate !== yesterdayStr) continue
    } else if (tab === 'today') {
      const due = t.dueDate
      const isOverdue = due && due < todayStr && !t.isChecked
      const isDueToday = due === todayStr
      if (!isDueToday && !isOverdue) continue
    } else if (tab === 'weekly') {
      const due = t.dueDate
      const inSprint = currentSprint ? t.sprint === currentSprint : true
      const dueThisWeek = due && due >= todayStr && due <= weekLaterStr
      if (!dueThisWeek && !inSprint) continue
    }

    filtered.push(t)
  }

  // Weekly: group by sprint
  if (tab === 'weekly') {
    const sprintMap = new Map<string, Map<string, TaskItem[]>>()
    for (const t of filtered) {
      const sprintKey = t.sprint ?? '(ไม่มี Sprint)'
      const section = t.section ?? t.epic ?? fileLabel(t.fileRelativePath)
      if (!sprintMap.has(sprintKey)) sprintMap.set(sprintKey, new Map())
      const secMap = sprintMap.get(sprintKey)!
      if (!secMap.has(section)) secMap.set(section, [])
      secMap.get(section)!.push(t)
    }
    return [...sprintMap.entries()].map(([epic, secMap]) => ({
      epic,
      sections: [...secMap.entries()].map(([section, tasks]) => ({ section, tasks })),
      total: [...secMap.values()].reduce((s, arr) => s + arr.length, 0),
    })) as EpicGroup[]
  }

  // Hierarchy mode: use sprint-status.yaml Epic → Story structure
  if (epicHierarchy.value.length > 0) {
    // Primary: match by filename pattern "N-M-..." → story N.M
    // This prevents tasks from story 3.8's file being placed under story 2.2
    // just because they mention TI-33 in passing.
    const fileStoryMap = new Map<string, TaskItem[]>()  // "3.8" → tasks
    const jiraTaskMap = new Map<string, TaskItem[]>()   // jiraKey → tasks (fallback only)
    const fileEpicTasks = new Map<number, TaskItem[]>() // epic-N folder tasks

    for (const t of filtered) {
      const fileM = t.fileRelativePath.match(/\/(\d+)-(\d+)-[^/]+\.md$/)
      if (fileM) {
        const storyNum = `${fileM[1]}.${fileM[2]}`
        if (!fileStoryMap.has(storyNum)) fileStoryMap.set(storyNum, [])
        fileStoryMap.get(storyNum)!.push(t)
      } else {
        // No story-numbered filename: try section heading "Story N.M", then jiraKey, then epic folder
        const sectionM = (t.section ?? '').match(/Story\s+(\d+)\.(\d+)/i)
        if (sectionM) {
          const storyNum = `${sectionM[1]}.${sectionM[2]}`
          if (!fileStoryMap.has(storyNum)) fileStoryMap.set(storyNum, [])
          fileStoryMap.get(storyNum)!.push(t)
          continue
        }
        const jiraKey = (t as any).jiraKey as string | undefined
        if (jiraKey) {
          if (!jiraTaskMap.has(jiraKey)) jiraTaskMap.set(jiraKey, [])
          jiraTaskMap.get(jiraKey)!.push(t)
        }
        const em = t.fileRelativePath.match(/\/epic-(\d+)\//i)
        if (em) {
          const epicNum = parseInt(em[1])
          if (!fileEpicTasks.has(epicNum)) fileEpicTasks.set(epicNum, [])
          fileEpicTasks.get(epicNum)!.push(t)
        }
      }
    }

    return epicHierarchy.value.map((epic) => {
      const sections: SectionGroup[] = epic.stories.map((story) => {
        const numM = story.slug.match(/^(\d+)-(\d+)/)
        const storyNum = numM ? `${numM[1]}.${numM[2]}` : null

        const tasks: TaskItem[] = []
        // 1st: tasks whose FILE is this story's implementation file
        if (storyNum) tasks.push(...(fileStoryMap.get(storyNum) ?? []))
        // 2nd: tasks from epic-N/test-artifacts that carry this story's jira key
        for (const jk of story.jiraKeys) {
          tasks.push(...(jiraTaskMap.get(jk) ?? []))
        }

        const cov = tcCoverage.value[story.slug]
        return {
          section: story.label,
          storyStatus: story.status,
          storySlug: story.slug,
          hasTC: cov?.hasTC,
          hasE2E: cov?.hasE2E,
          tasks,
        }
      })

      const misc = fileEpicTasks.get(epic.number) ?? []
      if (misc.length > 0) {
        sections.push({ section: '(misc)', tasks: misc })
      }

      return {
        epic: `Epic ${epic.number}`,
        epicStatus: epic.status,
        sections,
        total: sections.reduce((s, sec) => s + sec.tasks.length, 0),
      }
    }) as EpicGroup[]
  }

  // Fallback: group by H1 epic → H2 section from scanned tasks
  const epicMap = new Map<string, Map<string, TaskItem[]>>()
  for (const t of filtered) {
    const epic = t.epic ?? fileLabel(t.fileRelativePath)
    const section = t.section ?? '—'
    if (!epicMap.has(epic)) epicMap.set(epic, new Map())
    const secMap = epicMap.get(epic)!
    if (!secMap.has(section)) secMap.set(section, [])
    secMap.get(section)!.push(t)
  }
  return [...epicMap.entries()].map(([epic, secMap]) => ({
    epic,
    sections: [...secMap.entries()].map(([section, tasks]) => ({ section, tasks })),
    total: [...secMap.values()].reduce((s, arr) => s + arr.length, 0),
  })) as EpicGroup[]
})

const subtitle = computed(() => {
  const n = projectsStore.projects.length
  if (n === 0) return 'No projects'
  const total = projectsStore.projects.reduce((s, p) => s + tasksStore.untrackedCount(p.id), 0)
  return `${n} project${n > 1 ? 's' : ''} · ${total} untracked`
})

async function loadSprintStatus(projectId: string) {
  const result = await window.qaApi.getSprintStatus(projectId)
  devStatusMap.value = result.devStatusMap
  epicHierarchy.value = result.epicHierarchy
  tcCoverage.value = result.tcCoverage ?? {}
  gitDateMap.value = result.gitDateMap ?? {}

  // Fetch Jira tickets for all story jiraKeys so due dates are available
  const allKeys = result.epicHierarchy.flatMap(e => e.stories.flatMap(s => s.jiraKeys))
  if (allKeys.length > 0) {
    jiraStore.fetchTickets(allKeys).catch(() => {/* non-blocking */})
  }
}

async function loadProjects() {
  await projectsStore.fetchProjects()
  if (!activeProjectId.value && projectsStore.projects.length > 0) {
    activeProjectId.value = projectsStore.projects[0].id
  }
  for (const project of projectsStore.projects) {
    tasksStore.scanProject(project.id)
  }
  if (activeProjectId.value) {
    await loadSprintStatus(activeProjectId.value)
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

watch(
  () => projectsStore.projects,
  (projects) => {
    if (!activeProjectId.value && projects.length > 0) {
      activeProjectId.value = projects[0].id
    }
  }
)

watch(activeProjectId, async (id) => {
  if (!id) return
  await loadSprintStatus(id)
})

onMounted(async () => {
  const settings = await window.qaApi.getJiraSettings()
  if (settings?.site) jiraSiteBase.value = buildJiraBase(settings.site)
  loadProjects()
})
</script>
