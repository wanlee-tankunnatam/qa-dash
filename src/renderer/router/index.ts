import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@renderer/pages/DashboardPage.vue'),
  },
  {
    path: '/project/:id',
    name: 'project',
    component: () => import('@renderer/pages/ProjectPage.vue'),
  },
  {
    path: '/ai',
    name: 'ai-terminal',
    component: () => import('@renderer/pages/AITerminalPage.vue'),
  },
  {
    path: '/draft',
    name: 'draft-review',
    component: () => import('@renderer/pages/DraftReviewPage.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@renderer/pages/SettingsPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
