<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import close from '@/components/pendingWarning/close.vue'
import suspend from '@/components/pendingWarning/suspend.vue'
import pendingReport from '@/components/pendingWarning/pendingReport.vue'
import level from '@/components/pendingWarning/level.vue'
import confirmclose from '@/components/pendingWarning/confirmclose.vue'
import warningDetail from '@/components/warningList/warningDetail.vue'
import newWarningDetail from '@/components/warningList/newWarningDetail.vue'
import { getWarnInfoList, getWarnInfoListByDesc } from '@/api/pendingWarning'

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
const buttonPermissions = ['B37', 'C6']
// 计算属性控制显隐
const showInfoButton = computed(() => hasPermission(buttonPermissions))
///权限相关///

const router = useRouter()
// 获取路由实例
const route = useRoute()

// 解构获取传递的参数
const turbineId = route.query.turbineId
const turbineName = route.query.turbineName
const windFarmId = route.query.windFarmId
const windFarmName = route.query.windFarmName
const companyName = route.query.companyName
const lookDialogVisible = ref(false)

// 子表格加载状态
const expandedLoading = ref({})
// 主表格数据（分组数据）
const warningList = ref([])
// 展开的详细数据缓存
const expandedData = ref({})

// 获取分组数据
const getWarnInfo = async () => {
  try {
    const params = {
      windFarmId: parseInt(windFarmId),
      turbineId: parseInt(turbineId)
    }
    // console.log("getWarnInfoList_参数",params)
    const response = await getWarnInfoList(params)
    // console.log("getWarnInfo返回数据",response)
    warningList.value = response.data.result.map((item) => ({
      ...item,
      expanded: false,
      selected: false
    }))
  } catch (error) {
    console.error('获取分组数据失败:', error)
  }
}

// 处理表格展开事件
const handleExpand = async (row) => {
  if (!expandedData.value[row.warningDescription]) {
    try {
      expandedLoading.value[row.warningDescription] = true // 开始加载
      const params = {
        windFarmId: parseInt(windFarmId),
        turbineId: parseInt(turbineId),
        warningDescription: row.warningDescription
      }
      // console.log("getWarnInfoListByDesc_参数",params)
      const response = await getWarnInfoListByDesc(params)
      // console.log("getWarnInfoListByDesc返回数据",response)
      expandedData.value[row.warningDescription] = response.data.result.map((item) => ({
        ...item,
        selected: false
      }))
    } catch (error) {
      console.error('获取详细数据失败:', error)
    } finally {
      expandedLoading.value[row.warningDescription] = false // 结束加载
    }
  }
}
// const handleExpand = async (row) => {
//   if (!expandedData.value[row.warningDescription]) {
//     try {
//       const params = {
//         windFarmId: parseInt(windFarmId),
//         turbineId: parseInt(turbineId),
//         warningDescription: row.warningDescription
//       }
//       console.log("getWarnInfoListByDesc_参数",params)
//       const response = await getWarnInfoListByDesc(params)
//       console.log("getWarnInfoListByDesc返回数据",response)
//       expandedData.value[row.warningDescription] = response.data.result.map(item => ({
//         ...item,
//         selected: false
//       }))
//     } catch (error) {
//       console.error('获取详细数据失败:', error)
//     }
//   }
// }
// 主行选中切换
const toggleMainRowSelect = (row) => {
  row.selected = !row.selected
  const details = expandedData.value[row.warningDescription] || []
  details.forEach((item) => {
    item.selected = row.selected
  })
}

// 详细行选中切换
const toggleExpandedRowSelect = (row, mainRow) => {
  row.selected = !row.selected
  const details = expandedData.value[mainRow.warningDescription] || []
  mainRow.selected = details.every((item) => item.selected)
}

// 选中的详细行
const selectedExpandedRows = computed(() => {
  return Object.values(expandedData.value)
    .flat()
    .filter((item) => item.selected)
})

onMounted(getWarnInfo)

