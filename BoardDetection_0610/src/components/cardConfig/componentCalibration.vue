<script setup>
import { ref } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'

// 筛选相关数据
const factoryID = ref('')
const typeID = ref('')
const factoryList = ref([{ factoryID: 1, factoryName: 'Analog Devices' }])
const typeList = ref([{ typeID: 1, typeName: 'ALYN' }])

// 表格数据
const tableData = ref([
  { id: 1, name: 'C3', coordinates: '(92.371)', operation: true },
  { id: 2, name: 'C4', coordinates: '(121.84)', operation: true },
  { id: 3, name: 'C5', coordinates: '(142.88)', operation: true },
  { id: 4, name: 'R3', coordinates: '(21,423)', operation: true },
  { id: 5, name: 'R4', coordinates: '(342,212)', operation: true },
  { id: 6, name: 'R5', coordinates: '(35,534)', operation: true },
  { id: 7, name: 'R6', coordinates: '(78,532)', operation: true },
  { id: 8, name: 'C9', coordinates: '(214,234)', operation: true },
  { id: 9, name: 'C10', coordinates: '(468,24)', operation: true },
  { id: 10, name: 'C11', coordinates: '(353,234)', operation: true }
])

// 图片相关
const imageUrl = ref('')
const handleImageUpload = (file) => {
  // 实际项目中应上传到服务器，这里做本地预览
  imageUrl.value = URL.createObjectURL(file.raw)
  return false // 阻止自动上传
}
</script>

<template>
  <div class="container">
    <!-- 筛选区域 -->
    <div class="info">
      <div class="info-text">
        <span class="span-name">厂家</span>
        <el-select
          v-model="factoryID"
          placeholder="全部厂家"
          value-key="FactoryID"
          class="factory-select"
          style="--el-input-text-color: white"
        >
          <el-option label="全部厂家" value="allFactory" />
          <el-option
            v-for="factory in factoryList"
            :key="factory.factoryID"
            :label="factory.factoryName"
            :value="factory.factoryID"
          ></el-option>
        </el-select>
        <span class="span-name">型号</span>
        <el-select
          v-model="typeID"
          placeholder="全部型号"
          value-key="typeID"
          class="factory-select"
          style="--el-input-text-color: white"
        >
          <el-option label="全部型号" value="allType" />
          <el-option
            v-for="type in typeList"
            :key="type.typeID"
            :label="type.typeName"
            :value="type.typeID"
          ></el-option>
        </el-select>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="main-content">
      <!-- 左侧图片区域 -->
      <div class="image-section">
        <div class="image-container">
          <el-upload
            class="image-upload"
            action="#"
            :show-file-list="false"
            :on-change="handleImageUpload"
            :auto-upload="false"
          >
            <div v-if="!imageUrl" class="upload-placeholder">
              <div class="upload-icon">+</div>
              <div class="upload-text">请上传图片</div>
            </div>
            <img v-else :src="imageUrl" class="image-preview" />
          </el-upload>
        </div>
      </div>

      <!-- 右侧表格区域 -->
      <div class="table-section">
        <el-table :data="tableData" class="data-table" height="100%">
          <el-table-column prop="id" label="序号" width="80" align="center" />
          <el-table-column prop="name" label="元器件名称" align="center" />
          <el-table-column prop="coordinates" label="坐标" align="center" />
          <el-table-column label="操作" width="120">
            <template #default>
              <div class="operation-buttons">
                <el-button type="primary" :icon="Edit" circle />
                <el-button type="danger" :icon="Delete" circle />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 10px;
  display: flex;
  height: 80vh;
  flex-direction: column;
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 15px;
}

.span-name {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  background-color: #143f5c;
  border: 1px solid #143f5c;
  font-size: 15px;
  width: 140px;
  height: 8px;
  padding: 10px;
  color: white;
  border-radius: 4px;
}

.main-content {
  display: flex;
  flex: 1;
  gap: 20px;
}

.image-section {
  flex: 1.5;
  background-color: rgba(20, 63, 92, 0.5);
  border: 1px solid #164b6d;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-section {
  flex: 1;
  /* background-color: rgba(20, 63, 92, 0.5); */
  border: 1px solid #164b6d;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.image-container {
  padding: 20px;
  display: flex;
  flex: 1;
}

.image-upload {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #36b8da;
  border-radius: 4px;
  background-color: rgba(20, 63, 92, 0.3);
  color: #c2dcf5;
}

.upload-icon {
  font-size: 48px;
  font-weight: bold;
}

.upload-text {
  font-size: 18px;
  margin: 12px;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.data-table {
  width: 100%;
  --el-table-bg-color: transparent;
}

.operation-buttons {
  display: flex;
  gap: 5px;
}
/* 表格样式 */
:deep(.el-table) {
  border: 1px solid #164b6d !important;
  background-color: transparent !important;

  &::before,
  &::after {
    display: none !important;
  }

  --el-table-border-color: transparent !important;

  .el-table__inner-wrapper {
    border-bottom: none !important;
  }

  .el-table__header-wrapper {
    th {
      background-color: #143f5c !important;
      border-bottom: none !important;
      border-right: none !important;
    }
    .el-table__header {
      border-bottom: none !important;
    }
  }

  .el-table__body-wrapper {
    background-color: transparent !important;
    tr {
      background-color: transparent !important;
      td {
        background-color: transparent !important;
        border-bottom: 1px solid #164b6d !important;
        border-right: 1px solid #164b6d !important;
      }
    }
  }

  th {
    color: #ffffff !important;
  }

  td {
    color: #c2dcf5 !important;
  }
}
/* 分页组件 */
:deep(.el-pagination) {
  background-color: transparent !important;
  color: #c2dcf5 !important;

  .el-pager li,
  button.btn-prev,
  button.btn-next {
    background-color: transparent !important;
    color: #c2dcf5 !important;
    border: 1px solid #164b6d !important;
  }

  .el-pager li.is-active {
    background-color: #143f5c !important;
    color: #ffffff !important;
    border-color: #164b6d !important;
  }

  .el-input__wrapper {
    background-color: transparent !important;
    box-shadow: none !important;
    border: 1px solid #164b6d !important;
  }

  .el-input__inner {
    color: #c2dcf5 !important;
  }

  .el-pagination__jump {
    color: #fff !important;
  }
}
/* 弹窗 */
:deep(.el-dialog__wrapper) {
  background-color: rgba(20, 63, 92, var(--overlay-opacity, 0.9)) !important;
}

:deep(.el-dialog) {
  background-color: rgba(20, 63, 92, var(--dialog-opacity, 0.9)) !important;
  box-shadow: none !important;
  color: white !important;
}

/* 针对标题 */
:deep(.el-dialog__header .el-dialog__title) {
  color: white !important;
}

/* 针对内容 */
:deep(.el-dialog__body) {
  color: white !important;
}

/* 如果有关闭按钮 */
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white !important;
}
</style>
