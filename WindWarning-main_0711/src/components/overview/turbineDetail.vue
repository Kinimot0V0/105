<template>
  <div class="turbine-detail">
    <!-- 返回按钮 -->
    <div class="button-container">
      <el-button @click="goBack" type="primary" size="large" style="margin-right: 500px;">返回</el-button>
      <el-button :class="{ active: selectedRange === '7' }" type="primary" @click="handleRecentSevenDays">最近7天</el-button>
    <el-button :class="{ active: selectedRange === '30' }" type="primary" @click="handleRecentThirtyDays">最近30天</el-button>

    <el-date-picker
      v-model="startDate"
      type="datetime"
      placeholder="选择开始时间"
      :clearable="true"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      style="width: 180px; margin-left: 20px; margin-right: 10px;"
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
      style="width: 180px; margin-left: 10px;"
      :disabledDate="disabledDate"
      @change="validateEndDate"
    ></el-date-picker>
    </div>

    <div class="content">
      <!-- 左侧：三维风机模型显示区域 -->
      <div class="left-panel">
        <!-- 浮在三维显示区域上的设备按钮 -->
        <div class="device-buttons">
          <el-button 
            v-for="(device, index) in devices" 
            :key="index"
            :type="selectedDevice === device.code ? 'primary' : ''"
            size="large"
            @click="selectDevice(device.code)"
          >
            {{ device.name }}
          </el-button>
        </div>

        <!-- 三维风机模型 iframe -->
        <iframe 
          :src="baseModelUrl" 
          class="model-frame"
          frameborder="0"
        ></iframe>
      </div>

      <!-- 右侧：信息显示区域 -->
      <div class="right-panel">
        <!-- 风机基本信息显示区域 -->
        <div class="info-section">
          <h3>风机基本信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="项目">{{ turbineInfo.company }}</el-descriptions-item>
            <el-descriptions-item label="场站">{{ turbineInfo.farm }}</el-descriptions-item>
            <el-descriptions-item label="风机名称">{{ turbineInfo.turbineName }}</el-descriptions-item>
            <el-descriptions-item label="容量">{{ turbineInfo.capacity }}</el-descriptions-item>
            <el-descriptions-item label="运行状态">{{ turbineInfo.status }}</el-descriptions-item>
            <el-descriptions-item label="风速">{{ turbineInfo.windSpeed }}</el-descriptions-item>
            <el-descriptions-item label="功率">{{ turbineInfo.power }}</el-descriptions-item>
            <el-descriptions-item label="环境温度">{{ turbineInfo.temperature }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 预警信息列表 -->
        <div class="warning-section">
          <h3>预警信息列表</h3>
          <el-table :data="filteredWarnings" style="width: 100%">
            <el-table-column prop="" label="开始时间" ></el-table-column>
            <el-table-column prop="" label="结束时间" ></el-table-column>
            <el-table-column prop="" label="预警信息"></el-table-column>
            <el-table-column prop="" label="管理分级" ></el-table-column>
            <el-table-column prop="" label="状态" ></el-table-column>
            <el-table-column prop="" label="详情" ></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 路由相关
const route = useRoute()
const router = useRouter()

//风机id
const turbineId = route.query.turbineId

const companyId = ref(Number(sessionStorage.getItem('companyId')) || null)

// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)
// 新增：选择范围状态： '7' | '30' | null
const selectedRange = ref('7') // 默认最近7天高亮

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
  selectedRange.value = '7'
}

// 最近30天按钮处理
const handleRecentThirtyDays = () => {
  endDate.value = formatDate(getCurrentTime())
  startDate.value = formatDate(getDateBefore(30))
  selectedRange.value = '30'
}

