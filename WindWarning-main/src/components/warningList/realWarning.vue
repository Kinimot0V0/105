<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getWarning } from '@/api/warning'
import warningDetail from '@/components/warningList/warningDetail.vue'

const company_id = ref(null)
const windfarm_id = ref(null)
const module_id = ref(null)
const warning_level = ref(null)

const turbine = ref('')

//getModel的信息
const companyList = ref([])
const windFarmList = ref([])
const selected_windFarmList = ref([])
const warningList = ref([])
const modelList = ref([])
const turbineList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
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

const modules = ref([
  {
    id: '1',
    name: '风电机组降功率运行'
  }
])

const warningLevel = ref([
  {
    id: '1',
    name: '1级'
  },
  {
    id: '2',
    name: '2级'
  }
])

const dialogVisible = ref(false) // 控制弹窗的显示

// 选择公司后，更新风场列表
watch(company_id, (newCompanyId) => {
  if (newCompanyId === '') {
    // 如果选择“全部”，清空风场
    windfarm_id.value = ''
    selected_windFarmList.value = []
  } else {
    // 根据选择的公司过滤风场
    selected_windFarmList.value = windFarmList.value.filter((farm) => farm.companyId === newCompanyId)
    windfarm_id.value = '' // 重置风场选择
  }
})

const search = () => {
  //   getModelData()
  company_id.value = null
  windfarm_id.value = null
  module_id.value = null
  warning_level.value = null
  turbine.value = ''
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
    // const data = response.data.result
    // windFarmList.value = data.windFarmList
    // companyList.value = data.companyList
    // warningList.value = data.warningList
    // modelList.value = data.modelList
    // turbineList.value = data.turbineList
    // totalCount.value = data.total_count
    // page.value = data.page
    // totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

onMounted(getWarningData)

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
  1: { label: '处理中', color: 'blue' },
  2: { label: '已处理', color: 'green' }
})

// 预警详情查看
const look = (warningId) => {
  console.log(warningId)
  dialogVisible.value = true
}

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
  <div class="container">
    <el-form label-width="120px">
      <el-row :gutter="5">
        <!-- 按管理公司 -->
        <el-col :span="4">
          <el-form-item label="按管理公司：" prop="company_id">
            <el-select v-model="company_id" placeholder="全部" value-key="id" style="--el-input-text-color: white">
              <el-option :label="'全部'" :value="''"></el-option>
              <el-option
                v-for="company in companyList"
                :key="company.companyId"
                :label="company.companyName"
                :value="company.companyId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 风场 -->
        <el-col :span="4">
          <el-form-item label="风场：" prop="windfarm_id">
            <el-select v-model="windfarm_id" placeholder="全部" value-key="id" style="--el-input-text-color: white">
              <el-option :label="'全部'" :value="''"></el-option>
              <el-option
                v-for="windfarm in selected_windFarmList"
                :key="windfarm.windFarmId"
                :label="windfarm.windFarmName"
                :value="windfarm.windFarmId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 预警等级 -->
        <el-col :span="4">
          <el-form-item label="预警等级：" prop="warning_level">
            <el-select v-model="warning_level" placeholder="全部" value-key="id">
              <el-option
                v-for="warninglevel in warningLevel"
                :key="warninglevel.id"
                :label="warninglevel.name"
                :value="warninglevel.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 系统分类 -->
        <el-col :span="4">
          <el-form-item label="系统分类：" prop="modules_id">
            <el-select v-model="module_id" placeholder="全部" value-key="id">
              <el-option v-for="mod in modules" :key="mod.id" :label="mod.name" :value="mod.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 风机名称 -->
        <el-col :span="4">
          <el-form-item label="风机名称：" prop="turbine">
            <el-input v-model="turbine" placeholder="请输入风机名称"> </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="4" style="text-align: left">
          <el-button type="primary" @click="search">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table :data="warningList">
      <el-table-column label="序号" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="开始时间" align="center">
        <template #default="scope">
          {{ scope.row.startTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center">
        <template #default="scope">
          {{ scope.row.endTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="turbine_name" label="风机名称" align="center">
        <template #default="scope">
          {{ getTurbineName(scope.row.modelId) }}
        </template>
      </el-table-column>
      <el-table-column prop="warningDescription" label="预警信息" align="center"></el-table-column>
      <el-table-column prop="warningLevel" label="等级" align="center">
        <template #default="scope">
          <span>
            {{ levelMap[scope.row.warningLevel]?.label || '未知状态' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="warningStatus" label="状态" align="center">
        <template #default="scope">
          <span
            :style="{
              color: statusMap[scope.row.warningStatus]?.color || 'black'
            }"
          >
            {{ statusMap[scope.row.warningStatus]?.label || '未知状态' }}
          </span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="" label="可靠度" align="center"></el-table-column> -->
      <el-table-column prop="" label="详情" align="center">
        <template #default="scope">
          <el-link type="primary" @click="look(scope.row.warningId)">查看</el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-link type="primary" @click="handleEdit(scope.row.model_id)">编辑</el-link>
          &nbsp;
          <el-link type="danger" @click="handleClose(scope.row.model_id)">关闭</el-link>
          &nbsp;
          <el-link type="warning" @click="handleSuspend(scope.row.model_id)">挂起</el-link>
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
  </div>
  <!-- 预警详情弹窗 -->
  <el-dialog title="预警详情" v-model="dialogVisible" width="90%">
    <warningDetail />
  </el-dialog>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #164b6d;
  height: 80vh;
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
