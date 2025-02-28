<script setup>
import { ref, onMounted, watch } from 'vue'
import windFarm from '@/components/overview/windFarm.vue'
import warning from '@/components/overview/warning.vue'
import { ElMessage } from 'element-plus'
import { getWindFarmList, getWarnList, getTurbineWarnList } from '@/api/overview'

// 风场选择相关
const windFarmId = ref(0)
const windFarmList = ref([])

// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)

//预警相关
const warningList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(8)
const totalPages = ref(0)

//风机矩阵相关
const turbineWarnList = ref([])

// 格式化日期为字符串
const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0') +
    ' ' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0') +
    ':' +
    String(d.getSeconds()).padStart(2, '0')
  )
}

// 获取当前时间
const getCurrentTime = () => {
  return new Date()
}

// 获取指定天数前的时间
const getDateBefore = (days) => {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - days)
  return currentDate
}

// 初始化默认时间范围为最近7天
const initDefaultTimeRange = () => {
  endDate.value = formatDate(getCurrentTime())
  startDate.value = formatDate(getDateBefore(7))
}

// 最近7天按钮处理
const handleRecentSevenDays = () => {
  endDate.value = formatDate(getCurrentTime())
  startDate.value = formatDate(getDateBefore(7))
}

// 最近30天按钮处理
const handleRecentThirtyDays = () => {
  endDate.value = formatDate(getCurrentTime())
  startDate.value = formatDate(getDateBefore(30))
}

// 时间选择器限制
const disabledDate = (time) => {
  // 结束时间不能超过当前时间
  return time > getCurrentTime()
}

// 监听开始时间变化，确保开始时间不超过结束时间
const validateStartDate = (val) => {
  if (endDate.value && new Date(val) > new Date(endDate.value)) {
    ElMessage.error('开始时间不能晚于结束时间')
    startDate.value = null
  }
}

// 监听结束时间变化，确保结束时间不早于开始时间
const validateEndDate = (val) => {
  if (startDate.value && new Date(val) < new Date(startDate.value)) {
    ElMessage.error('结束时间不能早于开始时间')
    endDate.value = null
  }
}
const getWindFarm = async () => {
  try {
    const response = await getWindFarmList()
    windFarmList.value = response.data.result
    windFarmId.value = windFarmList.value[0].windFarmId
    return response
  } catch (error) {
    console.error('获取风场数据失败:', error)
  }
}

const getWarningData = async () => {
  try {
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      windFarmId: windFarmId.value,
      startTime: formatDate(startDate.value),
      endTime: formatDate(endDate.value)
      // startTime: '2024-11-06 15:43:30',
      // endTime: '2024-11-06 16:00:00'
    }
    // console.log('getWarningData_params:', params)
    const response = await getWarnList(params)
    // console.log('getWarningData返回结果:', response)
    const data = response.data.result
    warningList.value = data.records
    totalCount.value = data.total
    page.value = data.current
    totalPages.value = data.pages
  } catch (error) {
    console.error('获取预警数据失败:', error)
  }
}
const getTurbineWarnData = async () => {
  try {
    const params = {
      windFarmId: windFarmId.value,
      startDate: formatDate(startDate.value),
      endDate: formatDate(endDate.value)
      // startDate: '2024-11-06 15:43:30',
      // endDate: '2024-11-06 16:00:00'
    }
    // console.log('getTurbineWarnData_params:', params)
    const response = await getTurbineWarnList(params)
    // console.log('getTurbineWarnData返回结果:', response)
    turbineWarnList.value = response.data.result
  } catch (error) {
    console.error('获取风机矩阵数据失败:', error)
  }
}

// 组件挂载时初始化默认时间范围
// onMounted(async () => {
//   try {
//     initDefaultTimeRange()

//     const windFarms = await getWindFarm()

//     if (windFarms.data.result.length) {
//       await getWarningData()
//     } else {
//       console.log('没有可用的风场')
//     }
//   } catch (error) {
//     console.error('Initialization error:', error)
//   }
// })

// 监听开始时间、结束时间和风场 ID 的变化
// watch([startDate, endDate, windFarmId], () => {
//   if (startDate.value && endDate.value) {
//     page.value = 1
//     getWarningData()
//   }
// })

// 组件挂载时初始化默认时间范围 获取风场
onMounted(async () => {
  try {
    initDefaultTimeRange()

    await getWindFarm()
  } catch (error) {
    console.error('Initialization error:', error)
  }
})

// 监听开始时间、结束时间和风场 ID 的变化
watch([startDate, endDate, windFarmId], () => {
  if (windFarmList.value.length && startDate.value && endDate.value) {
    page.value = 1
    getWarningData()
    getTurbineWarnData()
  }
})
const handlePageChange = (newPage) => {
  page.value = newPage
  getWarningData()
}
</script>

<template>
  <div class="time">
    <el-button type="primary" @click="handleRecentSevenDays">最近7天</el-button>
    <el-button type="primary" @click="handleRecentThirtyDays">最近30天</el-button>

    <el-date-picker
      v-model="startDate"
      type="datetime"
      placeholder="选择开始时间"
      :clearable="true"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      style="width: 180px"
      :disabledDate="disabledDate"
      @change="validateStartDate"
    ></el-date-picker>

    <span class="date-separator">至</span>

    <el-date-picker
      v-model="endDate"
      type="datetime"
      placeholder="选择结束时间"
      :clearable="true"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      style="width: 180px"
      :disabledDate="disabledDate"
      @change="validateEndDate"
    ></el-date-picker>

    <el-form-item label="场站：" prop="windFarmId">
      <el-select
        v-model="windFarmId"
        placeholder="请选择风场"
        clearable
        style="width: 180px; --el-input-text-color: white"
      >
        <el-option
          v-for="windFarm in windFarmList"
          :key="windFarm.windFarmId"
          :label="windFarm.windFarmName"
          :value="windFarm.windFarmId"
        ></el-option>
      </el-select>
    </el-form-item>
  </div>
  <div class="container">
    <div class="windFarm">
      <windFarm :turbineWarnList="turbineWarnList" />
    </div>
    <div class="warning">
      <warning
        :warning-list="warningList"
        :total-count="totalCount"
        :current-page="page"
        :page-size="pageSize"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.time {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.container {
  display: flex;
  /* overflow: hidden; */
  border: 1px solid #164b6d;
  height: 78vh;
}
.windFarm {
  flex: 4;
  border: 1px solid #164b6d;
  overflow: auto;
}
.warning {
  flex: 3;
  border: 1px solid #164b6d;
  overflow: auto;
}

/* 表单 */
:deep(.el-form-item__label) {
  color: white !important;
}

:deep(.el-select__wrapper) {
  background-color: transparent !important;
  color: white;
}

:deep(.el-select-dropdown) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: white;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-input__wrapper) {
  background-color: transparent !important;
}

:deep(.el-input__inner) {
  background-color: transparent !important;
  color: white !important;
}

:deep(.el-input) {
  --el-input-bg-color: transparent !important;
  --el-input-text-color: white !important;
}
</style>
