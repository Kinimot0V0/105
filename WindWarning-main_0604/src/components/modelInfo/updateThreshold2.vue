<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { changeThreshold } from '@/api/model'

const props = defineProps({
  thresholdData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close-dialog', 'refresh-model-data'])

// 创建响应式的阈值对象 {aa: 0, bb: 0}
const thresholdValues = ref({})

// 监听props变化，初始化阈值对象
watch(
  () => props.thresholdData,
  (newVal) => {
    if (newVal && newVal.items) {
      const values = {}
      newVal.items.forEach((item) => {
        values[item] = ''
      })
      thresholdValues.value = values
    }
  },
  { immediate: true, deep: true }
)

// 数值验证函数
const isValidNumber = (value) => {
  if (value === '') return false
  return /^[-+]?\d+(\.\d+)?$/.test(value)
}

// 数据提交
const update = async () => {
  try {
    // 验证所有输入值
    for (const [key, value] of Object.entries(thresholdValues.value)) {
      if (value === '') {
        ElMessage.warning(`"${key}"的值不能为空！`)
        return
      }
      if (!isValidNumber(value)) {
        ElMessage.error(`"${key}"的值格式不正确，请输入数字`)
        return
      }
    }

    // 构建参数格式
    const items = Object.entries(thresholdValues.value).map(([key, value]) => {
      return { [key]: parseFloat(value) }
    })

    const params = {
      modelId: props.thresholdData.modelId,
      items: items
    }

    // console.log('changeThreshold参数', params)
    // 调用接口
    const response = await changeThreshold(params)
    // console.log('changeThreshold返回', response)
    ElMessage.success('修改成功')
    emit('refresh-model-data')
    emit('close-dialog')
  } catch (error) {
    console.error('更改阈值接口错误:', error)
    ElMessage.error('修改失败：' + (error.response?.data?.message || error.message))
  }
}

const closeDialog = () => {
  emit('close-dialog')
}
</script>

<template>
  <div class="warning-table-container">
    <div class="input-container">
      <!-- 为每个选中的名称创建一个输入框 -->
      <div v-for="(value, name) in thresholdValues" :key="name" class="input-row">
        <span class="span-name">{{ name }}</span>
        <el-input v-model="thresholdValues[name]" placeholder="请输入数值" clearable style="width: 200px"> </el-input>
      </div>
    </div>

    <div class="table-footer">
      <el-button type="primary" @click="update">确认修改</el-button>
      <el-button type="danger" @click="closeDialog">关闭</el-button>
    </div>
  </div>
</template>

<style scoped>
.warning-table-container {
  display: flex;
  flex-direction: column;
}

.input-container {
  max-height: 50vh;
  overflow-y: auto;
  padding: 10px;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.span-name {
  display: inline-block;
  width: 200px;
  text-align: right;
  padding-right: 15px;
  font-weight: bold;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 15px;
}

.table-footer .el-button {
  margin: 0 10px;
}
</style>
