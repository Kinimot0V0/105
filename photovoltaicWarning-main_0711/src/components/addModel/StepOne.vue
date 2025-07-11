<script setup>
import { reactive, watch, ref, onMounted } from 'vue'
import { getPvFarmList, getDevice } from '@/api/overview'
import { getAlg } from '@/api/model'

const companyId = ref(Number(sessionStorage.getItem('companyId')) || null)
const props = defineProps({
  stepData: Object,
  providedData: Object
})

const localData = reactive({ ...props.stepData })

// 设备层级状态（使用内部状态管理）
const boxId = ref('')
const inverterId = ref('')
const combinerId = ref('')

// 设备类型选项
const deviceTypes = ref([
  { label: '逆变器模型', value: 2 },
  { label: '汇流箱模型', value: 1 }
])

// 建模方式选项
const modelTypes = ref([
  { label: '全部建模', value: 1 },
  { label: '单独建模', value: 0 }
])

// 设备列表
const pvFarmList = ref([])
const boxList = ref([])
const inverterList = ref([])
const combinerList = ref([])

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
  deviceList: [{ required: true, type: 'array', min: 1, message: '至少选择一个设备', trigger: 'change' }],
  alertInterval: [{ required: true, validator: validateInteger, message: '预警间隔必须是整数', trigger: 'blur' }],
  alertWindowSize: [{ required: true, validator: validateInteger, message: '预警窗口大小必须是整数', trigger: 'blur' }],
  algorithmId: [{ required: true, message: '请选择算法详情', trigger: 'change' }],
  pvFarmId: [{ required: true, message: '请选择场站', trigger: 'change' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  isAll: [{ required: true, message: '请选择建模方式', trigger: 'change' }]
}

const validateStep = () => {
  return new Promise((resolve) => {
    stepForm.value.validate((valid) => {
      emit('validateStep', valid)
      resolve(valid)
    })
  })
}

// 算法列表
const algorithmList = ref([])

/* ========= 设备层级获取 ========= */
const getPvFarm = async () => {
  try {
    const params = { companyId: companyId.value }
    const { data } = await getPvFarmList(params)
    pvFarmList.value = data.result || []

    // 恢复之前选择的场站（如果存在）
    if (localData.pvFarmId) {
      onPvFarmChange(localData.pvFarmId)
    }
  } catch (e) {
    console.error('获取场站失败', e)
  }
}

// 处理场站变更
const onPvFarmChange = (selectedPvFarmId) => {
  localData.pvFarmId = selectedPvFarmId
  resetDeviceHierarchy()
  if (selectedPvFarmId) {
    getDeviceHierarchy()
  }
}

// 获取设备层级
const getDeviceHierarchy = async () => {
  if (!localData.pvFarmId) return

  try {
    const { data } = await getDevice({ pvFarmId: localData.pvFarmId })
    const tree = data.result || []
    boxList.value = tree.map((t) => ({
      boxId: t.boxTrans.id,
      boxName: t.boxTrans.boxName,
      inverters: t.innerDeviceInfoList || []
    }))

    // 尝试恢复之前选择的设备
    if (localData.deviceList.length > 0) {
      restoreSelectedDevices()
    }
  } catch (e) {
    console.error('获取设备树失败', e)
  }
}

// 重置设备层级
const resetDeviceHierarchy = () => {
  boxId.value = ''
  inverterId.value = ''
  combinerId.value = ''
  boxList.value = []
  inverterList.value = []
  combinerList.value = []
}

// 箱变变化监听
watch(boxId, (val) => {
  const box = boxList.value.find((b) => b.boxId === val)
  inverterList.value = val
    ? box?.inverters.map((it) => ({
        inverterId: it.inverter.id,
        inverterName: it.inverter.inverterName,
        combinerBoxList: it.combinerBoxList || []
      }))
    : []
  inverterId.value = ''
  combinerList.value = []
  combinerId.value = ''
})

// 逆变器变化监听
watch(inverterId, (val) => {
  const inv = inverterList.value.find((i) => i.inverterId === val)
  combinerList.value = val
    ? (inv?.combinerBoxList || []).map((c) => ({
        combinerId: c.id,
        combinerName: c.combinerBoxName
      }))
    : []
  combinerId.value = ''
})

// 尝试恢复之前选择的设备
const restoreSelectedDevices = () => {
  // 简单实现：根据设备类型预选第一级设备
  if (boxList.value.length > 0 && localData.deviceType === 2) {
    boxId.value = boxList.value[0].boxId
  }
}

// 添加当前选中设备
const addCurrentDevice = () => {
  let selectedDevice = null
  let deviceName = ''

  // 根据设备类型确定选中的设备
  if (localData.deviceType === 1 && combinerId.value) {
    const combiner = combinerList.value.find((c) => c.combinerId === combinerId.value)
    deviceName = combiner ? combiner.combinerName : '未知汇流箱'

    selectedDevice = {
      deviceId: combinerId.value,
      deviceName: deviceName,
      deviceType: 1 // 记录设备类型
    }

    // 重置当前汇流箱选择
    combinerId.value = ''
  } else if (localData.deviceType === 2 && inverterId.value) {
    const inverter = inverterList.value.find((i) => i.inverterId === inverterId.value)
    deviceName = inverter ? inverter.inverterName : '未知逆变器'

    selectedDevice = {
      deviceId: inverterId.value,
      deviceName: deviceName,
      deviceType: 2 // 记录设备类型
    }

    // 重置当前逆变器选择
    inverterId.value = ''
  }

  if (selectedDevice && !localData.deviceList.some((d) => d.deviceId === selectedDevice.deviceId)) {
    localData.deviceList.push(selectedDevice)
  }
}

// 删除已选设备
const removeDevice = (deviceId) => {
  localData.deviceList = localData.deviceList.filter((device) => device.deviceId !== deviceId)
}

//初始化算法
const initAlg = async () => {
  try {
    const response = await getAlg()
    algorithmList.value = response.data.result
    return response
  } catch (error) {
    console.error('获取算法数据失败:', error)
  }
}

// 当本地副本变化时，通知父组件
watch(
  () => localData,
  (newData) => {
    emit('updateStepData', newData)
  },
  { deep: true }
)

// 初始化
onMounted(async () => {
  await initAlg()
  await getPvFarm() // 最后调用以确保可以恢复场站
})

// 暴露验证方法给父组件
defineExpose({
  validateStep
})
</script>

<template>
  <div class="model-config-container">
    <h2 class="title">① 基本信息配置</h2>

    <!-- 基本信息配置 -->
    <div class="basic-info">
      <el-form :model="localData" :rules="rules" ref="stepForm" label-width="120px">
        <!-- 模型名称 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="localData.modelName" placeholder="请输入模型名称"></el-input>
            </el-form-item>
          </el-col>

          <!-- 场站选择 -->
          <el-col :span="8">
            <el-form-item label="场站" prop="pvFarmId">
              <el-select
                v-model="localData.pvFarmId"
                placeholder="请选择场站"
                @change="onPvFarmChange"
                style="--el-input-text-color: white"
              >
                <el-option
                  v-for="farm in pvFarmList"
                  :key="farm.id"
                  :label="farm.pvFarmName"
                  :value="farm.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="设备类型" prop="deviceType">
              <el-radio-group v-model="localData.deviceType">
                <el-radio v-for="type in deviceTypes" :key="type.value" :label="type.value">
                  {{ type.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 设备类型选择 -->
        <el-row :gutter="20">
          <!-- 建模方式 -->
          <el-col :span="8">
            <el-form-item label="建模方式" prop="isAll">
              <el-radio-group v-model="localData.isAll">
                <el-radio v-for="type in modelTypes" :key="type.value" :label="type.value">
                  {{ type.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 单独建模设备选择 -->
        <el-row v-if="localData.isAll === 0 && pvFarmList.length > 0" :gutter="20">
          <!-- 箱变选择 -->
          <el-col :span="6">
            <el-form-item label="箱变">
              <el-select
                v-model="boxId"
                placeholder="请选择箱变"
                style="--el-input-text-color: white"
                :disabled="boxList.length === 0"
              >
                <el-option
                  v-for="box in boxList"
                  :key="box.boxId"
                  :label="box.boxName"
                  :value="box.boxId"
                /> </el-select
            ></el-form-item>
          </el-col>

          <!-- 逆变器选择 -->
          <el-col :span="6">
            <el-form-item label="逆变器">
              <el-select
                v-model="inverterId"
                placeholder="请选择逆变器"
                style="--el-input-text-color: white"
                :disabled="!boxId || inverterList.length === 0"
              >
                <el-option
                  v-for="inverter in inverterList"
                  :key="inverter.inverterId"
                  :label="inverter.inverterName"
                  :value="inverter.inverterId"
                /> </el-select
            ></el-form-item>
          </el-col>

          <!-- 汇流箱选择 (仅当设备类型为汇流箱时显示) -->
          <el-col v-if="localData.deviceType === 1" :span="6">
            <el-form-item label="汇流箱">
              <el-select
                v-model="combinerId"
                placeholder="请选择汇流箱"
                style="--el-input-text-color: white"
                :disabled="!inverterId || combinerList.length === 0"
              >
                <el-option
                  v-for="combiner in combinerList"
                  :key="combiner.combinerId"
                  :label="combiner.combinerName"
                  :value="combiner.combinerId"
                /> </el-select
            ></el-form-item>
          </el-col>

          <!-- 添加设备按钮 -->
          <el-col :span="6">
            <el-button
              type="primary"
              @click="addCurrentDevice"
              :disabled="(localData.deviceType === 1 && !combinerId) || (localData.deviceType === 2 && !inverterId)"
            >
              添加设备
            </el-button>
          </el-col>
        </el-row>

        <!-- 已选择设备 -->
        <el-row v-if="localData.deviceList.length > 0" :gutter="20">
          <el-col :span="24">
            <el-form-item label="已选择设备" prop="deviceList">
              <div class="selected-devices">
                <el-tag
                  v-for="device in localData.deviceList"
                  :key="device.deviceId"
                  closable
                  @close="removeDevice(device.deviceId)"
                  class="device-tag"
                  :type="device.deviceType === 2 ? 'success' : 'warning'"
                >
                  {{ device.deviceName }}
                </el-tag>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 算法详情 -->
          <el-col :span="6">
            <el-form-item label="算法详情" prop="algorithmId">
              <el-select v-model="localData.algorithmId" placeholder="请选择算法" style="--el-input-text-color: white">
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
            <el-form-item label="预警窗口大小" prop="alertWindowSize">
              <el-input v-model="localData.alertWindowSize" placeholder="请输入预警窗口大小（整数）">
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
.selected-devices {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.device-tag {
  margin: 5px;
  font-size: 14px;
  padding: 5px 15px;
  border-radius: 20px;
}

.param-entries-container {
  max-height: 120px;
  overflow-y: auto;
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

:deep(.el-radio) {
  color: white;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: white !important;
}
</style>
