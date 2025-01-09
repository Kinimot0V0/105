<script setup>

const props = defineProps({
  dialogData: {
    type: Array,
    required: true
  }
})

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
      <span>如下预警信息将被&nbsp;&nbsp;挂起</span>
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

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.table-footer .el-button {
  margin: 0 10px;
}
</style>
