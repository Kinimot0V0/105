<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getReport } from '@/api/report'
import { getFarmInfo } from '@/api/warningDetail'
import { getPvFarmList, getDevice } from '@/api/overview'

import { ElMessage } from 'element-plus'
import processReport from '@/components/pendingReport/processReport.vue'
// 公司相关变量
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
///权限相关///
//登录获取角色
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
const roles = userInfo?.roles
// 权限校验方法
const hasPermission = (requiredRoles) => {
  if (!roles || roles.length === 0) return false
  return requiredRoles.some((role) => roles.includes(role))
}
// 按钮权限配置
const buttonPermissions = ['B37']
// 计算属性控制显隐
const showButton = computed(() => hasPermission(buttonPermissions))
///权限相关///

//getModel的信息
const reportList = ref([])
const pvFarmId = ref('')
const boxId = ref('')
const inverterId = ref('')
const combinerId = ref('')

const pvFarmList = ref([])
const boxList = ref([])
const inverterList = ref([])
const combinerList = ref([])

// 控制弹窗显示
const showProcessReportDialog = ref(false)
const currentReportId = ref(null)
const currentDeviceId = ref(null)
const currentDeviceName = ref(null)
const currentPvFarmName = ref(null)
const currentPvFarmId = ref(null)

// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)

const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

// 计算属性：为每个report添加inverterName
// const processedReportList = computed(() => {
//   return reportList.value.map((report) => {
//     // 找到匹配的逆变器
//     const matchedInverter = inverterList.value.find((inverter) => inverter.inverterId === report.inverterId)

//     // 如果找到匹配的逆变器，添加inverterName
//     return {
//       ...report,
//       inverterName: matchedInverter ? matchedInverter.inverterName : '未知逆变器'
//     }
//   })
// })

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

// 全部选项
const pvFarmListWithAll = computed(() => [{ id: '', pvFarmName: '全部' }, ...pvFarmList.value])
const boxListWithAll = computed(() => [{ boxId: '', boxName: '全部' }, ...boxList.value])
const inverterListWithAll = computed(() => [{ inverterId: '', inverterName: '全部' }, ...inverterList.value])
const combinerListWithAll = computed(() => [{ combinerId: '', combinerName: '全部' }, ...combinerList.value])

//获取场站信息
const getPvFarm = async () => {
  try {
    const params = { companyId: companyId.value }
    const { data } = await getPvFarmList(params)
    pvFarmList.value = data.result || []
  } catch (e) {
    console.error('获取场站失败', e)
  }
}

const getDeviceInfo = async () => {
  if (!pvFarmId.value) {
    resetAllSubLists()
    return
  }
  try {
    const { data } = await getDevice({ pvFarmId: pvFarmId.value })
    const tree = data.result || []
    boxList.value = tree.map((t) => ({
      boxId: t.boxTrans.id,
      boxName: t.boxTrans.boxName,
      inverters: t.innerDeviceInfoList || []
    }))
    resetAllSubLists(false) // 只清空箱变以下
  } catch (e) {
    console.error('获取设备树失败', e)
  }
}
const resetAllSubLists = (clearBox = true) => {
  if (clearBox) boxId.value = ''
  inverterId.value = ''
  combinerId.value = ''
  if (clearBox) boxList.value = []
  inverterList.value = []
  combinerList.value = []
}

//获取通知信息
const getReportData = async () => {
  try {
    const params = {
      pageNo: page.value,
      pageSize: pageSize.value,
      startTime: startDate.value,
      endTime: endDate.value,
      companyId: companyId.value
    }

    if (pvFarmId.value) params.pvFarmId = pvFarmId.value
    if (inverterId.value) params.inverterId = inverterId.value
    if (combinerId.value) params.combinerBoxId = combinerId.value
    // console.log('getReportData_params', params)
    const response = await getReport(params)
    // console.log('getReportData返回结果:', response)
    const data = response.data.result

    const reports = data.records
    // 获取电站名称并合并到预警项
    const farmNameCache = {}
    const updatedReports = await Promise.all(
      reports.map(async (warning) => {
        const deviceId = warning.deviceId
        const deviceType = warning.deviceType

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
    reportList.value = updatedReports
    // console.log('reportList:', reportList.value)
    totalCount.value = data.total
    page.value = data.current
    totalPages.value = data.pages
  } catch (error) {
    console.error('获取通知数据失败:', error)
  }
}

// 处理通知的方法
const handleReport = (reportId, pvFarmName, pvFarmId, deviceId, deviceName) => {
  // 设置当前报告ID
  currentReportId.value = reportId
  currentPvFarmName.value = pvFarmName
  currentPvFarmId.value = pvFarmId
  currentDeviceId.value = deviceId
  currentDeviceName.value = deviceName
  // 显示弹窗
  showProcessReportDialog.value = true
}

// 关闭弹窗的方法
const handleDialogClose = () => {
  showProcessReportDialog.value = false
  currentReportId.value = null
}

const handleGet = () => {
  page.value = 1
  getReportData()
}

const handleReset = () => {
  initDefaultTimeRange()
  pvFarmId.value = ''
  boxId.value = ''
  inverterId.value = ''
  combinerId.value = ''
  page.value = 1
  getReportData()
}

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '处理中', color: 'yellow' },
  2: { label: '已办结', color: 'green' }
})

