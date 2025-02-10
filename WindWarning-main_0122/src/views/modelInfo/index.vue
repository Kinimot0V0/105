<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import addModel from '@/components/addModel/addModel.vue'
import chooseTime from '@/components/modelInfo/chooseTime.vue'
import { getModel, predict, stopPredict } from '@/api/model'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const company_id = ref('')
const windfarm_id = ref('')
// const module_id = ref(null)
const turbine_id = ref('')

const dialogVisible = ref(false) // 控制弹窗的显示
const timeDialogVisible = ref(false) // 控制弹窗的显示

//getModel的信息
const modelList = ref([])
const companyList = ref([])
const windFarmList = ref([])
const moduleList = ref([])
const algorithmList = ref([])
const selected_windFarmList = ref([])
const turbineList = ref([])
const selected_turbineList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const currentModelId = ref(null)

// const modules = ref([])

const confirm = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }

    if (company_id.value) {
      params.company_id = parseInt(company_id.value)
    }
    if (windfarm_id.value) {
      params.windfarm_id = parseInt(windfarm_id.value)
    }
    if (turbine_id.value) {
      params.turbine_id = parseInt(turbine_id.value)
    }
    console.log(params)
    const response = await getModel(params)
    console.log('confirm返回结果:', response)

    const data = response?.data?.result || {}
    // 只有在 result 和 modelList 存在时，才赋值
    if (data && Array.isArray(data.modelList)) {
      modelList.value = data.modelList
      totalCount.value = data.total_count || 0
      page.value = data.page || 1
      totalPages.value = data.total_pages || 0
    } else {
      modelList.value = []
    }
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

const getModelData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    const response = await getModel(params)
    console.log('getModelData返回结果:', response)
    const data = response.data.result
    modelList.value = data.modelList
    turbineList.value = data.turbineList
    windFarmList.value = data.windFarmList
    moduleList.value = data.moduleList
    algorithmList.value = data.algorithmList
    companyList.value = data.companyList
    turbineList.value.forEach((turbine) => {
      const windFarm = windFarmList.value.find((farm) => farm.windFarmId === turbine.windFarmId)
      if (windFarm) {
        turbine.turbineName = `${windFarm.windFarmName}-${turbine.turbineName}`
      }
    })
    totalCount.value = data.total_count
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

