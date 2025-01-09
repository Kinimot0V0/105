<script setup>
import { ref } from 'vue'
import windFarm from '@/components/overview/windFarm.vue'
import warning from '@/components/overview/warning.vue'

// 风场选择相关
const windFarmId = ref('')
const windFarmList = ref([
  { windFarmId: 1, windFarmName: '风场1' },
  { windFarmId: 2, windFarmName: '风场2' }
])

// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)
</script>

<template>
  <div class="time">
    <el-button type="primary">最近7天</el-button>
    <el-button type="primary">最近30天</el-button>

    <el-date-picker
      v-model="startDate"
      type="datetime"
      placeholder="选择开始时间"
      :clearable="true"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      style="width: 180px"
    ></el-date-picker>

    <span class="date-separator">至</span>

    <el-date-picker
      v-model="endDate"
      type="datetime"
      placeholder="选择结束时间"
      :clearable="true"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      style="width: 180px"
    ></el-date-picker>

    <el-form-item label="场站：" prop="windFarmId">
      <el-select v-model="windFarmId" placeholder="全部" clearable style="width: 120px; --el-input-text-color: white">
        <el-option :label="'全部'" :value="''"></el-option>
        <el-option
          v-for="windFarm in windFarmList"
          :key="windFarm.windFarmId"
          :label="windFarm.windFarmName"
          :value="windFarm.windFarmId"
        ></el-option>
      </el-select>
    </el-form-item>
  </div>
  <div class="container">
    <div class="windFarm">
      <windFarm />
    </div>
    <div class="warning"><warning /></div>
  </div>
</template>

<style scoped>
.time {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.container {
  display: flex;
  overflow: hidden;
  border: 1px solid #164b6d;
  height: 77vh;
}
.windFarm {
  flex: 4;
  border: 1px solid #164b6d;
}
.warning {
  flex: 3;
  border: 1px solid #164b6d;
}

/* 表单 */
:deep(.el-form-item__label) {
  color: white !important;
}

:deep(.el-select__wrapper) {
  background-color: transparent !important;
  color: white;
}

:deep(.el-select-dropdown) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: white;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-input__wrapper) {
  background-color: transparent !important;
}

:deep(.el-input__inner) {
  background-color: transparent !important;
  color: white !important;
}

:deep(.el-input) {
  --el-input-bg-color: transparent !important;
  --el-input-text-color: white !important;
}
</style>
