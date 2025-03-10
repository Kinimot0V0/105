<script setup>
import { ref, reactive, onMounted, watch, computed,onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElTree, ElDatePicker } from 'element-plus'

// 图表容器
const chartRef = ref(null)
let chartInstance = null
const resizeObserver = ref(null)

// 时间相关
const currentTime = ref(new Date().toLocaleString())
const defaultTime = ref([new Date(), new Date(Date.now() - 86400000)])
const timeRange = ref([new Date(Date.now() - 86400000), new Date()])

// 树形数据
const treeData = reactive([
{
    id: 'fan1',
    label: '风机1',
    children: [
    {
        id: 'module1',
        label: '模块A',
        children: [
        { id: 'point1', label: '温度' },
        { id: 'point2', label: '振动' },
        { id: 'point3', label: '振动1' }
        ]
    },
    {
        id: 'module2',
        label: '模块b',
        children: [
        { id: 'point1', label: '温度' },
        { id: 'point2', label: '振动' },
        { id: 'point3', label: '振动1' }
        ]
    }
    // 更多模块...
    ]
}
// 更多风机...
])

const defaultProps = {
children: 'children',
label: 'label'
}

// 选中的测点
const selectedPoints = ref([])

// 处理复选框选择
const handleCheck = (node, checked) => {
selectedPoints.value = checked.checkedNodes
    .filter(n => !n.children)
    .map(n => n.id)
}

// 生成模拟数据
const generateData = (pointId) => {
const data = []
const end = Date.now()
const start = end - 86400000 // 24小时

for (let time = start; time <= end; time += 3600000) {
    data.push({
    time,
    value: Math.random() * 100
    })
}
return data
}
// 初始化图表方法（独立抽出）
const initChart = () => {
  if (!chartInstance && chartRef.value) {
    // 确保DOM已渲染
    nextTick(() => {
      chartInstance = echarts.init(chartRef.value)
      chartInstance.setOption(chartOption.value)
      setupResizeObserver() // 初始化尺寸监听
    })
  }
}
// 设置尺寸监听
const setupResizeObserver = () => {
  resizeObserver.value = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.value.observe(chartRef.value)
}

// 图表配置
const chartOption = computed(() => ({
tooltip: {
    trigger: 'axis'
},
xAxis: {
    type: 'time',
    boundaryGap: false
},
yAxis: {
    type: 'value'
},
series: selectedPoints.value.map(pointId => ({
    name: treeData.flatMap(f => f.children)
    .flatMap(m => m.children)
    .find(p => p.id === pointId).label,
    type: 'line',
    showSymbol: false,
    data: generateData(pointId)
}))
}))

// 初始化图表
onMounted(() => {
  // 延迟初始化确保父组件弹窗打开完成
  setTimeout(initChart, 100)
  
  // 保留原有watch逻辑
  watch(chartOption, (newVal) => {
    chartInstance?.setOption(newVal)
  })
})


// 更新时间
setInterval(() => {
currentTime.value = new Date().toLocaleString()
}, 1000)

</script>
<template>
    <div class="container">
      <!-- 顶部基础信息 -->
      <div class="header">
        <h2>设备监测系统</h2>
        <p>当前时间：{{ currentTime }}</p>
      </div>
  
      <!-- 主体内容 -->
      <div class="main">
        <!-- 左侧树形选择 -->
        <div class="left-panel">
          <el-tree
            :data="treeData"
            show-checkbox
            node-key="id"
            :props="defaultProps"
            @check="handleCheck"
            :check-strictly="false"
          />
        </div>
  
        <!-- 右侧图表 -->
        <div class="right-panel">
          <div class="chart-header">
            <el-date-picker
              v-model="timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="defaultTime"
            />
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
</template>
  
<style scoped>
.container {
height: 100vh;
display: flex;
flex-direction: column;
}

.header {
padding: 20px;
border-bottom: 1px solid #eee;
}

.main {
flex: 1;
display: flex;
}

.left-panel {
width: 300px;
padding: 20px;
border-right: 1px solid #eee;
}

.right-panel {
flex: 1;
padding: 20px;
display: flex;
flex-direction: column;
}

.chart-container {
flex: 1;
margin-top: 20px;
}

.chart-header {
display: flex;
justify-content: flex-end;
}
</style>  