// 初始化时获取场站和逆变器列表
onMounted(async () => {
  initDefaultTimeRange()
  await getCompanyList()
  await getPvFarm()
  getReportData()
})
const refresh = () => {
  // 重新获取数据
  getReportData()
  // console.log('刷新页面')
}
// 更新分页的当前页
const handlePageChange = (current_page) => {
  page.value = current_page
  getReportData()
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  getReportData()
}
watch(boxId, (val) => {
  const box = boxList.value.find((b) => b.boxId === val)
  inverterList.value = val
    ? box?.inverters.map((it) => ({
        inverterId: it.inverter.id,
        inverterName: it.inverter.inverterName,
        combinerBoxList: it.combinerBoxList || []
      }))
    : []
  inverterId.value = ''
  combinerList.value = []
  combinerId.value = ''
  // getReportData()
})

watch(inverterId, (val) => {
  const inv = inverterList.value.find((i) => i.inverterId === val)
  combinerList.value = val
    ? (inv?.combinerBoxList || []).map((c) => ({
        combinerId: c.id,
        combinerName: c.combinerBoxName
      }))
    : []
  combinerId.value = ''
  // getReportData()
})

watch(pvFarmId, () => {
  resetAllSubLists()
  getDeviceInfo()
  // getReportData()
})

// watch([combinerId, startDate, endDate], () => getReportData())
</script>

