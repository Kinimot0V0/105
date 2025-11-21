<template>
  <div ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const baseOption = {
  title: {
    text: ' ',
    left: '1%',
    top: '3%',
    textStyle: {
      color: '#fff',
      fontSize: 14
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      if (!params || !params.length) return ''
      // 取到第一个点的时间戳
      const [timestamp] = params[0].value
      const dateStr = new Date(timestamp).toLocaleString()

      // 每条曲线的名称和数值
      const lines = params.map(item => {
        const [t, val] = item.value
        return `${item.marker} ${item.seriesName}: ${val.toFixed(2)}`
      })

      return `${dateStr}<br/>${lines.join('<br/>')}`
    }
  },
  legend: {
    top: '5%',
    right: '5%',
    textStyle: {
      color: '#fff',
      fontSize: 15
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '80px',
    containLabel: true
  },
  xAxis: {
    type: 'time',
    boundaryGap: false,
    axisLabel: {
      color: '#fff'
    }
  },
  yAxis: [
    {
      type: 'value',
      axisLabel: {
        formatter: (val) => val.toFixed(2),
        color: '#fff'
      },
      name: '',
      nameTextStyle: {
        color: '#fff'
      }
    },
    {
      type: 'value',
      axisLabel: {
        formatter: (val) => val.toFixed(2),
        color: '#fff'
      },
      name: '',
      nameTextStyle: {
        color: '#fff'
      }
    }
  ],
  dataZoom: [
    {
      type: 'slider',
      xAxisIndex: [0],
      bottom: 20,
      height: 30,
      handleSize: 20,
      showDetail: false
    }
  ],
  series: []
}

onMounted(() => {
  nextTick(() => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    renderChart() // 首次渲染

    // 监听缩放事件（拖动滚动条）
    chartInstance.on('datazoom', handleDataZoom)

    // 窗口大小变化
    window.addEventListener('resize', resizeHandler)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})

function resizeHandler() {
  chartInstance?.resize()
}

watch(
  () => props.chartData,
  () => {
    renderChart()
  },
  { deep: true }
)

function renderChart() {
  if (!chartInstance) return

  const keys = Object.keys(props.chartData)
  if (!keys.length) {
    chartInstance.clear()
    return
  }

  // 设置Y轴名称
  const yAxisNames = keys.slice(0, 2) // 只取前两个作为Y轴名称
  
  // 组装 series
  const seriesData = keys.slice(0, 2).map((key, index) => {
    return {
      name: key,
      type: 'line',
      showSymbol: false,
      yAxisIndex: index, // 分别对应左右两个Y轴
      data: props.chartData[key].map(point => ({ value: point }))
    }
  })

  // 求所有数据点的最小、最大时间戳
  const allTimes = seriesData.flatMap(s => s.data.map(d => d.value[0]))
  const minTime = Math.min(...allTimes)
  const maxTime = Math.max(...allTimes)
  
  globalMinTime = minTime
  globalMaxTime = maxTime

  const option = {
    ...baseOption,
    yAxis: [
      {
        ...baseOption.yAxis[0],
        name: yAxisNames[0] || ''
      },
      {
        ...baseOption.yAxis[1],
        name: yAxisNames[1] || ''
      }
    ],
    series: seriesData,
    xAxis: {
      ...baseOption.xAxis,
      min: minTime,
      max: maxTime
    }
  }

  chartInstance.setOption(option, true)
}

// 处理缩放事件
function handleDataZoom(params) {
  const { startValue, endValue } = params.batch[0]

  // 更新全局时间范围
  globalMinTime = startValue
  globalMaxTime = endValue

  // 触发更新
  renderChart()
}

// 全局时间范围变量
let globalMinTime = 0
let globalMaxTime = 0
</script>

<style scoped>
</style>