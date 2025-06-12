<script setup>
import { ref, onMounted } from 'vue'
import { getAlgorithm,getModuleList} from '@/api/algorithm'

const algorithmList = ref([])

const getAlgorithmData = async () => {
  try {
    // 先获取模块列表
    const responseModule = await getModuleList()
    
    // 创建moduleId到moduleName的映射表
    const moduleMap = {}
    if (responseModule.data && responseModule.data.result) {
      responseModule.data.result.forEach(module => {
        moduleMap[module.moduleId] = module.moduleName
      })
    }
    
    // 获取算法列表
    const response = await getAlgorithm()
    
    // 处理算法数据，添加moduleName字段
    if (response.data && response.data.result) {
      algorithmList.value = response.data.result.map(algorithm => ({
        ...algorithm,
        moduleName: moduleMap[algorithm.moduleId] || '未知模块'
      }))
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

onMounted(getAlgorithmData)
</script>

<template>
  <div class="container">
    <!-- <el-form label-width="120px" style="margin-top: 10px; margin-bottom: 10px; margin-left: 10px">
      <el-row :gutter="10">
        <el-button type="primary" @click="dialogVisible = true">新增测点</el-button>
      </el-row>
    </el-form> -->
    <h2 style="text-align: center;">规则生成</h2>

    <el-table :data="algorithmList" border  :max-height="680">
      <el-table-column label="序号" align="center" width="80px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="algorithmLabel" label="算法标签" align="center"></el-table-column>
      <el-table-column prop="algorithmName" label="算法名称" align="center"></el-table-column>
      <el-table-column prop="algorithmVersion" label="算法版本" align="center"></el-table-column>
      <el-table-column prop="moduleName" label="模块名称" align="center"></el-table-column>
      <!-- <el-table-column label="操作" align="center" width="120px">
        <template #default="scope">
          <el-link type="primary" @click="handleEdit(scope.row.model_id)">编辑</el-link>
        </template>
      </el-table-column> -->
    </el-table>

    <!-- 新建模型弹窗 -->
    <!-- <el-dialog title="新增测点" v-model="dialogVisible" width="80%">
      <addRealPoint :dialog-visible="dialogVisible" @close-dialog="dialogVisible = false" />
    </el-dialog> -->
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
