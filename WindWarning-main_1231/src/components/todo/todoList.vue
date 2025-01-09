<script setup>
import { Document } from '@element-plus/icons-vue'
import { ref } from 'vue'
import flow from '@/components/overview/flow.vue'

const modelList = ref([
  { modelId: 1, modelLabel: 'M0001' },
  { modelId: 2, modelLabel: 'M0002' },
  { modelId: 3, modelLabel: 'M0003' },
  { modelId: 4, modelLabel: 'M0004' },
  { modelId: 5, modelLabel: 'M0005' },
  { modelId: 6, modelLabel: 'M0006' },
  { modelId: 7, modelLabel: 'M0007' },
  { modelId: 8, modelLabel: 'M0008' },
  { modelId: 9, modelLabel: 'M0009' },
  { modelId: 10, modelLabel: 'M0010' }
])
</script>

<template>
  <div class="container">
    <div class="top-info">
      <span class="custom-span">
        <el-icon><Document /></el-icon>
        待办事项及流程
      </span>
    </div>
    <div class="content">
      <div class="model">
        <div class="model-grid">
          <div v-for="model in modelList" :key="model.modelId" class="model-item">
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
            <div class="model-label">模型{{ model.modelLabel }}</div>
          </div>
        </div>
      </div>
      <div class="flow-chart">
        <flow />
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
  justify-content: space-between;
  height: 50px;
  margin-bottom: 10px;
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
  display: flex;
  flex-direction: column;
  height: 100%;
}

.model {
  flex: 3;
  margin-top: 10px;
  overflow-y: auto;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  padding: 10px;
}

.model-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.model-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.model-label {
  font-size: 14px;
  color: #95cbed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.flow-chart {
  flex: 4;
  margin-top: 15px;
  border: 1px solid #164b6d;
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
