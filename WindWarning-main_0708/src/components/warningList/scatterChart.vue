<template>
    <div 
      ref="scatterChart" 
      class="scatter-chart" 
      :style="{ width: width, height: height }"
    ></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
width: {
    type: String,
    default: '350px'
},
height: {
    type: String,
    default: '300px'
},
title: String,
xName: String,
yName: String,
data: Array 
})

let chart = null
const scatterChart = ref(null)


const initChart = () => {
  if (!scatterChart.value) {
    console.error('DOM element not found')
    return
  }
  
  try {
    chart = echarts.init(scatterChart.value)
    const option = {
    title: {
    text: props.title,
    textStyle: {
        color: '#fff'
    },
    left: 'center'
    },
    grid: {
    left: '15%',
    right: '10%',
    bottom: '15%'
    },
    xAxis: {
    name: props.xName,
    nameLocation: 'end',      // 名称在轴末端
      nameGap: 25,              // 调整与轴线的距离
      nameTextStyle: {
        color: '#fff',          // 设置名称颜色
        align: 'right',         // 右对齐
        // padding: [0, 0, 0, -40] // 微调位置
      },
    type: 'value',
    axisLabel: {
        color: '#fff'
    }
    },
    yAxis: {
    name: props.yName,
    nameLocation: 'end',      // 名称在轴末端
      nameGap: 10,              // 调整与轴线的距离
      nameTextStyle: {
        color: '#fff',          // 设置名称颜色
        align: 'right',         // 右对齐
        padding: [0, -50, 0, -40] // 微调位置
      },
    type: 'value',
    axisLabel: {
        color: '#fff'
    }
    },
    series: [{
      type: 'scatter',
      data: props.data, // 直接使用完整数据
      symbolSize: 3,
      large: false,
      // 移除固定颜色配置
    }],
    tooltip: {
    trigger: 'item',
    formatter: params => {
        return `${props.xName}: ${params.value[0].toFixed(2)}<br/>
                ${props.yName}: ${params.value[1].toFixed(2)}`
    }
    }
}
chart.setOption(option)
  } catch (e) {
    console.error('ECharts init error:', e)
  }
}

// 修改挂载逻辑
onMounted(() => {
  nextTick(() => { // 等待DOM更新
    initChart()
  })
})

// 添加resize监听
window.addEventListener('resize', () => {
  if (chart) {
    chart.resize()
  }
})
</script>

<style scoped>
.scatter-chart {
background: rgba(16, 40, 66, 0.8);
margin: 10px;
border-radius: 8px;
padding: 10px;
}
</style>