<script setup>
import { ref, onMounted, watch, computed,nextTick } from 'vue'
import { getPvFarmList } from '@/api/overview'
import { getInverterList } from '@/api/report'
import { getRealWarning } from '@/api/warning'
import { getFarmInfo } from '@/api/warningDetail'
import warningDetail from '@/components/warningList/warningDetail.vue'

const companyName = ref('内蒙古公司')
const inverterId = ref('')
const pvFarmId = ref('')
const warningList = ref([])
const pvFarmList = ref([])
const inverterList = ref([])
const lookDialogVisible = ref(false)

const level = ref('')
const levelList = ref([
  { levelId: '', levelName: '全部' },
  { levelId: 1, levelName: '1级' },
  { levelId: 2, levelName: '2级' }
])


const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)


// 计算逆变器列表（包含全部选项）
const inverterListWithAll = computed(() => {
  if (!pvFarmId.value) {
    return [{ inverterId: '', inverterName: '全部' }]
  }
  return [{ inverterId: '', inverterName: '全部' }, ...inverterList.value]
})

//获取场站信息
const getPvFarm = async () => {
  try {
    const response = await getPvFarmList()
    pvFarmList.value = [{ pvFarmId: '', pvFarmName: '全部' }, ...response.data.result]
    return response
  } catch (error) {
    console.error('获取场站数据失败:', error)
  }
}

//根据场站id查逆变器
const getInverter = async () => {
  try {
    if (!pvFarmId.value) {
      inverterList.value = []
      inverterId.value = ''
      return
    }

    const params = {
      pvFarmId: pvFarmId.value
    }
    const response = await getInverterList(params)
    inverterList.value = response.data.result
    inverterId.value = ''
    return response
  } catch (error) {
    console.error('获取逆变器数据失败:', error)
  }
}

