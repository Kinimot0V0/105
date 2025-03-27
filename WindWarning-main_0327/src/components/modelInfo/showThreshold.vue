<script setup>
import { ref, onMounted } from 'vue'
import { getThr } from '@/api/model'

const props = defineProps({
  modelId: {
    type: Number,
    required: true
  }
})
const thrData=ref([])

// const pendingChanges = ref({
//   modelId: props.modelId,
//   items: []
// })

// const updateDialogVisible = ref(false) // 控制弹窗的显示
// 判断按钮是否禁用
// const isDisabled = computed(() => {
//   return selected.length === 0
// })
const emit = defineEmits(['close-dialog'])

const closeDialog = () => {
  emit('close-dialog')
}

const init = async () => {
  try {
    const params = {
      modelId: props.modelId
    }
    const response = await getThr(params)
    thrData.value = response.data.result
  } catch (error) {
    console.error('查看阈值接口错误:', error)
  }
}
// 处理表格选择变化事件
const handleSelectionChange = (selection) => {
  
}
onMounted(async () => {
  await init()
})
</script>

<template>
  <div class="warning-table-container">
    <!-- <h3>查看模型阈值</h3>
    <el-button type="success">批量更改</el-button> -->
    <el-table :data="thrData" style="width: 100%" stripe max-height="50vh" >      
        <!-- <el-table-column 
            type="selection" 
            width="55" 
            align="center"
            /> -->
      <el-table-column label="序号" align="center" width="100px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="上限" align="center">
        <template #default="scope">
          {{ scope.row.upperLimit ?? 'NULL' }}
        </template>
      </el-table-column>

      <el-table-column label="下限" align="center">
        <template #default="scope">
          {{ scope.row.lowerLimit ?? 'NULL' }}
        </template>
      </el-table-column>

      <el-table-column label="区间" align="center">
        <template #default="scope">
          <span v-if="scope.row.range && scope.row.range.length >= 2">
            [{{ scope.row.range[0] }} , {{ scope.row.range[1] }}]
          </span>
          <span v-else>
            NULL
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-link type="primary">
            更改上下限
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-button type="danger" @click="closeDialog">关闭</el-button>
    </div>
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
