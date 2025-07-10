<script setup>
import { ref, onMounted, watch } from 'vue'
import pvFarm from '@/components/overview/pvFarm.vue'
import warning from '@/components/overview/warning.vue'
import { ElMessage } from 'element-plus'
import { getPvFarmList, getFarmInfo, getDevice } from '@/api/overview'
import { getWarning } from '@/api/warning'

// 公司相关
import { getCompany } from '@/api/company'
const companyId = ref(Number(sessionStorage.getItem('companyId')) || null)
const companyList = ref([])

// 获取公司列表
const getCompanyList = async () => {
  try {
    const response = await getCompany()
    companyList.value = response.data.result
    return response
  } catch (error) {
    console.error('获取公司数据失败:', error)
  }
}

// 场站选择相关
const id = ref(0)
const pvFarmList = ref([])

// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)

//预警相关
const warningList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(8)
const totalPages = ref(0)

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
const getPvFarm = async () => {
  try {
    const params = { companyId: companyId.value }
    const response = await getPvFarmList(params)
    // 在列表开头添加全部场站选项
    pvFarmList.value = [{ id: -1, pvFarmName: '全部场站' }, ...response.data.result]
    // 设置默认选中全部场站
    id.value = -1
    return response
  } catch (error) {
    console.error('获取场站数据失败:', error)
  }
}

const getWarningData = async () => {
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      startDate: startDate.value,
      endDate: endDate.value,
      companyId: companyId.value
    }
    if (id.value != -1) {
      params.pvFarmId = id.value
    }

    const response = await getWarning(params)
    const data = response.data.result
    // console.log('getWarning返回', response)
    const warnings = data.warningList

    // 获取电站名称并合并到预警项
    const farmNameCache = {}
    const updatedWarnings = await Promise.all(
      warnings.map(async (warning) => {
        const deviceId = warning.deviceId
        const deviceType = warning.modelType

        // 创建唯一缓存键
        const cacheKey = `${deviceType}:${deviceId}`

        if (farmNameCache[cacheKey]) {
          return { ...warning, pvFarmName: farmNameCache[cacheKey] }
        }

        try {
          // 修正参数传递（使用正确的字段名）
          const farmResponse = await getFarmInfo({
            deviceId,
            deviceType
          })

          // 检查响应结构（根据实际响应调整）
          const result = farmResponse.data?.result || {}
          const pvFarmName = result.pvFarmName || '未知电站'

          farmNameCache[cacheKey] = pvFarmName
          return { ...warning, pvFarmName }
        } catch (error) {
          console.error('场站信息获取失败', { deviceId, deviceType, error })
          return { ...warning, pvFarmName: '未知电站' }
        }
      })
    )
    warningList.value = updatedWarnings

    totalCount.value = data.total_count
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取预警数据失败:', error)
  }
}

//设备矩阵相关
// const deviceWarnList = ref([])

// const getDeviceWarnData = async () => {
//   try {
//     const params = {
//       pvFarmId: 2,
//       startDate: formatDate(startDate.value),
//       endDate: formatDate(endDate.value)
//       // startDate: '2024-11-06 15:43:30',
//       // endDate: '2024-11-06 16:00:00'
//     }
//     console.log('getDeviceWarnData_params:', params)
//     const response = await getDeviceWarnList(params)
//     console.log('getDeviceWarnData返回结果:', response)
//     deviceWarnList.value = response.data.result
//   } catch (error) {
//     console.error('获取设备矩阵数据失败:', error)
//   }
// }

//设备相关
const deviceList = ref([])

const getDeviceData = async () => {
  try {
    if (id.value === -1) {
      // 全部场站，处理多个列表
      const realFarms = pvFarmList.value.slice(1)

      const responses = await Promise.all(
        realFarms.map(async (farm) => {
          const response = await getDevice({ pvFarmId: farm.id })
          const devices = response.data.result || []

          return {
            pvFarmId: farm.id,
            pvFarmName: farm.pvFarmName,
            pvFarmType: farm.pvFarmType,
            devices
          }
        })
      )

      deviceList.value = responses
    } else {
      // 单个场站
      const selectedFarm = pvFarmList.value.find((farm) => farm.id === id.value)
      if (!selectedFarm) return

      const response = await getDevice({ pvFarmId: selectedFarm.id })
      const devices = response.data.result || []

      deviceList.value = [
        {
          pvFarmId: selectedFarm.id,
          pvFarmName: selectedFarm.pvFarmName,
          pvFarmType: selectedFarm.pvFarmType,
          devices
        }
      ]
    }

    // console.log('deviceList.value', deviceList.value)
  } catch (error) {
    console.error('获取设备数据失败:', error)
  }
}

// const getDeviceWarnData = async () => {
//   try {
//     if (pvFarmId.value === -1) {
//       // 获取排除"全部场站"后的真实场站列表
//       const realFarms = pvFarmList.value.slice(1)
//       // 并发获取所有场站数据
//       const responses = await Promise.all(
//         realFarms.map(farm =>
//           getDeviceWarnList({
//             pvFarmId: farm.pvFarmId,
//             startDate: formatDate(startDate.value),
//             endDate: formatDate(endDate.value)
//           })
//         )
//       )
//       // 合并所有结果
//       deviceWarnList.value = responses.flatMap(r => r.data.result)
//     } else {
//       // 原有单个场站请求逻辑
//       const params = {
//         pvFarmId: pvFarmId.value,
//         startDate: formatDate(startDate.value),
//         endDate: formatDate(endDate.value)
//       }
//       const response = await getDeviceWarnList(params)
//       deviceWarnList.value = response.data.result
//     }
//   } catch (error) {
//     console.error('获取设备矩阵数据失败:', error)
//   }
// }

// 组件挂载时初始化默认时间范围 获取场站
onMounted(async () => {
  try {
    initDefaultTimeRange()
    await getCompanyList()
    await getPvFarm()
  } catch (error) {
    console.error('Initialization error:', error)
  }
})

// 监听开始时间、结束时间和场站 ID 的变化
watch([startDate, endDate, id], () => {
  if (pvFarmList.value.length && startDate.value && endDate.value) {
    page.value = 1
    getWarningData()
    getDeviceData()
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
    <el-form-item label="公司：" prop="companyId">
      <el-select
        v-model="companyId"
        placeholder="请选择公司"
        class="wind-farm-select"
        style="width: 180px; --el-input-text-color: white"
        disabled
      >
        <el-option
          v-for="company in companyList"
          :key="company.companyId"
          :label="company.companyName"
          :value="company.companyId"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="场站：" prop="pvFarmId">
      <el-select v-model="id" placeholder="请选择场站" clearable style="width: 180px; --el-input-text-color: white">
        <el-option
          v-for="pvFarm in pvFarmList"
          :key="pvFarm.id"
          :label="pvFarm.pvFarmName"
          :value="pvFarm.id"
        ></el-option>
      </el-select>
    </el-form-item>
  </div>
  <div class="container">
    <div class="pvFarm">
      <pvFarm :deviceList="deviceList" />
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
  /* border: 1px solid #164b6d; */
  height: 78vh;
}
.pvFarm {
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