const back = () => {
  const filteredQuery = Object.entries(route.query).reduce((acc, [key, value]) => {
    if (!/Name/i.test(key)) {
      acc[key] = value
    }
    return acc
  }, {})

  router.push({
    path: '/intelligentEarlyWarning/todo',
    query: filteredQuery
  })
}

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '挂起', color: 'yellow' },
  2: { label: '转通知', color: 'green' },
  3: { label: '关闭待确认', color: 'orange' },
  4: { label: '关闭', color: 'white' }
})
const levelMap = ref({
  1: { label: '1级', color: 'white' },
  2: { label: '2级', color: 'white' }
})

// 控制弹窗显示
const closeDialogVisible = ref(false)
const suspendDialogVisible = ref(false)
const reportDialogVisible = ref(false)
const levelDialogVisible = ref(false)
const confirmCloseDialogVisible = ref(false)
const dialogData = ref([])

// 判断各个按钮是否禁用
const isCloseDisabled = computed(() => {
  const selected = selectedExpandedRows.value
  return selected.length === 0 || !selected.every((row) => row.warningStatus === 0 || row.warningStatus === 1)
})

const isSuspendDisabled = computed(() => {
  const selected = selectedExpandedRows.value
  return selected.length === 0 || !selected.every((row) => row.warningStatus === 0 || row.warningStatus === 3)
})

const isReportDisabled = computed(() => {
  const selected = selectedExpandedRows.value
  return selected.length === 0 || !selected.every((row) => row.warningStatus === 0 || row.warningStatus === 1)
})

const isLevelDisabled = computed(() => {
  const selected = selectedExpandedRows.value
  return selected.length === 0 || !selected.every((row) => row.warningStatus === 0 || row.warningStatus === 1)
})

const isConfirmCloseDisabled = computed(() => {
  const selected = selectedExpandedRows.value
  return selected.length === 0 || !selected.every((row) => row.warningStatus === 3)
})

// 修改处理函数，移除冗余的状态检查
const handleClose = () => {
  dialogData.value = selectedExpandedRows.value
  closeDialogVisible.value = true
}

const handleSuspend = () => {
  dialogData.value = selectedExpandedRows.value
  suspendDialogVisible.value = true
}

const handleReport = () => {
  dialogData.value = selectedExpandedRows.value
  reportDialogVisible.value = true
}

const handleLevel = () => {
  dialogData.value = selectedExpandedRows.value
  levelDialogVisible.value = true
}

const confirmClose = () => {
  const selectedRows = selectedExpandedRows.value
  if (selectedRows.length === 0) return

  dialogData.value = selectedRows
  confirmCloseDialogVisible.value = true
}

// 刷新功能
const tableKey = ref(0)
const refresh = async () => {
  await getWarnInfo()
  expandedData.value = {}
  tableKey.value += 1
}
//预警详情界面
const detailTurbineId = ref(null)
const detailWarningDescription = ref(null)
const detailWarningLevel = ref(null)
const detailStartTime = ref(null)
const detailEndTime = ref(null)
const detailWarningStatus = ref(null)
const detailTurbineName = ref(null)
const detailWarningId = ref(null)
const detailStandCode = ref(null)
const detailNewWarningLevel = ref(null)
const detailStandDes = ref(null)
const detailConsequence = ref(null)
const detailWarningLabel = ref(null)
const detailPriority = ref(null)
const detailModelId = ref(null)
const look = (
  turbineId,
  warningDescription,
  warningLevel,
  startTime,
  endTime,
  warningStatus,
  turbineName,
  warningId,
  standCode,
  newWarningLevel,
  standDes,
  consequence,
  warningLabel,
  priority,
  modelId
) => {
  detailTurbineId.value = turbineId
  detailWarningDescription.value = warningDescription
  detailWarningLevel.value = warningLevel
  detailStartTime.value = startTime
  detailEndTime.value = endTime
  detailWarningStatus.value = warningStatus
  detailTurbineName.value = turbineName
  detailWarningId.value = warningId
  detailStandCode.value = standCode
  detailNewWarningLevel.value = newWarningLevel
  detailStandDes.value = standDes
  detailConsequence.value = consequence
  detailWarningLabel.value = warningLabel
  detailPriority.value = priority
  detailModelId.value = modelId
  lookDialogVisible.value = true
}
</script>

