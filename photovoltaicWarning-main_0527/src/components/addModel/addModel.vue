<script setup>
import { ref, reactive, computed, watch } from 'vue'
import StepOne from '@/components/addModel/StepOne.vue'
import StepTwo from '@/components/addModel/StepTwo.vue'
// import StepThree from '@/components/addModel/StepThree.vue'
// import StepFour from '@/components/addModel/StepFour.vue'
// import StepFive from '@/components/addModel/StepFive.vue'
import { addModel, train, getPoint } from '@/api/model'

// 定义初始数据，用于在取消时复位
const stepData = reactive({
  0: {
    modelName: '',
    inverterList: [],
    alertInterval: 60,
    moduleID: '',
    algorithmId: '',
    params: {},
    customParams: false,
    pvFarmId: '',
    inverterId: '',
    alertPvowSize: 10
  },
  1: {
    unselectedData: [],
    selectedData: []
  },
  2: {
    conditions: [
      {
        id: Date.now(),
        name: '',
        infer: true,
        status: false,
        color: '#FF0000',
        duration: '',
        selected: false,
        measurePoints: []
      }
    ]
  },
  3: {
    sample: []
  }
})

watch(
  () => stepData[0].algorithmId,
  async (newAlgorithmId) => {
    if (newAlgorithmId) {
      try {
        // 调用 getPoint 接口获取测点列表
        const response = await getPoint(newAlgorithmId)

        // 将返回的测点列表赋值给 unselectedData
        stepData[1].unselectedData = response.data.result || []

        // 清空已选择的数据
        stepData[1].selectedData = []
      } catch (error) {
        console.error('获取测点列表失败:', error)
        // 可以添加错误处理，比如显示错误提示
        stepData[1].unselectedData = []
        stepData[1].selectedData = []
      }
    } else {
      // 如果没有选择算法，则 unselectedData 为空
      stepData[1].unselectedData = []
      stepData[1].selectedData = []
    }
  }
)

// 当前步骤
const currentStep = ref(0)
// const stepComponents = [StepOne, StepTwo, StepThree, StepFour, StepFive]
const stepComponents = [StepOne, StepTwo]
const totalSteps = stepComponents.length

// 根据当前步骤加载组件
const currentStepComponent = computed(() => stepComponents[currentStep.value])

// 更新步骤数据
const updateStepData = (newData) => {
  if (currentStep.value === 0) {
    stepData[currentStep.value] = newData
  } else if (currentStep.value === 1) {
    stepData[1].selectedData = newData.selectedData
    stepData[1].unselectedData = newData.unselectedData
  } else if (currentStep.value === 2) {
    stepData[currentStep.value].conditions = newData
  } else if (currentStep.value === 3) {
    stepData[currentStep.value].sample = newData
  }
}

// 处理表单验证结果
const validationResult = ref(false)

const handleValidation = (valid) => {
  validationResult.value = valid
}

// 切换到下一步
const nextStep = async () => {
  if (currentStep.value === 0) {
    const stepComponent = stepComponentRef.value
    if (stepComponent) {
      const isValid = await stepComponent.validateStep()
      if (isValid) {
        currentStep.value++
        // console.log('Step1数据', stepData[0])
      }
    }
  } else if (currentStep.value === 1) {
    if (stepData[1].selectedData.length > 0) {
      currentStep.value++
      // console.log('Step2数据', stepData[1])
    }
  } else if (currentStep.value === 2) {
    if (stepData[2].conditions[0].measurePoints.length > 0) {
      currentStep.value++
      // console.log('Step3数据', stepData[2])
    }
  } else if (currentStep.value === 3) {
    if (stepData[3].sample.length > 0) {
      currentStep.value++
      // console.log('Step4数据', stepData[3])
    }
  }
}

//跳过
const skip = async () => {
  if (currentStep.value === 2) {
    currentStep.value++
  }
}

// 切换到上一步
const prevStep = () => {
  currentStep.value--
}

