<script setup>
import { reactive, watch, ref, onMounted } from 'vue'
import { getPvFarmList,getAlg,getInverterList,getModuleList } from '@/api/model'
// 从父组件传递的 props 数据
const props = defineProps({
  stepData: Object,
  providedData: Object
})

// 创建 props 的本地副本
const localData = reactive({ ...props.stepData })

// 初始化参数数组，初始值来自 localData.params
const paramEntries = ref(Object.entries(localData.params).map(([key, value]) => ({ key, value })))

// 将 paramEntries 转换为 JSON 对象并存储到 localData.params
watch(
  paramEntries,
  (newEntries) => {
    localData.params = newEntries.reduce((acc, entry) => {
      if (entry.key) acc[entry.key] = entry.value
      return acc
    }, {})
  },
  { deep: true }
)

// 添加新的参数行
const addParamEntry = () => {
  paramEntries.value.push({ key: '', value: '' })
}

// 删除指定的参数行
const removeParamEntry = (index) => {
  paramEntries.value.splice(index, 1)
}

// 用于向父组件传递数据和验证结果
const emit = defineEmits(['updateStepData', 'validateStep'])

// 表单引用
const stepForm = ref(null)


const validateInteger = (rule, value, callback) => {
  const intRegex = /^[0-9]+$/
  if (!value) {
    return callback(new Error('该字段不能为空'))
  }
  if (!intRegex.test(value)) {
    return callback(new Error('必须输入整数'))
  }
  callback()
}

// 验证规则
const rules = {
  modelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
  inverterList: [{ required: true, type: 'array', min: 1, message: '至少选择一个逆变器', trigger: 'change' }],
  alertInterval: [{ required: true, validator: validateInteger, message: '预警间隔必须是整数', trigger: 'blur' }],
  alertPvowSize: [
    { required: true, validator: validateInteger, message: '预警窗口大小必须是整数', trigger: 'blur' }
  ],
  moduleID: [{ required: true, message: '请选择模块', trigger: 'change' }],
  algorithmId: [{ required: true, message: '请选择算法详情', trigger: 'change' }]
}

const validateStep = () => {
  return new Promise((resolve) => {
    stepForm.value.validate((valid) => {
      emit('validateStep', valid)
      resolve(valid)
    })
  })
}

const pvFarmList = ref([])
const pv_inverter = ref([])
const inverterList = ref([]) // 当前选择的场站对应的逆变器列表
const moduleList = ref([])
const algorithmList = ref([])

const onPvFarmChange = (selectedFarmId) => {
  inverterList.value = pv_inverter.value.filter((inverter) => inverter.pvFarmId === selectedFarmId)
}

const onInverterSelect = (selectedInverterId) => {
  const selectedInverter = inverterList.value.find((inverter) => inverter.inverterId === selectedInverterId)

  if (selectedInverter && !localData.inverterList.some((t) => t.inverterId === selectedInverter.inverterId)) {
    // 如果逆变器对象存在且不在已选逆变器列表中，则添加到 localData.inverterList
    localData.inverterList.push(selectedInverter)
  }
}

// 删除已选择的逆变器
const removeInverter = (inverterId) => {
  // 直接从 localData.inverterList 中删除指定的逆变器
  localData.inverterList = localData.inverterList.filter((inverter) => inverter.inverterId !== inverterId)
}

// 当本地副本变化时，通知父组件
watch(
  () => localData,
  (newData) => {
    emit('updateStepData', newData)
  },
  { deep: true }
)

// 暴露验证方法给父组件
defineExpose({
  validateStep
})

//初始化场站
const initPvFarm = async () => {
  try {
    const response = await getPvFarmList()
    pvFarmList.value = response.data.result
    return response
  } catch (error) {
    console.error('获取场站数据失败:', error)
  }
}
//初始化逆变器
const initInverter = async () => {
  try {
    const response = await getInverterList()
    
    // 添加组合名称逻辑
    pv_inverter.value = response.data.result.map(inverter => {
      const matchedFarm = pvFarmList.value.find(
        farm => farm.pvFarmId === inverter.pvFarmId
      )
      return {
        ...inverter,
        combinedName: matchedFarm 
          ? `${matchedFarm.pvFarmName}${inverter.inverterName}`
          : inverter.inverterName
      }
    })
    
    return response
  } catch (error) {
    console.error('获取逆变器数据失败:', error)
  }
}
//初始化模块
const initModule = async () => {
  try {
    const response = await getModuleList()
    moduleList.value = response.data.result
    return response
  } catch (error) {
    console.error('获取模块数据失败:', error)
  }
}
//初始化算法
const initAlg= async () => {
  try {
    const response = await getAlg()
    algorithmList.value = response.data.result
    return response
  } catch (error) {
    console.error('获取算法数据失败:', error)
  }
}

