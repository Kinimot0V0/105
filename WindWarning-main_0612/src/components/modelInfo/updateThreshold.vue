<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { changeThreshold } from '@/api/model'

const props = defineProps({
  thresholdData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close-dialog', 'refresh-model-data'])

const upperLimit = ref('')
const lowerLimit = ref('')

// 数值验证函数
const isValidNumber = (value) => {
  // 修改后的正则表达式，支持整数和浮点数
  return /^[-+]?\d+(\.\d+)?$/.test(value)
}

// 格式化数字为浮动类型并保留一位小数
const formatNumber = (num) => {
  if (num !== '' && num !== null && num !== undefined) {
    // 检查是否是整数，若是则加一个小数点后0
    if (parseFloat(num) === Math.floor(num)) {
      return parseFloat(num).toFixed(1) // 整数格式化为浮动类型
    } else {
      return parseFloat(num).toFixed(1) // 非整数，保留一位小数
    }
  }
  return null
}

// // 格式化区间数据，确保每个数值都保留一位小数
// const formatRange = (rangeArray) => {
//   return rangeArray.map((num) => parseFloat(num).toFixed(1)) // 保留一位小数
// }

// 数据提交
const update = async () => {
  try {
    // 输入验证
    const upper = upperLimit.value.trim()
    const lower = lowerLimit.value.trim()

    // 空值检查
    if (upper === '' || lower === '') {
      ElMessage.warning('上下限不能为空！')
      return
    }

    // 格式验证
    if (upper !== '' && !isValidNumber(upper)) {
      ElMessage.error('上限格式不正确')
      return
    }
    if (lower !== '' && !isValidNumber(lower)) {
      ElMessage.error('下限格式不正确')
      return
    }

    // 类型转换并格式化为浮动类型，保留一位小数
    const upperNum = upper !== '' ? parseFloat(formatNumber(upper)) : null
    const lowerNum = lower !== '' ? parseFloat(formatNumber(lower)) : null

    // 逻辑验证
    if (upperNum !== null && lowerNum !== null && parseFloat(upperNum) < parseFloat(lowerNum)) {
      ElMessage.error('上限不能小于下限')
      return
    }

    // 构造请求参数，确保 range 中的数值是浮动类型
    const params = {
      modelId: props.thresholdData.modelId,
      items: props.thresholdData.Items.map((item) => ({
        upperLimit: upperNum, // 确保 upperLimit 是浮动类型
        lowerLimit: lowerNum, // 确保 lowerLimit 是浮动类型
        range: item.range.map((r) => parseFloat(r)) // 确保 range 中的每个值是浮动类型
      }))
    }

    // 最终参数验证
    if (
      !params.items.every(
        (item) => Array.isArray(item.range) && item.range.length === 2 && item.range.every(Number.isFinite)
      )
    ) {
      ElMessage.error('区间数据格式错误')
      return
    }

    // console.log('changeThreshold参数', params)
    // 调用接口
    const response = await changeThreshold(params)
    // console.log('changeThreshold返回', response)
    emit('refresh-model-data')
    emit('close-dialog')
  } catch (error) {
    console.error('更改上下限接口错误:', error)
    ElMessage.error('修改失败：' + (error.response?.data?.message || error.message))
  }
}

const closeDialog = () => {
  emit('close-dialog')
}
</script>

<template>
  <div class="warning-table-container">
    <div class="info">
      <span class="span-name">上限</span>
      <el-input v-model="upperLimit" placeholder="请输入上限" clearable style="width: 120px; margin-right: 5px">
      </el-input>

      <span class="span-name">下限</span>
      <el-input v-model="lowerLimit" placeholder="请输入下限" clearable style="width: 120px"> </el-input>
    </div>

    <div class="table-footer">
      <el-button type="primary" @click="update">确认修改</el-button>
      <el-button @click="closeDialog">关闭</el-button>
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
  padding: 10px;
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
  margin-right: 10px;
}
</style>
