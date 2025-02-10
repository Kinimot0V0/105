<script setup>
import { ref, reactive } from 'vue'
import { addRealPoint } from '@/api/realPoint'

const formRef = ref(null)

// 使用 reactive 组织表单字段
const formData = reactive({
  pointLabel: null,
  pointDescription: null,
  moduleID: null,
  pointUnit: null,
  pointType: null,
  turbineId: null
})
// 提供的数据信息
const providedData = {
  turbineList: [
    {
      id: '001',
      name: '风机1'
    },
    {
      id: '002',
      name: '风机2'
    },
    {
      id: '003',
      name: '风机3'
    },
    {
      id: '004',
      name: '风机4'
    }
  ],
  moduleList: [
    {
      id: '01',
      name: '模块1'
    },
    {
      id: '02',
      name: '模块2'
    },
    {
      id: '03',
      name: '模块3'
    }
  ],
  pointTypeList: [
    {
      id: '001',
      name: '开关测点'
    },
    {
      id: '002',
      name: '模拟测点'
    }
  ]
}
// 表单规则
const rules = {
  pointLabel: [{ required: true, message: '测点标签不能为空', trigger: 'blur' }],
  moduleID: [{ required: true, message: '模块不能为空', trigger: 'change' }]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    // 等待表单校验完成
    await formRef.value.validate()

    const pointData = {
      pointLabel: formData.pointLabel,
      pointDescription: formData.pointDescription,
      moduleID: parseInt(formData.moduleID),
      pointUnit: formData.pointUnit,
      pointType: parseInt(formData.pointType),
      turbineId: parseInt(formData.turbineId)
    }
    console.log('表单数据:', pointData)

    // 调用接口
    const response = await addRealPoint(pointData)
    console.log('Form submitted successfully!')
    console.log('接口返回的数据:', response.data)

    // 清空表单并关闭弹窗
    resetAndCloseDialog()
  } catch (error) {
    console.error('表单校验失败或提交失败:', error)
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

        <!-- 模块 -->
        <el-col :span="8">
          <el-form-item label="模块" prop="moduleID">
            <el-select v-model="formData.moduleID" placeholder="请选择模块">
              <el-option
                v-for="module in providedData.moduleList"
                :key="module.id"
                :label="module.name"
                :value="module.id"
              />
            </el-select>
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
            <el-select v-model="formData.pointType" placeholder="测点类型">
              <el-option
                v-for="type in providedData.pointTypeList"
                :key="type.id"
                :label="type.name"
                :value="type.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 风机 -->
        <el-col :span="8">
          <el-form-item label="风机" prop="turbineId">
            <el-select v-model="formData.turbineId" placeholder="请选择风机">
              <el-option
                v-for="turbine in providedData.turbineList"
                :key="turbine.id"
                :label="turbine.name"
                :value="turbine.id"
              />
            </el-select>
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
  background-color: white;
  height: 100%;
}
.button-row {
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中对齐按钮 */
  gap: 20px; /* 按钮之间的间距 */
  margin-top: 10px;
}
.custom-hr {
  height: 1px;
  background-color: #dcdcdc;
  border: none;
}
</style>
