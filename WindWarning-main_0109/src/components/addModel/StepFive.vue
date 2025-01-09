<script setup>
// 用于向父组件传递数据和验证结果
const emit = defineEmits(['beginTrain'])
const train = () => {
  emit('beginTrain')
}
</script>

<template>
  <!-- 外层容器使按钮居中 -->
  <div class="button-container">
    <el-button
      type="success"
      size="large"
      plain
      round
      style="width: 200px; padding: 10px 10px; font-size: 20px; margin-top: 100px; margin-bottom: 100px"
      @click="train"
    >
      开始训练
    </el-button>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
</style>
