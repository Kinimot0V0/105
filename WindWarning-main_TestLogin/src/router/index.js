import { createRouter, createWebHashHistory  } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/LoginPage.vue')
    },

    {
      path: '/',
      redirect: '/login'
    },
    // {
    //   path: '/',
    //   redirect: '/intelligentEarlyWarning'
    // },
    {
      path: '/layout',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      children: [
        {
          path: '/home',
          component: () => import('@/views/home/index.vue')
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
          path: '/measurePoint',
          component: () => import('@/views/measurePoint/index.vue')
        },
        {
          path: '/modelInfo',
          component: () => import('@/views/modelInfo/index.vue')
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
    }
  ]
})

export default router