<template>
  <div class="container">
    <div class="top">
      <el-button @click="back" class="button"> 返回 </el-button>
      <div class="title-container">
        <span class="title">待处理预警</span>
      </div>
    </div>
    <div class="main">
      <div class="info">
        <div class="info-text">
          <el-button class="company">{{ companyName }}</el-button>
          <span class="span-name">场站</span>
          <span class="span-value">{{ windFarmName }}</span>
          <span class="span-name">风机名称</span>
          <span class="span-value">{{ turbineName }}</span>
        </div>
        <div class="info-button" v-if="showInfoButton">
          <el-button class="operation" :disabled="isCloseDisabled" @click="handleClose">关闭</el-button>
          <el-button class="operation" :disabled="isSuspendDisabled" @click="handleSuspend">挂起</el-button>
          <el-button class="operation" :disabled="isReportDisabled" @click="handleReport">通知</el-button>
          <el-button class="operation" :disabled="isLevelDisabled" @click="handleLevel">分级</el-button>
          <el-button class="operation" :disabled="isConfirmCloseDisabled" @click="confirmClose">确认关闭</el-button>
        </div>
      </div>

      <el-table
        :data="warningList"
        :key="tableKey"
        row-key="warningDescription"
        height="70vh"
        @expand-change="handleExpand"
      >
        <el-table-column type="expand" label="展开" width="60px">
          <template #default="{ row }">
            <!-- <el-table
              :data="expandedData[row.warningDescription] || []"
              height="335px"
              :show-overflow-tooltip="true"
              :default-sort="{ prop: 'warningStatus', order: 'ascending' }"
            > -->
            <el-table
              :data="expandedData[row.warningDescription] || []"
              height="335px"
              v-loading="expandedLoading[row.warningDescription]"
              element-loading-text="数据加载中..."
              element-loading-background="rgba(0, 0, 0, 0.4)"
              element-loading-spinner="el-icon-loading"
              :default-sort="{ prop: 'warningStatus', order: 'ascending' }"
            >
              <!-- 表格列配置 -->
              <el-table-column width="46" align="center" ></el-table-column>
              <el-table-column width="55" align="center">
                <template #header>选择</template>
                <template #default="scope">
                  <el-checkbox
                    :model-value="scope.row.selected"
                    @change="toggleExpandedRowSelect(scope.row, row)"
                  ></el-checkbox>
                </template>
              </el-table-column>

              <!-- 其他列配置保持不变 -->
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
              <el-table-column prop="farmTurbineName" label="设备名称" width="320px" align="center"></el-table-column>
              <el-table-column  label="预警信息" align="center">
                <template #default="scope">
                    {{ scope.row.warningDescription.replace(/[\[\]']+/g, '') }}
                </template>
              </el-table-column>
              <el-table-column prop="warningLevel" label="等级" width="140px" align="center">
                <template #default="scope">
                  <span :style="{ color: levelMap[scope.row.warningLevel]?.color }">
                    {{ levelMap[scope.row.warningLevel]?.label }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="warningStatus"
                label="状态"
                width="140px"
                align="center"
                sortable
                :sort-orders="['ascending', 'descending']"
                :sort-method="(a, b) => a.warningStatus - b.warningStatus"
              >
                <template #default="scope">
                  <span :style="{ color: statusMap[scope.row.warningStatus]?.color }">
                    {{ statusMap[scope.row.warningStatus]?.label }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="" label="详情" align="center" width="140px">
                <template #default="scope">
                  <el-link
                    type="primary"
                    @click="
                      look(
                        scope.row.turbineId,
                        scope.row.warningDescription,
                        scope.row.warningLevel,
                        scope.row.startTime,
                        scope.row.endTime,
                        scope.row.warningStatus,
                        scope.row.turbineName,
                        scope.row.warningId,
                        scope.row.standCode,
                        scope.row.newWarningLevel,
                        scope.row.standDes,
                        scope.row.consequence,
                        scope.row.warningLabel,
                        scope.row.priority,
                        scope.row.modelId
                      )
                    "
                    >查看</el-link
                  >
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column width="55" align="center">
          <template #header>选择</template>
          <template #default="scope">
            <el-checkbox :model-value="scope.row.selected" @change="toggleMainRowSelect(scope.row)"></el-checkbox>
          </template>
        </el-table-column>

        <el-table-column label="序号" width="60px" align="center">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="farmTurbineName" label="设备名称" width="700px" align="center"></el-table-column>
        <el-table-column prop="warningDescription" label="预警信息" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 弹窗 -->
    <el-dialog title="关闭预警" v-model="closeDialogVisible" width="60%">
      <close
        v-if="closeDialogVisible"
        :dialogData="dialogData"
        @close-dialog="closeDialogVisible = false"
        @refresh="refresh"
      />
    </el-dialog>
    <el-dialog title="挂起" v-model="suspendDialogVisible" width="60%">
      <suspend
        v-if="suspendDialogVisible"
        :dialogData="dialogData"
        @close-dialog="suspendDialogVisible = false"
        @refresh="refresh"
      />
    </el-dialog>
    <el-dialog title="通知" v-model="reportDialogVisible" width="60%">
      <pendingReport
        v-if="reportDialogVisible"
        :dialogData="dialogData"
        :windFarmId="Number(windFarmId)"
        :windFarmName="windFarmName"
        :turbineId="Number(turbineId)"
        @close-dialog="reportDialogVisible = false"
        @refresh="refresh"
      />
    </el-dialog>
    <el-dialog title="修改等级" v-model="levelDialogVisible" width="60%">
      <level
        v-if="levelDialogVisible"
        :dialogData="dialogData"
        @close-dialog="levelDialogVisible = false"
        @refresh="refresh"
      />
    </el-dialog>
    <el-dialog title="确认关闭" v-model="confirmCloseDialogVisible" width="60%">
      <confirmclose
        v-if="confirmCloseDialogVisible"
        :dialogData="dialogData"
        @close-dialog="confirmCloseDialogVisible = false"
        @refresh="refresh"
      />
    </el-dialog>
    <el-dialog title="预警详情" v-model="lookDialogVisible" width="90%">
      <newWarningDetail
        v-if="lookDialogVisible"
        :turbineId="Number(turbineId)"
        :warningDescription="detailWarningDescription"
        :warningLevel="detailWarningLevel"
        :warningStatus="detailWarningStatus"
        :startTime="detailStartTime"
        :endTime="detailEndTime"
        :turbineName="turbineName"
        :warningId="detailWarningId"
        :standCode="detailStandCode"
        :newWarningLevel="detailNewWarningLevel"
        :standDes="detailStandDes"
        :consequence="detailConsequence"
        :warningLabel="detailWarningLabel"
        :priority="detailPriority"
        :modelId="detailModelId"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}
.container {
  padding: 10px;
  margin: 10px;
  background-color: transparent !important;
}
.top {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 15px;
}
.button {
  position: absolute;
  left: 0;
  background-color: #164476;
  font-size: 15px;
  color: white;
  border: #164476;
}
.title-container {
  background: linear-gradient(to bottom, #102842, #15608a);
  padding: 15px;
  border-radius: 5px;
  text-align: center;
}

.title {
  color: white;
  font-size: 18px;
  letter-spacing: 2px;
}
.main {
  border: 1px solid #164b6d;
}
.info {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.info-text {
  display: flex;
  align-items: center;
  position: relative;
}

.info-text::after {
  content: '';
  height: 35px;
  width: 2px;
  background-color: #15608a;
  margin-left: -512px;
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
  height: 15px;
  padding: 10px;
}
.span-value {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #164b6d;
  font-size: 15px;
  width: 140px;
  height: 15px;
  padding: 10px;
}
.span-value-time {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #164b6d;
  font-size: 14px;
  width: 140px;
  height: 15px;
  padding: 10px;
}
.operation {
  background-color: #36b8da;
  border: 1px solid #36b8da;
  font-size: 15px;
  color: white;
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
      .el-table__expanded-cell & {
        background-color: #021524 !important;
        td {
          background-color: #021524 !important;
          color: #ffffff !important;
        }
      }
    }
  }

  th {
    color: #ffffff !important;
  }

  td {
    color: #c2dcf5 !important;
  }

  .el-table__expanded-cell & {
    th {
      background-color: #0f3349 !important;
      color: #ffffff !important;
    }
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

.operation:disabled {
  background-color: #ccc !important;
  border-color: #ccc !important;
  color: #666 !important;
  cursor: not-allowed;
}
</style>
