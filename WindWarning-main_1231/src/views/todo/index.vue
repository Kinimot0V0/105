<script setup>
import { ref } from 'vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import todoList from '@/components/todo/todoList.vue'
import turbine from '@/components/todo/turbine.vue'
// 选择的起始和结束时间
const startDate = ref(null)
const endDate = ref(null)
</script>

<template>
  <div class="header">
    <div class="right-align">
      <el-button type="primary">全部</el-button>
      <el-button type="primary">最近七天</el-button>
      <el-date-picker
        v-model="startDate"
        type="datetime"
        placeholder="选择开始时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
      ></el-date-picker>
      &nbsp;至&nbsp;
      <el-date-picker
        v-model="endDate"
        type="datetime"
        placeholder="选择结束时间"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
      ></el-date-picker>
    </div>
  </div>
  <div class="main">
    <div class="turbine">
      <turbine />
    </div>
    <div class="todoList">
      <todoList />
    </div>
  </div>
</template>

<style scoped>
.header {
  padding: 10px;
  border: 1px solid #164b6d;
  height: 30px;
}

.right-align {
  display: flex;
  align-items: center;
}
.right-align .el-button,
.right-align .el-date-picker {
  margin-right: 10px;
}
.main {
  display: flex;
  margin-top: 10px;
  border: 1px solid #164b6d;
  height: 75vh;
  overflow: hidden;
}
.todoList {
  flex: 3;
  margin: 5px;
  border: 1px solid #164b6d;
}
.turbine {
  flex: 1;
  margin: 5px;
  border: 1px solid #164b6d;
  overflow: auto;
}
</style>
