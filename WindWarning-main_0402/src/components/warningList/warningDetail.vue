<script setup>
import { ref,reactive,onMounted,watch,h } from 'vue'
import trendChart from '@/components/warningList/trendChart.vue'
import scatterChart from '@/components/warningList/scatterChart.vue'
import { ElTree, ElDatePicker } from 'element-plus'
import { getTurbineInfo,getTrendData,getFarmInfo,showPictures } from '@/api/warningDetail'
const props = defineProps({
  turbineId: {
    type: Number,
    default: 1
  },
  warningId: {
    type: Number,
    default: 1
  },
  turbineName: {
    type: String,
    default: ''
  },
  warningDescription: {
    type: String,
    default: ''
  },
  warningLevel: {
    type: Number,
    default: 1
  },
  warningStatus: {
    type: Number,
    default: 1
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
})
const windFarmName=ref(null)
//趋势图数据
const chartData = ref({})
//散点图相关
const scatterData = ref([])
// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)
// 格式化日期为字符串
const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0') +
    ' ' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0') +
    ':' +
    String(d.getSeconds()).padStart(2, '0')
  )
}

// 获取当前时间
const getCurrentTime = () => {
  return new Date()
}

// 获取指定天数前的时间
const getDateBefore = (days) => {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - days)
  return currentDate
}

// 初始化默认时间范围为最近1天
// const initDefaultTimeRange = () => {
//   endDate.value = formatDate(getCurrentTime())
//   startDate.value = formatDate(getDateBefore(1))
// }

// 时间选择器限制
const disabledDate = (time) => {
  // 结束时间不能超过当前时间
  return time > getCurrentTime()
}

// 监听开始时间变化，确保开始时间不超过结束时间
const validateStartDate = (val) => {
  if (endDate.value && new Date(val) > new Date(endDate.value)) {
    ElMessage.error('开始时间不能晚于结束时间')
    startDate.value = null
  }
}

// 监听结束时间变化，确保结束时间不早于开始时间
const validateEndDate = (val) => {
  if (startDate.value && new Date(val) < new Date(startDate.value)) {
    ElMessage.error('结束时间不能早于开始时间')
    endDate.value = null
  }
}


// 选中的测点
const selectedPoints = ref([])

// 树形数据
const treeData = reactive([])

