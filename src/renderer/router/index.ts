import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@renderer/pages/HomePage.vue'),
  },
  {
    path: '/qa',
    name: 'dashboard',
    component: () => import('@renderer/pages/DashboardPage.vue'),
    props: { initialView: 'qa' },
  },
  {
    path: '/weekly',
    name: 'weekly',
    component: () => import('@renderer/pages/DashboardPage.vue'),
    props: { initialView: 'weekly' },
  },
  {
    path: '/today',
    name: 'today',
    component: () => import('@renderer/pages/DashboardPage.vue'),
    props: { initialView: 'today' },
  },
  {
    path: '/yesterday',
    name: 'yesterday',
    component: () => import('@renderer/pages/DashboardPage.vue'),
    props: { initialView: 'yesterday' },
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
    path: '/sprint',
    name: 'sprint',
    component: () => import('@renderer/pages/SprintPage.vue'),
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
