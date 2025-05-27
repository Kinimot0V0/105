<script setup>
import { ref } from 'vue'
import { operate } from '@/api/pendingWarning'
const props = defineProps({
  dialogData: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close-dialog', 'refresh'])

const closeDialog = () => {
  emit('close-dialog')
}

const handleConfirm = async () => {
  try {
    const params = {
      warningId: props.dialogData.map((item) => item.warningId),
      operateCode: 4
    }
    // console.log('关闭_params:', params)
    const response = await operate(params)
    // console.log('关闭返回结果:', response)
    emit('refresh')
    emit('close-dialog')
  } catch (error) {
    console.error('确认关闭失败:', error)
  }
}
const levelMap = ref({
  1: { label: '1级', color: 'white' },
  2: { label: '2级', color: 'white' }
})
</script>

<template>
  <div class="warning-table-container">
    <div class="top">
      <span>如下预警信息将被确认关闭</span>
    </div>
    <el-table :data="props.dialogData" style="width: 100%" stripe max-height="50vh">
      <el-table-column label="开始时间" width="200px" align="center">
        <template #default="scope">
          {{ scope.row.startTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="200px" align="center">
        <template #default="scope">
          {{ scope.row.endTime.replace('T', ' ') }}
        </template>
      </el-table-column>
      <el-table-column prop="deviceName" label="设备名称" width="230px" align="center" />
      <el-table-column prop="warningDescription" label="预警信息" align="center" />
      <el-table-column prop="warningLevel" label="等级" width="100px" align="center">
        <template #default="scope">
          <span :style="{ color: levelMap[scope.row.warningLevel]?.color}">
            {{ levelMap[scope.row.warningLevel]?.label}}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <div class="table-footer">
      <el-button type="primary" @click="handleConfirm">确定</el-button>
      <el-button type="danger" @click="closeDialog">取消</el-button>
    </div>
  </div>
</template>

<style scoped>
.warning-table-container {
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-footer .el-button {
  margin: 0 10px;
}
</style>