// 判断当前 startDate/endDate 是否为 最近 N 天（允许少量时间偏差）
const isRecentDays = (days) => {
  if (!startDate.value || !endDate.value) return false
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const now = getCurrentTime()
  const targetStart = getDateBefore(days)
  // 允许 2 秒以内的时间误差
  return Math.abs(end.getTime() - now.getTime()) < 2000 && Math.abs(start.getTime() - targetStart.getTime()) < 2000
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

// 设备列表
const devices = ref([
  { code: '01', name: '逆变器' },
  { code: '02', name: '变桨系统' },
  { code: '03', name: '齿轮箱' },
  { code: '04', name: '发电机' },
  { code: '05', name: '机舱' },
  { code: '06', name: '塔筒' },
  { code: '07', name: '塔底' },
  { code: '08', name: '液压系统' }
])

// 当前选中的设备
const selectedDevice = ref('')

// 选择设备
const selectDevice = (deviceCode) => {
  selectedDevice.value = deviceCode
}

// 返回概览页面
const goBack = () => {
  router.go(-1)
}

// 三维模型基础URL
const baseModelUrl = ref('https://simuview.bernouly.com/QProject/FJGraphic/index.html')

// // 构造带参数的模型URL
// const modelUrl = computed(() => {
//   // 示例数据：哪些设备有报警
//   const warningDevices = ['01', '03'] // 这些应该从实际数据中获取
  
//   // 构造color参数
//   let colorParams = warningDevices.map(code => `color=${code}warning`).join('&')
  
//   // 构造run参数（假设02号设备桨叶正常旋转）
//   let runParam = 'run=02y'
  
//   // 组合完整的URL
//   return `${baseModelUrl.value}?${colorParams}&${runParam}`
// })

// 风机基本信息
const turbineInfo = ref({
  company: '项目',
  farm: '场站',
  turbineName: '风机名称',
  capacity: '容量',
  status: '状态',
  windSpeed: '风速',
  power: '功率',
  temperature: '温度'
})

// 所有预警信息（示例数据）
const warnings = ref([])

// 根据选中设备过滤的预警信息
const filteredWarnings = computed(() => {
  if (!selectedDevice.value) {
    return warnings.value
  }
  return warnings.value.filter(warning => {
    const device = devices.value.find(d => d.code === selectedDevice.value)
    return warning.device === device.name
  })
})

// 组件挂载时的处理
onMounted(() => {
  // 从路由参数中获取风机ID等信息
  console.log('Turbine ID:', route.query.turbineId)
  initDefaultTimeRange()
  selectedRange.value = '7'
})

watch([startDate, endDate], () => {
    if (isRecentDays(7)) {
    selectedRange.value = '7'
  } else if (isRecentDays(30)) {
    selectedRange.value = '30'
  } else {
    selectedRange.value = null
  }
})
</script>

<style scoped>
.turbine-detail {
  height: 78vh;
  display: flex;
  flex-direction: column;
}

.button-container {
  padding: 10px;
  border-bottom: 1px solid #164b6d;
}
.button-container .active {
  background-color: #f6c555 !important; /* 黄色 */
  border-color: #f6c555 !important;
  color: #000 !important;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 960px; /* 固定宽度以适应模型 */
  height: 600px; /* 固定高度以适应模型 */
  position: relative;
  border-right: 1px solid #164b6d;
}

.device-buttons {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  max-width: calc(100% - 20px);
}

.device-buttons .el-button{
    background-color: #1b557c7d;
    color: white;
}

.model-frame {
  width: 960px;
  height: 600px;
}

.right-panel {
  flex: 1; /* 占据剩余空间 */
  min-width: 300px; /* 最小宽度 */
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.info-section, .warning-section {
  padding: 15px;
  border-bottom: 1px solid #164b6d;
}

.info-section h3, .warning-section h3 {
  margin-top: 0;
  color: white;
}

/* Element Plus 样式定制 */
:deep(.el-input__wrapper) {
  background-color: transparent !important;
}
:deep(.el-input__inner) {
  background-color: transparent !important;
  color: white !important;
}
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    color: white;
}

:deep(.el-descriptions__content.el-descriptions__cell.is-bordered-content) {
    color: #ffffff;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  color: white;
  background-color: #143f5c !important;
  width: 100px !important;
}

:deep(.el-descriptions__cell) {
  color: #c2dcf5;
  border-color: #164b6d !important;
}

:deep(.el-table) {
  background-color: transparent;
  --el-table-border-color: #164b6d;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #143f5c;
  --el-table-text-color: #c2dcf5;
}

:deep(.el-table th) {
  color: white;
  background-color: #143f5c !important;
}

:deep(.el-table td) {
  color: #c2dcf5;
  background-color: transparent !important;
}

:deep(.el-table__row:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 响应式设计：当屏幕较小时调整布局 */
@media (max-width: 1400px) {
  .content {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    height: 600px;
  }
  
  .model-frame {
    width: 100%;
    height: 600px;
  }
  
  .right-panel {
    width: 100%;
  }
}
</style>