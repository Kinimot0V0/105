<script setup>
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { VueFlow, Handle, useVueFlow } from '@vue-flow/core'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  selectedDevice: {
    type: Object,
    default: () => null
  },
  startDate: {
    type: String,
    default: null
  },
  endDate: {
    type: String,
    default: null
  },
  infoType: {
    type: Number,
    default: null
  },
  companyId: {
    type: Number,
    default: null
  }
})

// 定义节点
const nodes = ref([
  {
    id: '1',
    type: 'custom',
    position: { x: 50, y: 200 },
    data: {
      label: '01 待处理',
      count1: null,
      count2: null,
      onClick: () => handleNodeClick('1')
    }
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 200 },
    data: {
      label: '02 挂起',
      count1: null,
      count2: null,
      onClick: () => handleNodeClick('2')
    }
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 450, y: 200 },
    data: {
      label: '03 通知缺陷',
      defectCount: null,
      onClick: () => handleNodeClick('3')
    }
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 450, y: 260 },
    data: {
      label: '办结'
    }
  },
  {
    id: '5',
    type: 'custom',
    position: { x: 150, y: 260 },
    data: {
      label: '关闭待确认',
      count1: null,
      count2: null,
      onClick: () => handleNodeClick('4')
    }
  },
  {
    id: '6',
    type: 'custom',
    position: { x: 280, y: 260 },
    data: {
      label: '关闭'
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
// 监听选中的逆变器变化
watch(
  () => props.selectedDevice,
  (device) => {
    if (device) {
      nodes.value = nodes.value.map((node) => {
        switch (node.id) {
          case '1':
            return {
              ...node,
              data: {
                ...node.data,
                count1: device.warningLevel1waitDoneSum,
                count2: device.warningLevel2waitDoneSum
              }
            }
          case '2':
            return {
              ...node,
              data: {
                ...node.data,
                count1: device.warningLevel1waitHangUpSum,
                count2: device.warningLevel2waitHangUpSum
              }
            }
          case '5':
            return {
              ...node,
              data: {
                ...node.data,
                count1: device.warningLevel1waitCloseWaitSum,
                count2: device.warningLevel2waitCloseWaitSum
              }
            }
          case '3':
            return {
              ...node,
              data: {
                ...node.data,
                defectCount: device.reportSum
              }
            }
          default:
            return node
        }
      })
    } else {
      // 重置为初始状态
      nodes.value = nodes.value.map((node) => ({
        ...node,
        data: {
          ...node.data,
          count1: null,
          count2: null,
          defectCount: null
        }
      }))
    }
  },
  { immediate: true }
)

const router = useRouter()

const handleNodeClick = (id) => {
  const deviceInfo = props.selectedDevice
  if (!deviceInfo) return

  const routeParams = {
    deviceId: deviceInfo.deviceId,
    deviceType: deviceInfo.deviceType,
    deviceName: deviceInfo.deviceName,
    pvFarmId: deviceInfo.pvFarmId,
    pvFarmName: deviceInfo.pvFarmName,
    companyName: deviceInfo.companyName,
    startDate: props.startDate,
    endDate: props.endDate,
    infoType: props.infoType,
    companyId: props.companyId
    // startDate: props.startDate,
    // endDate: props.endDate
  }
  // console.log("routeParams:",routeParams)
  // const routeParamsReport = {
  //   deviceId: deviceInfo.deviceId,
  //   deviceName: deviceInfo.deviceName,
  //   pvFarmId: deviceInfo.pvFarmId,
  //   pvFarmName: deviceInfo.pvFarmName,
  //   companyName: deviceInfo.companyName,
  //   startDate: props.startDate,
  //   endDate: props.endDate
  // }

  switch (id) {
    case '1':
    case '2':
    case '4':
      router.push({
        path: '/pendingWarning',
        query: routeParams
      })
      break
    case '3':
      router.push({
        path: '/pendingReport',
        query: routeParams
      })
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
    <div class="top-info">
      <span class="custom-span">
        <el-icon><Document /></el-icon>
        待办事项及流程
      </span>
    </div>
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
        :style="{ cursor: (data.label && (data.label.trim() === '办结' || data.label.trim() === '关闭')) ? 'default' : 'pointer' }"
      >
        <div class="status-label-text">{{ data.label }}</div>

        <!-- 只在有数据时显示数字 -->
        <div v-if="data.count1 !== null" class="status-label-dual-counts">
          <div class="status-label-count status-count-1">{{ data.count1 }}</div>
          <div class="status-label-count status-count-2">{{ data.count2 }}</div>
        </div>

        <div v-if="data.defectCount !== null" class="status-label-defect-count">
          <i class="fas fa-bell"></i>
          <span>{{ data.defectCount }}</span>
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
  /* margin: 10px; */
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
.status-label-dual-counts {
  display: flex;
  gap: 2px;
}

.status-label-count.status-count-1 {
  background-color: #05bc6c;
  color: white;
  padding: 1px;
}

.status-label-count.status-count-2 {
  background-color: #90cf36;
  color: white;
  padding: 1px;
}

.status-label-defect-count {
  display: flex;
  align-items: center;
  background-color: #f44336;
  border-radius: 10px;
  padding: 2px;
  font-size: 7px;
}

.status-label-defect-count i {
  margin-right: 3px;
  color: white;
}

.status-label-defect-count span {
  color: white;
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
</style>
