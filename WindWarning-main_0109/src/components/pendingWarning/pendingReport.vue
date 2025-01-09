<script setup>
import { ref } from 'vue'

const props = defineProps({
  dialogData: {
    type: Array,
    required: true
  }
})
const windFarmId = ref(1)
const windFarmList = ref([
  {
    windFarmId: 1,
    windFarmName: '化德分散式风电场'
  }
])
const deviceId = ref(1)
const deviceList = ref([
  {
    deviceId: 1,
    deviceName: '风机'
  }
])
const turbineName = ref('化德分散式001号风机')

const statusId = ref(1)
const statusList = ref([
  {
    statusId: 1,
    statusName: '处理中'
  },
  {
    statusId: 2,
    statusName: '已办结'
  }
])
const validId = ref(0)
const validList = ref([
  {
    validId: 0,
    validName: '-'
  },
  {
    validId: 1,
    validName: '否'
  },
  {
    validId: 2,
    validName: '是'
  }
])
const repeatId = ref(0)
const repeatList = ref([
  {
    repeatId: 0,
    repeatName: '-'
  },
  {
    repeatId: 1,
    repeatName: '否'
  },
  {
    repeatId: 2,
    repeatName: '是'
  }
])
const reportTime = ref('2024-10-10 00:00:00')

const peopleId = ref(0)
const peopleList = ref([
  {
    peopleId: 0,
    peopleName: '张三'
  },
  {
    peopleId: 1,
    peopleName: '李四'
  }
])
const short = ref('')
const emit = defineEmits(['close-dialog', 'confirm'])

const closeDialog = () => {
  emit('close-dialog')
}

const handleConfirm = () => {
  emit('confirm', props.dialogData)
  emit('close-dialog')
}
</script>

<template>
  <div class="warning-table-container">
    <div class="top">
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="项目名称：">
              <el-select v-model="windFarmId" style="--el-input-text-color: white">
                <el-option
                  v-for="farm in windFarmList"
                  :key="farm.windFarmId"
                  :label="farm.windFarmName"
                  :value="farm.windFarmId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="设备类型：">
              <el-select v-model="deviceId" style="--el-input-text-color: white">
                <el-option
                  v-for="device in deviceList"
                  :key="device.deviceId"
                  :label="device.deviceName"
                  :value="device.deviceId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="设备名称：">
              <el-input v-model="turbineName" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
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

          <el-col :span="8">
            <el-form-item label="重复：">
              <el-select v-model="repeatId" style="--el-input-text-color: white">
                <el-option
                  v-for="repeat in repeatList"
                  :key="repeat.repeatId"
                  :label="repeat.repeatName"
                  :value="repeat.repeatId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="通知时间：">
              <el-input v-model="reportTime" readonly></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="责任人：">
              <el-select v-model="peopleId" style="--el-input-text-color: white">
                <el-option
                  v-for="people in peopleList"
                  :key="people.peopleId"
                  :label="people.peopleName"
                  :value="people.peopleId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="简述：">
              <el-input v-model="short" type="textarea" :rows="4" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关联预警：">
              <el-table :data="dialogData" style="width: 100%" stripe>
                <el-table-column prop="startTime" label="开始时间" width="200px" align="center" />
                <el-table-column prop="endTime" label="结束时间" width="200px" align="center" />
                <el-table-column prop="warningInfo" label="预警信息" align="center" />
                <el-table-column prop="level" label="等级" width="100px" align="center" />
                <el-table-column label="详情" width="100px" align="center">
                  <template #default="scope">
                    <el-link type="primary" @click="look(scope.row)">查看</el-link>
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