// 初始化
onMounted(async () => {
  await initPvFarm()
  await initInverter()
  await initModule()
  await initAlg()
})
</script>
<template>
  <div class="model-config-container">
    <h2 class="title">① 基本信息配置</h2>

    <!-- 基本信息配置 -->
    <div class="basic-info">
      <el-form :model="localData" :rules="rules" ref="stepForm" label-width="120px">
        <el-row :gutter="20">

          <!-- 模型名称 -->
          <el-col :span="8">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="localData.modelName" placeholder="请输入模型名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="场站">
              <el-select
                v-model="localData.pvFarmId"
                @change="onPvFarmChange"
                placeholder="请选择场站"
                style="--el-input-text-color: white"
              >
                <el-option
                  v-for="farm in pvFarmList"
                  :key="farm.pvFarmId"
                  :label="farm.pvFarmName"
                  :value="farm.pvFarmId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="逆变器">
              <el-select
                v-model="localData.inverterId"
                placeholder="请选择逆变器"
                @change="onInverterSelect"
                style="--el-input-text-color: white"
              >
                <el-option
                  v-for="inverter in inverterList"
                  :key="inverter.inverterId"
                  :label="inverter.combinedName"
                  :value="inverter.inverterId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 已选择逆变器 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="已选择逆变器" prop="inverterList">
              <div class="selected-inverters">
                <el-tag
                  v-for="inverter in localData.inverterList"
                  :key="inverter.inverterId"
                  closable
                  @close="removeInverter(inverter.inverterId)"
                >
                  {{ inverter.combinedName }}
                </el-tag>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <!-- 模块 -->
          <el-col :span="6">
            <el-form-item label="模块" prop="moduleID">
              <el-select
                v-model="localData.moduleID"
                placeholder="请选择模块"
                value-key="moduleId"
                style="--el-input-text-color: white"
              >
                <el-option
                  v-for="modulelist in moduleList"
                  :key="modulelist.moduleId"
                  :label="modulelist.moduleName"
                  :value="modulelist.moduleId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 算法详情 -->
          <el-col :span="6">
            <el-form-item label="算法详情" prop="algorithmId">
              <el-select
                v-model="localData.algorithmId"
                placeholder="请选择算法"
                value-key="algorithmId"
                style="--el-input-text-color: white"
              >
                <el-option
                  v-for="algorithm in algorithmList"
                  :key="algorithm.algorithmId"
                  :label="algorithm.algorithmName"
                  :value="algorithm.algorithmId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 预警间隔 -->
          <el-col :span="6">
            <el-form-item label="预警间隔" prop="alertInterval">
              <el-input v-model="localData.alertInterval" placeholder="请输入预警间隔（整数）">
                <template #append> s/次 </template>
              </el-input>
            </el-form-item>
          </el-col>

          <!-- 预警数据长度 -->
          <el-col :span="6">
            <el-form-item label="预警窗口大小" prop="alertPvowSize">
              <el-input v-model="localData.alertPvowSize" placeholder="请输入预警窗口大小（整数）">
                <template #append> s/次 </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 自定义参数复选框 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="是否自定义参数">
              <el-checkbox v-model="localData.customParams"></el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 参数设置 -->
        <el-row v-if="localData.customParams" :gutter="20">
          <el-col :span="8">
            <!-- 添加参数按钮，固定在参数设置的下方 -->
            <el-button type="primary" @click="addParamEntry" class="add-param-btn">添加参数</el-button>
            <!-- 参数设置部分 -->
            <div class="param-entries-container">
              <div v-for="(param, index) in paramEntries" :key="index" class="param-entry-row">
                <el-input v-model="param.key" placeholder="参数名称" class="param-key"></el-input>
                <el-input v-model="param.value" placeholder="参数值" class="param-value"></el-input>
                <el-button type="danger" @click="removeParamEntry(index)"> 删除 </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.selected-inverters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-inverters .el-tag {
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
</style>
