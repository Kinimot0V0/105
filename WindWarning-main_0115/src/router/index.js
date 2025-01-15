import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/intelligentEarlyWarning/overview'
    },

    {
      path: '/intelligentEarlyWarning',
      component: () => import('@/views/layout/LayoutWarning.vue'),
      redirect: '/intelligentEarlyWarning/overview',
      children: [
        {
          path: 'overview',
          name: 'overview',
          component: () => import('@/views/overview/index.vue')
        },
        {
          path: 'todo',
          name: 'todo',
          component: () => import('@/views/todo/index.vue')
        },
        {
          path: 'realWarning',
          name: 'realWarning',
          component: () => import('@/components/warningList/realWarning.vue')
        },
        {
          path: 'historyWarning',
          name: 'historyWarning',
          component: () => import('@/components/warningList/historyWarning.vue')
        },
        {
          path: 'report',
          name: 'report',
          component: () => import('@/views/report/index.vue')
        }
      ]
    },
    {
      path: '/pendingWarning',
      component: () => import('@/components/pendingWarning/pendingWarning.vue')
    },
    {
      path: '/pendingReport',
      component: () => import('@/components/pendingReport/report.vue')
    }
  ]
})

export default router
