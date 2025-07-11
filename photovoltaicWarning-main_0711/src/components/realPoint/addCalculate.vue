<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addRealPoint, getRealPoint } from '@/api/realPoint'

const formRef = ref(null)
const pointList = ref([])
// const totalPage = ref(null)
// const selectedLabel = ref(null)
const selectedOperator = ref(null)
const expressionParts = ref([])
const selectedLabel = ref(null)

const formData = reactive({
  pointLabel: null,
  pointDescription: null,
  calculate: null
})

const validateCalculate = (rule, value, callback) => {
  if (!value) return callback(new Error('计算表达式不能为空'))
  const parts = value.split(' ')

  if (['+', '-', '*', '/'].includes(parts[0])) return callback(new Error('表达式不能以运算符开头'))
  if (['+', '-', '*', '/'].includes(parts[parts.length - 1])) return callback(new Error('表达式不能以运算符结尾'))

  let expectOperator = false
  for (let i = 0; i < parts.length; i++) {
    const isOp = ['+', '-', '*', '/'].includes(parts[i])
    if ((expectOperator && !isOp) || (!expectOperator && isOp)) {
      return callback(new Error('表达式格式错误，请检查运算符位置'))
    }
    expectOperator = !expectOperator
  }
  callback()
}

const rules = {
  pointLabel: [{ required: true, message: '测点标签不能为空', trigger: 'blur' }],
  pointDescription: [{ required: true, message: '测点描述不能为空', trigger: 'blur' }],
  calculate: [
    { required: true, message: '计算表达式不能为空', trigger: 'blur' },
    { validator: validateCalculate, trigger: 'blur' }
  ]
}

const addLabel = () => {
  if (!selectedLabel.value) return ElMessage.warning('请选择测点标签')
  if (expressionParts.value.length % 2 !== 0) return ElMessage.error('需要先添加运算符')

  expressionParts.value.push(selectedLabel.value)
  selectedLabel.value = null
  updateFormCalculate()
}

const addOperator = () => {
  if (!selectedOperator.value) return ElMessage.warning('请选择运算符')
  if (expressionParts.value.length % 2 === 0) return ElMessage.error('需要先添加测点标签')

  expressionParts.value.push(selectedOperator.value)
  selectedOperator.value = null
  updateFormCalculate()
}

const clearExpression = () => {
  expressionParts.value = []
  formData.calculate = ''
}

const updateFormCalculate = () => {
  formData.calculate = expressionParts.value.join(' ')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 构建基础必填字段
    const pointData = {
      pointLabel: formData.pointLabel,
      pointDescription: formData.pointDescription,
      calculate: formData.calculate
    }

    // console.log('提交数据:', pointData);
    const response = await addRealPoint(pointData)
    // console.log('提交数据返回:', response);

    resetAndCloseDialog()
  } catch (error) {
    console.error('提交失败:', error)
  }
}
//初始化
const init = async () => {
  try {
    // const params={
    //     page: 1,
    //     page_size: 10
    // }
    // const responsePoint = await getRealPoint(params);
    // totalPage.value=responsePoint.data.result.total_count;
    const paramsPoint = {
      page: 1,
      // page_size: totalPage.value
      pageSize: 1000
    }
    const responsePointTotal = await getRealPoint(paramsPoint)
    pointList.value = responsePointTotal.data.result.realPointList
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 重置表单并关闭弹窗
const resetAndCloseDialog = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  emit('close-dialog')
}

const emit = defineEmits(['close-dialog'])

// 初始化
onMounted(async () => {
  init()
})

// 点击取消按钮时调用
const closeDialog = () => {
  resetAndCloseDialog()
}
</script>
<template>
  <div class="form-container">
    <h2 class="title">计算测点配置</h2>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20" style="margin-top: 10px">
        <!-- 测点标签 -->
        <el-col :span="8">
          <el-form-item label="测点标签" prop="pointLabel">
            <el-input v-model="formData.pointLabel" placeholder="请输入测点标签" />
          </el-form-item>
        </el-col>

        <!-- 测点描述 -->
        <el-col :span="8">
          <el-form-item label="测点描述" prop="pointDescription">
            <el-input v-model="formData.pointDescription" placeholder="请输入测点描述" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="计算测点配置" prop="calculate">
        <el-row :gutter="20" class="expression-controls">
          <el-col :span="10">
            <el-select
              v-model="selectedLabel"
              placeholder="选择测点标签"
              clearable
              style="--el-input-text-color: white"
            >
              <el-option
                v-for="point in pointList"
                :key="point.pointLabel"
                :label="point.pointLabel"
                :value="point.pointLabel"
              />
            </el-select>
            <el-button type="primary" @click="addLabel">添加标签</el-button>
          </el-col>

          <el-col :span="11">
            <el-select
              v-model="selectedOperator"
              placeholder="选择运算符"
              clearable
              style="--el-input-text-color: white"
            >
              <el-option label="加(+)" value="+" />
              <el-option label="减(-)" value="-" />
              <el-option label="乘(*)" value="*" />
              <el-option label="除(/)" value="/" />
            </el-select>
            <el-button type="primary" @click="addOperator">添加运算符</el-button>
          </el-col>

          <el-col :span="4">
            <el-button type="danger" @click="clearExpression">清空表达式</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <div class="expression-display">
        <span class="expression-text">{{ formData.calculate || '尚未添加表达式' }}</span>
      </div>
      <!-- 底部按钮 -->
      <div class="button-row">
        <el-button type="primary" @click="submitForm">保存并关闭</el-button>
        <el-button type="danger" @click="closeDialog">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}
.form-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px 50px;
  height: 100%;
}
.button-row {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}
.custom-hr {
  height: 1px;
  border: none;
}
.expression-controls {
  margin-bottom: 15px;
}

.expression-display {
  margin-top: 10px;
  margin-left: 120px;
  margin-right: 150px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.expression-text {
  color: #409eff;
  font-weight: 500;
  text-align: center;
}

.el-select {
  margin-right: 10px;
  width: 180px;
}

.el-button {
  margin-top: 5px;
}

.virtual-select {
  .el-select-v2__item {
    height: 40px;
    padding: 0 12px;
    line-height: 40px;
  }

  .el-select-v2__list {
    will-change: transform;
    contain: strict;
  }
}

:deep(.el-select-dropdown) {
  height: 400px !important;
}

:deep(.el-select-dropdown .el-scrollbar) {
  height: 100% !important;
}

:deep(.el-select-dropdown .el-scrollbar__wrap) {
  max-height: 400px !important;
  overflow-y: auto !important;
}

.loading-text {
  padding: 8px;
  text-align: center;
  color: #909399;
  font-size: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
