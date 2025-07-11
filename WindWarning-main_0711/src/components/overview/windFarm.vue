<script setup>
import { computed } from 'vue'

const props = defineProps({
  turbineWarnList: {
    type: Array,
    default: () => []
  }
})

// 处理多风场数据
const windFarmList = computed(() => {
  return props.turbineWarnList.map(item => ({
    windFarmId: item.windFarmId,
    windFarmName: item.windFarmName,
    warnCountList: item.warnCountList
  }))
})

// 生成分组的按钮数据
const buttonGroups = computed(() => {
  return windFarmList.value.map(windFarm => {
    // 计算当前风场的最大告警数
    const maxWarning = windFarm.warnCountList.length > 0 
      ? Math.max(...windFarm.warnCountList.map(t => t.warnCount)) 
      : 0

    return {
      name: windFarm.windFarmName,
      buttons: windFarm.warnCountList.map(turbine => ({
        label: turbine.turbineNumber,
        warning: turbine.warnCount,
        percentage: maxWarning > 0 
          ? (turbine.warnCount / maxWarning) * 100 
          : 0
      }))
    }
  })
})
</script>

<template>
  <div class="top">
    <span class="custom-span"> 风机预警矩阵 </span>
  </div>
  <div class="container">
    <!-- 遍历每个风场 -->
    <div 
      class="row" 
      v-for="(group, groupIndex) in buttonGroups" 
      :key="groupIndex"
    >
      <span class="row-title">{{ group.name }}</span>
      <div class="button-group">
        <!-- 遍历当前风场的风机 -->
        <div 
          v-for="(button, buttonIndex) in group.buttons" 
          :key="buttonIndex" 
          class="button-container"
        >
          <button>{{ button.label }}</button>
          <div class="progress-bar">
            <div 
              class="progress" 
              :style="{ width: button.percentage + '%' }"
            >
              <span 
                class="progress-text" 
                v-if="button.warning > 0"
              >
                {{ button.warning }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  height: 50px;
}

.custom-span {
  display: inline-flex;
  align-items: center;
  background-color: #164476;
  color: white;
  padding: 5px 10px;
  font-size: 17px;
  border-radius: 5px;
  position: relative;
  font-weight: bold;
}

.container {
  color: #2043f2;
  padding: 20px;
  border-radius: 10px;
  overflow-x: hidden;
  max-height: 600px;
  overflow-y: auto;
}

.row {
  margin-left: 15px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid #0a85d9;
  background: linear-gradient(90deg, transparent, #0a85d9 50%, transparent);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

.row-title {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px 10px;
  font-size: 16px;
  color: #ffffff;
  background: linear-gradient(90deg, #184558, #20667f);
  margin-right: 8px;
  border: 1px solid #20667f;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;
  width: 130px;
  min-width: 130px;
  height: 40px;
  line-height: 40px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
}

button {
  width: 52px;
  height: 40px;
  background: linear-gradient(90deg, #1f5b4c, #1c594e);
  color: #ffffff;
  border: 1px solid #39a58a;
  border-radius: 5px;
  font-size: 16px;
}
.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 95%;
  background-color: transparent;
  border: 1px solid orange;
  border-radius: 2px;
  margin-top: 1px;
  height: 10px;
  position: relative;
}

.progress {
  background-color: orange;
  height: 100%;
  border-radius: 1px;
  position: relative;
}

.progress-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  font-size: 12px;
  line-height: 10px;
}
</style>