<template>
  <div class="container">
    <div class="company-line">
      <span class="label">公司</span>
      <el-select
        v-model="companyId"
        placeholder="请选择公司"
        class="selector"
        style="--el-input-text-color: white"
        disabled
      >
        <el-option
          v-for="company in companyList"
          :key="company.companyId"
          :label="company.companyName"
          :value="company.companyId"
        ></el-option>
      </el-select>
    </div>
    <div class="filter-line">
      <span class="label">场站</span>
      <el-select v-model="pvFarmId" class="selector" style="--el-input-text-color: white" placeholder="全部">
        <el-option v-for="f in pvFarmListWithAll" :key="f.id" :label="f.pvFarmName" :value="f.id" />
      </el-select>

      <span class="label">箱变</span>
      <el-select v-model="boxId" class="selector" style="--el-input-text-color: white; width: 110px" placeholder="全部">
        <el-option v-for="b in boxListWithAll" :key="b.boxId" :label="b.boxName" :value="b.boxId" />
      </el-select>

      <span class="label">逆变器</span>
      <el-select v-model="inverterId" class="selector" style="--el-input-text-color: white; width: 180px" placeholder="全部">
        <el-option
          v-for="inv in inverterListWithAll"
          :key="inv.inverterId"
          :label="inv.inverterName"
          :value="inv.inverterId"
        />
      </el-select>

      <span class="label">汇流箱</span>
      <el-select v-model="combinerId" class="selector" style="--el-input-text-color: white; width: 220px" placeholder="全部">
        <el-option v-for="c in combinerListWithAll" :key="c.combinerId" :label="c.combinerName" :value="c.combinerId" />
      </el-select>

      <el-date-picker
        v-model="startDate"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        :disabled-date="disabledDate"
        @change="validateStartDate"
        class="date-picker"
        placeholder="开始时间"
      />
      <span class="date-sep">至</span>
      <el-date-picker
        v-model="endDate"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        :disabled-date="disabledDate"
        @change="validateEndDate"
        class="date-picker"
        placeholder="结束时间"
      />
      <el-button
            style="background-color: #164b6d; border-color: #164b6d; margin-left: 0; color: white;"
            @click="handleGet"
            class="operation">查询</el-button>
        <el-button
            style="background-color: #164b6d; border-color: #164b6d; margin-left: 0px; color: white;"
            @click="handleReset"
            class="operation">重置</el-button>
    </div>
    <el-table :data="reportList">
      <el-table-column label="设备名称" align="center">
        <template #default="scope"> {{ scope.row.pvFarmName }}&nbsp;&nbsp;{{ scope.row.deviceName }} </template>
      </el-table-column>
      <el-table-column prop="employeeName" label="发起人" width="240px" align="center"></el-table-column>
      <el-table-column label="发起时间" width="200px" align="center">
        <template #default="scope">
          {{ scope.row.initialTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="reportText" label="详情" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" width="240px" align="center">
        <template #default="scope">
          <span
            :style="{
              color: statusMap[scope.row.status]?.color
            }"
          >
            {{ statusMap[scope.row.status]?.label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240px" align="center" v-if="showButton">
        <template #default="scope">
          <el-link
            type="primary"
            @click="
              handleReport(
                scope.row.reportId,
                scope.row.pvFarmName,
                scope.row.pvFarmId,
                scope.row.deviceId,
                scope.row.deviceName
              )
            "
          >
            处理
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px; margin-bottom: 15px">
      <div style="margin-right: 10px">共 {{ totalCount }} 条，共 {{ totalPages }} 页</div>

      <!-- 分页组件 -->
      <el-pagination
        background
        layout="prev, pager, next, sizes, jumper"
        :page-size="pageSize"
        :current-page="page"
        :page-sizes="[10, 15, 20, 30]"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>
    <!-- 处理通知的弹窗 -->
    <el-dialog v-model="showProcessReportDialog" title="处理通知" width="60%">
      <processReport
        v-if="showProcessReportDialog"
        :reportId="currentReportId"
        :deviceId="currentDeviceId"
        :deviceName="currentDeviceName"
        :pvFarmId="currentPvFarmId"
        :pvFarmName="currentPvFarmName"
        @close-dialog="handleDialogClose"
        @refresh="refresh"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #164b6d;
  height: 80vh;
}
.info-text {
  display: flex;
  align-items: center;
  position: relative;
  padding: 10px;
}

.info-text::after {
  content: '';
  height: 35px;
  width: 2px;
  background-color: #15608a;
  margin-left: -995px;
}
.company {
  background: linear-gradient(to bottom, #102842, #15608a);
  width: 140px;
  font-size: 15px;
  padding: 15px;
  color: white;
  border: #164476;
}
.span-name {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 15px;
  background-color: #143f5c;
  border: 1px solid #143f5c;
  font-size: 15px;
  width: 60px;
  height: 8px;
  padding: 10px;
}
.pv-farm-select {
  width: 160px;
}
.company-line {
  margin-bottom: 10px;
  display: flex;
  gap: 15px;
}
.filter-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.selector {
  width: 160px;
}
.label {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #143f5c;
  border: 1px solid #143f5c;
  font-size: 15px;
  width: 60px;
  height: 8px;
  padding: 10px;
}
.info-text {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  padding: 10px;
}
.el-table {
  border-collapse: collapse;
  text-align: center;
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
/* 分页组件 */
:deep(.el-pagination) {
  background-color: transparent !important;
  color: #c2dcf5 !important;

  .el-pager li,
  button.btn-prev,
  button.btn-next {
    background-color: transparent !important;
    color: #c2dcf5 !important;
    border: 1px solid #164b6d !important;
  }

  .el-pager li.is-active {
    background-color: #143f5c !important;
    color: #ffffff !important;
    border-color: #164b6d !important;
  }

  .el-input__wrapper {
    background-color: transparent !important;
    box-shadow: none !important;
    border: 1px solid #164b6d !important;
  }

  .el-input__inner {
    color: #c2dcf5 !important;
  }

  .el-pagination__jump {
    color: #fff !important;
  }
}
/* 弹窗 */
:deep(.el-dialog__wrapper) {
  background-color: rgba(20, 63, 92, var(--overlay-opacity, 0.8)) !important;
}

:deep(.el-dialog) {
  background-color: rgba(20, 63, 92, var(--dialog-opacity, 0.8)) !important;
  box-shadow: none !important;
  color: white !important;
}

/* 针对标题 */
:deep(.el-dialog__header .el-dialog__title) {
  color: white !important;
}

/* 针对内容 */
:deep(.el-dialog__body) {
  color: white !important;
}

/* 如果有关闭按钮 */
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white !important;
}
</style>
