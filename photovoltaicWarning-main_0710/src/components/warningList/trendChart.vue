<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
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

let globalMinTime = 0
let globalMaxTime = 0

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
      const lines = params.map((item) => {
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
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (val) => val.toFixed(2),
      color: '#fff'
    }
  },
  dataZoom: [
    {
      type: 'slider',
      xAxisIndex: 0,
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

  // 组装 series
  const seriesData = keys.map((key) => {
    return {
      name: key,
      type: 'line',
      showSymbol: false,
      data: props.chartData[key].map((point) => ({ value: point }))
    }
  })

  // 求所有数据点的最小、最大时间戳
  const allTimes = seriesData.flatMap((s) => s.data.map((d) => d.value[0]))
  const minTime = Math.min(...allTimes)
  const maxTime = Math.max(...allTimes)
  globalMinTime = minTime // 存到全局
  globalMaxTime = maxTime

  const totalRange = maxTime - minTime
  if (totalRange <= 0) {
    // 如果只有同一个时间戳，特殊处理
    chartInstance.clear()
    return
  }

  // 默认只显示前 1/5 范围
  const partialEnd = minTime + totalRange / 5

  const option = {
    ...baseOption,
    legend: {
      ...baseOption.legend,
      data: keys
    },
    series: seriesData
  }

  // 这里用 startValue / endValue 设置初始显示的时间范围
  option.dataZoom[0].startValue = minTime
  option.dataZoom[0].endValue = partialEnd

  chartInstance.clear() // 先清空，避免旧数据干扰
  chartInstance.setOption(option, true)

  chartInstance.setOption({
    title: {
      text: `${formatTime(minTime)}-${formatTime(partialEnd)}`
    }
  })
}

// dataZoom 事件处理
function handleDataZoom(params) {
  let { startValue, endValue, start, end } = params
  if (startValue == null || endValue == null) {
    const totalRange = globalMaxTime - globalMinTime

    startValue = globalMinTime + totalRange * (start / 100)
    endValue = globalMinTime + totalRange * (end / 100)
  }

  if (startValue >= endValue) return

  const timeDiff = endValue - startValue

  let formatter
  if (timeDiff <= 60000) {
    // ≤ 1分钟
    formatter = (value) => {
      const d = new Date(value)
      return d.getSeconds() + 's'
    }
  } else if (timeDiff <= 3600000) {
    // ≤ 1小时
    formatter = (value) => {
      const d = new Date(value)
      return `${d.getMinutes()}:${String(d.getSeconds()).padStart(2, '0')}`
    }
  } else if (timeDiff <= 86400000) {
    // ≤ 1天
    formatter = (value) => {
      const d = new Date(value)
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  } else {
    // > 1天
    formatter = (value) => echarts.time.format(value, '{MM}-{dd} {HH}:{mm}', false)
  }

  chartInstance.setOption({
    xAxis: { axisLabel: { formatter } }
  })

  chartInstance.setOption({
    title: {
      text: `${formatTime(startValue)}-${formatTime(endValue)}`
    }
  })
}

// 时间戳转字符串
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (num) => String(num).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}
</script>
