<script setup>
import { ref } from 'vue'

//getModel的信息
const noticeList = ref([
  {
    noticeLabel: 'TZ01',
    turbineName: '化德分散式风电场-风机01',
    people: '张三',
    time: '2024-10-10 00:00:00',
    detail: '发电机绕组温度高；发电机驱动端轴承..',
    status: 1
  }
])
const companyName = ref('内蒙古公司')
const turbineName = ref('')
const windFarmId = ref('')
const windFarmList = ref([
  {
    windFarmId: 1,
    windFarmName: '化德分散式'
  },
  {
    windFarmId: 2,
    windFarmName: '丰镇分散式'
  }
])
// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)

const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

// 状态映射
const statusMap = ref({
  1: { label: '处理中', color: 'red' },
  2: { label: '办结', color: 'blue' }
})
</script>

<template>
  <div class="container">
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
        <el-option :label="'全部'" :value="''"></el-option>
        <el-option
          v-for="windFarm in windFarmList"
          :key="windFarm.windFarmId"
          :label="windFarm.windFarmName"
          :value="windFarm.windFarmId"
        ></el-option>
      </el-select>
      <span class="span-name">风机名称</span>
      <el-input v-model="turbineName" style="width: 140px; height: 30px" placeholder="请输入风机名称"></el-input>
      <el-date-picker
        v-model="startDate"
        type="datetime"
        placeholder="选择开始时间"
        :clearable="true"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 180px"
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
      ></el-date-picker>
    </div>
    <el-table :data="noticeList">
      <el-table-column prop="noticeLabel" label="通知编号" width="240px" align="center"></el-table-column>
      <el-table-column prop="turbineName" label="风机名称" align="center"></el-table-column>
      <el-table-column prop="people" label="发起人" width="240px" align="center"></el-table-column>
      <el-table-column prop="time" label="发起时间" width="200px" align="center"></el-table-column>
      <el-table-column prop="detail" label="详情" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" width="240px" align="center">
        <template #default="scope">
          <span
            :style="{
              color: statusMap[scope.row.status]?.color || 'black'
            }"
          >
            {{ statusMap[scope.row.status]?.label || '未知状态' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240px" align="center">
        <el-link type="primary" @click="handleEdit()">处理</el-link>
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

.info-text::after {
  content: '';
  height: 35px;
  width: 2px;
  background-color: #15608a;
  margin-left: -956px;
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
  width: 140px;
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
:deep(.el-select__wrapper) {
  background-color: transparent !important;
  border: 1px solid #164b6d;
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