//获取预警信息
const getWarningData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value,
      company_id: 1
    }

    if (pvFarmId.value) params.pvfarm_id = pvFarmId.value
    if (inverterId.value) params.inverter_id = inverterId.value
    if (level.value !== '') params.warning_level = level.value

    const response = await getRealWarning(params)

    const data = response.data.result
    const warnings = data.warningList

    // 获取场站名称并合并到预警项
    const farmNameCache = {}
    const updatedWarnings = await Promise.all(
      warnings.map(async (warning) => {
        const inverterId = warning.inverterId
        if (farmNameCache[inverterId]) {
          return { ...warning, farmName: farmNameCache[inverterId] }
        }
        try {
          const farmResponse = await getFarmInfo({ inverterId })
          const pvFarmName = farmResponse.data.result.pvFarmName
          farmNameCache[inverterId] = pvFarmName
          return { ...warning, pvFarmName }
        } catch (error) {
          return { ...warning, pvFarmName: '未知场站' }
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

// 初始化时获取场站和逆变器列表
onMounted(async () => {
  await getPvFarm()
  pvFarmId.value = ''
  inverterId.value = ''
  level.value = ''
})

// 监听场站变化，重新获取逆变器列表
watch(pvFarmId, () => {
  getInverter()
  getWarningData()
})

// 监听其他筛选条件变化
watch([inverterId, level], () => {
  getWarningData()
})

// 更新分页的当前页
const handlePageChange = (current_page) => {
  page.value = current_page
  getWarningData()
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  getWarningData()
}

// 等级映射
const levelMap = ref({
  1: { label: '1级' },
  2: { label: '2级' }
})

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '挂起', color: 'yellow' },
  2: { label: '转通知', color: 'green' },
  3: { label: '关闭待确认', color: 'orange' },
  4: { label: '关闭', color: 'white' }
})

//预警详情界面
const detailInverterId=ref(null)
const detailWarningDescription=ref(null)
const detailWarningLevel=ref(null)
const detailStartTime=ref(null)
const detailEndTime=ref(null)
const detailWarningStatus=ref(null)
const detailInverterName=ref(null)
const detailWarningId=ref(null)
const look = (inverterId,warningDescription,warningLevel,startTime,endTime,warningStatus,inverterName,warningId) =>{
  detailInverterId.value=inverterId
  detailWarningDescription.value=warningDescription
  detailWarningLevel.value=warningLevel
  detailStartTime.value=startTime
  detailEndTime.value=endTime
  detailWarningStatus.value=warningStatus
  detailInverterName.value=inverterName
  detailWarningId.value=warningId
  lookDialogVisible.value=true
}
</script>

<template>
  <div class="container">
    <div class="info">
      <div class="info-text">
        <el-button class="company">{{ companyName }}</el-button>
        <span class="span-name">场站</span>
        <el-select
          v-model="pvFarmId"
          placeholder="全部"
          value-key="pvFarmId"
          class="pv-farm-select"
          style="--el-input-text-color: white"
        >
          <el-option
            v-for="pvFarm in pvFarmList"
            :key="pvFarm.pvFarmId"
            :label="pvFarm.pvFarmName"
            :value="pvFarm.pvFarmId"
          ></el-option>
        </el-select>
        <span class="span-name">逆变器名称</span>
        <el-select
          v-model="inverterId"
          placeholder="全部"
          value-key="inverterId"
          class="pv-farm-select"
          style="--el-input-text-color: white"
        >
          <el-option
            v-for="inverter in inverterListWithAll"
            :key="inverter.inverterId"
            :label="inverter.inverterName"
            :value="inverter.inverterId"
          ></el-option>
        </el-select>
        <span class="span-name">等级</span>
        <el-select
          v-model="level"
          placeholder="全部"
          value-key="level"
          class="pv-farm-select"
          style="--el-input-text-color: white; width: 80px"
        >
          <el-option
            v-for="levelItem in levelList"
            :key="levelItem.levelId"
            :label="levelItem.levelName"
            :value="levelItem.levelId"
          ></el-option>
        </el-select>
      </div>
    </div>

    <el-table :data="warningList">
      <el-table-column label="序号" width="120px" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="开始时间" width="220px" align="center">
        <template #default="scope">
          {{ scope.row.startTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" width="220px" align="center">
        <template #default="scope">
          {{ scope.row.endTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="pvFarmName" label="场站名称" width="250px" align="center"></el-table-column>
      <el-table-column prop="inverterName" label="逆变器名称" width="300px" align="center"></el-table-column>
      <el-table-column prop="warningDescription" label="预警信息" align="center"></el-table-column>
      <el-table-column prop="warningLevel" label="等级" width="150px" align="center">
        <template #default="scope">
          <span>
            {{ levelMap[scope.row.warningLevel]?.label}}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="warningStatus" label="状态" width="150px" align="center">
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
      <el-table-column prop="" label="详情" align="center" width="150px">
        <template #default="scope">
          <el-link type="primary" @click="look(scope.row.inverterId,scope.row.warningDescription,
          scope.row.warningLevel,scope.row.startTime,scope.row.endTime,scope.row.warningStatus,scope.row.inverterName,
          scope.row.warningId)">查看</el-link>
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
    <el-dialog title="预警详情" v-model="lookDialogVisible" width="90%">
      <warningDetail
        v-if="lookDialogVisible"
        :inverterId="detailInverterId"
        :warningDescription="detailWarningDescription"
        :warningLevel="detailWarningLevel"
        :warningStatus="detailWarningStatus"
        :startTime="detailStartTime"
        :endTime="detailEndTime"
        :inverterName="detailInverterName"
        :warningId="detailWarningId"
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
.operation {
  background-color: #36b8da;
  border: 1px solid #36b8da;
  font-size: 15px;
  color: white;
}
.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-text::after {
  content: '';
  height: 35px;
  width: 2px;
  background-color: #15608a;
  margin-left: -781px;
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
  background-color: rgba(20, 63, 92, var(--overlay-opacity, 0.9)) !important;
}

:deep(.el-dialog) {
  background-color: rgba(20, 63, 92, var(--dialog-opacity, 0.9)) !important;
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
