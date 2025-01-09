<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 从父组件传递的 props 数据
const props = defineProps({
  stepData: Object, // 假设 stepData 中包含测点数据
  providedData: Object
})

// 向父组件发送更新的事件
const emit = defineEmits(['updateStepData'])

// 创建一个本地的可变 conditions 引用
const conditions = ref([...props.stepData.conditions])

// 监听本地 conditions 的变化并同步到父组件
watch(
  conditions,
  (newConditions) => {
    emit('updateStepData', newConditions) // 将更新后的 conditions 传递给父组件
  },
  { deep: true }
)

const dialogVisible = ref(false) // 控制弹窗的显示
const selectedConditionIndex = ref(null) // 当前选中的条件索引
const selectedMeasurePoints = ref([]) // 存储选择的测点列表
const tableRef = ref(null) // 表格的 ref

// 添加工况
const addCondition = () => {
  conditions.value.push({
    id: Date.now(),
    name: '',
    infer: true,
    status: false,
    color: '#FF0000',
    duration: '',
    selected: false,
    measurePoints: []
  })
}

// 删除工况
const deleteCondition = () => {
  const count = conditions.value.length
  conditions.value = conditions.value.filter((condition) => !condition.selected)
  if (count > conditions.value.length) {
    ElMessage.success('工况已删除')
  } else {
    ElMessage.warning('未选中任何工况')
  }
}

// 删除测点的方法
const deleteMeasurePoint = (conditionIndex, pointIndex) => {
  if (conditions.value[conditionIndex]) {
    conditions.value[conditionIndex].measurePoints.splice(pointIndex, 1)
    ElMessage.success('测点已删除')
  } else {
    ElMessage.warning('未找到指定工况')
  }
}

// 打开测点选择弹窗
const openMeasurePointDialog = (index) => {
  selectedConditionIndex.value = index
  selectedMeasurePoints.value = [] // 清空选择的测点
  // 确保表格的选中状态也被清除
  if (tableRef.value) {
    tableRef.value.clearSelection() // 清空 el-table 的选中状态
  }
  dialogVisible.value = true
}

// 确认选择测点
const confirmMeasurePoint = () => {
  const condition = conditions.value[selectedConditionIndex.value]

  selectedMeasurePoints.value.forEach((point) => {
    condition.measurePoints.push({
      ...point,
      operator: '>', // 初始符号
      value: '' // 初始数值为空
    })
  })

  dialogVisible.value = false
}

// 处理表格中的选中状态变化
const handleSelectionChange = (selected) => {
  selectedMeasurePoints.value = selected
}

// 可选的颜色列表
const colors = [
  { name: 'red', value: '#FF0000' },
  { name: 'green', value: '#00FF00' },
  { name: 'blue', value: '#0000FF' },
  { name: 'yellow', value: '#FFFF00' }
]
</script>

<template>
  <div class="model-config-container">
    <h2 class="title">③ 工况配置</h2>
    <el-row :gutter="20" style="margin-bottom: 10px">
      <el-col :span="24">
        <el-button type="primary" @click="addCondition">添加</el-button>
        <el-button type="danger" @click="deleteCondition">删除</el-button>
      </el-col>
    </el-row>

    <el-form
      label-width="120px"
      v-for="(condition, conditionIndex) in conditions"
      :key="condition.id"
      class="condition"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <!-- 只有一个工况时复选框禁用，当工况数大于1时可点击 -->
          <el-checkbox
            v-model="condition.selected"
            :disabled="conditions.length === 1"
            style="margin-right: 10px"
          ></el-checkbox>
          <span>工况名称 </span>
          <el-input v-model="condition.name" placeholder="请输入工况名称" style="width: 200px"></el-input>
        </el-col>

        <el-col :span="4">
          <span>是否推理 </span>
          <el-radio v-model="condition.infer" :label="true">是</el-radio>
          <el-radio v-model="condition.infer" :label="false">否</el-radio>
        </el-col>

        <el-col :span="4">
          <el-switch v-model="condition.status" active-text="工况状态"></el-switch>
        </el-col>

        <el-col :span="4">
          <span>标识色：</span>
          <el-select v-model="condition.color" style="width: 45px">
            <template v-slot:prefix>
              <span
                :style="{
                  backgroundColor: condition.color,
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  marginRight: '5px',
                  borderRadius: '4px'
                }"
              ></span>
            </template>
            <el-option v-for="color in colors" :key="color.name" :value="color.value">
              <span
                :style="{
                  backgroundColor: color.value,
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px'
                }"
              ></span>
            </el-option>
          </el-select>
        </el-col>

        <el-col :span="3">
          <span>持续时间：</span>
          <el-input v-model="condition.duration" style="width: 50px"></el-input> 秒
        </el-col>

        <!-- 添加测点按钮 -->
        <el-col :span="3">
          <el-button type="primary" @click="openMeasurePointDialog(conditionIndex)">添加测点</el-button>
        </el-col>
      </el-row>

      <!-- 动态渲染测点 -->
      <el-row
        v-for="(mp, mpIndex) in condition.measurePoints"
        :key="mpIndex"
        style="margin-top: 10px; width: 80%"
        :gutter="20"
      >
        <el-col :span="3" v-if="mpIndex > 0">
          <el-button>AND</el-button>
        </el-col>
        <el-col :span="3" v-if="mpIndex == 0">
          <span></span>
        </el-col>
        <el-col :span="7">
          <el-input :disabled="true" v-model="mp.name"></el-input>
        </el-col>
        <el-col :span="3">
          <el-select v-model="mp.operator">
            <el-option label=">" value=">"></el-option>
            <el-option label="<" value="<"></el-option>
            <el-option label=">=" value=">="></el-option>
            <el-option label="<=" value="<="></el-option>
            <el-option label="=" value="="></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input v-model="mp.value" placeholder="请输入值"></el-input>
        </el-col>
        <!-- 删除测点按钮 -->
        <el-col :span="3">
          <el-button type="danger" @click="deleteMeasurePoint(conditionIndex, mpIndex)">删除</el-button>
        </el-col>
      </el-row>
    </el-form>

    <!-- 测点选择弹窗 -->
    <el-dialog title="选择测点" v-model="dialogVisible" width="50%">
      <!-- 使用 el-table 来显示测点数据 -->
      <el-table
        :data="props.providedData.selectedData"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        ref="tableRef"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="测点名称" width="200"></el-table-column>
      </el-table>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmMeasurePoint">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.condition {
  border: 1px solid #ccc;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 5px;
}
.model-config-container {
  padding: 10px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}
</style>
