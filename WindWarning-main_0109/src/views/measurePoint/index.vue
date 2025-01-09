<script setup>
import { ref, onMounted } from 'vue'
import addRealPoint from '@/components/realPoint/addRealPoint.vue'
import { getRealPoint } from '@/api/realPoint'

const dialogVisible = ref(false) // 控制弹窗的显示

//getRealPoint的信息
const realPointList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

const getRealPointData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    const response = await getRealPoint(params)
    console.log('返回结果:', response)
    // const data = response.data.result
    // realPointList.value = data.modelList
    // totalCount.value = data.total_count
    // page.value = data.page
    // totalPages.value = data.total_pages
  } catch (error) {
    console.error('获取模型数据失败:', error)
  }
}

onMounted(getRealPointData)

// 更新分页的当前页
const handlePageChange = (current_page) => {
  page.value = current_page
  getRealPointData()
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  getRealPointData()
}
</script>

<template>
  <div class="container">
    <el-form label-width="120px" style="margin-top: 10px; margin-bottom: 10px; margin-left: 10px">
      <el-row :gutter="10">
        <el-button type="primary" @click="dialogVisible = true">新增测点</el-button>
      </el-row>
    </el-form>

    <el-table :data="realPointList" border>
      <el-table-column label="序号" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="pointLabel" label="测点标签" align="center"></el-table-column>
      <el-table-column prop="pointDescription" label="测点描述" align="center"></el-table-column>
      <el-table-column prop="moduleID" label="模块" align="center"></el-table-column>
      <el-table-column prop="pointUnit" label="测点单位" align="center"></el-table-column>
      <el-table-column prop="pointType" label="测点类型" align="center"></el-table-column>
      <el-table-column prop="turbineId" label="风机" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
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
        :page-sizes="[10, 20, 30]"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>

    <!-- 新建模型弹窗 -->
    <el-dialog title="新增测点" v-model="dialogVisible" width="80%">
      <!-- 将 dialogVisible 传递给子组件 index，并监听 closeDialog 事件 -->
      <addRealPoint :dialog-visible="dialogVisible" @close-dialog="dialogVisible = false" />
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 20px;
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
  border: 1px solid #d3d3d3;
}
</style>
