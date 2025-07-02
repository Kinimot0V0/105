<script setup> 
import { ref, onMounted, watch, nextTick } from 'vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import todoList from '@/components/todo/todoList.vue'
import device from '@/components/todo/device.vue'
import { ElMessage } from 'element-plus'
import { getWaitDoneInfo } from '@/api/todo'
import flow from '@/components/todo/flow.vue'
import { useRoute } from 'vue-router'

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

const route = useRoute()
const deviceIdFromQuery = Number(route.query.deviceId)
const pvFarmIdFromQuery = Number(route.query.pvFarmId)

const companyName = ref('')
const infoList = ref([])
const treeData = ref([])
const todoListData = ref([])
// 选择的起始和结束时间
const startDate = ref(null)
const endDate = ref(null)

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

const infoTypeList = ref([
  {
    id: 0,
    name: '全部'
  },
  {
    id: 1,
    name: '预警一级'
  },
  {
    id: 2,
    name: '预警二级'
  },
  {
    id: 3,
    name: '通知'
  }
])

const infoType = ref(infoTypeList.value[0].id)
const transformData = (data) => {
  return data.map((station) => ({
    pvFarm_id: station.pvFarmId,
    label: station.pvFarmName,
    expanded: false,
    manuallyExpanded: false,
    children: station.inverterWaitDoneInfo.map((inverter) => {
      const hasCombiner = Array.isArray(inverter.combinerBoxWaitDoneInfo) && inverter.combinerBoxWaitDoneInfo.length > 0

      // 三层结构：逆变器 → 汇流箱
      if (hasCombiner) {
        return {
          device_id: inverter.deviceId,
          device_name: inverter.deviceName,
          expanded: false,
          manuallyExpanded: false,
          children: inverter.combinerBoxWaitDoneInfo.map((box) => ({
            device_id: box.deviceId,
            device_name: box.deviceName,
            reportSum: box.reportSum,
            warningLevel1waitCloseWaitSum: box.warningLevel1waitCloseWaitSum,
            warningLevel1waitDoneSum: box.warningLevel1waitDoneSum,
            warningLevel1waitHangUpSum: box.warningLevel1waitHangUpSum,
            warningLevel2waitCloseWaitSum: box.warningLevel2waitCloseWaitSum,
            warningLevel2waitDoneSum: box.warningLevel2waitDoneSum,
            warningLevel2waitHangUpSum: box.warningLevel2waitHangUpSum,
            modelList: box.modelList,
            pvFarmId: station.pvFarmId,
            selected: false
          }))
        }
      }

      // 二层结构：逆变器为叶子节点
      return {
        device_id: inverter.deviceId,
        device_name: inverter.deviceName,
        reportSum: inverter.reportSum,
        warningLevel1waitCloseWaitSum: inverter.warningLevel1waitCloseWaitSum,
        warningLevel1waitDoneSum: inverter.warningLevel1waitDoneSum,
        warningLevel1waitHangUpSum: inverter.warningLevel1waitHangUpSum,
        warningLevel2waitCloseWaitSum: inverter.warningLevel2waitCloseWaitSum,
        warningLevel2waitDoneSum: inverter.warningLevel2waitDoneSum,
        warningLevel2waitHangUpSum: inverter.warningLevel2waitHangUpSum,
        modelList: inverter.modelList,
        pvFarmId: station.pvFarmId,
        selected: false
      }
    })
  }))
}

