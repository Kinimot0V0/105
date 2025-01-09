<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const companyName = ref('内蒙古公司')
const windFarmName = ref('化德分散式')
const turbineName = ref('风机001')

const warningList = ref([
  {
    deviceName: '风场1-风机1',
    warningInfo: '温度高',
    module: '发电机1',
    level: '1级',
    status: 0,
    expanded: false,
    selected: false
  },
  {
    deviceName: '风场1-风机2',
    warningInfo: '发电机出问题',
    module: '发电机1',
    level: '1级',
    status: 1,
    expanded: false,
    selected: false
  }
])

const warningInfoList = ref([
  {
    id: 1,
    startTime: '2024-10-10 13:00:00',
    endTime: '2024-10-10 14:00:00',
    deviceName: '风场1-风机1',
    warningInfo: '温度高',
    module: '发电机1',
    level: '1级',
    status: 0,
    selected: false
  },
  {
    id: 2,
    startTime: '2024-10-10 10:08:00',
    endTime: '2024-10-10 10:08:00',
    deviceName: '风场1-风机2',
    warningInfo: '温度高',
    module: '发电机2',
    level: '1级',
    status: 0,
    selected: false
  },
  {
    id: 3,
    startTime: '2024-10-10 10:00:00',
    endTime: '2024-10-10 10:00:00',
    deviceName: '风场1-风机3',
    warningInfo: '发电机出问题',
    module: '发电机3',
    level: '1级',
    status: 1,
    selected: false
  },
  {
    id: 4,
    startTime: '2024-10-10 10:00:00',
    endTime: '2024-10-10 10:00:00',
    deviceName: '风场1-风机3',
    warningInfo: '发电机出问题',
    module: '发电机3',
    level: '1级',
    status: 1,
    selected: false
  },
  {
    id: 5,
    startTime: '2024-10-10 13:00:00',
    endTime: '2024-10-10 14:00:00',
    deviceName: '风场1-风机1',
    warningInfo: '温度高',
    module: '发电机1',
    level: '1级',
    status: 0,
    selected: false
  },
  {
    id: 6,
    startTime: '2024-10-10 10:08:00',
    endTime: '2024-10-10 10:08:00',
    deviceName: '风场1-风机2',
    warningInfo: '温度高',
    module: '发电机2',
    level: '1级',
    status: 0,
    selected: false
  }
])

const back = () => {
  router.push('/intelligentEarlyWarning/todo')
}

const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '已挂起', color: 'orange' }
})

// 原表格选择框
const toggleMainRowSelect = (row) => {
  row.selected = !row.selected

  const relatedInfo = warningInfoList.value.filter((info) => info.warningInfo === row.warningInfo)

  relatedInfo.forEach((info) => {
    info.selected = row.selected
  })
}

// 展开表格选择框
const toggleExpandedRowSelect = (row, mainRow) => {
  row.selected = !row.selected

  const relatedInfo = warningInfoList.value.filter((info) => info.warningInfo === row.warningInfo)
  const allRowsSelected = relatedInfo.every((info) => info.selected)

  if (!allRowsSelected) {
    mainRow.selected = false
  }
}

// 获取所有选中的展开表格行
// const getSelectedExpandedRows = computed(() => {
//   return warningInfoList.value.filter((row) => row.selected)
// })

// 添加处理详情的方法
const handleEdit = (modelId) => {
  console.log('查看详情', modelId)
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
        <div class="info-button">
          <el-button class="operation">关闭</el-button>
          <el-button class="operation">挂起</el-button>
          <el-button class="operation">通知</el-button>
          <el-button class="operation">分级</el-button>
        </div>
      </div>

      <el-table :data="warningList" row-key="warningInfo" height="70vh">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :data="warningInfoList.filter((info) => info.warningInfo === row.warningInfo)">
              <el-table-column width="46" align="center"></el-table-column>
              <el-table-column width="55" align="center">
                <template #header> 选择 </template>
                <template #default="scope">
                  <el-checkbox
                    :model-value="scope.row.selected"
                    @change="toggleExpandedRowSelect(scope.row, row)"
                  ></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column width="60" align="center"></el-table-column>
              <el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
              <el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
              <el-table-column prop="deviceName" label="设备名称" align="center"></el-table-column>
              <el-table-column prop="warningInfo" label="预警信息" width="440px" align="center"></el-table-column>
              <el-table-column prop="module" label="系统分类" width="240px" align="center"></el-table-column>
              <el-table-column prop="level" label="等级" width="120px" align="center"></el-table-column>
              <el-table-column prop="status" label="状态" width="120px" align="center">
                <template #default="scope">
                  <span :style="{ color: statusMap[scope.row.status]?.color || 'black' }">
                    {{ statusMap[scope.row.status]?.label || '未知状态' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="详情" width="120px" align="center">
                <template #default="scope">
                  <el-link type="primary" @click="handleEdit(scope.row.id)">查看</el-link>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column width="55" align="center">
          <template #header> 选择 </template>
          <template #default="scope">
            <el-checkbox :model-value="scope.row.selected" @change="toggleMainRowSelect(scope.row)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="序号" width="60px" align="center">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceName" label="设备名称" align="center"></el-table-column>
        <el-table-column prop="warningInfo" label="预警信息" width="440px" align="center"></el-table-column>
        <el-table-column prop="module" label="系统分类" width="240px" align="center"></el-table-column>
        <el-table-column prop="level" label="等级" width="120px" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="120px" align="center">
          <template #default="scope">
            <span :style="{ color: statusMap[scope.row.status]?.color || 'black' }">
              {{ statusMap[scope.row.status]?.label || '未知状态' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="详情" width="120px" align="center">
          <template #default="scope">
            <el-link type="primary" @click="handleEdit(scope.row.model_id)">查看</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