// 风机下测点
const getPointInfo = async () => {
  try {
    const params = { warningId: props.warningId }
    // console.log("getPointInfo_params",params)
    const response = await getTurbineInfo(params)
    // console.log("getPointInfo_返回结果",response)
    const result  = response.data.result
    const paramsFarm = { turbineId: props.turbineId }
    const responseFarm = await getFarmInfo(paramsFarm)
    // console.log("getFarmInfo_返回结果",responseFarm)
    const resultFarm = responseFarm.data.result
    windFarmName.value=resultFarm.windFarmName


    // 清空原有数据
    treeData.splice(0, treeData.length)
    // 构建新数据结构
    treeData.push({
    id: `${props.turbineId}`,
    label: `${windFarmName.value}-${props.turbineName}`,
    children: result.map(module => {
      // 如果该模块下任意一个测点 used === 1，则判定该模块也需要高亮
      const moduleUsed = module.pointList.some(point => point.used === 1)
      return {
        id: `module-${module.moduleId}`,
        label: module.moduleName,
        // 模块的 used
        used: moduleUsed ? 1 : 0,
        children: module.pointList.map(point => ({
          id: point.pointId,
          label: point.pointDescription,
          // 测点的 used，直接用后端返回的值
          used: point.used
        }))
      }
    })
  })
    // treeData.push({
    //   id: `${props.turbineId}`,
    //   label: `${windFarmName.value}-${props.turbineName}`,
    //   children: result.map(module => ({
    //     id: `module-${module.moduleId}`,
    //     label: module.moduleName,
    //     children: module.pointList.map(point => ({
    //       id: point.pointId,
    //       label: point.pointDescription
    //     }))
    //   }))
    // })
  } catch (error) {
    console.error('获取风机测点数据失败:', error)
  }
}
//趋势图数据
const getTrend = async () => {
  try {
    // 收集选中的测点id
    const pointIdList = selectedPoints.value.map(p => Number(p.id))

    // 如果没有勾选测点，chartData 清空，直接返回
    if (!pointIdList.length) {
      chartData.value = {}
      return
    }

    const params = { 
      turbineId: props.turbineId,
      pointIdList,
      startDate:startDate.value,
      endDate:endDate.value
    }
    // console.log("请求参数:", params)
    const response = await getTrendData(params)
    const result = response.data.result || []

    const newChartData = {}
    selectedPoints.value.forEach((point, index) => {
      // point.name 在 handleCheck 时赋值
      const pointData = result[index]?.pointValue || []
      newChartData[point.name] = pointData.map(item => [
        new Date(item.datetime).getTime(),
        parseFloat(item.value.toFixed(2))
      ])
    })

    // 给图表组件
    chartData.value = newChartData

  } catch (error) {
    console.error('获取趋势图数据失败:', error)
  }
}
//散点图数据
const getPictures = async () => {
  try {
    const params = { 
      warningId: props.warningId,
      startTime:  formatDate(new Date(props.startTime)),
      endTime:  formatDate(new Date(props.endTime))
    }
    const response = await showPictures(params)
    scatterData.value = response.data.result.map(item => {
      const [xPoint, yPoint] = item.points
      const dataMap = new Map()
      
      // 处理X轴数据并保存时间
      xPoint.pointValue.forEach(x => {
        dataMap.set(x.datetime, { 
          x: x.value,
          datetime: x.datetime // 保存时间戳
        })
      })
      
      // 处理Y轴数据并合并
      yPoint.pointValue.forEach(y => {
        if (dataMap.has(y.datetime)) {
          const entry = dataMap.get(y.datetime)
          entry.y = y.value
        }
      })

      // 转换数据并判断颜色
      return {
        title: item.picName,
        xName: xPoint.pointDescription,
        yName: yPoint.pointDescription,
        data: Array.from(dataMap.values())
          .filter(d => d.y !== undefined)
          .map(d => {
            const pointTime = new Date(d.datetime)
            const start = new Date(props.startTime)
            const end = new Date(props.endTime)
            const isAlarm = pointTime >= start && pointTime <= end
            
            return {
              value: [
                parseFloat(d.x.toFixed(2)),
                parseFloat(d.y.toFixed(2))
              ],
              itemStyle: {
                color: isAlarm ? 'red' : 'DodgerBlue'
              }
            }
          })
      }
    })
  } catch (error) {
    console.error('获取散点图数据失败:', error)
  }
}



const defaultProps = {
children: 'children',
label: 'label'
}

// 处理复选框选择
const handleCheck = (node, checked) => {
selectedPoints.value = checked.checkedNodes
    .filter(n => !n.children)
    .map(n => ({
      id: n.id,
      name: n.label
    }))
    getTrend()
}

onMounted(() => {
    startDate.value = formatDate(new Date(props.startTime))
    endDate.value = formatDate(new Date(props.endTime))
    getPointInfo()
    getPictures()
})


// 监听开始/结束时间，只要有变化就自动重新获取趋势数据
watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    getTrend()
  }
})

 const setQuickTime = (type) => {
  // 先得到当前时间
  const end = getCurrentTime()
  let start = new Date(end)

  switch (type) {
    case '30min':
      start.setMinutes(start.getMinutes() - 30)
      break
    case '1day':
      start.setDate(start.getDate() - 1)
      break
    case '7day':
      start.setDate(start.getDate() - 7)
      break
  }

  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
}



// 等级映射
const levelMap = ref({
  1: { label: '1级' },
  2: { label: '2级' }
})

