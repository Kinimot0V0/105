<script setup>
import { ref } from 'vue'

const props = defineProps({
  dialogData: {
    type: Array,
    required: true
  }
})
const validId = ref(1)
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
const repeatId = ref(1)
const repeatList = ref([
  {
    repeatId: 0,
    repeatName: '否'
  },
  {
    repeatId: 1,
    repeatName: '是'
  }
])

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
          v-model="repeatId"
          value-key="repeatId"
          class="select"
          style="--el-input-text-color: white; width: 150px"
        >
          <el-option
            v-for="repeat in repeatList"
            :key="repeat.repeatId"
            :label="repeat.repeatName"
            :value="repeat.repeatId"
          ></el-option>
        </el-select>
      </div>
    </div>
    <el-table :data="dialogData" style="width: 100%" stripe>
      <el-table-column prop="startTime" label="开始时间" width="200px" align="center" />
      <el-table-column prop="endTime" label="结束时间" width="200px" align="center" />
      <el-table-column prop="deviceName" label="设备名称" align="center" />
      <el-table-column prop="warningInfo" label="预警信息" align="center" />
      <el-table-column prop="module" label="系统分类" width="200px" align="center" />
      <el-table-column prop="level" label="等级" width="100px" align="center" />
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
