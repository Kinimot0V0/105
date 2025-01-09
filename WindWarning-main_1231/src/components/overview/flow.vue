<script setup>
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { VueFlow, Handle, useVueFlow } from '@vue-flow/core'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 定义节点
const nodes = ref([
  {
    id: '1',
    type: 'custom',
    position: { x: 50, y: 200 },
    data: {
      label: '01 待处理',
      count: 9,
      onClick: () => handleNodeClick('1')
    }
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 200 },
    data: {
      label: '02 挂起',
      count: 1,
      onClick: () => handleNodeClick('2')
    }
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 450, y: 200 },
    data: {
      label: '03 通知缺陷',
      onClick: () => handleNodeClick('3')
    }
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 450, y: 260 },
    data: {
      label: '办结',
      onClick: () => handleNodeClick('4')
    }
  },
  {
    id: '5',
    type: 'custom',
    position: { x: 150, y: 260 },
    data: {
      label: '关闭待确认',
      count: 72,
      onClick: () => handleNodeClick('5')
    }
  },
  {
    id: '6',
    type: 'custom',
    position: { x: 280, y: 260 },
    data: {
      label: '关闭',
      onClick: () => handleNodeClick('6')
    }
  }
])

// 定义边
const edges = ref([
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'handle-right',
    targetHandle: 'handle-left',
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    },
    type: 'step'
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    sourceHandle: 'handle-top',
    targetHandle: 'handle-top',
    label: '转通知',
    labelStyle: {
      fill: 'white',
      color: 'white',
      fontSize: '8px'
    },
    labelBgStyle: {
      fill: 'transparent'
    },
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    },
    type: 'step'
  },
  {
    id: 'e1-5',
    source: '1',
    target: '5',
    sourceHandle: 'handle-bottom',
    targetHandle: 'handle-top',
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 'handle-right',
    targetHandle: 'handle-left',
    label: '转通知',
    labelStyle: {
      fill: 'white',
      color: 'white',
      fontSize: '8px'
    },
    labelBgStyle: {
      fill: 'transparent'
    },
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    },
    type: 'step'
  },
  {
    id: 'e2-5',
    source: '2',
    target: '5',
    sourceHandle: 'handle-bottom',
    targetHandle: 'handle-top',
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    }
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourceHandle: 'handle-bottom',
    targetHandle: 'handle-top',
    label: '反馈有效性',
    labelStyle: {
      fill: 'white',
      color: 'white',
      fontSize: '8px'
    },
    labelBgStyle: {
      fill: 'transparent'
    },
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    },
    type: 'step'
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    sourceHandle: 'handle-right',
    targetHandle: 'handle-left',
    style: {
      stroke: '#2680b8',
      strokeWidth: 1
    },
    markerEnd: {
      type: 'arrow',
      color: '#2680b8'
    }
  }
])

const router = useRouter()

// 定义点击事件处理函数
const handleNodeClick = (id) => {
  switch (id) {
    case '1':
      router.push('/pendingWarning')
      // 可以添加更多待处理节点的逻辑
      break
    case '2':
      alert('点击了挂起节点')
      break
    case '3':
      alert('点击了通知缺陷节点')
      break
    case '4':
      alert('点击了办结节点')
      break
    case '5':
      alert('点击了关闭节点')
      break
    default:
      alert('点击了未知节点')
  }
}

const { fitView } = useVueFlow()

onMounted(() => {
  fitView()

  window.addEventListener('resize', () => {
    fitView()
  })
})
</script>

<template>
  <div class="level-item">
    <span>预警等级：</span>
    <span class="circle" :style="{ backgroundColor: '#05bc6c' }"></span>
    <span>一级</span>
    <span class="circle" :style="{ backgroundColor: '#90cf36' }"></span>
    <span>二级</span>
    <span style="margin-left: 15px">缺陷通知</span>
    <span class="bell-icon">
      <i class="fas fa-bell"></i>
    </span>
  </div>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :nodesDraggable="false"
    :edgesSelectable="false"
    :nodesConnectable="false"
    :zoomOnScroll="false"
    :zoomOnPinch="false"
    :panOnScroll="false"
    :panOnDrag="false"
    :preventScrolling="true"
    :preventZoom="true"
    :fitViewOnInit="true"
    class="w-full h-full"
  >
    <template #node-custom="{ data }">
      <div
        @click="data.onClick"
        :class="[
          'status-label',
          data.label.includes('待处理')
            ? 'status-pending'
            : data.label.includes('挂起')
              ? 'status-suspended'
              : data.label.includes('通知缺陷')
                ? 'status-notification-defect'
                : data.label.includes('办结')
                  ? 'status-completed'
                  : data.label.includes('关闭')
                    ? 'status-closed'
                    : 'status-default'
        ]"
      >
        <div class="status-label-text">{{ data.label }}</div>

        <div v-if="data.count" class="status-label-count">
          {{ data.count }}
        </div>

        <Handle
          id="handle-top"
          type="source"
          position="top"
          class="absolute -top-2.5 left-1/2 transform -translate-x-1/2"
        />

        <Handle
          id="handle-right"
          type="source"
          position="right"
          class="absolute -right-2.5 top-1/2 transform -translate-y-1/2"
        />

        <Handle
          id="handle-bottom"
          type="source"
          position="bottom"
          class="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2"
        />

        <Handle
          id="handle-left"
          type="source"
          position="left"
          class="absolute -left-2.5 top-1/2 transform -translate-y-1/2"
        />
      </div>
    </template>
  </VueFlow>
</template>

<style>
.vue-flow {
  touch-action: none !important;
  user-select: none !important;
  width: 100%;
  height: 100%;
}

.vue-flow__renderer {
  pointer-events: none;
}

.vue-flow__node {
  pointer-events: auto !important;
  cursor: pointer !important;
}

.vue-flow__handle {
  width: 1px !important;
  height: 1px !important;
  background-color: transparent !important;
  border: none !important;
  opacity: 0 !important;
}

.vue-flow__edge {
  pointer-events: none;
}

.vue-flow__controls {
  display: none !important;
}
.status-label {
  width: 85px;
  height: 25px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 改为 space-between */
  padding: 0 8px; /* 添加左右内边距 */
  color: #fff;
  cursor: pointer;
  clip-path: polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%);
}
.status-label-text {
  flex-grow: 1; /* 让文字占据剩余空间 */
  text-align: center; /* 文字居中 */
  font-size: 8px;
}

.status-label-count {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #f44336;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 6px;
}
.status-pending {
  background-color: #18bbf4;
}

.status-suspended {
  background-color: #0f6285;
}

.status-notification-defect {
  background-color: #625626;
}

.status-completed {
  background-color: #11524c;
}

.status-closed {
  background-color: #11524c;
}

.status-default {
  background-color: #11524c;
}
.level-item span {
  margin-right: 10px;
}

.level-item {
  display: flex;
  align-items: center;
  position: relative;
  margin: 10px;
}

.level-item::after {
  content: '';
  height: 20px;
  width: 2px;
  background-color: #059af6;
  margin-left: -110px;
}
.circle {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 5px;
}
.bell-icon i {
  font-size: 16px;
  color: red;
}
</style>
