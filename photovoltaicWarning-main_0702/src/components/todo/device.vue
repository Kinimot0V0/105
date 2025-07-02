<script setup>
import { Document, House } from '@element-plus/icons-vue'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  companyName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['device-click'])

const handleDeviceClick = (node, station) => {
  props.treeData.forEach((farm) => {
    farm.children?.forEach((inverter) => {
      if (!inverter.children) {
        inverter.selected = false
      } else {
        inverter.children.forEach((cb) => (cb.selected = false))
      }
    })
  })

  node.selected = true

  emit('device-click', {
    pvFarmId: station.pvFarm_id,
    deviceId: node.device_id
  })
}

// 切换展开状态（用于场站和逆变器）
const toggleExpand = (node) => {
  node.expanded = !node.expanded
  node.manuallyExpanded = node.expanded
}

// 计算电站节点的告警总和（只累加其children）
const calculateStationCount = (station) => {
  let total = 0
  if (station.children?.length) {
    station.children.forEach((inverter) => {
      // 如果是两层结构，inverter是叶子节点
      if (!inverter.children) {
        total += calculateCount(inverter)
      } else {
        // 三层结构只统计 inverter 级别的，不统计子节点（汇流箱）
        total += calculateCount(inverter)
      }
    })
  }
  return total
}

// 统计数：每个节点只展示自身的告警与通知数量
const calculateCount = (node) => {
  const w1 = node.warningLevel1waitDoneSum ?? 0
  const w2 = node.warningLevel2waitDoneSum ?? 0
  const h1 = node.warningLevel1waitHangUpSum ?? 0
  const h2 = node.warningLevel2waitHangUpSum ?? 0
  const c1 = node.warningLevel1waitCloseWaitSum ?? 0
  const c2 = node.warningLevel2waitCloseWaitSum ?? 0
  const report = node.reportSum ?? 0
  return w1 + w2 + h1 + h2 + c1 + c2 + report
}
</script>

<template>
  <div class="top">
    <span class="custom-span">
      <el-icon><Document /></el-icon>
      电站列表
    </span>
  </div>

  <div class="tree-container">
    <ul class="tree">
      <li v-for="station in props.treeData" :key="station.pvFarm_id" class="tree-node">
        <div class="tree-label">
          <span @click="toggleExpand(station)" class="expand-icon">
            {{ station.expanded ? '▼' : '▶' }} <el-icon><House /></el-icon>
          </span>
          <span class="label">
            {{ station.label }}
            <span class="count-badge" v-if="calculateStationCount(station) > 0">{{
              calculateStationCount(station)
            }}</span>
          </span>
        </div>

        <ul v-if="station.expanded && station.children?.length">
          <li
            v-for="inverter in station.children"
            :key="inverter.device_id"
            class="tree-node"
            style="margin-left: 20px"
          >
            <!-- 1. 逆变器为叶子节点 -->
            <div
              v-if="!inverter.children"
              class="tree-label"
              :class="{ 'selected-device': inverter.selected }"
              @click="handleDeviceClick(inverter, station)"
            >
              <span class="label">
                {{ inverter.device_name }}
                <span class="count-badge" v-if="calculateCount(inverter) > 0">{{ calculateCount(inverter) }}</span>
              </span>
            </div>

            <!-- 2. 逆变器有子节点（汇流箱） -->
            <div v-else class="tree-label">
              <span @click="toggleExpand(inverter)" class="expand-icon">
                {{ inverter.expanded ? '▼' : '▶' }}
              </span>
              <span class="label">
                {{ inverter.device_name }}
                <span class="count-badge" v-if="calculateCount(inverter) > 0">{{ calculateCount(inverter) }}</span>
              </span>
            </div>

            <!-- 汇流箱列表 -->
            <ul v-if="inverter.expanded && inverter.children?.length">
              <li
                v-for="box in inverter.children"
                :key="box.device_id"
                class="child-node"
                :class="{ 'selected-device': box.selected }"
              >
                <div class="tree-label" @click="handleDeviceClick(box, station)">
                  <span class="label">
                    {{ box.device_name }}
                    <span class="count-badge" v-if="calculateCount(box) > 0">{{ calculateCount(box) }}</span>
                  </span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.top {
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
  font-weight: bold;
}
.tree-container {
  max-height: 100%;
  border-radius: 5px;
  margin: 10px;
}
.tree {
  list-style-type: none;
  padding-left: 0;
  margin-left: 20px;
}
.tree-node {
  margin-bottom: 15px;
  position: relative;
}
.child-node {
  margin-left: 40px;
  margin-bottom: 20px;
}
/* .label {
  background: linear-gradient(rgba(30, 96, 120, 0) 0%, rgba(30, 96, 120, 0.5) 25%, rgba(30, 96, 120, 1) 50%, rgba(30, 96, 120, 0.5) 75%, rgba(30, 96, 120, 0) 100%);
  padding: 5px 12px;
  cursor: pointer;
} */
.label {
  position: relative;
  display: inline-block;
  background: linear-gradient(
    rgba(30, 96, 120, 0) 0%,
    rgba(30, 96, 120, 0.5) 25%,
    rgba(30, 96, 120, 1) 50%,
    rgba(30, 96, 120, 0.5) 75%,
    rgba(30, 96, 120, 0) 100%
  );
  padding: 5px 12px;
  cursor: pointer;
}

.count-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #2098b2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 5px;
  white-space: nowrap;
}

.selected-device .label {
  background: linear-gradient(
    rgba(119, 102, 30, 0) 0%,
    rgba(119, 102, 30, 0.5) 25%,
    rgba(119, 102, 30, 1) 50%,
    rgba(119, 102, 30, 0.5) 75%,
    rgba(119, 102, 30, 0) 100%
  );
}
.tree-label {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}
.expand-icon {
  cursor: pointer;
  font-size: 16px;
}
</style>