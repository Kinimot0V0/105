<script setup>
import { ref, reactive } from 'vue'
import { addStandPoint } from '@/api/standardMeasurePoint'

const formRef = ref(null)
const moduleList = ref([])
// 使用 reactive 组织表单字段
const formData = reactive({
  pointLabel: null,
  pointDescription: null
})

// 表单规则
const rules = {
  pointLabel: [{ required: true, message: '测点标签不能为空', trigger: 'blur' }]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 构建基础必填字段
    const pointData = {
      pointLabel: formData.pointLabel
    }

    // 可选字段处理
    if (formData.pointDescription) {
      pointData.pointDescription = formData.pointDescription;
    }

    // console.log('提交数据:', pointData);
    const response = await addStandPoint(pointData);
    // console.log('提交数据返回:', response);
    
    resetAndCloseDialog();
  } catch (error) {
    console.error('提交失败:', error);
  }
};
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
    <h2 class="title">标准测点配置</h2>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20" style="margin-top: 10px">
        <!-- 测点标签 -->
        <el-col :span="8">
          <el-form-item label="标准测点标签" prop="pointLabel">
            <el-input v-model="formData.pointLabel" placeholder="请输入标准测点标签" />
          </el-form-item>
        </el-col>

        <!-- 测点描述 -->
        <el-col :span="8">
          <el-form-item label="标准测点描述" prop="pointDescription">
            <el-input v-model="formData.pointDescription" placeholder="请输入标准测点描述" />
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
