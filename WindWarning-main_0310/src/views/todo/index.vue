<script setup>
import { ref, onMounted, watch,nextTick } from 'vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import todoList from '@/components/todo/todoList.vue'
import turbine from '@/components/todo/turbine.vue'
import { ElMessage } from 'element-plus'
import { getWaitDoneInfo } from '@/api/todo'
import flow from '@/components/todo/flow.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const companyId = ref(1)
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
  // 转换数据为树形结构
  return data.map((companyData) => ({
    windFarm_id: companyData.windFarmId,
    label: companyData.windFarmName,
    expanded: false,
    children: companyData.turbineWaitDoneInfo.map((turbine) => ({
      reportSum: turbine.reportSum,
      warningLevel1waitCloseWaitSum: turbine.warningLevel1waitCloseWaitSum,
      warningLevel1waitDoneSum: turbine.warningLevel1waitDoneSum,
      warningLevel1waitHangUpSum: turbine.warningLevel1waitHangUpSum,
      warningLevel2waitCloseWaitSum: turbine.warningLevel2waitCloseWaitSum,
      warningLevel2waitDoneSum: turbine.warningLevel2waitDoneSum,
      warningLevel2waitHangUpSum: turbine.warningLevel2waitHangUpSum,
      modelList: turbine.modelList,
      turbine_id: turbine.turbineId,
      turbine_name: turbine.turbineName,
      selected: false
    }))
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
    // console.log('/ews/waitdone/getWaitDoneInfo_params', params)
    infoList.value = response.data.result
    // console.log('/ews/waitdone/getWaitDoneInfo返回值', infoList.value)
    companyName.value = infoList.value[0].companyName

    // 转换数据时保留原有的展开状态
    treeData.value = transformData(infoList.value).map((farm) => {
      const existingFarm = treeData.value.find((f) => f.windFarm_id === farm.windFarm_id)
      if (existingFarm) {
        farm.expanded = existingFarm.manuallyExpanded || existingFarm.expanded
      }
      return farm
    })
  } catch (error) {
    console.error('获取待办信息数据失败:', error)
  }
}

//已选中风机的信息
const selectedTurbineInfo = ref(null)

const handleTurbineClick = (params) => {
  // 同时支持对象参数和原始参数
  const turbineId = params.turbineId || params.turbine_id
  const windFarmId = params.windFarmId || params.windFarm_id

  const targetFarm = treeData.value.find(
    farm => farm.windFarm_id === windFarmId
  )

  if (!targetFarm) return

  const targetTurbine = targetFarm.children.find(
    turbine => turbine.turbine_id === turbineId
  )

  if (targetTurbine) {
    // 更新模型数据
    todoListData.value = targetTurbine.modelList || []
    
    // 更新选中信息
    selectedTurbineInfo.value = {
      turbineId: targetTurbine.turbine_id,
      turbineName: targetTurbine.turbine_name,
      windFarmId: targetFarm.windFarm_id,
      windFarmName: targetFarm.label,
      companyName: companyName.value,
      warningLevel1waitCloseWaitSum: targetTurbine.warningLevel1waitCloseWaitSum,
      warningLevel1waitDoneSum: targetTurbine.warningLevel1waitDoneSum,
      warningLevel1waitHangUpSum: targetTurbine.warningLevel1waitHangUpSum,
      warningLevel2waitCloseWaitSum: targetTurbine.warningLevel2waitCloseWaitSum,
      warningLevel2waitDoneSum: targetTurbine.warningLevel2waitDoneSum,
      warningLevel2waitHangUpSum: targetTurbine.warningLevel2waitHangUpSum,
      reportSum: targetTurbine.reportSum
    }
  }
}


onMounted(async () => {
  try {
    // 初始化时间（保留原有逻辑）
    if (!route.query.startDate || !route.query.endDate) {
      initDefaultTimeRange()
    } else {
      startDate.value = route.query.startDate
      endDate.value = route.query.endDate
    }

    // 恢复信息类别
    if (route.query.infoType) {
      infoType.value = Number(route.query.infoType)
    }

    // 关键修改：确保数据加载完成
    await getWDInfo() // 添加 await 确保数据加载完成

    // 恢复选中的风机
    if (route.query.turbineId && route.query.windFarmId) {
      const targetFarm = treeData.value.find(
        farm => farm.windFarm_id === Number(route.query.windFarmId)
      )
      
      if (targetFarm) {
        // 展开风场
        targetFarm.expanded = true
        targetFarm.manuallyExpanded = true

        // 查找目标风机
        const targetTurbine = targetFarm.children.find(
          turbine => turbine.turbine_id === Number(route.query.turbineId)
        )

        if (targetTurbine) {
          // 清除其他选中状态
          treeData.value.forEach(farm => 
            farm.children.forEach(turbine => turbine.selected = false)
          )
          
          // 设置选中状态
          targetTurbine.selected = true
          
          // 关键修改：等待 DOM 更新
          await nextTick()
          
          // 触发点击处理
          handleTurbineClick({
            turbineId: targetTurbine.turbine_id,
            windFarmId: targetFarm.windFarm_id
          })
        }
      }
    }
  } catch (error) {
    console.error('初始化错误:', error)
  }
})
watch([startDate, endDate, infoType], async () => {
  if (!startDate.value || !endDate.value) return
  
  // 保存当前选中状态
  const currentSelected = treeData.value
    .flatMap(farm => farm.children)
    .find(turbine => turbine.selected)

  await getWDInfo()

  // 恢复选中状态
  if (currentSelected) {
    await nextTick()
    handleTurbineClick({
      turbineId: currentSelected.turbine_id,
      windFarmId: treeData.value.find(farm => 
        farm.children.includes(currentSelected)
      ).windFarm_id
    })
  }
})
</script>

<template>
  <div class="header">
    <div class="header-left">
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
    <div class="turbine">
      <turbine :treeData="treeData" @turbine-click="handleTurbineClick" />
    </div>
    <div class="todoList">
      <div class="model">
        <todoList :todoListData="todoListData" :infoType="infoType" />
      </div>
      <div class="flow-chart">
        <flow :selectedTurbine="selectedTurbineInfo" :startDate="startDate" :endDate="endDate" :infoType="infoType"/>
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

.turbine {
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