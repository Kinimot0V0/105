<script setup>
import { ref, computed } from 'vue'
import realWarning from '@/components/warningList/realWarning.vue'
import historyWarning from '@/components/warningList/historyWarning.vue'
// 当前显示的组件
const current = ref(0)
const Components = [realWarning, historyWarning]
const currentComponent = computed(() => Components[current.value])

// 切换组件的方法
const switchComponent = (componentId) => {
  current.value = componentId
}
</script>
<template>
  <div class="app-container">
    <!-- 按钮组 -->
    <div class="button-group">
      <button :class="['switch-button', current === 0 ? 'active' : 'inactive']" @click="switchComponent(0)">
        实时预警
      </button>
      <button :class="['switch-button', current === 1 ? 'active' : 'inactive']" @click="switchComponent(1)">
        历史预警
      </button>
    </div>

    <!-- 动态渲染组件 -->
    <component :is="currentComponent"></component>
  </div>
</template>

<style scoped>
.app-container {
  text-align: center;
  margin: 20px;
}

.button-group {
  display: flex;
  justify-content: left;
  margin-bottom: 10px;
}

.switch-button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

/* 默认未选中状态样式 */
.switch-button.inactive {
  background-color: #0eb3f4;
  color: white;
}

/* 选中状态样式 */
.switch-button.active {
  background-color: #ffd700;
  color: black;
  font-weight: bold;
}
</style>
