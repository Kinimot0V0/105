import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/LoginPage.vue')
    },

    {
      path: '/',
      redirect: '/login'
    },

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

// 路由守卫，检查用户角色
router.beforeEach((to, from, next) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const isAuthenticated = userInfo && userInfo.username && userInfo.role
  const userRole = userInfo?.role || 'user'

  // 如果用户没有登录，强制跳转到登录页
  if (!isAuthenticated && to.path !== '/login') {
    next('/login')
  } else if (isAuthenticated) {
    // 根据角色限制访问路由
    if (userRole === 'user') {
      // 普通用户
      const restrictedPaths = ['/measurePoint', '/modelInfo']
      if (restrictedPaths.includes(to.path)) {
        next('/intelligentEarlyWarning') // 如果访问受限，跳转到智能预警
      } else {
        next() // 允许访问
      }
    } else if (userRole === 'admin') {
      next() // 管理员可以访问所有页面
    }
  } else {
    next() // 如果已经登录，继续访问
  }
})

export default router
