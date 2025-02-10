<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as echarts from 'echarts'

// 接收父组件传递的 chartData 数据
const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null) // 引用 chart DOM
let chartInstance = null // 保存 ECharts 实例

// 定义 ECharts 配置项模板
const baseOption = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: []
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value) => {
        return value.toFixed(2)
      }
    }
  },
  series: []
}

// 注册 resize 处理器
const resizeHandler = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 在组件挂载时初始化图表
onMounted(() => {
  nextTick(() => {
    chartInstance = echarts.init(chartRef.value)

    // 获取 xAxis 的数据（假设 xAxis 是所有系列的 datetime 数据）
    const xAxisData = Object.values(props.chartData)[0].map((item) => item.datetime)

    // 获取每个系列的 series 数据
    const seriesData = Object.keys(props.chartData).map((key) => {
      return {
        name: key,
        type: 'line',
        data: props.chartData[key].map((item) => item.value)
      }
    })

    // 动态更新配置项
    const option = {
      ...baseOption,
      legend: {
        data: Object.keys(props.chartData),
        right: '5%',
        top: '5%',
        textStyle: {
          fontSize: 14
        }
      },
      xAxis: {
        data: xAxisData
      },
      series: seriesData
    }

    chartInstance.setOption(option)

    // 手动触发一次 resize
    chartInstance.resize()

    window.addEventListener('resize', resizeHandler)
  })
})

// 在组件卸载时移除事件监听并销毁实例
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  if (chartInstance) {
    chartInstance.dispose() // 销毁 ECharts 实例
  }
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>
