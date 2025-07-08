<script setup>
import { ref, onMounted, watch } from 'vue'
import { getThr } from '@/api/model'
import updateThreshold from '@/components/modelInfo/updateThreshold.vue'
const props = defineProps({
  modelId: {
    type: Number,
    required: true
  }
})
const thrData = ref([])

const updateDialogVisible = ref(false) // 控制弹窗的显示

const selectedData = ref(null)

watch(
  () => props.modelId,
  (newVal) => {
    if (newVal) init()
  }
)

const update = (row) => {
  // 构造符合要求的数据结构
  selectedData.value = {
    modelId: props.modelId,
    Items: [
      {
        upperLimit: row.upperLimit,
        lowerLimit: row.lowerLimit,
        range: row.range
      }
    ]
  }
  updateDialogVisible.value = true
}

const emit = defineEmits(['close-dialog'])

const closeDialog = () => {
  emit('close-dialog')
}

const init = async () => {
  try {
    thrData.value = [] // 清空旧数据
    const response = await getThr({ modelId: props.modelId })
    thrData.value = response.data.result
  } catch (error) {
    console.error('查看阈值接口错误:', error)
    thrData.value = [] // 确保出错时清空数据
  }
}

onMounted(async () => {
  await init()
})

// 格式化数字为浮动类型并保留两位小数
const formatNumber = (num) => {
  if (num !== null && num !== undefined) {
    return parseFloat(num).toFixed(1)
  }
  return 'NULL'
}
</script>

<template>
  <div class="warning-table-container">
    <el-table :data="thrData" style="width: 100%" stripe max-height="50vh">
      <el-table-column label="序号" align="center" width="100px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="上限" align="center">
        <template #default="scope">
          {{ formatNumber(scope.row.upperLimit) ?? 'NULL' }}
        </template>
      </el-table-column>

      <el-table-column label="下限" align="center">
        <template #default="scope">
          {{ formatNumber(scope.row.lowerLimit) ?? 'NULL' }}
        </template>
      </el-table-column>

      <el-table-column label="区间" align="center">
        <template #default="scope">
          <span v-if="scope.row.range && scope.row.range.length >= 2">
            [{{ formatNumber(scope.row.range[0]) }} , {{ formatNumber(scope.row.range[1]) }}]
          </span>
          <span v-else> NULL </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-link type="primary" @click="update(scope.row)"> 更改阈值 </el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-button type="danger" @click="closeDialog">关闭</el-button>
    </div>

    <!-- 更新弹窗 -->
    <el-dialog title="更改阈值" v-model="updateDialogVisible" width="80%">
      <updateThreshold
        v-if="updateDialogVisible"
        :thresholdData="selectedData"
        @close-dialog="updateDialogVisible = false"
        @refresh-model-data="init"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.warning-table-container {
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
.info {
  display: flex;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-footer .el-button {
  margin: 0 10px;
}
.span-name {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #285e76;
  border: 1px solid #285e76;
  font-size: 15px;
  width: 60px;
  height: 9px;
  padding: 10px;
}
</style>
