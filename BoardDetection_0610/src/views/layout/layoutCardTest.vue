<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 点击处理函数
const handleButtonClick = (routeName) => {
  router.push(`/cardTest/${routeName}`)
}
</script>

<template>
  <div class="container">
    <div class="button-group">
      <div
        class="trapezoid"
        :class="{ active: route.name === 'addTest' }"
        @click="handleButtonClick('addTest')"
      >
        新增试验
      </div>
      <div
        class="parallelogram"
        :class="{ active: route.name === 'historyTest' }"
        @click="handleButtonClick('historyTest')"
      >
        历史试验
      </div>
    </div>

    <div class="content-area">
      <router-view></router-view>
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
