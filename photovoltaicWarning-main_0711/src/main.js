import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import '@/assets/main.scss'

// 引入 Element Plus 及其样式和中文语言包
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 使用 Pinia 和持久化插件
app.use(createPinia().use(persist))

// 使用路由
app.use(router)

// 使用 Element Plus 并设置语言为中文
app.use(ElementPlus, {
  locale: zhCn
})

// 挂载应用
app.mount('#app')
