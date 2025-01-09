<script setup>
import { Menu } from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = defineProps({
  todoListData: {
    type: Array,
    default: () => []
  },
  infoType: {
    type: Number,
    default: 0
  }
})

const modelList = computed(() => {
  return props.todoListData.map((model) => ({
    modelId: model.modelId,
    modelName: model.modelName
  }))
})

const modelCountMap = computed(() => {
  const countMap = {}

  if (props.infoType === 0) {
    // 当为全部时，显示一级和二级预警的总和
    props.todoListData.forEach((model) => {
      countMap[model.modelId] = (model.warningLevel1Sum || 0) + (model.warningLevel2Sum || 0)
    })
  } else if (props.infoType === 1) {
    // 一级预警
    props.todoListData.forEach((model) => {
      countMap[model.modelId] = model.warningLevel1Sum
    })
  } else if (props.infoType === 2) {
    // 二级预警
    props.todoListData.forEach((model) => {
      countMap[model.modelId] = model.warningLevel2Sum
    })
  }
  // 当 infoType 为 3（通知）时，不会添加任何数据到 countMap，即不显示数字

  return countMap
})
</script>

<template>
  <div class="container">
    <div class="top-info">
      <span class="custom-span">
        <el-icon><Menu /></el-icon>
        风机对应模型
      </span>
    </div>
    <div class="content">
      <div v-if="modelList.length > 0" class="model-grid">
        <div v-for="model in modelList" :key="model.modelId" class="model-item">
          <div class="model-icon-container">
            <div class="model-icon">
              <div class="cube">
                <div class="face front"></div>
                <div class="face back"></div>
                <div class="face left"></div>
                <div class="face right"></div>
                <div class="face top"></div>
                <div class="face bottom"></div>
              </div>
            </div>
            <div v-if="modelCountMap[model.modelId]" class="model-count-badge">
              {{ modelCountMap[model.modelId] }}
            </div>
          </div>
          <div class="model-label" :title="model.modelName">
            {{ model.modelName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-info {
  display: flex;
  height: 50px;
}

.custom-span {
  display: inline-flex;
  align-items: center;
  background-color: #164476;
  color: white;
  padding: 5px 10px;
  font-size: 15px;
  border-radius: 5px;
  position: relative;
  font-weight: bold;
}

.content {
  margin-top: 10px;
  overflow-y: auto;
  height: 100%;
}

/* .model-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  padding: 10px;
} */
.model-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr); /* 保持8列 */
  gap: 10px;
  padding: 10px;
  justify-items: center; /* 居中对齐 */
  align-items: start; /* 顶部对齐 */
}

/* .model-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
} */
.model-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100px; /* 固定宽度 */
  height: 100px; /* 固定高度 */
}

/* .model-icon-container {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
} */
.model-icon-container {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px; /* 增加底部间距 */
}

.model-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-count-badge {
  position: absolute;
  top: -6px;
  left: 50px;
  background-color: #2098b2;
  color: white;
  font-size: 13px;
  padding: 3px 7px;
  border-radius: 3px;
}

/* .model-label {
  font-size: 14px;
  color: #95cbed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
} */
.model-label {
  font-size: 14px;
  color: #95cbed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px; /* 限制最大宽度 */
  text-align: center;
}

.cube {
  position: relative;
  width: 30px;
  height: 30px;
  transform-style: preserve-3d;
  transform: rotateX(335deg) rotateY(316deg);
}

.face {
  position: absolute;
  width: 30px;
  height: 30px;
  background: rgba(43, 153, 87, 0.5);
  border: 1px solid #3cd67a;
}

.front {
  transform: translateZ(15px);
}
.back {
  transform: rotateY(180deg) translateZ(15px);
}
.left {
  transform: rotateY(-90deg) translateZ(15px);
}
.right {
  transform: rotateY(90deg) translateZ(15px);
}
.top {
  transform: rotateX(90deg) translateZ(15px);
}
.bottom {
  transform: rotateX(-90deg) translateZ(15px);
}
</style>