const getWDInfo = async () => {
  try {
    const params = {
      companyId: companyId.value,
      infoType: infoType.value,
      startDate: startDate.value,
      endDate: endDate.value
    }

    const response = await getWaitDoneInfo(params)
    console.log('getWDInfo_params', params)
    infoList.value = response.data.result
    console.log('getWDInfo返回值', infoList.value)
    companyName.value = infoList.value[0].companyName

    const transformed = transformData(infoList.value)

    transformed.forEach((station) => {
      if (station.pvFarm_id === pvFarmIdFromQuery.value) {
        station.expanded = true
        station.manuallyExpanded = true

        for (const inverter of station.children || []) {
          if (!inverter.children) {
            if (inverter.device_id === deviceIdFromQuery.value) {
              inverter.selected = true
            }
          } else {
            inverter.expanded = true
            inverter.manuallyExpanded = true
            for (const box of inverter.children || []) {
              if (box.device_id === deviceIdFromQuery.value) {
                box.selected = true
              }
            }
          }
        }
      }
    })
    treeData.value = transformed
    // // 转换为树结构并恢复展开状态
    // const transformed = transformData(infoList.value)
    // treeData.value = transformed.map((station) => {
    //   const existingStation = treeData.value.find((s) => s.pvFarm_id === station.pvFarm_id)
    //   if (existingStation) {
    //     station.expanded = existingStation.manuallyExpanded || existingStation.expanded
    //     station.manuallyExpanded = existingStation.manuallyExpanded

    //     station.children.forEach((inverter) => {
    //       const existingInverter = existingStation.children?.find((i) => i.device_id === inverter.device_id)
    //       if (existingInverter) {
    //         inverter.expanded = existingInverter.manuallyExpanded || existingInverter.expanded
    //         inverter.manuallyExpanded = existingInverter.manuallyExpanded
    //       }
    //     })
    //   }
    //   return station
    // })
  } catch (error) {
    console.error('获取待办信息数据失败:', error)
  }
}

//已选中设备的信息
const selectedDeviceInfo = ref(null)

const handleDeviceClick = (params) => {
  const deviceId = params.deviceId || params.device_id
  const pvFarmId = params.pvFarmId || params.pvFarm_id

  for (const station of treeData.value) {
    if (station.pvFarm_id !== pvFarmId) continue

    for (const inverter of station.children || []) {
      // 情况1：逆变器为叶子节点（无汇流箱）
      if (!inverter.children) {
        inverter.selected = inverter.device_id === deviceId
        if (inverter.selected) {
          todoListData.value = inverter.modelList || []
          selectedDeviceInfo.value = {
            deviceId: inverter.device_id,
            deviceType: 2,
            deviceName: inverter.device_name,
            pvFarmId: station.pvFarm_id,
            pvFarmName: station.label,
            companyName: companyName.value,
            warningLevel1waitCloseWaitSum: inverter.warningLevel1waitCloseWaitSum,
            warningLevel1waitDoneSum: inverter.warningLevel1waitDoneSum,
            warningLevel1waitHangUpSum: inverter.warningLevel1waitHangUpSum,
            warningLevel2waitCloseWaitSum: inverter.warningLevel2waitCloseWaitSum,
            warningLevel2waitDoneSum: inverter.warningLevel2waitDoneSum,
            warningLevel2waitHangUpSum: inverter.warningLevel2waitHangUpSum,
            reportSum: inverter.reportSum
          }
        }
      }

      // 情况2：有汇流箱
      for (const box of inverter.children || []) {
        box.selected = false
        if (box.device_id === deviceId) {
          box.selected = true
          todoListData.value = box.modelList || []
          selectedDeviceInfo.value = {
            deviceId: box.device_id,
            deviceType: 1,
            deviceName: box.device_name,
            pvFarmId: station.pvFarm_id,
            pvFarmName: station.label,
            companyName: companyName.value,
            warningLevel1waitCloseWaitSum: box.warningLevel1waitCloseWaitSum,
            warningLevel1waitDoneSum: box.warningLevel1waitDoneSum,
            warningLevel1waitHangUpSum: box.warningLevel1waitHangUpSum,
            warningLevel2waitCloseWaitSum: box.warningLevel2waitCloseWaitSum,
            warningLevel2waitDoneSum: box.warningLevel2waitDoneSum,
            warningLevel2waitHangUpSum: box.warningLevel2waitHangUpSum,
            reportSum: box.reportSum
          }
        }
      }
    }
  }
  console.log('selectedDeviceInfo:', selectedDeviceInfo.value)
}

