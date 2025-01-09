<script setup>
import { reactive } from 'vue'

// 按钮分组和初始状态
const buttonGroups = reactive([
  {
    name: '化德分散式',
    buttons: Array.from({ length: 16 }, (_, i) => ({
      label: String(i + 1).padStart(2, '0'),
      active: false
    }))
  },
  {
    name: '化德长顺',
    buttons: Array.from({ length: 21 }, (_, i) => ({
      label: String(i + 1).padStart(2, '0'),
      active: false
    }))
  },
  {
    name: '协和扎兰屯',
    buttons: Array.from({ length: 12 }, (_, i) => ({
      label: String(i + 113),
      active: false
    }))
  },
  {
    name: '扎兰屯二期',
    buttons: Array.from({ length: 12 }, (_, i) => ({
      label: String(i + 201),
      active: false
    }))
  },
  {
    name: '丰镇分散式',
    buttons: Array.from({ length: 12 }, (_, i) => ({
      label: String(i + 201),
      active: false
    }))
  },
  {
    name: '伊旗风储',
    buttons: Array.from({ length: 12 }, (_, i) => ({
      label: String(i + 201),
      active: false
    }))
  }
])

// 切换按钮状态
const toggleButton = (groupIndex, buttonIndex) => {
  buttonGroups[groupIndex].buttons[buttonIndex].active = !buttonGroups[groupIndex].buttons[buttonIndex].active
}
</script>

<template>
  <div class="top">
    <span class="custom-span"> 风机预警矩阵 </span>
  </div>
  <div class="container">
    <div class="row" v-for="(group, groupIndex) in buttonGroups" :key="groupIndex">
      <span class="row-title">{{ group.name }}</span>
      <div class="button-group">
        <button
          v-for="(button, buttonIndex) in group.buttons"
          :key="buttonIndex"
          :class="{ active: button.active }"
          @click="toggleButton(groupIndex, buttonIndex)"
        >
          {{ button.label }}
        </button>
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
}

.row {
  margin-left: 15px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;

  /* 隐藏上、左和右边框 */
  border-top: none;
  border-left: none;
  border-right: none;

  /* 美化下边框 */
  border-bottom: 1px solid #0a85d9; /* 边框颜色 */

  /* 添加渐变效果 */
  background: linear-gradient(90deg, transparent, #0a85d9 50%, transparent);

  /* 减小阴影高度 */
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1); /* 垂直偏移量减少，模糊半径减小 */
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
  min-width: 100px;
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
  cursor: pointer;
  font-size: 16px;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

button:hover {
  background-color: #005f99;
  transform: scale(1.1);
}

button.active {
  background-color: #c4ed0b;
  border-color: #1e7e34;
}
</style>
