<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getReport } from '@/api/report'
import { getWindFarmList } from '@/api/overview'
import { getTurbineList } from '@/api/report'
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
// const companyName = ref('内蒙古公司')
const turbineId = ref(null)
const windFarmId = ref(null)
const windFarmList = ref([])
const turbineList = ref([])

// 控制弹窗显示
const showProcessReportDialog = ref(false)
const currentReportId = ref(null)
const currentTurbineId = ref(null)
const currentWindFarmName = ref(null)
const currentWindFarmId = ref(null)

// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)

const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

// 计算属性：为每个report添加turbineName
// const processedReportList = computed(() => {
//   return reportList.value.map((report) => {
//     // 找到匹配的风机
//     const matchedTurbine = turbineList.value.find((turbine) => turbine.turbineId === report.turbineId)

//     // 如果找到匹配的风机，添加turbineName
//     return {
//       ...report,
//       turbineName: matchedTurbine ? matchedTurbine.turbineName : '未知风机'
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

// 计算风机列表（包含全部选项）
const turbineListWithAll = computed(() => {
  if (!windFarmId.value) {
    return [{ turbineId: '', turbineName: '全部' }]
  }
  return [{ turbineId: '', turbineName: '全部' }, ...turbineList.value]
})
// 获取风场信息 - 修改为根据公司ID获取
const getWindFarm = async () => {
  try {
    if (!companyId.value) return
    const params = { companyId: companyId.value }
    const response = await getWindFarmList(params)
    windFarmList.value = [{ windFarmId: '', windFarmName: '全部' }, ...response.data.result]
    return response
  } catch (error) {
    console.error('获取风场数据失败:', error)
  }
}

//根据风场id查风机
const getTurbine = async () => {
  try {
    if (!windFarmId.value) {
      turbineList.value = []
      turbineId.value = ''
      return
    }

    const params = {
      windFarmId: windFarmId.value
    }
    const response = await getTurbineList(params)
    turbineList.value = response.data.result
    turbineId.value = ''
    return response
  } catch (error) {
    console.error('获取风机数据失败:', error)
  }
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
    // 只有在不是"全部"的情况下才添加对应参数
    if (windFarmId.value) {
      params.windFarmId = windFarmId.value
    }
    if (turbineId.value) {
      params.turbineId = turbineId.value
    }
    // console.log('getReportData_params', params)
    const response = await getReport(params)
    // console.log('getReportData返回结果:', response)
    const data = response.data.result
    reportList.value = data.records
    totalCount.value = data.total
    page.value = data.current
    totalPages.value = data.pages
  } catch (error) {
    console.error('获取通知数据失败:', error)
  }
}

// 处理通知的方法
const handleReport = (reportId, windFarmName, windFarmId, turbineId) => {
  // 设置当前报告ID
  currentReportId.value = reportId
  currentWindFarmName.value = windFarmName
  currentWindFarmId.value = windFarmId
  currentTurbineId.value = turbineId
  // 显示弹窗
  showProcessReportDialog.value = true
}

// 关闭弹窗的方法
const handleDialogClose = () => {
  showProcessReportDialog.value = false
  currentReportId.value = null
}

//查询方法
const handleGet = () => {
  getReportData()
  page.value = 1
}

//重置方法
const handleReset = () => {
  windFarmId.value = ''
  turbineId.value = ''
  page.value = 1
  initDefaultTimeRange()
  getReportData()
}

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '处理中', color: 'yellow' },
  2: { label: '已办结', color: 'green' }
})

// 监听风场变化，重新获取风机列表
watch(windFarmId, () => {
  getTurbine()
  // getReportData()
})

// 监听其他筛选条件变化
// watch([turbineId, startDate, endDate], () => {
//   getReportData()
// })

// 初始化时获取风场和风机列表
onMounted(async () => {
  initDefaultTimeRange()
  await getCompanyList()
  await getWindFarm()
  windFarmId.value = ''
  turbineId.value = ''
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
</script>

<template>
  <div class="container">
    <div class="info-text">
      <span class="span-name">公司</span>
      <el-select
        v-model="companyId"
        placeholder="请选择公司"
        class="wind-farm-select"
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
      <span class="span-name">场站</span>
      <el-select
        v-model="windFarmId"
        placeholder="全部"
        value-key="windFarmId"
        class="wind-farm-select"
        style="--el-input-text-color: white"
      >
        <el-option
          v-for="windFarm in windFarmList"
          :key="windFarm.windFarmId"
          :label="windFarm.windFarmName"
          :value="windFarm.windFarmId"
        ></el-option>
      </el-select>
      <span class="span-name">风机名称</span>
      <el-select
        v-model="turbineId"
        placeholder="全部"
        value-key="turbineId"
        class="wind-farm-select"
        style="--el-input-text-color: white"
      >
        <el-option
          v-for="turbine in turbineListWithAll"
          :key="turbine.turbineId"
          :label="turbine.turbineName"
          :value="turbine.turbineId"
        ></el-option>
      </el-select>
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
      <el-button
            style="background-color: #164b6d; border-color: #164b6d; color: white;"
            @click="handleGet"
            class="operation">查询</el-button>
        <el-button
            style="background-color: #164b6d; border-color: #164b6d; color: white; margin-left: 0;"
            @click="handleReset"
            class="operation">重置</el-button>
    </div>
    <el-table :data="reportList">
      <el-table-column label="风机名称" align="center">
        <template #default="scope"> {{ scope.row.windFarmName }}&nbsp;&nbsp;{{ scope.row.turbineName }} </template>
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
            @click="handleReport(scope.row.reportId, scope.row.windFarmName, scope.row.windFarmId, scope.row.turbineId)"
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
        :turbineId="currentTurbineId"
        :windFarmId="currentWindFarmId"
        :windFarmName="currentWindFarmName"
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

/* .info-text::after {
  content: '';
  height: 35px;
  width: 2px;
  background-color: #15608a;
  margin-left: -995px;
} */
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
.wind-farm-select {
  width: 160px;
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
