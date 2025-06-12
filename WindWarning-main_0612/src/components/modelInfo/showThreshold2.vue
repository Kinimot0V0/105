<script setup>
import { ref, onMounted, computed } from 'vue'
import { getThr } from '@/api/model'
import updateThreshold2 from '@/components/modelInfo/updateThreshold2.vue'

const props = defineProps({
  modelId: {
    type: Number,
    required: true
  }
})
const thrData = ref({})
const selectedItems = ref([])
const updateDialogVisible = ref(false)

// 将对象转换为表格需要的对象数组
const tableData = computed(() => {
  return Object.keys(thrData.value)
    .filter((key) => key !== 'id') // 排除id字段
    .map((key) => ({
      name: key,
      value: thrData.value[key]
    }))
})

// 创建传递给子组件的数据
const selectedData = computed(() => ({
  modelId: props.modelId,
  items: selectedItems.value
}))

const update = () => {
  // console.log('选择的项:', selectedItems.value)
  updateDialogVisible.value = true
}

const emit = defineEmits(['close-dialog'])

const closeDialog = () => {
  emit('close-dialog')
}

// 修复复选框逻辑
const handleCheckboxChange = (rowName, checked) => {
  if (checked) {
    selectedItems.value.push(rowName)
  } else {
    selectedItems.value = selectedItems.value.filter((item) => item !== rowName)
  }
}

// 修复0值显示问题
const formatNumber = (num) => {
  return num !== null && num !== undefined ? parseFloat(num).toFixed(1) : 'NULL'
}

const init = async () => {
  try {
    const params = {
      modelId: props.modelId
    }
    // console.log('阈值参数:', params)
    const response = await getThr(params)
    // console.log('阈值返回:', response)
    thrData.value = response.data.result
  } catch (error) {
    console.error('查看阈值接口错误:', error)
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="warning-table-container">
    <!-- 修复条件判断和数据结构 -->
    <el-table v-if="tableData.length > 0" :data="tableData" style="width: 100%" stripe max-height="50vh">
      <el-table-column label="选择" align="center" width="100px">
        <template #default="scope">
          <!-- 修复复选框绑定 -->
          <el-checkbox
            :checked="selectedItems.includes(scope.row.name)"
            @change="handleCheckboxChange(scope.row.name, $event)"
          />
        </template>
      </el-table-column>

      <el-table-column label="名称" align="center" prop="name" />

      <el-table-column label="数值" align="center">
        <template #default="scope">
          {{ formatNumber(scope.row.value) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-button type="primary" @click="update" :disabled="selectedItems.length === 0"> 更改阈值 </el-button>
      <el-button type="danger" @click="closeDialog">关闭</el-button>
    </div>

    <!-- 更新弹窗 -->
    <el-dialog title="更改阈值" v-model="updateDialogVisible" width="80%">
      <updateThreshold2
        v-if="updateDialogVisible"
        :thresholdData="selectedData"
        @close-dialog="updateDialogVisible = false"
        @refresh-model-data="init"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.warning-table-container {
  display: flex;
  flex-direction: column;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-footer .el-button {
  margin: 0 10px;
}
</style>
