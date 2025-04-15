<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// 从父组件接收的 `props`
const props = defineProps({
  stepData: Object
})

// 用于向父组件传递数据
const emit = defineEmits(['updateStepData'])

// 左侧（待选）测点数据
const leftTableData = ref([...props.stepData.unselectedData])

// 右侧（已选）测点数据
const rightTableData = ref([...props.stepData.selectedData])

// 左侧和右侧选中的行
const selectedLeftRows = ref([]) // 记录左侧选中行
const selectedRightRows = ref([]) // 记录右侧选中行

// 分页控制
const currentPageLeft = ref(1)
const currentPageRight = ref(1)
const pageSizeLeft = ref(10) // 左侧每页显示的行数
const pageSizeRight = ref(10) // 右侧每页显示的行数

// 搜索框内容
const leftSearchQuery = ref('') // 左侧搜索框的内容
const rightSearchQuery = ref('') // 右侧搜索框的内容

// 计算过滤后的左侧表格数据
const filteredLeftTableData = computed(() => {
  if (leftSearchQuery.value === '') {
    return leftTableData.value
  }
  return leftTableData.value.filter(
    (row) =>
      row.pointLabel.toLowerCase().includes(leftSearchQuery.value.toLowerCase())
      // row.pointDescription.toLowerCase().includes(leftSearchQuery.value.toLowerCase())
  )
})

// 计算过滤后的右侧表格数据
const filteredRightTableData = computed(() => {
  if (rightSearchQuery.value === '') {
    return rightTableData.value
  }
  return rightTableData.value.filter(
    (row) =>
      row.pointLabel.toLowerCase().includes(rightSearchQuery.value.toLowerCase())
      // row.pointDescription.toLowerCase().includes(rightSearchQuery.value.toLowerCase())
  )
})

// 计算分页后的左侧数据
const paginatedLeftTableData = computed(() => {
  const start = (currentPageLeft.value - 1) * pageSizeLeft.value
  const end = start + pageSizeLeft.value
  return filteredLeftTableData.value.slice(start, end)
})

// 计算分页后的右侧数据
const paginatedRightTableData = computed(() => {
  const start = (currentPageRight.value - 1) * pageSizeRight.value
  const end = start + pageSizeRight.value
  return filteredRightTableData.value.slice(start, end)
})

// 监听左侧搜索查询变化
watch(leftSearchQuery, () => {
  currentPageLeft.value = 1
})

// 监听右侧搜索查询变化
watch(rightSearchQuery, () => {
  currentPageRight.value = 1
})

// 监听左侧选中的行变化
const handleLeftSelectionChange = (rows) => {
  selectedLeftRows.value = rows
}

// 监听右侧选中的行变化
const handleRightSelectionChange = (rows) => {
  selectedRightRows.value = rows
}

// 将选中的行从左侧移动到右侧
const moveSelectedRowsToRight = () => {
  if (selectedLeftRows.value.length > 0) {
    // 使用 Set 来提高去重和查找效率
    const selectedSet = new Set(selectedLeftRows.value)

    rightTableData.value.push(...selectedLeftRows.value)
    leftTableData.value = leftTableData.value.filter((row) => !selectedSet.has(row))
    selectedLeftRows.value = []

    // 向父组件传递更新的数据
    emit('updateStepData', {
      unselectedData: leftTableData.value,
      selectedData: rightTableData.value
    })
  }
}

// 将选中的行从右侧移动到左侧
const moveSelectedRowsToLeft = () => {
  if (selectedRightRows.value.length > 0) {
    const selectedSet = new Set(selectedRightRows.value)

    leftTableData.value.push(...selectedRightRows.value)
    rightTableData.value = rightTableData.value.filter((row) => !selectedSet.has(row))
    selectedRightRows.value = []

    // 向父组件传递更新的数据
    emit('updateStepData', {
      unselectedData: leftTableData.value,
      selectedData: rightTableData.value
    })
  }
}

// 左侧表格每页显示数量变化
const handleSizeChangeLeft = (val) => {
  pageSizeLeft.value = val
  currentPageLeft.value = 1
}

// 右侧表格每页显示数量变化
const handleSizeChangeRight = (val) => {
  pageSizeRight.value = val
  currentPageRight.value = 1
}
</script>

<template>
  <div class="model-config-container">
    <h2 class="title">② 选择测点</h2>
    <div class="point-selection">
      <!-- 左侧：待选测点 -->
      <div class="table-container">
        <div class="search-box">
          <el-input v-model="leftSearchQuery" placeholder="搜索测点" clearable />
        </div>
        <p>待选测点: {{ filteredLeftTableData.length }} 项</p>
        <el-table
          stripe
          :data="paginatedLeftTableData"
          style="width: 100%"
          height="320px"
          max-height="320px"
          @selection-change="handleLeftSelectionChange"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="pointLabel" label="测点标签"></el-table-column>
          <!-- <el-table-column prop="pointDescription" label="测点描述"></el-table-column> -->
        </el-table>
        <!-- 左侧分页 -->
        <el-pagination
          class="pagination"
          v-model:currentPage="currentPageLeft"
          :page-size="pageSizeLeft"
          :total="filteredLeftTableData.length"
          :page-sizes="[10, 20, 30]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChangeLeft"
        />
      </div>

      <!-- 中间按钮 -->
      <div class="button">
        <!-- 右移按钮 -->
        <el-button @click="moveSelectedRowsToRight" type="primary" :icon="ArrowRight" style="margin: 10px 15px">
        </el-button>
        <!-- 左移按钮 -->
        <el-button @click="moveSelectedRowsToLeft" type="primary" :icon="ArrowLeft" style="margin: 10px 15px">
        </el-button>
      </div>

      <!-- 右侧：已选测点 -->
      <div class="table-container">
        <div class="search-box">
          <el-input v-model="rightSearchQuery" placeholder="搜索测点" clearable />
        </div>
        <p>已选测点: {{ filteredRightTableData.length }} 项</p>
        <el-table
          stripe
          :data="paginatedRightTableData"
          style="width: 100%"
          height="320px"
          max-height="320px"
          @selection-change="handleRightSelectionChange"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="pointLabel" label="测点标签"></el-table-column>
          <!-- <el-table-column prop="pointDescription" label="测点描述"></el-table-column> -->
        </el-table>
        <!-- 右侧分页 -->
        <el-pagination
          class="pagination"
          v-model:currentPage="currentPageRight"
          :page-size="pageSizeRight"
          :total="filteredRightTableData.length"
          :page-sizes="[10, 20, 30]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChangeRight"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-config-container {
  padding: 10px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}
.point-selection {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
}
.table-container {
  width: 45%;
}
.button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.search-box {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.pagination {
  margin-top: 5px;
  display: flex;
  justify-content: center;
}
</style>