// 保存并退出
const submitForm = async () => {
  const modelData = {
    model: {
      modelName: stepData[0].modelName,
      moduleID: parseInt(stepData[0].moduleID), 
      patternId: 1,
      algorithmId: parseInt(stepData[0].algorithmId),
      alertInterval: parseInt(stepData[0].alertInterval),
      alertPvowSize: parseInt(stepData[0].alertPvowSize),
      params: Object.fromEntries(Object.entries(stepData[0].params).map(([key, value]) => [key, parseInt(value, 10)]))
    },
    inverterList: stepData[0].inverterList.map((inverter) => inverter.inverterId),
    pointList: stepData[1].selectedData.map((item) => item.pointLabel)
  }
  // console.log('模型信息', modelData)
  try {
    const response = await addModel(modelData)
    // console.log('Form submitted successfully!')
    // console.log('接口返回的数据:', response.data)
    currentStep.value = 0
    // 通过事件通知父组件关闭弹窗
    emit('refresh-model-data')
    emit('close-dialog')
  } catch (error) {
    console.error('Failed to submit form:', error)
  }
}

// 开始训练
const beginTrain = async () => {
  const modelData = {
    model: {
      modelName: stepData[0].modelName,
      algorithmId: parseInt(stepData[0].algorithmId),
      alertInterval: parseInt(stepData[0].alertInterval),
      params: Object.fromEntries(Object.entries(stepData[0].params).map(([key, value]) => [key, parseInt(value, 10)]))
    },
    inverterList: stepData[0].inverterList.map((inverter) => inverter.inverterId),
    pointList: stepData[1].selectedData.map((item) => item.code)
  }
  // console.log('模型信息', modelData)
  try {
    const response = await addModel(modelData)
    // console.log('Form submitted successfully!')
    // console.log('addModel接口返回的数据:', response.data)

    // 从 addModel 的响应中提取模型 ID 列表
    const modelIds = response.data.result.map((model) => model.modelId)

    // 定义时间段数据
    const timePeriods = stepData[3].sample.map((item) => ({
      startTime: item.startTime,
      endTime: item.endTime
    }))

    // 构造 trainData 对象
    const trainData = {
      modelIds: modelIds,
      timePeriods: timePeriods
    }

    // 调用 train 接口
    const responseTrain = await train(trainData)
    // console.log('train接口返回的数据:', responseTrain.data)

    currentStep.value = 0
    // 通过事件通知父组件关闭弹窗
    emit('refresh-model-data')
    emit('close-dialog')
  } catch (error) {
    console.error('Failed to submit form:', error)
  }
}

// 引用子组件
const stepComponentRef = ref(null)

//向父组件传函数
const emit = defineEmits(['close-dialog', 'refresh-model-data'])

const closeDialog = () => {
  currentStep.value = 0
  // 通过事件通知父组件关闭弹窗
  emit('close-dialog')
}
</script>

<template>
  <div class="form-container">
    <el-steps :active="currentStep" align-center finish-status="success">
      <el-step title="基本信息配置"></el-step>
      <el-step title="测点选择"></el-step>
      <!-- <el-step title="工况配置"></el-step>
      <el-step title="训练样本选择"></el-step>
      <el-step title="模型训练"></el-step> -->
    </el-steps>
    <!-- 动态加载当前步骤的组件 -->
    <component
      :is="currentStepComponent"
      :stepData="stepData[currentStep]"
      @beginTrain="beginTrain"
      @updateStepData="updateStepData"
      @validateStep="handleValidation"
      ref="stepComponentRef"
    />

    <!-- 底部按钮 -->
    <div class="button-row" :style="{ marginTop: currentStep === totalSteps - 1 ? '30px' : '0' }">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button v-if="currentStep < totalSteps - 1" type="primary" @click="nextStep">下一步</el-button>
      <!-- <el-button v-if="currentStep === 2" type="primary" @click="skip">跳过</el-button> -->
      <el-button v-if="currentStep === totalSteps - 1" type="primary" @click="submitForm">保存并关闭</el-button>
      <el-button type="danger" @click="closeDialog">取消</el-button>
    </div>
  </div>
</template>

<style scoped>
.span-container {
  display: flex;
  align-items: center;
  margin: 10px 0;
  width: 100%;
}
.form-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px 50px;
  background-color: transparent !important;
  height: 100%;
}
.button-row {
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中对齐按钮 */
  gap: 10px; /* 按钮之间的间距 */
}
.custom-hr {
  height: 1px;
  background-color: #dcdcdc;
  border: none;
}

:deep(.el-step__title) {
  color: white !important;
}
</style>
