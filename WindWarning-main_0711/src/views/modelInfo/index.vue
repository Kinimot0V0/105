<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import addModel from '@/components/addModel/addModel.vue'
import chooseTime from '@/components/modelInfo/chooseTime.vue'
import test from '@/components/modelInfo/test.vue'
import showThreshold from '@/components/modelInfo/showThreshold.vue'
import showThreshold2 from '@/components/modelInfo/showThreshold2.vue'
import modelEdit from '@/components/addModel/modelEdit.vue'
import { getModel, predict, stopPredict, getCompany, getWindFarmList, getAlg, Delete } from '@/api/model'
import { getTurbineList } from '@/api/report'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

// 公司相关变量
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
const turbineId = ref('')
const windFarmId = ref('')
const algorithmId = ref('')
const algorithmList = ref([])

const dialogVisible = ref(false) // 控制弹窗的显示
const timeDialogVisible = ref(false) // 控制弹窗的显示
const editDialogVisible = ref(false) // 控制弹窗的显示
const testDialogVisible = ref(false) // 控制弹窗的显示
//getModel的信息
const modelList = ref([])
// const companyList = ref([])
const windFarmList = ref([])
const turbineList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const currentModelId = ref(null)

// 计算风机列表（包含全部选项）
const turbineListWithAll = computed(() => {
  if (!windFarmId.value) {
    return [{ turbineId: '', turbineName: '全部' }]
  }
  return [{ turbineId: '', turbineName: '全部' }, ...turbineList.value]
})

//获取公司信息
// const getCompanyList = async () => {
//   try {
//     const response = await getCompany()
//     companyList.value = [{ companyId: '', companyName: '全部' }, ...response.data.result]
//     return response
//   } catch (error) {
//     console.error('获取公司数据失败:', error)
//   }
// }