onMounted(async () => {
  try {
    await getCompanyList()
    if (!route.query.startDate || !route.query.endDate) {
      initDefaultTimeRange()
    } else {
      startDate.value = route.query.startDate
      endDate.value = route.query.endDate
    }

    if (route.query.infoType) {
      infoType.value = Number(route.query.infoType)
    }
    // 恢复公司
    if (route.query.companyId) {
      companyId.value = Number(route.query.companyId)
    }

    await getWDInfo()

    if (route.query.deviceId && route.query.pvFarmId) {
      const pvFarmId = Number(route.query.pvFarmId)
      const deviceId = Number(route.query.deviceId)

      const targetStation = treeData.value.find((s) => s.pvFarm_id === pvFarmId)
      if (targetStation) {
        targetStation.expanded = true
        targetStation.manuallyExpanded = true

        for (const inverter of targetStation.children || []) {
          // 处理有汇流箱（三层结构）
          const targetBox = inverter.children?.find((box) => box.device_id === deviceId)
          if (targetBox) {
            inverter.expanded = true
            inverter.manuallyExpanded = true
            await nextTick()
            handleDeviceClick({ deviceId, pvFarmId })
            return
          }

          // 处理二层结构（逆变器为叶子节点）
          if (!inverter.children && inverter.device_id === deviceId) {
            await nextTick()
            handleDeviceClick({ deviceId, pvFarmId })
            return
          }
        }
      }
    }
  } catch (error) {
    console.error('初始化错误:', error)
  }
})

watch([startDate, endDate, infoType, companyId], async () => {
  if (!startDate.value || !endDate.value) return

  let currentSelected = null

  for (const station of treeData.value) {
    for (const inverter of station.children || []) {
      // 三层结构：查找汇流箱是否 selected
      if (Array.isArray(inverter.children) && inverter.children.length > 0) {
        const found = inverter.children.find((box) => box.selected)
        if (found) {
          currentSelected = { deviceId: found.device_id, pvFarmId: station.pvFarm_id }
          break
        }
      } else {
        // 二层结构：逆变器本身作为叶子节点
        if (inverter.selected) {
          currentSelected = { deviceId: inverter.device_id, pvFarmId: station.pvFarm_id }
          break
        }
      }
    }
  }

  await getWDInfo()

  if (currentSelected) {
    await nextTick()
    handleDeviceClick(currentSelected)
  }
})
</script>

<template>
  <div class="header">
    <div class="header-left">
      <el-form-item label="公司" class="info-category">
        <el-select
          v-model="companyId"
          placeholder="请选择"
          class="wind-farm-select"
          style="--el-input-text-color: white; width: 120px; margin-right: 10px"
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
      <span class="info"></span>
      <el-form-item label="信息类别" class="info-category">
        <el-select
          v-model="infoType"
          placeholder="全部"
          value-key="id"
          style="--el-input-text-color: white; width: 100px"
        >
          <el-option
            v-for="infoType in infoTypeList"
            :key="infoType.id"
            :label="infoType.name"
            :value="infoType.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </div>
    <div class="header-right">
      <div class="time-filter">
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
      </div>
    </div>
  </div>
  <div class="main">
    <div class="device">
      <device :treeData="treeData" :companyName="companyName" @device-click="handleDeviceClick" />
    </div>
    <div class="todoList">
      <div class="model">
        <todoList :todoListData="todoListData" :infoType="infoType" />
      </div>
      <div class="flow-chart">
        <flow
          :selectedDevice="selectedDeviceInfo"
          :startDate="startDate"
          :endDate="endDate"
          :infoType="infoType"
          :companyId="companyId"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #164b6d;
}

.header-left {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.header-left::after {
  content: '';
  height: 30px;
  width: 2px;
  background-color: #059af6;
  margin-left: 15px;
}
.info {
  width: 16px;
  height: 16px;
  background-color: #2098b2;
  color: white;
  border-radius: 3px;
  margin-right: 5px;
}
.info-category {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.info-category .el-form-item__label {
  margin-right: 10px;
}

.header-right {
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
}

.time-filter {
  display: flex;
  align-items: center;
}

.date-picker-container {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.date-separator {
  margin: 0 10px;
}

.time-filter .el-button {
  margin-right: 10px;
}

.main {
  display: flex;
  margin-top: 10px;
  border: 1px solid #164b6d;
  height: 75vh;
  overflow: hidden;
}

.todoList {
  flex: 3;
  display: flex;
  flex-direction: column;
  margin: 5px;
  border: 1px solid #164b6d;
}
.model {
  flex: 3;
  overflow: auto;
}
.flow-chart {
  flex: 4;
  border: 1px solid #164b6d;
}

.device {
  flex: 1;
  margin: 5px;
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