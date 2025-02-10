<script setup>
import { ref } from 'vue'
import trendChart from '@/components/warningList/trendChart.vue'
import analysisPoint from '@/components/warningList/analysisPoint.vue'
const warningDescription = ref('齿轮异常')
const windfarm = ref('化德分散式')
const device = ref('化德分散式-光伏机器')
const startDate = ref('2024-11-17 00:00:01')
const endDate = ref('2024-11-17 00:00:01')
const level = ref('1级')
const status = ref('已通知')
// 定义多个键值对数组
const chartData = ref({
  series1: [
    { datetime: '2024-11-01', value: 120 },
    { datetime: '2024-11-02', value: 132 },
    { datetime: '2024-11-03', value: 101 },
    { datetime: '2024-11-04', value: 134 }
  ],
  series2: [
    { datetime: '2024-11-01', value: 220 },
    { datetime: '2024-11-02', value: 182 },
    { datetime: '2024-11-03', value: 191 },
    { datetime: '2024-11-04', value: 234 }
  ],
  series3: [
    { datetime: '2024-11-01', value: 150 },
    { datetime: '2024-11-02', value: 232 },
    { datetime: '2024-11-03', value: 201 },
    { datetime: '2024-11-04', value: 154 }
  ]
})
</script>
<template>
  <div class="container1">
    <el-form label-width="120px">
      <el-row :gutter="0">
        <!-- 异常描述 -->
        <el-col :span="4">
          <el-button>{{ warningDescription }}</el-button>
        </el-col>

        <el-col :span="4">
          <el-form-item label="场站" prop="windfarm">
            <div class="input">
              {{ windfarm }}
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item label="设备" prop="device">
            <div class="input">
              {{ device }}
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item label="开始时间">
            <div class="input">
              {{ startDate }}
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item label="结束时间">
            <div class="input">
              {{ endDate }}
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="1">
          <el-button>{{ level }}</el-button>
        </el-col>

        <el-col :span="1">
          <el-button>{{ status }}</el-button>
        </el-col>

        <el-col :span="2">
          <el-button>{{ status }}</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
  <div class="container2">
    <!-- 分析测点 -->
    <div class="left">
      <analysisPoint />
    </div>

    <!-- 右侧区域 -->
    <div class="right">
      <!-- 右侧第一行 -->
      <div class="row">
        <div class="contrast">右上 - 1</div>
        <div class="chooseTime">右上 - 2</div>
      </div>
      <!-- 右侧第二行 -->
      <div class="row">
        <div class="trendChart">
          <div class="trendInfo">
            <div class="trend">趋势图</div>
            <div class="time">
              <el-date-picker
                v-model="startDate"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="margin-left: 20px; margin-right: 10px"
              ></el-date-picker
              >至
              <el-date-picker
                v-model="endDate"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="margin-left: 10px"
              ></el-date-picker>
              <el-button type="primary" @click="handleDateChange" style="margin-left: 10px">确定</el-button>
            </div>
          </div>
          <div class="chart">
            <trendChart :chartData="chartData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 图表 */
.chart {
  flex: 5;
  display: flex;
  width: 100%;
}
/* 图表上方的信息 */
.trendInfo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;
}
/* “趋势图”字体样式 */
.trend {
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #0d96d1;
  padding: 10px 20px;
  border-radius: 5px;
}
/* 时间选择部分 */
.time {
  display: flex;
  align-items: center;
  gap: 4px;
}
/* 最上方基础信息 */
.input {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #164b6d;
  text-align: center;
}
/* 上方基础信息框架 */
.container1 {
  padding: 10px;
  margin-top: 20px;
  border: 1px solid #164b6d;
  height: 4vh;
  /* background-color: #0d96d1; */
}
/* 下方框架 */
.container2 {
  display: flex;
  height: 85vh;
  margin-top: 10px;
  border: 1px solid #164b6d;
}
/* 下方左侧框架 */
.left {
  flex: 1;
  padding: 16px;
  border: 1px solid #164b6d;
  margin-top: 1px;
  margin-left: 1px;
  margin-bottom: 1px;
}
/* 下方右侧框架 */
.right {
  flex: 4.5;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.row {
  flex: 1;
  display: flex;
  gap: 8px;
}
/* 对比图 */
.contrast {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #164b6d;
  padding: 16px;
}
/* 选择时间 */
.chooseTime {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #164b6d;
  padding: 16px;
}
/* 图表＋基本信息框架 */
.trendChart {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #164b6d;
  padding: 16px;
  margin-top: 10px;
}
</style>
