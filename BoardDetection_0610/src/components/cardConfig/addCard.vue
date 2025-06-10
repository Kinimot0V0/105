<script setup>
import { ref, reactive } from 'vue'

const formRef = ref(null)

const formData = reactive({
  cardFactory: '',
  cardType: '',
  currentRating: null //额定电流
})
</script>

<template>
  <div class="from-container">
    <h2 class="title">新增卡件</h2>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px"></el-form>
  </div>
</template>

<style></style>
