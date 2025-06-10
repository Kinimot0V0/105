<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 实时时间处理
const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 导航函数
function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="nav-container">
    <!-- 左侧Logo区域 -->
    <div class="logo-placeholder">中国核电</div>

    <!-- 中间系统名称 -->
    <div class="system-title">卡件通用检测评估系统</div>

    <!-- 右侧区域 -->
    <div class="right-section">
      <!-- 系统时间 -->
      <div class="system-time">
        {{ currentTime }}
      </div>

      <!-- 导航菜单 -->
      <div class="menu-container">
        <!-- 修改所有导航项的激活判断逻辑 -->
        <div
          class="menu-item"
          :class="{ active: route.path.startsWith('/cardConfig') }"
          @click="navigateTo('/cardConfig')"
        >
          卡件配置
        </div>
        <div
          class="menu-item"
          :class="{ active: route.path.startsWith('/cardTest') }"
          @click="navigateTo('/cardTest')"
        >
          卡件试验
        </div>
        <div
          class="menu-item"
          :class="{ active: route.path.startsWith('/result') }"
          @click="navigateTo('/result')"
        >
          结果分析
        </div>
      </div>
    </div>
  </div>

  <!-- 路由内容展示 -->
  <div class="content">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.nav-container {
  display: flex;
  align-items: center;
  justify-content: center; /* 关键修改：让内容在容器中居中 */
  height: 60px;
  background-color: transparent;
  color: white;
  padding: 0 20px;
  position: relative; /* 为绝对定位子元素提供参考 */
}

/* 系统名称居中定位 */
.system-title {
  position: absolute; /* 使用绝对定位实现精确居中 */
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8); /* 增强文字阴影提高可读性 */
  pointer-events: none; /* 防止点击名称影响其他元素 */
}

.logo-placeholder {
  width: 150px;
  height: 40px;
  background-color: transparent;
  border-radius: 4px;
}

/* 右侧区域改为靠右定位 */
.right-section {
  margin-left: auto; /* 将右侧区域推到右边 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.system-time {
  text-align: right;
  font-size: 18px;
  padding-right: 15px;
  margin-top: 5px;
  margin-bottom: 5px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5); /* 添加文字阴影 */
}

.menu-container {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.menu-item {
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
  font-size: 18px;
  background-color: rgba(4, 44, 84, 0.7); /* 半透明背景 */
}

.menu-item:hover {
  background-color: rgba(248, 163, 6, 0.5); /* 半透明悬停效果 */
}

.menu-item.active {
  background-color: #f8a306; /* 选中背景色 */
  color: white;
  font-weight: 500;
}

/* 路由内容区域 */
.content {
  flex-grow: 1;
  overflow: auto;
  /* padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
}
</style>
