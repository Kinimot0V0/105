<script setup>
import { computed } from 'vue'
import { House } from '@element-plus/icons-vue'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  }
})

// 计算每个风机和风场的总数
const calculateTotalCount = computed(() => {
  const farmTotalCounts = {}
  const turbineTotalCounts = {}

  // 遍历每个风场
  props.treeData.forEach((farm) => {
    let farmReportSum = 0
    let farmWarningLevel1Sum = 0
    let farmWarningLevel2Sum = 0

    // 计算每个风机的总数
    if (farm.children && farm.children.length > 0) {
      farm.children.forEach((turbine) => {
        const turbineTotal =
          (turbine.reportSum ?? 0) + (turbine.warningLevel1Sum ?? 0) + (turbine.warningLevel2Sum ?? 0)

        turbineTotalCounts[`${farm.windFarm_id}_${turbine.turbine_id}`] = turbineTotal

        // 累加风场总数
        farmReportSum += turbine.reportSum ?? 0
        farmWarningLevel1Sum += turbine.warningLevel1Sum ?? 0
        farmWarningLevel2Sum += turbine.warningLevel2Sum ?? 0
      })
    }

    // 计算风场总数
    farmTotalCounts[farm.windFarm_id] = farmReportSum + farmWarningLevel1Sum + farmWarningLevel2Sum
  })

  return {
    farmTotalCounts,
    turbineTotalCounts
  }
})

// 切换展开/收起状态
const toggleExpand = (node) => {
  node.expanded = !node.expanded
  // 可以在这里添加一个额外的标记，表示这是用户手动展开的
  node.manuallyExpanded = node.expanded
}

const emit = defineEmits(['turbine-click'])

// 处理风机节点点击事件
const handleTurbineClick = (turbine, parentNode) => {
  // 取消所有风场的所有风机选中状态
  props.treeData.forEach((farm) => {
    farm.children.forEach((child) => {
      child.selected = false
    })
  })

  // 选中当前点击的风机
  turbine.selected = true

  // 向父组件发送事件，传递风场ID和风机ID
  emit('turbine-click', {
    windFarmId: parentNode.windFarm_id,
    turbineId: turbine.turbine_id
  })
}
</script>

<template>
  <div class="top">
    <span class="custom-span">
      <el-icon><Document /></el-icon>
      内蒙古公司
    </span>
  </div>
  <div class="tree-container">
    <ul class="tree">
      <li v-for="(node, index) in props.treeData" :key="index" class="tree-node">
        <div class="tree-label">
          <span @click="toggleExpand(node)" class="expand-icon">
            {{ node.expanded ? '▼' : '▶' }} <el-icon style="font-size: 15px"><House /></el-icon>
          </span>

          <span class="label">{{ node.label }}</span>

          <!-- 风场节点右上角的数量标签 -->
          <span v-if="calculateTotalCount.farmTotalCounts[node.windFarm_id] !== undefined" class="windFarm-count-badge">
            {{ calculateTotalCount.farmTotalCounts[node.windFarm_id] }}
          </span>
        </div>
        <ul v-if="node.expanded && node.children">
          <li
            v-for="(child, childIndex) in node.children"
            :key="childIndex"
            class="child-node"
            :class="{ 'selected-turbine': child.selected }"
          >
            <div class="tree-label" @click="handleTurbineClick(child, node)">
              <span class="label">{{ child.turbine_name }}</span>

              <!-- 风机节点右上角的数量标签 -->
              <span
                v-if="
                  calculateTotalCount.turbineTotalCounts[`${node.windFarm_id}_${child.turbine_id}`] !== undefined &&
                  calculateTotalCount.turbineTotalCounts[`${node.windFarm_id}_${child.turbine_id}`] > 0
                "
                class="turbine-count-badge"
              >
                {{ calculateTotalCount.turbineTotalCounts[`${node.windFarm_id}_${child.turbine_id}`] }}
              </span>
            </div>
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
  position: relative;
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
  margin-bottom: 25px;
  position: relative;
}
.child-node {
  margin-bottom: 25px;
  margin-left: 40px;
  position: relative;
}
.label {
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

.selected-turbine .label {
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
  text-align: center;
}

.windFarm-count-badge {
  position: absolute;
  top: -10px;
  left: 190px;
  background-color: #2098b2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}
.turbine-count-badge {
  position: absolute;
  top: -2px;
  left: 105px;
  background-color: #2098b2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}
</style>
