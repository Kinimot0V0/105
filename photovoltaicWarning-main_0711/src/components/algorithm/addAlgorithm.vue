<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addAlgorithm, getModuleList } from '@/api/algorithm'

const formRef = ref(null)
const moduleList = ref([])
const trainFile = ref(null)
const predictFile = ref(null)

const formData = reactive({
  algorithmName: null,
  moduleId: null,
  trainFile: null,
  predictFile: null
})

const rules = {
  algorithmName: [
    { required: true, message: '算法名称不能为空', trigger: 'blur' }
  ],
  trainFile: [
    { required: true, message: '训练文件不能为空', trigger: 'change' }
  ],
  predictFile: [
    { required: true, message: '预测文件不能为空', trigger: 'change' }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 构建表单数据
    const algorithmData = new FormData();
    algorithmData.append('algorithmName', formData.algorithmName);

    // moduleId不是必填项，只有在有值时才添加
    if (formData.moduleId) {
      algorithmData.append('moduleId', formData.moduleId);
    }

    algorithmData.append('trainFile', trainFile.value);
    algorithmData.append('predictFile', predictFile.value);

    const response = await addAlgorithm(algorithmData);

    ElMessage.success('算法添加成功');
    resetAndCloseDialog();
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('算法添加失败: ' + (error.message || '未知错误'));
  }
};

// 获取模块列表
const initModule = async () => {
  try {
    const response = await getModuleList()
    moduleList.value = response.data.result
  } catch (error) {
    console.error('获取模块数据失败:', error)
    ElMessage.error('获取模块数据失败')
  }
}

// 重置表单并关闭弹窗
const resetAndCloseDialog = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  trainFile.value = null
  predictFile.value = null
  emit('close-dialog')
}

const emit = defineEmits(['close-dialog'])

// 初始化
onMounted(async () => {
  await initModule()
})

// 点击取消按钮时调用
const closeDialog = () => {
  resetAndCloseDialog()
}

// 文件选择处理
const handleTrainFileChange = (file) => {
  trainFile.value = file
  formData.trainFile = file
  return false // 阻止默认上传行为
}

const handlePredictFileChange = (file) => {
  predictFile.value = file
  formData.predictFile = file
  return false // 阻止默认上传行为
}
</script>

<template>
  <div class="form-container">
    <h2 class="title">算法配置</h2>
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        enctype="multipart/form-data"
    >
      <el-row :gutter="20" style="margin-top: 10px">
        <!-- 算法名称 -->
        <el-col :span="12">
          <el-form-item label="算法名称" prop="algorithmName">
            <el-input
                v-model="formData.algorithmName"
                placeholder="请输入算法名称"
            />
          </el-form-item>
        </el-col>

        <!-- 模块 -->
        <el-col :span="12">
          <el-form-item label="模块" prop="moduleId">
            <el-select
                v-model="formData.moduleId"
                placeholder="请选择模块"
                clearable              style="--el-input-text-color: white"
            >
              <el-option
                  v-for="module in moduleList"
                  :key="module.moduleId"
                  :label="module.moduleName"
                  :value="module.moduleId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 10px">
        <!-- 训练文件 -->
        <el-col :span="12">
          <el-form-item label="训练文件" prop="trainFile">
            <el-upload
                class="upload-demo"
                action=""
                :auto-upload="false"
                :on-change="handleTrainFileChange"
                :file-list="[]"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
          </el-form-item>
        </el-col>

        <!-- 预测文件 -->
        <el-col :span="12">
          <el-form-item label="预测文件" prop="predictFile">
            <el-upload
                class="upload-demo"
                action=""
                :auto-upload="false"
                :on-change="handlePredictFileChange"
                :file-list="[]"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
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
  color: white;
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
  margin-top: 30px;
}

:deep(.el-upload-list) {
  display: none;
}

/* 表单标签颜色 */
:deep(.el-form-item__label) {
  color: white !important;
}

/* 下拉选择框样式 */
:deep(.el-select__wrapper) {
  background-color: transparent !important;
  color: white;
}

:deep(.el-select-dropdown) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: white;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  background-color: transparent !important;
}

:deep(.el-input__inner) {
  background-color: transparent !important;
  color: white !important;
}

:deep(.el-input) {
  --el-input-bg-color: transparent !important;
  --el-input-text-color: white !important;
}
</style>