// 状态映射
const statusMap = ref({
  0: { label: '未处理', color: 'red' },
  1: { label: '挂起', color: 'yellow' },
  2: { label: '转通知', color: 'green' },
  3: { label: '关闭待确认', color: 'orange' },
  4: { label: '关闭', color: 'white' }
})

const renderNode = (h, { node, data, store }) => {
  return h('span', {
    style: {
      color: data.used === 1 ? 'yellow' : 'inherit'
    }
  }, data.label)
}

</script>
<template>
  <div class="container1">
      <!-- 顶部基础信息 -->
      <div class="info-text">
        <div class="description" style="width: 150px;margin-left: 10px;margin-right: 10px;" :title="props.warningDescription">{{ props.warningDescription }}</div>
        <span class="span-name">场站</span>
        <span class="span-value">{{ windFarmName }}</span>
        <span class="span-name">设备</span>
        <span class="span-value" style="width: 220px;">{{ windFarmName }}-{{ props.turbineName }}</span>
        <span class="span-name">开始时间</span>
        <span class="span-value" style="width: 180px;">{{ props.startTime.replace('T', ' ') }}</span>
        <span class="span-name">结束时间</span>
        <span class="span-value" style="width: 180px;">{{ props.endTime.replace('T', ' ') }}</span>
        <el-button class="buttonLike" style="width: 60px;margin-left: 20px;">{{ levelMap[props.warningLevel]?.label}}</el-button>
        <el-button class="buttonLike" style="width: 100px;">{{ statusMap[props.warningStatus]?.label}}</el-button>
      </div>
  </div>
  <div class="container2">
    <!-- 分析测点 -->
    <div class="left">
      <div class="analysis-title">分析测点</div>
      <el-tree
        :data="treeData"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        @check="handleCheck"
        :check-strictly="false"
        :render-content="renderNode"
      />

      <!-- <div v-if="selectedPoints.length" class="selected-points">
        <h4>已选测点：</h4>
        <ul>
          <li v-for="point in selectedPoints" :key="point.id">
            {{ point.name }}
          </li>
        </ul>
      </div> -->
    </div>

    <!-- 右侧区域 -->
    <div class="right">
      <!-- 右侧第一行：散点图区域 -->
      <div class="row1">
        <div class="otherChart">
          <div v-if="scatterData.length" class="scatter-charts-container">
            <!-- 散点图组件传参方式 -->
            <scatter-chart 
              v-for="(chart, index) in scatterData"
              :key="index"
              :title="chart.title"
              :data="chart.data"
              :x-name="chart.xName"
              :y-name="chart.yName"
            />
          </div>
          <div v-else class="no-data">正在加载散点图数据...</div>
        </div>
      </div>

      <!-- 右侧第二行 -->
      <div class="row2">
        <div class="trendChart">
          <div class="trendInfo">
            <div class="trend">趋势图</div>
            <div class="time">
              <el-date-picker
                v-model="startDate"
                type="datetime"
                placeholder="选择开始时间"
                :clearable="true"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabledDate="disabledDate"
                @change="validateStartDate"
                style="margin-left: 20px; margin-right: 10px;width: 180px;"
              ></el-date-picker
              >至
              <el-date-picker
                v-model="endDate"
                type="datetime"
                placeholder="选择结束时间"
                :clearable="true"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabledDate="disabledDate"
                @change="validateEndDate"
                style="margin-left: 10px;width: 180px;"
              ></el-date-picker>

              <el-button @click="setQuickTime('30min')" style="margin-left: 10px" type="primary">
                最近30分钟
              </el-button>
              <el-button @click="setQuickTime('1day')" type="primary">
                最近1天
              </el-button>
              <el-button @click="setQuickTime('7day')" type="primary">
                最近7天
              </el-button>
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
.info-text {
  display: flex;
  align-items: center;
  position: relative;
}
.info-text::after {
  content: '';
  height: 40px;
  width: 2px;
  background-color: #229ee6;
  margin-left: -1386px;
}
.span-name {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 15px;
  background-color: #1f618e;
  border: 1px solid #1f618e;
  font-size: 15px;
  width: 60px;
  height: 15px;
  padding: 10px;
}
.span-value {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #1f618e;
  font-size: 15px;
  width: 140px;
  height: 15px;
  padding: 10px;
}
.description {
  background: linear-gradient(to bottom, #102842, #15608a);
  width: 140px;
  font-size: 15px;
  padding: 10px;
  color: white;
  border: #164476;
  max-width: 150px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.buttonLike {
  background: linear-gradient(to bottom, #102842, #15608a);
  width: 140px;
  font-size: 15px;
  padding: 15px;
  color: white;
  border: #164476;
}
/* 上方基础信息框架 */
.container1 {
  padding: 10px;
  margin-top: 20px;
  border: 1px solid #164b6d;
  height: 4vh;
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
  max-height: 100%; /* 设置最大高度，避免溢出 */
  overflow-y: auto; /* 添加垂直滚动条 */
}
.analysis-title {
  text-align: left;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 1rem;
  position: relative; /* 确保浮动元素位置正确 */
}
.el-tree {
  background-color: transparent !important;
  color: white;
  font-size: 15px;
}
/* 增大 el-tree 每一行之间的间距 */
::v-deep .el-tree-node {
  margin-bottom: 10px; /* 每一行之间的间距为 10px */
}
/* 覆盖 el-tree 的选中节点样式 */
::v-deep .el-tree-node.is-current > .el-tree-node__content {
  background-color: transparent !important; /* 背景色透明 */
}
/* 覆盖 el-tree 的复选框样式 */
::v-deep .el-tree-node__content:hover {
  background-color: transparent !important; /* 背景色透明 */
}
/* 覆盖 el-tree 的选中节点背景色 */
::v-deep .el-tree-node:focus > .el-tree-node__content {
  background-color: transparent !important; /* 背景色透明 */
}
/* 下方右侧框架 */
/* 右侧区域滚动条 */
.right {
  flex: 4.5;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-width: 0;
  max-height: 100%; /* 允许右侧容器随页面变动，最大高度为100% */
  overflow-y: auto; /* 添加竖向滚动条 */
}

/* 散点图数据区域 */
.row1 {
  flex: 2;
  display: flex;
  flex-wrap: wrap;  /* 允许散点图超出时换行 */
  gap: 8px;
  min-width: 0;
}
.row2 {
  flex: 3;
  display: flex;
  gap: 8px;
  min-width: 0;
}
/* 对比图：散点图父容器 */
.otherChart {
  flex: 1;
  min-width: 0;
  border: 1px solid #164b6d;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 300px; /* 保持默认高度 */
}
/* 散点图容器 */
.scatter-charts-container {
  display: flex;           /* 水平排列 */
  flex-wrap: wrap;         /* 超过一行时换行 */
  gap: 20px;               /* 每个图表之间的间隙 */
  overflow: auto;          /* 添加滚动条 */
  width: 100%;
}
/* 每个散点图的大小保持固定，最多3个一行 */
.scatter-chart {
  width: 30%;  /* 每个散点图的宽度占30% */
  height: 300px; /* 固定高度 */
  flex: 0 0 auto;  /* 保持原有尺寸，不自动缩放 */
}
/* 如果没有数据，保持默认样式 */
.no-data {
  text-align: center;
  color: white;
  padding: 50px 0;
}
/* 增加趋势图的高度和自适应处理 */
.trendChart {
  flex: 1 0 auto;  /* 允许趋势图区域根据需要扩展 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;  /* 确保趋势图放在顶部 */
  border: 1px solid #164b6d;
  padding: 16px;
  margin-top: 10px;
  height: 400px;  /* 给趋势图区域一个固定的最小高度 */
  overflow: hidden; /* 隐藏溢出的内容 */
}
</style>

