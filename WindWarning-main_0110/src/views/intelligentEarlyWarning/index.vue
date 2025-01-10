<script setup>
import { ref, onMounted } from 'vue'
import Overview from '@/views/overview/index.vue'
import RealWarning from '@/components/warningList/realWarning.vue'
import HistoryWarning from '@/components/warningList/historyWarning.vue'
import Notice from '@/views/notice/index.vue'
import Todo from '@/views/todo/index.vue'

const navItems = [
  { label: '概览', path: '/overview' },
  { label: '待办', path: '/todo' },
  { label: '实时预警', path: '/realWarning' },
  { label: '历史预警', path: '/historyWarning' },
  { label: '通知', path: '/notice' }
]

const currentView = ref('/overview')

const switchView = (path) => {
  currentView.value = path
}

// 初始默认显示概览页面
onMounted(() => {
  currentView.value = '/overview'
})
</script>
<template>
  <div class="container">
    <div class="button-group">
      <div
        v-for="(item, index) in navItems"
        :key="item.path"
        :class="[index === 0 ? 'trapezoid' : 'parallelogram', { active: currentView === item.path }]"
        @click="switchView(item.path)"
      >
        {{ item.label }}
      </div>
    </div>

    <div class="content-area">
      <Overview v-if="currentView === '/overview'" />
      <Todo v-if="currentView === '/todo'" />
      <RealWarning v-else-if="currentView === '/realWarning'" />
      <HistoryWarning v-else-if="currentView === '/historyWarning'" />
      <Notice v-else-if="currentView === '/notice'" />
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 10px;
  border: 1px solid #042c54;
}

.button-group {
  display: flex;
  align-items: stretch;
  padding: 0;
}

.trapezoid,
.parallelogram {
  position: relative;
  width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  cursor: pointer;
  background: linear-gradient(to bottom, #103255, #154970);
}

.trapezoid {
  clip-path: polygon(0 0, 80% 0, 100% 100%, 0 100%);
}

.parallelogram {
  clip-path: polygon(0 0, 80% 0, 100% 100%, 20% 100%);
  margin-left: -24px;
}

.active {
  background: linear-gradient(to bottom, #202b27, #6a6d2a);
}

.content-area {
  width: 100%;
  padding: 5px;
  border: 1px solid #042c54;
}
</style>
