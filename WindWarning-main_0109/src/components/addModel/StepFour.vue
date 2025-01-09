<script setup>
import { ref, computed, watch } from 'vue'

// 从父组件传递的 props 数据
const props = defineProps({
  stepData: Object,
  providedData: Object
})

// 向父组件发送更新的事件
const emit = defineEmits(['updateStepData'])

// 确保 sample 是一个数组格式，以符合 el-table 的数据格式需求
const sample = ref(props.stepData.sample || []) // 使用空数组作为默认值
const currentPage = ref(1) // 当前页
const pageSize = ref(10) // 每页显示的条数

// 监听本地 sample 的变化并同步到父组件
watch(
  sample,
  (newSample) => {
    emit('updateStepData', newSample) // 将更新后的 conditions 传递给父组件
  },
  { deep: true }
)

// 选择的起始和结束时间
const startDate = ref(null)
const endDate = ref(null)

// 计算当前页的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sample.value.slice(start, end)
})

// 更新分页的当前页
const handlePageChange = (page) => {
  currentPage.value = page
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置为第一页
}

// 保存选择的时间
const handleDateChange = () => {
  if (startDate.value && endDate.value) {
    // 计算时间差（以秒为单位）
    const start = new Date(startDate.value).getTime()
    const end = new Date(endDate.value).getTime()
    const lastTimeInSeconds = Math.floor((end - start) / 1000) // 将毫秒转换为秒
    sample.value.push({
      id: Date.now(),
      startTime: startDate.value,
      endTime: endDate.value,
      lastTime: lastTimeInSeconds,
      sampleSize: '',
      filterPoints: '',
      mode: ''
    })
    // 清空选择的时间
    startDate.value = null
    endDate.value = null
    console.log(sample.value.id)
  }
}

const handleDelete = (id) => {
  // 根据 id 删除对应的数据
  sample.value = sample.value.filter((item) => item.id !== id)
}
</script>

<template>
  <div class="container">
    <h2 class="title">④ 训练样本选择</h2>
    <el-row style="margin-bottom: 10px; align-items: center">
      <el-button type="success">样本时间选取</el-button>
      <el-date-picker
        v-model="startDate"
        type="datetime"
        placeholder="选择开始时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="margin-left: 20px"
      ></el-date-picker>
      <el-date-picker
        v-model="endDate"
        type="datetime"
        placeholder="选择结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="margin-left: 10px"
      ></el-date-picker>
      <el-button type="primary" @click="handleDateChange" style="margin-left: 10px">添加</el-button>
    </el-row>

    <!-- 表格数据绑定为 paginatedData -->
    <el-table :data="paginatedData" border>
      <el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
      <el-table-column prop="lastTime" label="时长（秒）" align="center"></el-table-column>
      <el-table-column prop="sampleSize" label="样本数量（有效0）" align="center"></el-table-column>
      <el-table-column prop="filterPoints" label="过滤点数" align="center"></el-table-column>
      <el-table-column prop="mode" label="模式" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      style="margin-top: 15px; margin-bottom: 15px; display: flex; justify-content: center"
      background
      layout="prev, pager, next,sizes,jumper"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      :total="sample.length || 0"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
    </el-pagination>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
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
