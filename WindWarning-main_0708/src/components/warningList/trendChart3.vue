<template>
  <div ref="domRef" class="trend-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  lines: {
    type: Array,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  }
})

const domRef = ref(null)
let chart = null

function render() {
  if (!domRef.value) return
  if (!chart) chart = echarts.init(domRef.value)

  // 收集所有时间点并去重排序
  const allTimesRaw = []
  props.lines.forEach(line => {
    line.data.forEach(item => allTimesRaw.push(item[0]))
  })
  const uniqueTimes = [...new Set(allTimesRaw)].sort()

  // 生成阈值线数据
  const thresholdData = uniqueTimes.map(time => [time, props.threshold])

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { 
      top: 4, 
      icon: 'rect', 
      textStyle: { color: '#fff' },
      data: [
        ...props.lines.map(l => l.name),
        {
          name: '阈值',
          icon: 'rect',
          itemStyle: { color: 'red' }
        }
      ]
    },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#888' } }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: { lineStyle: { color: '#888' } }
    },
    series: [
      ...props.lines.map(l => ({
        name: l.name,
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: l.data
      })),
      {
        name: '阈值',
        type: 'line',
        showSymbol: false,
        lineStyle: { 
          color: 'red',
          width: 2
        },
        itemStyle: {
          color: 'red'
        },
        symbol: 'none',
        data: thresholdData
      }
    ]
  }

  chart.setOption(option)
  chart.resize()
}

// 监听lines和threshold的变化
watch(
  [() => props.lines, () => props.threshold],
  () => render(),
  { deep: true }
)

onMounted(() => {
  render()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
})
</script>

<style scoped>
.trend-chart {
  width: 97%;
  height: 260px;
}
</style>