<template>
  <!-- 图表 DOM 容器 -->
  <div ref="domRef" class="trend-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  lines: {
    type: Array,
    required: true
  }
})

const domRef = ref(null)      // 图表挂载点
let chart = null              // echarts 实例

function render () {
  if (!domRef.value) return
  if (!chart) chart = echarts.init(domRef.value)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { top: 4, icon: 'rect', textStyle: { color: '#fff' } },
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
    series: props.lines.map(l => ({
      name: l.name,
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: l.data
    }))
  }

  chart.setOption(option)
  chart.resize()
}

onMounted(() => {
  render()
  // 自适应窗口大小
  window.addEventListener('resize', () => chart && chart.resize())
})

watch(
  () => props.lines,
  () => render(),
  { deep: true }
)

onBeforeUnmount(() => {
  chart && chart.dispose()
  chart = null
})
</script>

<style scoped>
.trend-chart {
  width: 97%;
  height: 260px;  
}
</style>
