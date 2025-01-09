<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const companyName = ref('内蒙古公司')
const windFarmName = ref('化德分散式')
const turbineName = ref('风机001')
// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)

const reportList = ref([
  {
    noticeLabel: 'TZ01',
    turbineName: '化德分散式风电场-风机01',
    people: '张三',
    time: '2024-10-10 00:00:00',
    detail: '发电机绕组温度高；发电机驱动端轴承..',
    status: 1
  }
])
const back = () => {
  router.push('/intelligentEarlyWarning/todo')
}

const statusMap = ref({
  1: { label: '处理中', color: 'red' },
  2: { label: '办结', color: 'blue' }
})
</script>

<template>
  <div class="container">
    <div class="top">
      <el-button @click="back" class="button"> 返回 </el-button>
      <div class="title-container">
        <span class="title">待处理通知</span>
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
          <el-date-picker
            v-model="startDate"
            type="datetime"
            placeholder="选择开始时间"
            :clearable="true"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px; margin-left: 10px"
          ></el-date-picker>

          <span class="date-separator" style="margin-left: 10px">至</span>

          <el-date-picker
            v-model="endDate"
            type="datetime"
            placeholder="选择结束时间"
            :clearable="true"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px; margin-left: 10px"
          ></el-date-picker>
        </div>
      </div>
      <el-table :data="reportList">
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
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin: 10px;
  background-color: transparent !important;
}
.button {
  position: absolute;
  left: 0;
  background-color: #164476;
  font-size: 15px;
  color: white;
  border: #164476;
}
.top {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 15px;
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
  height: 75vh;
}
.info {
  display: flex;
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
  margin-left: -917px;
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
</style>
