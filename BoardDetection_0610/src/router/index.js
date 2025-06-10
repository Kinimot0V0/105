import { createRouter, createWebHashHistory } from 'vue-router'

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
          path: '/cardConfig',
          component: () => import('@/views/layout/layoutCardConfig.vue'),
          redirect: '/cardConfig/baseInfo',
          children: [
            {
              path: 'baseInfo',
              name: 'baseInfo',
              component: () => import('@/components/cardConfig/baseInfo.vue')
            },
            {
              path: 'componentCalibration',
              name: 'componentCalibration',
              component: () => import('@/components/cardConfig/componentCalibration.vue')
            }
          ]
        },
        {
          path: '/cardTest',
          component: () => import('@/views/layout/layoutCardTest.vue'),
          redirect: '/cardTest/addTest',
          children: [
            {
              path: 'addTest',
              name: 'addTest',
              component: () => import('@/components/cardTest/addTest.vue')
            },
            {
              path: 'historyTest',
              name: 'historyTest',
              component: () => import('@/components/cardTest/historyTest.vue')
            }
          ]
        },
        {
          path: '/result',
          component: () => import('@/views/result/index.vue')
        }
      ]
    }
  ]
})

export default router
