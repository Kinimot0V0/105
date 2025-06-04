<script setup>
import { ref } from 'vue'
import { operate } from '@/api/pendingWarning'
const props = defineProps({
  dialogData: {
    type: Array,
    required: true
  }
})
const validId = ref(0)
const validList = ref([
  {
    validId: 0,
    validName: '否'
  },
  {
    validId: 1,
    validName: '是'
  }
])
const repetitionId = ref(0)
const repetitionList = ref([
  {
    repetitionId: 0,
    repetitionName: '否'
  },
  {
    repetitionId: 1,
    repetitionName: '是'
  }
])

const emit = defineEmits(['close-dialog', 'refresh'])

const closeDialog = () => {
  emit('close-dialog')
}
const handleConfirm = async () => {
  try {
    const params = {
      warningId: props.dialogData.map((item) => item.warningId),
      operateCode: 0,
      repetition: repetitionId.value,
      valid: validId.value
    }
    // console.log('关闭_params:', params)
    const response = await operate(params)
    // console.log('关闭返回结果:', response)
    emit('refresh')
    emit('close-dialog')
  } catch (error) {
    console.error('处理预警关闭失败:', error)
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
      <span>如下预警信息的等级将被关闭</span>
      <div class="info">
        <span class="span-name">有效</span>
        <el-select
          v-model="validId"
          value-key="validId"
          class="select"
          style="--el-input-text-color: white; width: 150px"
        >
          <el-option
            v-for="valid in validList"
            :key="valid.validId"
            :label="valid.validName"
            :value="valid.validId"
          ></el-option>
        </el-select>
        <span class="span-name" style="margin-left: 10px">重复</span>
        <el-select
          v-model="repetitionId"
          value-key="repetitionId"
          class="select"
          style="--el-input-text-color: white; width: 150px"
        >
          <el-option
            v-for="repetition in repetitionList"
            :key="repetition.repetitionId"
            :label="repetition.repetitionName"
            :value="repetition.repetitionId"
          ></el-option>
        </el-select>
      </div>
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
      <el-table-column prop="farmTurbineName" label="设备名称" width="230px" align="center" />
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
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
.info {
  display: flex;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-footer .el-button {
  margin: 0 10px;
}
.span-name {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #285e76;
  border: 1px solid #285e76;
  font-size: 15px;
  width: 60px;
  height: 9px;
  padding: 10px;
}
</style>
