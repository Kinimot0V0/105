<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({
  warningList: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  totalPages: {
    type: Number,
    default: 0
  }
})

// 定义可以触发的事件
const emit = defineEmits(['page-change'])

// 分页变化处理
const handlePageChange = (newPage) => {
  emit('page-change', newPage)
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
  3: { label: '关闭待确认', color: 'blue' },
  4: { label: '关闭', color: 'white' }
})

// 自动轮播间隔时间（毫秒）
const CAROUSEL_INTERVAL = 5000

// 自动轮播定时器
let carouselTimer = null

// 自动翻页方法
const autoNextPage = () => {
  // 如果当前页是最后一页，则返回第一页
  const nextPage = props.currentPage >= props.totalPages ? 1 : props.currentPage + 1
  emit('page-change', nextPage)
}

// 开始自动轮播
const startCarousel = () => {
  carouselTimer = setInterval(autoNextPage, CAROUSEL_INTERVAL)
}

// 停止自动轮播
const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

// 鼠标悬停时停止轮播
const handleMouseEnter = () => {
  stopCarousel()
}

// 鼠标离开时重新开始轮播
const handleMouseLeave = () => {
  startCarousel()
}

// 组件挂载时开始轮播
onMounted(() => {
  startCarousel()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopCarousel()
})
</script>

<template>
  <div class="top">
    <span class="custom-span"> 预警信息 </span>
  </div>
  <div class="container" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <el-table :data="props.warningList">
      <el-table-column label="序号" align="center" width="60px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="开始时间" align="center">
        <template #default="scope">
          {{ scope.row.startTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="farmTurbineName" label="光伏机器名称" align="center"></el-table-column>
      <el-table-column prop="warningDescription" label="预警信息" align="center"></el-table-column>
      <el-table-column prop="warningLevel" label="等级" align="center" width="60px">
        <template #default="scope">
          <span>
            {{ levelMap[scope.row.warningLevel]?.label || '1级' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="warningStatus" label="状态" align="center" width="100px">
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
      <el-table-column prop="" label="详情" align="center" width="60px">
        <template #default="scope">
          <el-link type="primary" @click="look(scope.row.warningId)">查看</el-link>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px; margin-bottom: 15px">
      <div style="margin-right: 10px; font-size: 14px">共 {{ totalCount }} 条，共 {{ totalPages }} 页</div>

      <!-- 分页组件 -->
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  height: 50px;
}

.custom-span {
  display: inline-flex;
  align-items: center;
  background-color: #164476;
  color: white;
  padding: 5px 10px;
  font-size: 17px;
  border-radius: 5px;
  position: relative;
  font-weight: bold;
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
</style>
