<script setup>
import { ref, watch, computed } from 'vue'
import addCard from '@/components/cardConfig/addCard.vue'

// 响应式变量
const typeID = ref('allType')
const factoryID = ref('allFactory')
const isCalibrated = ref('all')

const page = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false) // 控制弹窗的显示

const cardList = ref([
  {
    itemNumber: '1',
    factory: 'VISHAY',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '2',
    factory: 'VISHAY',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '否'
  },
  {
    itemNumber: '3',
    factory: 'VISHAY',
    type: 'AWP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '4',
    factory: 'TRACO',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '1',
    factory: 'VISHAY',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '2',
    factory: 'VISHAY',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '否'
  },
  {
    itemNumber: '3',
    factory: 'VISHAY',
    type: 'AWP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '4',
    factory: 'TRACO',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '1',
    factory: 'VISHAY',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '2',
    factory: 'VISHAY',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '否'
  },
  {
    itemNumber: '3',
    factory: 'VISHAY',
    type: 'AWP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  },
  {
    itemNumber: '4',
    factory: 'TRACO',
    type: 'MDP卡件',
    ratedCurrent: '12.5',
    isMark: '是'
  }
])

// 过滤后的数据
const filteredData = ref([...cardList.value])

const factoryList = computed(() => {
  // 从cardList中提取所有唯一的厂家名称
  const factories = new Set(cardList.value.map((item) => item.factory))
  // 转换为el-option需要的格式
  return Array.from(factories).map((factoryName) => ({
    factoryID: factoryName, // 使用厂家名称作为ID
    factoryName: factoryName
  }))
})

const typeList = computed(() => {
  const types = new Set(cardList.value.map((item) => item.type))
  return Array.from(types).map((typeName) => ({
    typeID: typeName,
    typeName: typeName
  }))
})

// 查询按钮的方法
const handleSearch = () => {
  filteredData.value = cardList.value.filter((item) => {
    const factoryMatch = factoryID.value === 'allFactory' || item.factory === factoryID.value
    const typeMatch = typeID.value === 'allType' || item.type === typeID.value
    const isMarkMath =
      isCalibrated.value === 'all' ||
      (isCalibrated.value === 'true' && item.isMark === '是') ||
      (isCalibrated.value === 'false' && item.isMark === '否')
    return factoryMatch && typeMatch && isMarkMath
  })
  page.value = 1
}

// 分页相关计算
const totalCount = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 分页数据切片
const paginatedCardList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  page.value = 1
}

const handlePageChange = (newPage) => {
  page.value = newPage
}

// 操作方法
const cardEdit = () => {
  console.log('编辑操作')
}

const cardDelete = () => {
  console.log('删除操作')
}
</script>
<template>
  <div class="container">
    <div class="info">
      <div class="info-text">
        <el-button class="company" @click="dialogVisible = true">新增卡件</el-button>
        <span class="span-name">厂家</span>
        <el-select
          v-model="factoryID"
          placeholder="全部厂家"
          value-key="FactoryID"
          class="factory-select"
          style="--el-input-text-color: white"
        >
          <el-option label="全部厂家" value="allFactory" />
          <el-option
            v-for="factory in factoryList"
            :key="factory.factoryID"
            :label="factory.factoryName"
            :value="factory.factoryID"
          ></el-option>
        </el-select>
        <span class="span-name">型号</span>
        <el-select
          v-model="typeID"
          placeholder="全部型号"
          value-key="typeID"
          class="factory-select"
          style="--el-input-text-color: white"
        >
          <el-option label="全部型号" value="allType" />
          <el-option
            v-for="type in typeList"
            :key="type.typeID"
            :label="type.typeName"
            :value="type.typeID"
          ></el-option>
        </el-select>
        <span class="span-name">是否标定</span>
        <el-select
          v-model="isCalibrated"
          placeholder="全部"
          class="factory-select"
          style="--el-input-text-color: white; width: 80px"
        >
          <el-option label="全部" value="all" />
          <el-option label="是" value="true" />
          <el-option label="否" value="false" />
        </el-select>
        <el-button class="button" style="margin-left: 30px" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <el-table :data="paginatedCardList">
      <el-table-column label="序号" width="120px" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="factory" label="厂家" width="225px" align="center"></el-table-column>
      <el-table-column prop="type" label="型号" align="center"></el-table-column>
      <el-table-column prop="ratedCurrent" label="额定电流IN(A)" align="center"></el-table-column>
      <el-table-column prop="isMark" label="是否标定" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" width="226px" align="center">
        <template #default>
          <el-button link type="primary" size="small" @click="cardEdit">编辑</el-button>
          <el-button link type="danger" size="small" @click="cardDelete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        margin-bottom: 15px;
      "
    >
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
  <!-- 新建模型弹窗 -->
  <el-dialog title="新增卡件" v-model="dialogVisible" width="80%">
    <!-- 将 dialogVisible 传递给子组件 index，并监听 closeDialog 事件 -->
    <addCard :dialog-visible="dialogVisible" @close-dialog="dialogVisible = false" />
  </el-dialog>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 10px;
  /* border: 1px solid #164b6d; */
  height: 80vh;
}
.operation {
  background-color: #36b8da;
  border: 1px solid #36b8da;
  font-size: 15px;
  color: white;
}
.factory-select {
  width: 160px;
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
