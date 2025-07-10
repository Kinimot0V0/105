<script setup>
import { ref, onMounted } from 'vue'
import addRealPoint from '@/components/realPoint/addRealPoint.vue'
import addCalculate from '@/components/realPoint/addCalculate.vue'
import { getRealPoint,getFarmInfo } from '@/api/realPoint'

const dialogVisible = ref(false) // 控制弹窗的显示
const calculateDialogVisible = ref(false)

//getRealPoint的信息
const realPointList = ref([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

// 定义缓存对象
const inverterCache = ref({});

const getRealPointData = async () => {
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    };
    const response = await getRealPoint(params);
    // console.log("测点返回:", response);
    const data = response.data.result;
    const points = data.realPointList;

    // [修改点] 过滤掉没有 inverterId 的条目，并提取唯一值
    const inverterIds = [...new Set(
      points
        .map(point => point.inverterId)
        .filter(id => id != null) // 过滤 null/undefined
    )];

    const uncachedIds = inverterIds.filter(id => !inverterCache.value[id]);

    if (uncachedIds.length > 0) {
      const inverterPromises = uncachedIds.map(id => 
        getFarmInfo({ inverterId: id })
          .then(res => res.data.result)
          .catch(error => {
            console.error(`获取逆变器${id}信息失败:`, error);
            return null;
          })
      );
      const inverterResults = await Promise.all(inverterPromises);

      inverterResults.forEach(info => {
        if (info) {
          inverterCache.value[info.inverterId] = {
            inverterName: info.inverterName,
            pvFarmName: info.pvFarmName
          };
        }
      });
    }

    // [修改点] 合并数据时处理可能缺失 inverterId 的情况
    realPointList.value = points.map(point => ({
      ...point,
      ...(point.inverterId ? inverterCache.value[point.inverterId] : {}) // 安全解构
    }));

    totalCount.value = data.total_count;
    page.value = data.page;
    totalPages.value = data.total_pages;
  } catch (error) {
    console.error('获取测点数据失败:', error);
  }
};

onMounted(getRealPointData)

// 更新分页的当前页
const handlePageChange = (current_page) => {
  page.value = current_page
  getRealPointData()
}

// 更新每页显示条数
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  getRealPointData()
}
</script>

<template>
  <div class="container">
    <h2 style="text-align: center;">测点管理</h2>
    <el-form label-width="120px" style="margin-top: 10px; margin-bottom: 10px; margin-left: 10px">
      <el-row :gutter="10">
        <el-button type="primary" @click="dialogVisible = true">新增测点</el-button>
        <el-button type="success" @click="calculateDialogVisible = true">新增计算测点</el-button>
      </el-row>
        
    </el-form>

    <el-table :data="realPointList" border>
      <el-table-column label="序号" align="center" width="80px">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="pointLabel" label="测点标签" align="center"></el-table-column>
      <el-table-column prop="pointDescription" label="测点描述" align="center"></el-table-column>
      <el-table-column prop="inverterName" label="逆变器名称" align="center"></el-table-column>
      <el-table-column prop="pvFarmName" label="场站名称" align="center"></el-table-column>
      <el-table-column prop="calculate" label="计算测点表达式" align="center"></el-table-column>
      <!-- <el-table-column label="操作" align="center" width="120px">
        <template #default="scope">
          <el-link type="primary" @click="handleEdit(scope.row.model_id)">编辑</el-link>
        </template>
      </el-table-column> -->
    </el-table>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px; margin-bottom: 15px">
      <div style="margin-right: 10px">共 {{ totalCount }} 条，共 {{ totalPages }} 页</div>

      <!-- 分页组件 -->
      <el-pagination
        background
        layout="prev, pager, next, sizes, jumper"
        :page-size="pageSize"
        :current-page="page"
        :page-sizes="[10, 20, 30]"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      >
      </el-pagination>
    </div>

    <!-- 新建模型弹窗 -->
    <el-dialog title="新增测点" v-model="dialogVisible" width="80%">
      <!-- 将 dialogVisible 传递给子组件 index，并监听 closeDialog 事件 -->
      <addRealPoint :dialog-visible="dialogVisible" @close-dialog="dialogVisible = false" />
    </el-dialog>

    <!-- 新建计算测点弹窗 -->
    <el-dialog title="新增计算测点" v-model="calculateDialogVisible" width="80%">
      <addCalculate :dialog-visible="calculateDialogVisible" @close-dialog="calculateDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #164b6d;
  height: 80vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.el-table {
  border-collapse: collapse;
  text-align: center;
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
  background-color: rgba(20, 63, 92, var(--overlay-opacity, 0.8)) !important;
}

:deep(.el-dialog) {
  background-color: rgba(20, 63, 92, var(--dialog-opacity, 0.8)) !important;
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
