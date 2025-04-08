<script setup>
import { ref, computed } from 'vue'
import { test } from '@/api/model'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelId: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['close-dialog', 'refresh-model-data'])

// 存放时间段信息（仅限一条）
const sample = ref([])

// 选择起始和结束时间
const startDate = ref(null)
const endDate = ref(null)

// 当 sample 有数据时才可点击“开始测试”
const canStartTest = computed(() => sample.value.length > 0)

// 添加时间段
const handleDateChange = () => {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择完整的开始和结束时间')
    return
  }

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  if (end <= start) {
    ElMessage.warning('结束时间必须大于开始时间')
    return
  }

  // 限制只添加一条时间段
  if (sample.value.length >= 1) {
    ElMessage.warning('只能添加一条时间段')
    return
  }

  const lastTimeInSeconds = Math.floor((end - start) / 1000)
  sample.value.push({
    id: Date.now(),
    startTime: startDate.value,
    endTime: endDate.value,
    lastTime: lastTimeInSeconds,
    sampleSize: parseInt(lastTimeInSeconds / 10) 
  })

  // 清空选中的时间
  startDate.value = null
  endDate.value = null
}

// 删除时间段
const handleDelete = (id) => {
  sample.value = sample.value.filter((item) => item.id !== id)
}

// 关闭弹窗
const closeDialog = () => {
  emit('refresh-model-data')
  emit('close-dialog')
}

// 点击“开始测试”
const confirm = () => {
  ElMessageBox.confirm(
    '注意该操作会覆盖所选时间的预警，是否继续？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      // 点击“确定”后再调用接口
      try {
        // 将添加的时间段信息放入接口参数
        const params = {
          modelId: props.modelId,
          startTime: sample.value[0].startTime,
          endTime: sample.value[0].endTime
        }
        console.log('test接口参数:', params)

        const response = await test(params)
        console.log('test接口返回的数据:', response.data)

        emit('refresh-model-data')
        emit('close-dialog')
      } catch (error) {
        console.error('测试接口调用错误:', error)
      }
    })
    .catch(() => {
    })
}
</script>

<template>
  <div class="container">
    <h2 class="title">模型测试</h2>
    <el-row style="margin-bottom: 10px; align-items: center">
      <el-button type="success">样本时间选取</el-button>
      <el-date-picker
        v-model="startDate"
        type="datetime"
        placeholder="选择开始时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="margin-left: 20px"
      />
      <el-date-picker
        v-model="endDate"
        type="datetime"
        placeholder="选择结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="margin-left: 10px"
      />
      <el-button type="primary" @click="handleDateChange" style="margin-left: 10px">
        添加
      </el-button>
    </el-row>

    <!-- 直接绑定 sample -->
    <el-table :data="sample" border>
      <el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
      <el-table-column prop="lastTime" label="时长（秒）" align="center"></el-table-column>
      <el-table-column prop="sampleSize" label="样本数量" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部按钮 -->
    <div class="button-row">
      <el-button
        type="primary"
        @click="confirm"
        :disabled="!canStartTest"
      >
        开始测试
      </el-button>
      <el-button type="danger" @click="closeDialog">关闭</el-button>
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
  margin-top: 10px;
}
</style>
