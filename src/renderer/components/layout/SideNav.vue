<template>
  <nav class="w-52 flex-shrink-0 bg-slate-900 flex flex-col h-full">
    <!-- Logo -->
    <div class="px-4 pt-5 pb-4 flex items-center gap-2.5">
      <div class="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="white"/>
          <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
          <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
          <rect x="8" y="8" width="5" height="5" rx="1" fill="white"/>
        </svg>
      </div>
      <span class="text-sm font-semibold text-white tracking-tight">QADash</span>
    </div>

    <!-- Workspace selector -->
    <WorkspaceSelectorDropdown />

    <!-- Nav items -->
    <div class="flex-1 px-2 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all"
        :class="
          isActive(item.to)
            ? 'bg-indigo-600 text-white'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        "
      >
        <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>

    <!-- Bottom version -->
    <div class="px-4 py-3 border-t border-slate-800">
      <span class="text-xs text-slate-600">v0.1.0-alpha</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useRoute } from 'vue-router'
import WorkspaceSelectorDropdown from '../workspaces/WorkspaceSelectorDropdown.vue'

const route = useRoute()

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// Inline SVG icon components
const IconDashboard = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('rect', { x: '1', y: '1', width: '6', height: '6', rx: '1' }),
    h('rect', { x: '9', y: '1', width: '6', height: '6', rx: '1' }),
    h('rect', { x: '1', y: '9', width: '6', height: '6', rx: '1' }),
    h('rect', { x: '9', y: '9', width: '6', height: '6', rx: '1' }),
  ])

const IconAI = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', {
      d: 'M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Zm1 0v8h10V3H3Zm1 2h1v1H4V5Zm3 0h5v1H7V5ZM4 8h1v1H4V8Zm3 0h3v1H7V8Z',
    }),
    h('path', { d: 'M6 13h4v1H6v-1Z' }),
  ])

const IconSettings = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M8 5a3 3 0 1 0 0 6A3 3 0 0 0 8 5ZM6 8a2 2 0 1 1 4 0A2 2 0 0 1 6 8Z',
    }),
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M6.5 1h3l.5 1.5 1.3.75 1.5-.5 2.12 2.12-.5 1.5L15 7.5v3l-1.58.63-.5 1.5 .5 1.5-2.12 2.12-1.5-.5-1.3.75L8 15H5.5l-.5-1.5-1.3-.75-1.5.5L0 11.13l.5-1.5L-.08 8.5v-3L1.5 4.87l.5-1.5L1.5 1.75 3.62-.37l1.5.5 1.3-.75L7 0h-.5ZM5.62 2H8h2.38l.38 1.13.88.5.88.5L13.72 4l1.42 1.42-.12 1.3-.5.88-.5.88V8v1.5l.12.88.5.88.12 1.3-1.42 1.42-1.18-.12-.88-.5-.88.5-.38 1.13H8H5.62l-.38-1.13-.88-.5-.88-.5L2.28 12 .86 10.58l.12-1.3.5-.88.5-.88V8V6.5l-.12-.88-.5-.88-.12-1.3L2.28 4l1.18.12.88.5.88-.5.38-1.13Z',
    }),
  ])

const IconHome = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { d: 'M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v6A1.5 1.5 0 0 0 3 15h4v-4h2v4h4a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-.146-.354L8.354 1.146Z' }),
  ])

const IconSprint = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { d: 'M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41Zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9Z' }),
    h('path', { 'fill-rule': 'evenodd', d: 'M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3ZM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1Z' }),
  ])

const IconCalendar = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { d: 'M4 .5a.5.5 0 0 0-1 0V1H1.5A1.5 1.5 0 0 0 0 2.5v11A1.5 1.5 0 0 0 1.5 15h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 14.5 1H13V.5a.5.5 0 0 0-1 0V1H4V.5ZM1 5h14v8.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V5Zm1-3h12a.5.5 0 0 1 .5.5V4H1V2.5A.5.5 0 0 1 1.5 2Z' }),
  ])

const IconToday = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { d: 'M4 .5a.5.5 0 0 0-1 0V1H1.5A1.5 1.5 0 0 0 0 2.5v11A1.5 1.5 0 0 0 1.5 15h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 14.5 1H13V.5a.5.5 0 0 0-1 0V1H4V.5ZM1 5h14v8.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V5Zm6 2h2v2H7V7Z' }),
  ])

const IconKey = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { 'fill-rule': 'evenodd', d: 'M11.5 1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM5.5 5.5a6 6 0 1 1 11 2.11l2.7 2.7a.75.75 0 0 1-1.06 1.06L15.44 9.67A6 6 0 0 1 5.5 5.5Zm3.25 5.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H10v1.25a.75.75 0 0 1-1.5 0V11a.75.75 0 0 1 .75-.75v.5Z', 'clip-rule': 'evenodd' }),
  ])

const IconGapCheck = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', {
      d: 'M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2Zm1 0v12h8V2H4Zm2 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Z',
    }),
  ])

const IconCoverage = () =>
  h('svg', { viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', {
      d: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7 4h2v5H7V4Zm3 7H6v1h4v-1Z',
    }),
  ])

const navItems = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/qa', label: 'Tasks', icon: IconDashboard },
  { to: '/sprint', label: 'Sprint', icon: IconSprint },
  { to: '/ai', label: 'AI Terminal', icon: IconAI },
  { to: '/gapcheck', label: 'Gap Check', icon: IconGapCheck },
  { to: '/coverage', label: 'Test Coverage', icon: IconCoverage },
  { to: '/credentials', label: 'Credentials', icon: IconKey },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]
</script>
