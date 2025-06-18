<script setup>
import {ref} from 'vue'
import { edit } from '@/api/model'
const props = defineProps({
  modelIds: {
    type: Array,
    required: true
  }
})
const modelName = ref(null)
const alertInterval = ref(null)
const alertWindowSize = ref(null)
const paramEntries = ref([])
const customParams = ref(false)

// 添加新的参数行
const addParamEntry = () => {
  paramEntries.value.push({ key: '', value: '' })
}

// 删除指定的参数行
const removeParamEntry = (index) => {
  paramEntries.value.splice(index, 1)
}

const confirm = async () => {
  try {
    // 参数处理逻辑（自动过滤空key）
    const paramsJson = paramEntries.value.reduce((acc, param) => {
      const trimmedKey = param.key.trim()
      if (trimmedKey) {
        acc[trimmedKey] = param.value
      }
      return acc
    }, {})

    // 构建请求数据
    const requestData = {
      modelIds: props.modelIds
    }
    
    // 仅当有值时添加字段
    if (modelName.value) requestData.modelName = modelName.value
    if (alertInterval.value) requestData.alertInterval = parseInt(alertInterval.value)
    if (alertWindowSize.value) requestData.alertWindowSize = parseInt(alertWindowSize.value)
    
    // 仅当paramsJson有有效内容时添加（重要修改点）
    if (Object.keys(paramsJson).length > 0) {
      requestData.params = paramsJson
    }
    console.log("edit参数", requestData)
    const response = await edit(requestData)
    console.log("edit返回", response)
    closeDialog()
  } catch (error) {
    console.error("保存失败:", error)
  }
}

const emit = defineEmits(['close-dialog', 'refresh-model-data'])
const closeDialog = () => {
  emit('refresh-model-data')
  emit('close-dialog')
}
</script>
<template>
  <div class="model-config-container">
    <h2 class="title">模型编辑</h2>
    <span style="margin: 10px;">已选择 <span style="color: red;font-size: 18px;">{{props.modelIds.length}}</span> 个模型</span>
    <!-- 基本信息配置 -->
    <div class="basic-info">
      <el-form label-width="120px">
        <el-row :gutter="20">
          <!-- 模型名称 -->
          <el-col :span="6">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="modelName" placeholder="请输入模型名称"></el-input>
            </el-form-item>
          </el-col>    
          <!-- 预警间隔 -->
          <el-col :span="6">
            <el-form-item label="预警间隔" prop="alertInterval">
              <el-input v-model="alertInterval" placeholder="请输入预警间隔">
                <template #append> s/次 </template>
              </el-input>
            </el-form-item>
          </el-col>
          <!-- 预警窗口大小 -->
          <el-col :span="6">
            <el-form-item label="预警窗口大小" prop="modelVersion">
              <el-input v-model="alertWindowSize" placeholder="请输入预警窗口大小"></el-input>
            </el-form-item>
          </el-col>  
          <!-- 自定义参数复选框 -->
          <el-col :span="6">
            <el-form-item label="是否自定义参数">
              <el-checkbox v-model="customParams"></el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 参数设置 -->
        <el-row v-if="customParams" :gutter="20">
          <el-col :span="8">
            <!-- 添加参数按钮，固定在参数设置的下方 -->
            <el-button type="primary" @click="addParamEntry" class="add-param-btn">添加参数</el-button>
            <!-- 参数设置部分 -->
            <div class="param-entries-container">
              <div v-for="(param, index) in paramEntries" :key="index" class="param-entry-row">
                <el-input 
                  v-model="param.key" 
                  placeholder="参数名称" 
                  class="param-key"
                  :rules="[{ required: true, message: '请输入参数名称' }]"
                ></el-input>
                <el-input 
                  v-model="param.value" 
                  placeholder="参数值" 
                  class="param-value"
                ></el-input>
                <el-button type="danger" @click="removeParamEntry(index)"> 删除 </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
        
      <div class="button-row">        
        <el-button @click="confirm" type="primary">
          确定
        </el-button>
        <el-button type="danger" @click="closeDialog">
          关闭
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected-turbines {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-turbines .el-tag {
  font-size: 14px;
  background-color: #f0f9eb;
  color: #4caf50;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 5px 15px;
  transition: all 0.3s ease;
}

.param-entries-container {
  max-height: 120px; /* 限制高度，显示两组参数的高度 */
  overflow-y: auto; /* 当内容超出高度时，显示滚动条 */
  border: 1px solid #dcdcdc;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  margin-left: 30px;
}
.param-entry-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
.param-key,
.param-value {
  width: 40%;
}
.add-param-btn {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 30px;
}
.model-config-container {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.basic-info {
  padding: 20px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background-color: transparent !important;
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中对齐按钮 */
  gap: 10px; /* 按钮之间的间距 */
}

:deep(.el-form-item__label) {
  color: white !important;
}

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
.button-row {
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中对齐按钮 */
  gap: 10px; /* 按钮之间的间距 */
}
</style>