//根据公司获取风场信息
const getWindFarm = async () => {
  try {
    if (!companyId.value) {
      windFarmList.value = []
      windFarmId.value = ''
      return
    }
    const params = {
      companyId: companyId.value
    }
    const response = await getWindFarmList(params)
    windFarmList.value = [{ windFarmId: '', windFarmName: '全部' }, ...response.data.result]
    windFarmId.value = ''
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

//获取算法信息
const getAlgList = async () => {
  try {
    const response = await getAlg()
    algorithmList.value = [{ algorithmId: '', algorithmName: '全部' }, ...response.data.result]
    return response
  } catch (error) {
    console.error('获取算法数据失败:', error)
  }
}

const getModelData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    if (companyId.value) params.company_id = companyId.value
    if (windFarmId.value) params.windfarm_id = windFarmId.value
    if (turbineId.value) params.turbine_id = turbineId.value
    if (algorithmId.value) params.algorithm_id = algorithmId.value
    // console.log('getModelData参数:', params)
    const response = await getModel(params)
    // console.log('getModelData返回结果:', response)
    const data = response.data.result
    modelList.value = data.modelList
    // turbineList.value.forEach((turbine) => {
    //   const windFarm = windFarmList.value.find((farm) => farm.windFarmId === turbine.windFarmId)
    //   if (windFarm) {
    //     turbine.turbineName = `${windFarm.windFarmName}-${turbine.turbineName}`
    //   }
    // })
    totalCount.value = data.total_count
    page.value = data.page
    totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

// 初始化时获取风场和风机列表
onMounted(async () => {
  await getCompanyList()
  await getWindFarm()
  await getAlgList()
  // await getWindFarm()
  await getModelData()
  windFarmId.value = ''
  turbineId.value = ''
})
// 监听公司变化，重新获取风场列表
watch(companyId, () => {
  getWindFarm()
  getModelData()
})

// 监听风场变化，重新获取风机列表
watch(windFarmId, () => {
  getTurbine()
  getModelData()
})

// 监听筛选条件变化
watch([turbineId, algorithmId], () => {
  getModelData()
})

// 更新分页的当前页
const handlePageChange = (current_page) => {
  page.value = current_page
  getModelData()
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  getModelData()
}

// 状态映射
const statusMap = ref({
  0: { label: '未训练', color: 'red' },
  1: { label: '训练中', color: 'yellow' },
  2: { label: '训练完成', color: 'orange' },
  3: { label: '运行中', color: 'green' }
})

const selectedModelIds = ref([])

// 处理表格选择变化事件
const handleSelectionChange = (selection) => {
  selectedModelIds.value = selection.map((item) => item.modelId)
}
//编辑
const handleEdit = (modelId) => {
  selectedModelIds.value = [modelId]
  editDialogVisible.value = true
}
//测试
const handleTest = (modelId) => {
  currentModelId.value = modelId
  testDialogVisible.value = true
}
// 判断按钮是否禁用
const isDisabled = computed(() => {
  const selected = selectedModelIds.value
  return selected.length === 0
})

const onEditDialogClose = () => {
  // 选中的模型 id 清空
  selectedModelIds.value = []
  // 隐藏对话框
  editDialogVisible.value = false
}
//查看阈值
const thrDialogVisible = ref(false) // 控制弹窗的显示
const currentThresholdComponent = ref('') // 新增：存储当前要显示的组件类型

//查看阈值
const handleLook = (modelId) => {
  currentModelId.value = modelId
  const model = modelList.value.find((item) => item.modelId === modelId)
  if (model && model.modelName.includes('风功率')) {
    currentThresholdComponent.value = 'showThreshold'
  } else {
    currentThresholdComponent.value = 'showThreshold2'
  }
  thrDialogVisible.value = true
}

//开始训练
const training = (modelId) => {
  timeDialogVisible.value = true
  currentModelId.value = modelId
}
//批量开始预测
const startMore = async () => {
  try {
    // 使用 ElMessageBox 显示确认弹窗
    await ElMessageBox.confirm('确定要批量开启模型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 如果用户点击确定，则执行预测操作
    const predictData = selectedModelIds.value
    // console.log('predict数据', predictData)

    // 调用 predict 接口
    const responsePredict = await predict(predictData)
    // console.log('predict接口返回的数据:', responsePredict.data)
    getModelData()
  } catch (error) {
    // 如果用户点击取消，或者接口调用出错，都会进入这里
    if (error !== 'cancel') {
      console.error('预测接口调用错误:', error)
    }
  }
}
//一键开启
const oneStart = async () => {
  try {
    // 使用 ElMessageBox 显示确认弹窗
    await ElMessageBox.confirm('确定要一键开启模型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 如果用户点击确定，则执行预测操作
    const predictData = [0]
    // console.log('predict数据', predictData)

    // 调用 predict 接口
    const responsePredict = await predict(predictData)
    // console.log('predict接口返回的数据:', responsePredict.data)
    getModelData()
  } catch (error) {
    // 如果用户点击取消，或者接口调用出错，都会进入这里
    if (error !== 'cancel') {
      console.error('预测接口调用错误:', error)
    }
  }
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
    // console.log('predict数据', predictData)

    // 调用 predict 接口
    const responsePredict = await predict(predictData)
    // console.log('predict接口返回的数据:', responsePredict.data)
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
    // console.log('stopPredict数据', closeData)

    // 调用 predict 接口
    const responseCloseData = await stopPredict(closeData)
    // console.log('stopPredict接口返回的数据:', responseCloseData.data)
    getModelData()
  } catch (error) {
    // 如果用户点击取消，或者接口调用出错，都会进入这里
    if (error !== 'cancel') {
      console.error('预测接口调用错误:', error)
    }
  }
}
//删除
const handleDelete = async (modelId) => {
  try {
    // 使用 ElMessageBox 显示确认弹窗
    await ElMessageBox.confirm('确定要删除该模型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 如果用户点击确定
    // const params = {
    //   modelIds:[modelId]
    // }
    // console.log(params)
    // 调用 predict 接口
    const response = await Delete([modelId])
    getModelData()
  } catch (error) {
    // 如果用户点击取消，或者接口调用出错，都会进入这里
    if (error !== 'cancel') {
      console.error('删除接口调用错误:', error)
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="info">
      <div class="info-text">
        <!-- 按管理公司 -->
        <span class="span-name">公司</span>
        <el-select
          v-model="companyId"
          placeholder="全部"
          value-key="companyId"
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

        <!-- 风场 -->
        <span class="span-name">风场</span>
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

        <!-- 风机 -->
        <span class="span-name">风机</span>
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

        <!-- 算法 -->
        <span class="span-name">算法</span>
        <el-select
          v-model="algorithmId"
          placeholder="全部"
          value-key="algorithmId"
          class="wind-farm-select"
          style="--el-input-text-color: white"
        >
          <el-option
            v-for="algorithm in algorithmList"
            :key="algorithm.algorithmId"
            :label="algorithm.algorithmName"
            :value="algorithm.algorithmId"
          ></el-option>
        </el-select>
      </div>
      <div class="info-button">
        <el-button type="primary" @click="dialogVisible = true"
          ><el-icon><Plus /></el-icon>新建模型</el-button
        >
        <el-button type="success" :disabled="isDisabled" @click="editDialogVisible = true">批量编辑</el-button>
        <el-button type="danger" :disabled="isDisabled" @click="startMore">批量开启</el-button>
        <el-button type="primary" @click="oneStart">一键开启</el-button>
      </div>
    </div>

    <el-table :data="modelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="100px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="modelLabel" label="模型编号" align="center" width="120px"></el-table-column>
      <el-table-column prop="modelName" label="模型名称" align="center"></el-table-column>
      <el-table-column prop="modelVersion" label="模型版本" align="center" width="120px"></el-table-column>
      <el-table-column prop="turbineName" label="风机" align="center" width="140px"></el-table-column>
      <el-table-column prop="algorithmName" label="算法" align="center"></el-table-column>
      <el-table-column prop="modelStatus" label="状态" align="center" width="140px">
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
          <el-link type="primary" @click="handleEdit(scope.row.modelId)">编辑</el-link>
          &nbsp;|&nbsp;
          <el-link type="success" @click="handleTest(scope.row.modelId)">测试</el-link>
          &nbsp;|&nbsp;
          <el-link type="danger" @click="handleDelete(scope.row.modelId)">删除</el-link>
          &nbsp;|&nbsp;
          <el-link type="primary" @click="handleLook(scope.row.modelId)">查看阈值</el-link>
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
      <addModel v-if="dialogVisible" @close-dialog="dialogVisible = false" @refresh-model-data="getModelData" />
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

    <!-- 模型编辑弹窗 -->
    <el-dialog title="模型编辑" v-model="editDialogVisible" width="80%">
      <modelEdit
        v-if="editDialogVisible"
        @close-dialog="onEditDialogClose"
        @refresh-model-data="getModelData"
        :modelIds="selectedModelIds"
      />
    </el-dialog>
    <!-- 测试弹窗 -->
    <el-dialog title="模型测试" v-model="testDialogVisible" width="80%">
      <test
        v-if="testDialogVisible"
        @close-dialog="testDialogVisible = false"
        @refresh-model-data="getModelData"
        :model-id="currentModelId"
      />
    </el-dialog>
    <!-- 阈值弹窗 -->
    <el-dialog title="查看阈值" v-model="thrDialogVisible" width="80%">
      <showThreshold
        v-if="currentThresholdComponent === 'showThreshold'"
        @close-dialog="thrDialogVisible = false"
        :model-id="currentModelId"
      />
      <showThreshold2
        v-if="currentThresholdComponent === 'showThreshold2'"
        @close-dialog="thrDialogVisible = false"
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

.info {
  display: flex;
  justify-content: space-between;
  /* padding: 10px; */
}
.info-text {
  display: flex;
  align-items: center;
  position: relative;
  padding: 10px;
}
.span-name {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 15px;
  margin-right: 5px;
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
</style>
