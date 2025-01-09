<script setup>
import { ref, onMounted } from 'vue'
import { getWarning } from '@/api/warning'
//getModel的信息
const warningList = ref([])
const modelList = ref([])
const turbineList = ref([])
const page = ref(1)
const pageSize = ref(15)
const totalPages = ref(0)

// 开始和结束时间
// const startDate = ref(new Date(new Date().getTime() - 24 * 60 * 60 * 1000))
// const endDate = ref(new Date() - 0.5 * 24 * 60 * 60 * 1000)
const startDate = ref(new Date('2024-11-06T00:00:01'))
const endDate = ref(new Date('2024-11-07T14:00:01'))

const formatDateTime = (date) => {
  const isoString = date.toISOString() // 转为 ISO 格式
  return isoString.split('.')[0].replace('T', ' ') // 替换 T 为空格
}

const getWarningData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value,
      start_date: formatDateTime(startDate.value),
      end_date: formatDateTime(endDate.value)
    }
    console.log(params)
    const response = await getWarning(params)
    console.log('返回结果:', response)
    const data = response.data.result
    warningList.value = data.warningList
    modelList.value = data.modelList
    turbineList.value = data.turbineList
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

onMounted(getWarningData)

// 等级映射
const levelMap = ref({
  0: { label: '1级' },
  1: { label: '2级' }
})

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '处理中', color: 'blue' },
  2: { label: '已处理', color: 'green' }
})
// 获取风机名称
const getTurbineName = (modelId) => {
  const matchedModel = modelList.value.find((model) => model.modelId === modelId)

  if (matchedModel) {
    const matchedTurbine = turbineList.value.find((turbine) => turbine.turbineId === matchedModel.turbineId)

    return matchedTurbine ? matchedTurbine.turbineName : '未知风机'
  }

  return '未知风机'
}
</script>

<template>
  <div class="top">
    <span class="custom-span"> 预警信息 </span>
  </div>
  <div class="container">
    <el-table :data="warningList" max-height="540px" height="540px" :show-header="true" style="overflow-y: auto">
      <el-table-column label="序号" align="center" width="60px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="开始时间" align="center">
        <template #default="scope">
          {{ scope.row.startTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="turbine_name" label="风机名称" align="center">
        <template #default="scope">
          {{ getTurbineName(scope.row.modelId) }}
        </template>
      </el-table-column>
      <el-table-column prop="warningDescription" label="预警信息" align="center"></el-table-column>
      <el-table-column prop="warningLevel" label="等级" align="center" width="60px">
        <template #default="scope">
          <span>
            {{ levelMap[scope.row.warningLevel]?.label || '1级' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="warningStatus" label="状态" align="center" width="100px">
        <template #default="scope">
          <span
            :style="{
              color: statusMap[scope.row.warningStatus]?.color || 'black'
            }"
          >
            {{ statusMap[scope.row.warningStatus]?.label || '未处理' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="" label="详情" align="center" width="60px">
        <template #default="scope">
          <el-link type="primary" @click="look(scope.row.warningId)">查看</el-link>
        </template>
      </el-table-column>
    </el-table>
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
/* 表格样式 */
:deep(.el-table) {
  border: 1px solid #164b6d !important;
  background-color: transparent !important;

  &::before,
  &::after {
    display: none !important;
  }

  --el-table-border-color: transparent !important;

  .el-table__inner-wrapper {
    border-bottom: none !important;
  }

  .el-table__header-wrapper {
    th {
      background-color: #143f5c !important;
      border-bottom: none !important;
      border-right: none !important;
    }
    .el-table__header {
      border-bottom: none !important;
    }
  }

  .el-table__body-wrapper {
    background-color: transparent !important;
    tr {
      background-color: transparent !important;
      td {
        background-color: transparent !important;
        border-bottom: 1px solid #164b6d !important;
        border-right: 1px solid #164b6d !important;
      }
    }
  }

  th {
    color: #ffffff !important;
  }

  td {
    color: #c2dcf5 !important;
  }
}
</style>
