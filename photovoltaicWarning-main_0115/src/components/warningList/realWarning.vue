<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getWindFarmList } from '@/api/overview'
import { getTurbineList } from '@/api/report'
import { getRealWarning } from '@/api/warning'

const companyName = ref('内蒙古公司')
const turbineId = ref('')
const windFarmId = ref('')
const warningList = ref([])
const windFarmList = ref([])
const turbineList = ref([])

const level = ref('')
const levelList = ref([
  { levelId: '', levelName: '全部' },
  { levelId: 0, levelName: '1级' },
  { levelId: 1, levelName: '2级' }
])

// 时间选择相关

const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

// 计算光伏机器列表（包含全部选项）
const turbineListWithAll = computed(() => {
  if (!windFarmId.value) {
    return [{ turbineId: '', turbineName: '全部' }]
  }
  return [{ turbineId: '', turbineName: '全部' }, ...turbineList.value]
})

//获取风场信息
const getWindFarm = async () => {
  try {
    const response = await getWindFarmList()
    windFarmList.value = [{ windFarmId: '', windFarmName: '全部' }, ...response.data.result]
    return response
  } catch (error) {
    console.error('获取风场数据失败:', error)
  }
}

//根据风场id查光伏机器
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
    console.error('获取光伏机器数据失败:', error)
  }
}

//获取预警信息
const getWarningData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }

    // 只有在不是"全部"的情况下才添加对应参数
    if (windFarmId.value) {
      params.windfarm_id = windFarmId.value
    }

    if (turbineId.value) {
      params.turbine_id = turbineId.value
    }

    if (level.value !== '') {
      params.warning_level = level.value
    }

    console.log('实时预警参数:', params)
    const response = await getRealWarning(params)
    console.log('实时预警返回结果:', response)
    const data = response.data.result
    warningList.value = data.warningList
    totalCount.value = data.total_count
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取预警数据失败:', error)
  }
}

// 初始化时获取风场和光伏机器列表
onMounted(async () => {
  await getWindFarm()
  windFarmId.value = ''
  turbineId.value = ''
  level.value = ''
  await getWarningData()
})

// 监听风场变化，重新获取光伏机器列表
watch(windFarmId, () => {
  getTurbine()
  getWarningData()
})

// 监听其他筛选条件变化
watch([turbineId, level], () => {
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
  0: { label: '1级' },
  1: { label: '2级' }
})

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '挂起', color: 'yellow' },
  2: { label: '转通知', color: 'green' },
  3: { label: '关闭待确认', color: 'orange' },
  4: { label: '关闭', color: 'white' }
})
</script>

<template>
  <div class="container">
    <div class="info">
      <div class="info-text">
        <el-button class="company">{{ companyName }}</el-button>
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
        <span class="span-name" style="width: 90px;height: 9px;">光伏机器名称</span>
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
        <span class="span-name">等级</span>
        <el-select
          v-model="level"
          placeholder="全部"
          value-key="level"
          class="wind-farm-select"
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
      <el-table-column prop="turbineName" label="光伏机器名称" width="300px" align="center"></el-table-column>
      <el-table-column prop="warningDescription" label="预警信息" align="center"></el-table-column>
      <el-table-column prop="warningLevel" label="等级" width="150px" align="center">
        <template #default="scope">
          <span>
            {{ levelMap[scope.row.warningLevel]?.label || '1级' }}
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
      <!-- <el-table-column prop="" label="详情" align="center">
        <template #default="scope">
          <el-link type="primary" @click="look(scope.row.warningId)">查看</el-link>
        </template>
      </el-table-column> -->
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
  </div>
  <!-- <el-dialog
    v-model="dialogVisible"
    width="90%"
    :style="{
      backgroundColor: '#1b2b37',
      color: 'white'
    }"
  >
    <template #header>
      <span style="color: white !important; font-size: 18px">预警详情</span>
    </template>
    <warningDetail v-if="dialogVisible" />
  </el-dialog> -->
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
  margin-left: -1202px;
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
</style>