const getAddModelData = async () => {
  try {
    const params = {
      page: totalPages.value,
      page_size: pageSize.value
    }
    const response = await getModel(params)
    console.log('getAddModelData返回结果:', response)
    const data = response.data.result
    modelList.value = data.modelList
    turbineList.value = data.turbineList
    windFarmList.value = data.windFarmList
    moduleList.value = data.moduleList
    algorithmList.value = data.algorithmList
    companyList.value = data.companyList
    turbineList.value.forEach((turbine) => {
      const windFarm = windFarmList.value.find((farm) => farm.windFarmId === turbine.windFarmId)
      if (windFarm) {
        turbine.turbineName = `${windFarm.windFarmName}-${turbine.turbineName}`
      }
    })
    totalCount.value = data.total_count
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

onMounted(getModelData)

// 选择公司后，更新风场列表
watch(company_id, (newCompanyId) => {
  if (newCompanyId === '') {
    // 如果选择“全部”，清空风场和风机
    windfarm_id.value = ''
    turbine_id.value = ''
    selected_windFarmList.value = []
    selected_turbineList.value = []
  } else {
    // 根据选择的公司过滤风场
    selected_windFarmList.value = windFarmList.value.filter((farm) => farm.companyId === newCompanyId)
    windfarm_id.value = '' // 重置风场选择
    turbine_id.value = '' // 重置风机选择
  }
})

// 选择风场后，更新风机列表
watch(windfarm_id, (newWindfarmId) => {
  if (newWindfarmId === '') {
    // 如果选择“全部”，清空风机
    turbine_id.value = ''
    selected_turbineList.value = []
  } else {
    // 根据选择的风场过滤风机
    selected_turbineList.value = turbineList.value.filter((turbine) => turbine.windFarmId === newWindfarmId)
    turbine_id.value = '' // 重置风机选择
  }
})

// 更新分页的当前页
const handlePageChange = (current_page) => {
  page.value = current_page
  confirm()
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  confirm()
}

// 状态映射
const statusMap = ref({
  0: { label: '未训练', color: 'red' },
  1: { label: '训练中', color: 'yellow' },
  2: { label: '训练完成', color: 'orange' },
  3: { label: '运行中', color: 'green' }
})

provide('windFarmList', windFarmList)
provide('turbineList', turbineList)
provide('moduleList', moduleList)
provide('algorithmList', algorithmList)

//开始训练
const training = (modelId) => {
  timeDialogVisible.value = true
  currentModelId.value = modelId
}

//开始预测
const start = async (modelId) => {
  try {
    // 使用 ElMessageBox 显示确认弹窗
    await ElMessageBox.confirm('确定要开启该模型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 如果用户点击确定，则执行预测操作
    const predictData = [modelId]
    console.log('predict数据', predictData)

    // 调用 predict 接口
    const responsePredict = await predict(predictData)
    console.log('predict接口返回的数据:', responsePredict.data)
    getModelData()
  } catch (error) {
    // 如果用户点击取消，或者接口调用出错，都会进入这里
    if (error !== 'cancel') {
      console.error('预测接口调用错误:', error)
    }
  }
}

//停止预测
const close = async (modelId) => {
  try {
    // 使用 ElMessageBox 显示确认弹窗
    await ElMessageBox.confirm('确定要关闭该模型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 如果用户点击确定，则执行关闭操作
    const closeData = [modelId]
    console.log('stopPredict数据', closeData)

    // 调用 predict 接口
    const responseCloseData = await stopPredict(closeData)
    console.log('stopPredict接口返回的数据:', responseCloseData.data)
    getModelData()
  } catch (error) {
    // 如果用户点击取消，或者接口调用出错，都会进入这里
    if (error !== 'cancel') {
      console.error('预测接口调用错误:', error)
    }
  }
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

        <!-- 风机 -->
        <el-col :span="4">
          <el-form-item label="风机：" prop="turbine_id">
            <el-select v-model="turbine_id" placeholder="全部" value-key="id" style="--el-input-text-color: white">
              <el-option :label="'全部'" :value="''"></el-option>
              <el-option
                v-for="turbine in selected_turbineList"
                :key="turbine.turbineId"
                :label="turbine.turbineName"
                :value="turbine.turbineId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 系统分类 -->
        <!-- <el-col :span="4">
          <el-form-item label="系统分类：" prop="modules_id">
            <el-select v-model="module_id" placeholder="全部" value-key="id">
              <el-option v-for="mod in modules" :key="mod.id" :label="mod.name" :value="mod.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col> -->

        <el-col :span="4" style="text-align: left">
          <el-button type="success" @click="confirm">确定</el-button>
        </el-col>

        <el-col :span="8" style="text-align: right">
          <el-button type="primary" @click="dialogVisible = true"
            ><el-icon><Plus /></el-icon>新建模型</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table :data="modelList">
      <el-table-column label="序号" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="modelLabel" label="模型编号" align="center"></el-table-column>
      <el-table-column prop="modelName" label="模型名称" align="center"></el-table-column>
      <el-table-column prop="modelVersion" label="模型版本" align="center"></el-table-column>
      <el-table-column prop="turbineNumber" label="风机" align="center"></el-table-column>
      <!-- <el-table-column prop="moduleId" label="模块" align="center"></el-table-column> -->
      <el-table-column prop="algorithmName" label="算法" align="center"></el-table-column>
      <el-table-column prop="modelStatus" label="状态" align="center">
        <template #default="scope">
          <span
            :style="{
              color: statusMap[scope.row.modelStatus]?.color || 'black'
            }"
          >
            {{ statusMap[scope.row.modelStatus]?.label || '未知状态' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <!-- 根据状态显示不同的按钮 -->
          <el-link v-if="scope.row.modelStatus === 0" type="primary" @click="training(scope.row.modelId)">
            训练
          </el-link>
          <el-link v-if="scope.row.modelStatus === 2" type="success" @click="start(scope.row.modelId)"> 开启 </el-link>
          <el-link v-if="scope.row.modelStatus === 3" type="warning" @click="close(scope.row.modelId)"> 关闭 </el-link>
          &nbsp;|&nbsp;
          <el-link type="primary" @click="handleEdit(scope.row.model_id)">编辑</el-link>
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

    <!-- 新建模型弹窗 -->
    <el-dialog title="新建模型" v-model="dialogVisible" width="80%">
      <!-- 将 dialogVisible 传递给子组件 index，并监听 closeDialog 事件 -->
      <addModel v-if="dialogVisible" @close-dialog="dialogVisible = false" @refresh-model-data="getAddModelData" />
    </el-dialog>

    <!-- 选择训练时间弹窗 -->
    <el-dialog title="训练样本时间选择" v-model="timeDialogVisible" width="80%">
      <chooseTime
        v-if="timeDialogVisible"
        @close-dialog="timeDialogVisible = false"
        @refresh-model-data="getModelData"
        :model-id="currentModelId"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 20px;
  background-color: transparent !important;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
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
  /* 整体背景透明 */
  background-color: transparent !important;
  color: #c2dcf5 !important; /* 添加这行来控制整体文字颜色 */

  /* 按钮背景透明（上一页、下一页、页码按钮等） */
  .el-pager li,
  button.btn-prev,
  button.btn-next {
    background-color: transparent !important;
    color: #c2dcf5 !important;
    border: 1px solid #164b6d !important;
  }

  /* 当前选中页码的样式 */
  .el-pager li.is-active {
    background-color: #143f5c !important;
    color: #ffffff !important;
    border-color: #164b6d !important;
  }

  /* 跳转页码输入框 */
  .el-input__wrapper {
    background-color: transparent !important;
    box-shadow: none !important;
    border: 1px solid #164b6d !important;
  }

  /* 文字颜色 */
  .el-input__inner {
    color: #c2dcf5 !important;
  }

  /* 专门控制跳转文字的颜色 */
  .el-pagination__jump {
    color: #fff !important;
  }
}

/* 弹窗 */
:deep(.el-dialog__wrapper) {
  background-color: rgba(20, 63, 92, var(--overlay-opacity, 0.7)) !important;
}

:deep(.el-dialog) {
  background-color: rgba(20, 63, 92, var(--dialog-opacity, 0.7)) !important;
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
