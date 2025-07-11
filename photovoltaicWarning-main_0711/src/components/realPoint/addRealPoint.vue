<script setup>
import { ref, reactive } from 'vue'
import { addRealPoint } from '@/api/realPoint'

const formRef = ref(null)
// 使用 reactive 组织表单字段
const formData = reactive({
  pointLabel: null,
  pointDescription: null,
  pointUnit: null,
  pointType: '', // 初始空字符串
  deviceId: '' // 初始空字符串
})
// 表单规则
const rules = {
  pointLabel: [{ required: true, message: '测点标签不能为空', trigger: 'blur' }],
  pointType: [
    {
      validator: (rule, value, callback) => {
        if (value === null || value === '') {
          callback() // 允许为空
        } else {
          const num = Number(value)
          if (isNaN(num) || !Number.isInteger(num)) {
            callback(new Error('测点类型必须为整数'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  deviceId: [
    {
      validator: (rule, value, callback) => {
        if (value === null || value === '') {
          callback()
        } else {
          const num = Number(value)
          if (isNaN(num) || !Number.isInteger(num)) {
            callback(new Error('设备ID必须为整数'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 构建基础必填字段
    const pointData = {
      pointLabel: formData.pointLabel
    }

    // 可选字段处理
    if (formData.pointDescription) {
      pointData.pointDescription = formData.pointDescription
    }
    if (formData.pointUnit) {
      pointData.pointUnit = formData.pointUnit
    }

    // 处理整数类型字段
    const pointTypeValue = parseInt(formData.pointType)
    if (!isNaN(pointTypeValue)) {
      pointData.pointType = pointTypeValue
    }

    const deviceIdValue = parseInt(formData.deviceId)
    if (!isNaN(deviceIdValue)) {
      pointData.deviceId = deviceIdValue
    }

    // console.log('提交数据:', pointData);
    const response = await addRealPoint(pointData)
    // console.log('提交数据返回:', response);

    resetAndCloseDialog()
  } catch (error) {
    console.error('提交失败:', error)
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

// 点击取消按钮时调用
const closeDialog = () => {
  resetAndCloseDialog()
}
</script>
<template>
  <div class="form-container">
    <h2 class="title">测点配置</h2>
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

      <el-row :gutter="20" style="margin-top: 10px">
        <!-- 测点单位 -->
        <el-col :span="8">
          <el-form-item label="测点单位" prop="pointUnit">
            <el-input v-model="formData.pointUnit" placeholder="请输入测点单位" />
          </el-form-item>
        </el-col>

        <!-- 测点类型 -->
        <el-col :span="8">
          <el-form-item label="测点类型" prop="pointType">
            <!-- 测点类型 -->
            <el-input
              v-model="formData.pointType"
              placeholder="请输入测点类型(整数)"
              @input="formData.pointType = ($event || '').toString().replace(/[^\d]/g, '')"
            />
          </el-form-item>
        </el-col>

        <!-- 设备 -->
        <el-col :span="8">
          <el-form-item label="设备ID" prop="deviceId">
            <el-input
              v-model="formData.deviceId"
              placeholder="请输入设备ID(整数)"
              @input="formData.deviceId = ($event || '').toString().replace(/[^\d]/g, '')"
            />
          </el-form-item>
        </el-col>
      </el-row>

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
</style>
