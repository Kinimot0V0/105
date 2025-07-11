<script setup>
import { ref, onMounted } from 'vue'
import { getAlgorithm } from '@/api/algorithm'

const algorithmList = ref([])

const getAlgorithmData = async () => {
  try {
    // 获取算法列表
    const response = await getAlgorithm()
    algorithmList.value = response.data.result
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}
const getAlgorithmTypeName = (type) => {
  const typeMap = {
    1: '汇流箱算法',
    2: '逆变器算法'
  }
  return typeMap[type] || type // 非1/2的值显示原始值
}

onMounted(getAlgorithmData)
</script>

<template>
  <div class="container">
    <h2 style="text-align: center">规则生成</h2>

    <el-table :data="algorithmList" border :max-height="680">
      <el-table-column label="序号" align="center" width="80px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="algorithmLabel" label="算法标签" align="center"></el-table-column>
      <el-table-column prop="algorithmName" label="算法名称" align="center"></el-table-column>
      <el-table-column label="算法种类" align="center">
        <template #default="scope">
          {{ getAlgorithmTypeName(scope.row.algorithmType) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #164b6d;
  height: 80vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.el-table {
  border-collapse: collapse;
  text-align: center;
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
</style>
