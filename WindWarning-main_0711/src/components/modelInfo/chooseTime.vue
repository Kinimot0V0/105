<script setup>
import { ref, computed } from 'vue'
import { train } from '@/api/model'
import { ElMessage } from 'element-plus'

// 定义训练状态枚举
const TrainingStatus = {
  NOT_STARTED: 'not_started',
  TRAINING: 'training',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

const props = defineProps({
  modelId: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['close-dialog', 'refresh-model-data'])

const sample = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const trainingStatus = ref(TrainingStatus.NOT_STARTED)

// 计算按钮文案和类型
const buttonConfig = computed(() => {
  switch (trainingStatus.value) {
    case TrainingStatus.NOT_STARTED:
      return {
        text: '开始训练',
        type: 'primary',
        disabled: sample.value.length === 0
      }
    case TrainingStatus.TRAINING:
      return {
        text: '训练中',
        type: 'warning',
        disabled: true
      }
    case TrainingStatus.COMPLETED:
      return {
        text: '训练完成',
        type: 'success',
        disabled: false
      }
    case TrainingStatus.FAILED:
      return {
        text: '训练失败',
        type: 'danger',
        disabled: false
      }
    default:
      return {
        text: '开始训练',
        type: 'primary',
        disabled: false
      }
  }
})

// 选择的起始和结束时间
const startDate = ref(null)
const endDate = ref(null)

// 计算当前页的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sample.value.slice(start, end)
})

// 更新分页的当前页
const handlePageChange = (page) => {
  currentPage.value = page
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置为第一页
}

// 保存选择的时间
const handleDateChange = () => {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择完整的开始和结束时间')
    return
  }

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  // 检查结束时间是否大于开始时间
  if (end <= start) {
    ElMessage.warning('结束时间必须大于开始时间')
    return
  }

  const lastTimeInSeconds = Math.floor((end - start) / 1000)

  sample.value.push({
    id: Date.now(),
    startTime: startDate.value,
    endTime: endDate.value,
    lastTime: lastTimeInSeconds,
    sampleSize: '',
    filterPoints: '',
    mode: ''
  })

  // 清空选择的时间
  startDate.value = null
  endDate.value = null
}

const handleDelete = (id) => {
  // 根据 id 删除对应的数据
  sample.value = sample.value.filter((item) => item.id !== id)
}

const closeDialog = () => {
  emit('refresh-model-data')
  emit('close-dialog')
}

// 开始训练
const confirmTraining = async () => {
  // 根据当前状态决定操作
  switch (trainingStatus.value) {
    case TrainingStatus.COMPLETED:
    case TrainingStatus.FAILED:
      // 如果是训练完成或失败状态，直接关闭弹窗
      emit('refresh-model-data')
      emit('close-dialog')
      return

    case TrainingStatus.TRAINING:
      // 训练中不允许操作
      return

    case TrainingStatus.NOT_STARTED:
    default:
      // 检查是否有选择的时间段
      if (sample.value.length === 0) {
        ElMessage.warning('请至少选择一个时间段')
        return
      }

      try {
        // 设置训练状态为训练中
        trainingStatus.value = TrainingStatus.TRAINING

        // 构造 trainData 对象
        const trainData = {
          modelIds: [props.modelId],
          timePeriods: sample.value.map((item) => ({
            startTime: item.startTime,
            endTime: item.endTime
          }))
        }
        console.log('train数据', trainData)

        // 调用 train 接口
        const responseTrain = await train(trainData)
        console.log('train接口返回的数据:', responseTrain.data)

        // 训练完成后显示成功消息并更新状态
        ElMessage.success('训练任务完成')
        trainingStatus.value = TrainingStatus.COMPLETED
        emit('refresh-model-data')
        emit('close-dialog')
      } catch (error) {
        console.error('训练接口调用错误:', error)
        ElMessage.error('训练任务提交出现异常')
        trainingStatus.value = TrainingStatus.FAILED
      }
  }
}
</script>

<template>
  <div class="container">
    <h2 class="title">训练样本时间选择</h2>
    <el-row style="margin-bottom: 10px; align-items: center">
      <el-button type="success">样本时间选取</el-button>
      <el-date-picker
        v-model="startDate"
        type="datetime"
        placeholder="选择开始时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="margin-left: 20px"
      ></el-date-picker>
      <el-date-picker
        v-model="endDate"
        type="datetime"
        placeholder="选择结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="margin-left: 10px"
      ></el-date-picker>
      <el-button type="primary" @click="handleDateChange" style="margin-left: 10px">添加</el-button>
    </el-row>

    <!-- 表格数据绑定为 paginatedData -->
    <el-table :data="paginatedData" border>
      <el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
      <el-table-column prop="lastTime" label="时长（秒）" align="center"></el-table-column>
      <el-table-column prop="sampleSize" label="样本数量（有效0）" align="center"></el-table-column>
      <el-table-column prop="filterPoints" label="过滤点数" align="center"></el-table-column>
      <el-table-column prop="mode" label="模式" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      style="margin-top: 15px; margin-bottom: 15px; display: flex; justify-content: center"
      background
      layout="prev, pager, next,sizes,jumper"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      :total="sample.length || 0"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
    </el-pagination>

    <!-- 底部按钮 -->
    <div class="button-row">
      <el-button type="danger" :disabled="trainingStatus === TrainingStatus.TRAINING" @click="closeDialog">
        关闭
      </el-button>
      <el-button
        :type="buttonConfig.type"
        :disabled="buttonConfig.disabled"
        :loading="trainingStatus === TrainingStatus.TRAINING"
        @click="confirmTraining"
      >
        {{ buttonConfig.text }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.el-table {
  border-collapse: collapse;
  text-align: center;
  border: 1px solid #d3d3d3;
}
.button-row {
  width: 100%;
  display: flex;
  justify-content: center; /* 水平居中对齐按钮 */
  gap: 10px; /* 按钮之间的间距 */
}
</style>
