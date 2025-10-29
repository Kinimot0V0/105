<script setup>
import { ref } from 'vue'
import { operate } from '@/api/pendingWarning'
const props = defineProps({
  dialogData: {
    type: Array,
    required: true
  },
  pvFarmName: {
    type: String,
    default: ''
  },
  pvFarmId: {
    type: Number,
    default: 1
  },
  deviceId: {
    type: Number,
    default: 1
  },
  deviceName: {
    type: String,
    default: ''
  }
})
const deviceType = ref('')
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

const operatorId = ref(1)
const operatorList = ref([
  {
    operatorId: 1,
    operatorName: '张三'
  }
])
const reportText = ref('')
const emit = defineEmits(['close-dialog', 'refresh'])

const closeDialog = () => {
  emit('close-dialog')
}
const handleConfirm = async () => {
  try {
    const params = {
      warningId: props.dialogData.map((item) => item.warningId),
      operateCode: 3,
      repetition: repetitionId.value,
      valid: validId.value,
      reportText: reportText.value,
      operatorId: operatorId.value
    }
    //一级预警转二级预警
    const paramsLevel = {
      warningId: props.dialogData.map((item) => item.warningId),
      operateCode: 2,
      warningLevel: 2
    }
    // console.log('通知_params:', params)
    const response = await operate(params)
    const responseLevel = await operate(paramsLevel)
    // console.log('通知返回结果:', response)
    emit('refresh')
    emit('close-dialog')
  } catch (error) {
    console.error('处理预警通知失败:', error)
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
      <h3 style="color: red">注意：通知时一级预警会转为二级预警</h3>
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="项目名称：">
              <el-input :value="pvFarmName" readonly></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="设备名称：">
              <el-input :value="props.deviceName" readonly></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="有效：">
              <el-select v-model="validId" style="--el-input-text-color: white">
                <el-option
                  v-for="valid in validList"
                  :key="valid.validId"
                  :label="valid.validName"
                  :value="valid.validId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <!-- <el-col :span="8">
            <el-form-item label="状态：">
              <el-select v-model="statusId" style="--el-input-text-color: white">
                <el-option
                  v-for="status in statusList"
                  :key="status.statusId"
                  :label="status.statusName"
                  :value="status.statusId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->

          <el-col :span="8">
            <el-form-item label="重复：">
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
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="责任人：">
              <el-select v-model="operatorId" style="--el-input-text-color: white">
                <el-option
                  v-for="operator in operatorList"
                  :key="operator.operatorId"
                  :label="operator.operatorName"
                  :value="operator.operatorId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="通知时间：">
              <el-input v-model="reportTime" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="简述：">
              <el-input v-model="reportText" type="textarea" :rows="4" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关联预警：">
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
                <el-table-column  label="预警信息" align="center">
                  <template #default="scope">
                    {{ scope.row.warningDescription.replace(/[\[\]']+/g, '') }}
                  </template>
                </el-table-column>
                <el-table-column prop="warningLevel" label="等级" width="100px" align="center">
                  <template #default="scope">
                    <span :style="{ color: levelMap[scope.row.warningLevel]?.color }">
                      {{ levelMap[scope.row.warningLevel]?.label }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>

  <div class="table-footer">
    <el-button type="primary" @click="handleConfirm">确定</el-button>
    <el-button type="danger" @click="closeDialog">取消</el-button>
  </div>
</template>

<style scoped>
.warning-table-container {
  display: flex;
  flex-direction: column;
}
.top {
  padding: 10px;
}
.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-footer .el-button {
  margin: 0 10px;
}
:deep(.el-textarea__inner) {
  background-color: transparent !important;
  color: white !important;
  border: 1px solid #164b6d;
}
:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>
