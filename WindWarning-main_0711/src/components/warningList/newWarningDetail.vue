<script setup>
import { ref,reactive,onMounted,watch,nextTick  } from 'vue'
import trendChart from '@/components/warningList/trendChart.vue'
import trendChart2 from '@/components/warningList/trendChart2.vue'
import trendChart3 from '@/components/warningList/trendChart3.vue'
import scatterChart from '@/components/warningList/scatterChart.vue'
import { ElTree, ElDatePicker } from 'element-plus'
import { getTurbineInfo,getTrendData,getFarmInfo,showPictures } from '@/api/warningDetail'

// 标签页数据
const tabs = ['趋势图或散点图', '分析测点', '比较分析']
const activeTab = ref(0)

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
  },
  standCode: {
    type: String,
    default: ''
  },
  newWarningLevel: {
    type: String,
    default: ''
  },
  standDes: {
    type: String,
    default: ''
  },
  consequence: {
    type: String,
    default: ''
  },
  warningLabel: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    default: ''
  },
  modelId: {
    type: Number,
    default: ''
  },
  algorithmLabel: {
    type: String,
    default: ''
  },
  keyPoint: {
    type: String,
    default: ''
  },
  warningReason: {
    type: String,
    default: ''
  }
})
const windFarmName=ref(null)



//趋势图数据
const chartData = ref({})
//比较分析散点图数据
const pointScatterData =ref({})
//其他图数据
const currentPicType = ref(1)
const scatterData = ref([])
const trendPicData = ref([])
const thresholdPicData = ref([])
// 时间选择相关
const startDate = ref(null)
const endDate = ref(null)
const selectedRange = ref(null) // 默认最近7天高亮

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

// 新增/修改：用于第三个标签页比较所需的 reactive/refs
const compareTreeRef = ref(null)
const selectedComparePoints = ref([])            // 第三页实际选中的比较测点（最多2个）
const compareDefaultCheckedKeys = ref([])       // 第三页默认勾选（根据 used===1 的前两个）
const compareScatterData = ref([])              // 第三页散点图数据（数组 of { value: [x,y], itemStyle } 或 [x,y]）

// 选中的测点
const selectedPoints = ref([])

// 树形数据
const treeData = reactive([])
const defaultCheckedKeys = ref([])
const defaultExpandedKeys = ref([])

// // 风机下测点
// const getPointInfo = async () => {
//   try {
//     const params = { warningId: props.warningId };
//     const response = await getTurbineInfo(params);
//     const result = response.data.result;
//     const paramsFarm = { turbineId: props.turbineId };
//     const responseFarm = await getFarmInfo(paramsFarm);
//     const resultFarm = responseFarm.data.result;
//     windFarmName.value = resultFarm.windFarmName;

//     // 清空原有数据并构建新数据结构
//     treeData.splice(0, treeData.length);
//     treeData.push({
//       id: `${props.turbineId}`,
//       label: `${windFarmName.value}-${props.turbineName}`,
//       children: result.map(module => {
//         const moduleUsed = module.pointList.some(point => point.used === 1);
//         return {
//           id: `module-${module.moduleId}`,
//           label: module.moduleName,
//           used: moduleUsed ? 1 : 0,
//           children: module.pointList.map(point => ({
//             // 修改测点ID为 moduleId + pointId 组合，确保唯一性
//             id: `${module.moduleId}-${point.pointId}`,
//             label: point.pointDescription,
//             used: point.used
//           }))
//         };
//       })
//     });

//     // 计算默认选中测点和展开模块
//     const selectedPointIds = [];
//     const expandedModuleIds = [];
    
//     treeData[0].children.forEach(module => {
//       const usedPoints = module.children.filter(point => point.used === 1);
//       if (usedPoints.length > 0) {
//         const count = Math.max(1, Math.ceil(usedPoints.length / 3));
//         const selected = usedPoints.slice(0, count);
//         selectedPointIds.push(...selected.map(p => p.id)); // 存储组合后的唯一ID
//         expandedModuleIds.push(module.id);
//       }
//     });

//     // 设置默认选中和展开的keys
//     defaultCheckedKeys.value = selectedPointIds;
//     defaultExpandedKeys.value = expandedModuleIds;

//     // 更新选中测点列表（由于ID已唯一，直接查找即可）
//     selectedPoints.value = selectedPointIds.map(id => {
//       let point;
//       treeData[0].children.forEach(module => {
//         const found = module.children.find(p => p.id === id);
//         if (found) point = found;
//       });
//       return { id: point.id, name: point.label };
//     });

//     nextTick(() => {
//       getTrend();
//     });

//   } catch (error) {
//     console.error('获取风机测点数据失败:', error);
//   }
// }

// 修改 getPointInfo：确保第三页默认取 “标黄（used===1）” 的前两个测点
const getPointInfo = async () => {
  try {
    const params = { warningId: props.warningId };
    const response = await getTurbineInfo(params);
    const result = response.data.result;
    const paramsFarm = { turbineId: props.turbineId };
    const responseFarm = await getFarmInfo(paramsFarm);
    const resultFarm = responseFarm.data.result;
    windFarmName.value = resultFarm.windFarmName;

    // 清空原有数据并构建新数据结构
    treeData.splice(0, treeData.length);
    treeData.push({
      id: `${props.turbineId}`,
      label: `${windFarmName.value}-${props.turbineName}`,
      children: result.map(module => {
        const moduleUsed = module.pointList.some(point => point.used === 1);
        return {
          id: `module-${module.moduleId}`,
          label: module.moduleName,
          used: moduleUsed ? 1 : 0,
          children: module.pointList.map(point => ({
            id: `${module.moduleId}-${point.pointId}`, // 保持唯一
            label: point.pointDescription,
            used: point.used,
            rawPointId: point.pointId
          }))
        };
      })
    });

    // 计算默认选中测点和展开模块（第二页的默认选中逻辑）
    const selectedPointIds = [];
    const expandedModuleIds = [];

    treeData[0].children.forEach(module => {
      const usedPoints = module.children.filter(point => point.used === 1);
      if (usedPoints.length > 0) {
        const count = Math.max(1, Math.ceil(usedPoints.length / 3));
        const selected = usedPoints.slice(0, count);
        selectedPointIds.push(...selected.map(p => p.id));
        expandedModuleIds.push(module.id);
      }
    });

    // 设置第二页默认选中和展开
    defaultCheckedKeys.value = selectedPointIds;
    defaultExpandedKeys.value = expandedModuleIds;

    // 第三页默认选中：取 treeData 中 used===1 的前两个测点（按出现顺序）
    const yellowPoints = []
    treeData[0].children.forEach(module => {
      module.children.forEach(pt => {
        if (pt.used === 1 && yellowPoints.length < 2) {
          yellowPoints.push({ id: pt.id, name: pt.label, rawPointId: pt.rawPointId })
        }
      })
    })
    compareDefaultCheckedKeys.value = yellowPoints.map(p => p.id)
    // 把默认比较选点也写入 selectedComparePoints（用于初始渲染）
    selectedComparePoints.value = yellowPoints.map(p => ({ id: p.id, name: p.name }))

    // 更新第二页 selectedPoints（保持原逻辑）
    selectedPoints.value = selectedPointIds.map(id => {
      let point;
      treeData[0].children.forEach(module => {
        const found = module.children.find(p => p.id === id);
        if (found) point = found;
      });
      return { id: point.id, name: point.label };
    });

    nextTick(() => {
      getTrend();
      // 初始时也渲染第三页对比图（如果默认有两个点）
      if (selectedComparePoints.value.length === 2) {
        // 确保 tree 的选中状态在 DOM 渲染后被设置
        nextTick(() => {
          if (compareTreeRef.value && compareTreeRef.value.setCheckedKeys) {
            compareTreeRef.value.setCheckedKeys(compareDefaultCheckedKeys.value)
          }
        })
        getCompareScatter()
      }
    });

  } catch (error) {
    console.error('获取风机测点数据失败:', error);
  }
}

// 第三个标签页：处理选择（最多2个）
const handleCompareCheck = (node, checked) => {
  // checked.checkedNodes 为当前所有勾选节点
  const checkedPoints = (checked && checked.checkedNodes ? checked.checkedNodes : [])
    .filter(n => !n.children)
    .map(n => ({ id: n.id, name: n.label }))

  if (checkedPoints.length > 2) {
    ElMessage.warning('最多可选择2个测点用于对比')
    const keep = checkedPoints.slice(0, 2)
    const keepIds = keep.map(p => p.id)
    // 使用 tree 组件方法恢复只保留前两个
    nextTick(() => {
      if (compareTreeRef.value && compareTreeRef.value.setCheckedKeys) {
        compareTreeRef.value.setCheckedKeys(keepIds)
      }
      selectedComparePoints.value = keep
      getCompareScatter()
    })
    return
  }

  selectedComparePoints.value = checkedPoints
  if (selectedComparePoints.value.length === 2) {
    getCompareScatter()
  } else {
    compareScatterData.value = []
  }
}

// 获取对比散点图数据，按 datetime 对齐（更健壮的实现）
const getCompareScatter = async () => {
  try {
    if (selectedComparePoints.value.length < 2) {
      compareScatterData.value = []
      return
    }

    // 提取两个点的原始 pointId（组合 id 格式 moduleId-pointId）
    const pointIdList = selectedComparePoints.value.map(p => {
      const parts = p.id.split('-')
      return parseInt(parts[1])
    })

    const params = {
      turbineId: props.turbineId,
      pointIdList,
      startDate: startDate.value,
      endDate: endDate.value
    }

    const response = await getTrendData(params)
    const result = response.data.result || []

    if (!result || result.length < 2) {
      compareScatterData.value = []
      return
    }

    // 将返回按 pointId 建立 map（避免顺序不一致问题）
    const resultByPointId = new Map()
    result.forEach(item => {
      // 兼容：有些接口返回 item.pointId 或 item.pointId 中包含 pointId
      const pid = item.pointId ?? item.pointId
      // 如果接口没有提供 pointId，则按请求顺序 fallback（不常见）
      const key = pid ?? null
      resultByPointId.set(key, item)
    })

    // 尝试按请求顺序取到两个数据源（优先使用 pointId 匹配）
    const a = resultByPointId.get(pointIdList[0]) ?? result[0]
    const b = resultByPointId.get(pointIdList[1]) ?? result[1]

    const aValues = (a.pointValue || []).map(p => ({ datetime: p.datetime, value: Number(Number(p.value).toFixed(2)) }))
    const bValues = (b.pointValue || []).map(p => ({ datetime: p.datetime, value: Number(Number(p.value).toFixed(2)) }))

    // 用 Map 以 datetime 为 key 对齐
    const map = new Map()
    aValues.forEach(x => { map.set(x.datetime, { x: x.value, datetime: x.datetime }) })
    bValues.forEach(y => {
      if (map.has(y.datetime)) {
        map.get(y.datetime).y = y.value
      }
    })

    // 生成图表数据，过滤没有 y 的项
    const startAlarm = new Date(props.startTime)
    const endAlarm = new Date(props.endTime)

    const arr = Array.from(map.values())
      .filter(d => d.y !== undefined)
      .map(d => {
        const isAlarm = new Date(d.datetime) >= startAlarm && new Date(d.datetime) <= endAlarm
        return {
          value: [d.x, d.y],
          itemStyle: { color: isAlarm ? 'red' : 'DodgerBlue' }
        }
      })

    compareScatterData.value = arr

  } catch (err) {
    console.error('获取对比散点数据失败:', err)
    compareScatterData.value = []
  }
}

//趋势图数据
const getTrend = async () => {
  try {
    // 收集选中的测点id（需解析组合ID）
    const pointIdList = selectedPoints.value.map(p => {
      // 拆分组合ID为 [moduleId, pointId]
      const parts = p.id.split('-')
      return parseInt(parts[1]) // 提取原始 pointId
    })

    // 如果没有勾选测点，chartData 清空，直接返回
    if (!pointIdList.length) {
      chartData.value = {}
      return
    }

    const params = { 
      turbineId: props.turbineId,
      pointIdList,
      startDate: startDate.value,
      endDate: endDate.value
    }
    const response = await getTrendData(params)
    const result = response.data.result || []

    const newChartData = {}
    selectedPoints.value.forEach((point, index) => {
      const pointData = result[index]?.pointValue || []
      newChartData[point.name] = pointData.map(item => [
        new Date(item.datetime).getTime(),
        parseFloat(item.value.toFixed(2))
      ])
    })

    chartData.value = newChartData

  } catch (error) {
    console.error('获取趋势图数据失败:', error)
  }
}
//其他图数据
const getPictures = async () => {
  try {
    const params = {
      warningId: props.warningId,
      startTime: formatDate(new Date(props.startTime)),
      endTime: formatDate(new Date(props.endTime))
    }
    const { data } = await showPictures(params)
    // console.log("showPictures返回:",data)
    const result = data.result

    if (!result.length) {
      scatterData.value = []
      trendPicData.value = []
      thresholdPicData.value = []
      return
    }

    //记录当前图类型
    currentPicType.value = result[0].picType

    //按类型整理数据
    switch (currentPicType.value) {
      case 1: // ===== 散点图 =====
        scatterData.value = result.map(item => {
          //边界检查，当数据少于2组时画空图
          if (!item.points || item.points.length < 2) {
           return {
             title: item.picName,
             xName: '',
             yName: '',
             data: []
            }
          }
          const [xPoint, yPoint] = item.points
          const map = new Map()
          xPoint.pointValue.forEach(x =>
            map.set(x.datetime, { x: x.value, datetime: x.datetime })
          )
          yPoint.pointValue.forEach(y => {
            if (map.has(y.datetime)) map.get(y.datetime).y = y.value
          })
          return {
            title: item.picName,
            xName: xPoint.pointDescription,
            yName: yPoint.pointDescription,
            data: Array.from(map.values())
              .filter(d => d.y !== undefined)
              .map(d => {
                const isAlarm =
                  new Date(d.datetime) >= new Date(props.startTime) &&
                  new Date(d.datetime) <= new Date(props.endTime)
                return {
                  value: [Number(d.x.toFixed(2)), Number(d.y.toFixed(2))],
                  itemStyle: { color: isAlarm ? 'red' : 'DodgerBlue' }
                }
              })
          }
        })
        break

        // case 1: // ===== 散点图（双指针优化） =====
        // // 预先创建开始时间和结束时间的 Date 对象
        // const startTimeObj = new Date(props.startTime);
        // const endTimeObj = new Date(props.endTime);
      
        // scatterData.value = result.map(item => {
        //   // 增加边界检查，确保 points 存在且至少包含两个数据点
        //   if (!item.points || item.points.length < 2) {
        //     return {
        //       title: item.picName,
        //       xName: '',
        //       yName: '',
        //       data: []
        //     };
        //   }
      
        //   const [xPoint, yPoint] = item.points;
        //   const xValues = xPoint.pointValue;
        //   const yValues = yPoint.pointValue;
        //   let i = 0;
        //   let j = 0;
        //   const mergedData = [];
      
        //   // 使用双指针方法合并 x 和 y 轴的数据点
        //   while (i < xValues.length && j < yValues.length) {
        //     const xDatetime = xValues[i].datetime;
        //     const yDatetime = yValues[j].datetime;
      
        //     if (xDatetime === yDatetime) {
        //       mergedData.push({
        //         x: Number(xValues[i].value.toFixed(2)),
        //         y: Number(yValues[j].value.toFixed(2)),
        //         datetime: xDatetime
        //       });
        //       i++;
        //       j++;
        //     } else if (xDatetime < yDatetime) {
        //       i++;
        //     } else {
        //       j++;
        //     }
        //   }
      
        //   // 过滤掉没有 y 值的数据点，然后映射为图表所需格式
        //   const filteredData = mergedData
        //       .filter(d => d.y !== undefined) // 只保留同时有 x 和 y 值的数据点
        //       .map(d => {
        //         // 判断该数据点是否在告警时间范围内
        //         const isAlarm = new Date(d.datetime) >= startTimeObj && new Date(d.datetime) <= endTimeObj;
      
        //         // 返回图表所需的数据格式
        //         return {
        //           value: [d.x, d.y],
        //           itemStyle: { color: isAlarm ? 'red' : 'DodgerBlue' }
        //         };
        //       });
      
        //   // 返回当前图表的完整配置
        //   return {
        //     title: item.picName,              // 图表标题
        //     xName: xPoint.pointDescription,   // x轴名称
        //     yName: yPoint.pointDescription,   // y轴名称
        //     data: filteredData                // 处理后的数据点
        //   };
        // });
        // break;

      case 2: // ===== 趋势图（不含阈值）=====
        trendPicData.value = result.map(pic => ({
            title: pic.picName,
            lines: pic.points.map(pt => ({
              name: pt.pointDescription,
              data: pt.pointValue.map(pv => [
                new Date(pv.datetime).getTime(),
                Number(pv.value.toFixed(2))
              ])
            }))
          }))
        break

      case 3: // ===== 趋势图 + 阈值 =====
        thresholdPicData.value = result.map(pic => ({
            title: pic.picName,
            threshold: Number(pic.threshold.toFixed(2)),
            lines: pic.points.map(pt => ({
              name: pt.pointDescription,
              data: pt.pointValue.map(pv => [
                new Date(pv.datetime).getTime(),
                Number(pv.value.toFixed(2))
              ])
            }))
          }))
        break
    }
  } catch (err) {
    console.error('获取图表数据失败:', err)
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
    if (selectedComparePoints.value.length === 2) {
      getCompareScatter()
    }
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
  selectedRange.value = type
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

const handleTabChange = (newTab) => {
  activeTab.value = newTab
}

onMounted(() => {
  window.addEventListener('resize', () => {
    // 图表组件会自动处理 resize 事件
  })
})

</script>
<template>
  <div class="warning-detail-container">
    <div class="summary-section">
          <!-- 顶部基础信息（竖向排列） -->
          <div class="info-grid">
            <el-descriptions :column="2" border >
              <el-descriptions-item label="预警信息">{{ props.warningDescription.replace(/[\[\]']+/g, '')}}_{{ props.standCode }}_{{ props.algorithmLabel }}</el-descriptions-item>
              <el-descriptions-item label="风机名称">{{ windFarmName }}-{{ props.turbineName }}</el-descriptions-item>
              <el-descriptions-item label="预警状态">
                <span
                  :style="{
                      color: statusMap[props.warningStatus]?.color || 'black'
                  }"
                  >
                 {{ statusMap[props.warningStatus]?.label || '未处理' }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="管理分级">{{ props.newWarningLevel }}</el-descriptions-item>
              <!-- <el-descriptions-item label="故障编码">{{ props.standCode }}</el-descriptions-item> -->
              <el-descriptions-item label="所属设备">{{ props.standDes }}</el-descriptions-item>
              <el-descriptions-item label="可能影响后果">{{ props.consequence }}</el-descriptions-item>
              <el-descriptions-item label="缺陷分类">{{ props.warningLabel }}</el-descriptions-item>
              <el-descriptions-item label="维修优先级">{{ props.priority }}</el-descriptions-item>
              <el-descriptions-item label="开始时间——结束时间">{{ props.startTime.replace('T', ' ') }} —— {{ props.endTime.replace('T',' ') }}</el-descriptions-item>
              <!-- <el-descriptions-item label="结束时间">{{ props.endTime.replace('T', ' ') }}</el-descriptions-item> -->
              <el-descriptions-item label="关键测点">{{ props.keyPoint }}</el-descriptions-item>
              <el-descriptions-item label="预警原因">{{ props.warningReason }}</el-descriptions-item>
            </el-descriptions>
            <!-- <div class="info-row">
              <span class="info-label">预警信息</span>
              <span class="info-value">{{ props.warningDescription }}</span>
              <span class="info-label">预警设备</span>
              <span class="info-value">{{ windFarmName }}-{{ props.turbineName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">预警等级</span>
              <span class="info-value">
                <el-tag type="danger">{{ levelMap[props.warningLevel]?.label}}</el-tag>
              </span>
              <span class="info-label">预警状态</span>
              <span class="info-value">
                <el-tag type="danger">{{ statusMap[props.warningStatus]?.label}}</el-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">预警管理等级</span>
              <span class="info-value">模板：二类缺陷（4级）</span>
              <span class="info-label">预警编码标准分类</span>
              <span class="info-value">模板：MDY05(电气传动链-变流器控制及附属系统-电网)</span>
            </div>
            <div class="info-row">
              <span class="info-label">开始时间</span>
              <span class="info-value">{{ props.startTime.replace('T', ' ') }}</span>
              <span class="info-label">结束时间</span>
              <span class="info-value">{{ props.endTime.replace('T', ' ') }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">关键测点</span>
              <span class="info-value">模板：‘风速’、‘有功功率’</span>
              <span class="info-label">预警原因</span>
              <span class="info-value">模板：风速-功率数据点偏离正常区间范围，SCADA控制导致的降容</span>
            </div> -->
          </div>
        </div>
    <!-- 顶部标签页 -->
    <div class="tab-header">
      <div
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab-item', activeTab === index ? 'active' : '']"
          @click="activeTab = index"
      >
        {{ tab }}
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 第一个标签页：概要 -->
      <div v-show="activeTab === 0" class="tab-pane">
      

        <!-- 图表区域 -->
        <div class="charts-section">
          <!-- 散点图 -->
          <template v-if="currentPicType === 1">
            <div v-if="scatterData.length" class="charts-container">
              <scatterChart
                  v-for="(chart, idx) in scatterData"
                  :key="idx"
                  :title="chart.title"
                  :data="chart.data"
                  :x-name="chart.xName"
                  :y-name="chart.yName"
                  class="scatter-chart"
              />
            </div>
            <div v-else class="no-data">正在加载图表数据...</div>
          </template>

          <!-- 趋势图（无阈值）-->
          <template v-if="currentPicType === 2">
            <div v-if="trendPicData.length" class="trend-scroll">
              <!-- 一张图占一行，超出就滚动 -->
              <div
                  v-for="(chart, idx) in trendPicData"
                  :key="idx"
                  class="trend-wrapper"
              >
                <div class="chart-title">{{ chart.title }}</div>
                <trendChart2 :lines="chart.lines" />
              </div>
            </div>
            <div v-else class="no-data">正在加载图表数据...</div>
          </template>

          <!-- 趋势图 + 阈值 -->
          <template v-if="currentPicType === 3">
            <div v-if="thresholdPicData.length" class="trend-scroll">
              <!-- 一张图占一行，超出就滚动 -->
              <div
                  v-for="(chart, idx) in thresholdPicData"
                  :key="idx"
                  class="trend-wrapper"
              >
                <div class="chart-title">{{ chart.title }}</div>
                <trendChart3 :lines="chart.lines" :threshold="chart.threshold" />
              </div>
            </div>
            <div v-else class="no-data">正在加载图表数据...</div>
          </template>
        </div>
      </div>

      <!-- 第二个标签页：分析测点 -->
      <div v-if="activeTab === 1" class="tab-pane">
        <div class="analysis-section">
          <!-- 左侧分析测点 -->
          <div class="left-panel">
            <div class="analysis-title">分析测点</div>
            <div class="tree-container">
              <el-tree
                  :data="treeData"
                  show-checkbox
                  node-key="id"
                  :props="defaultProps"
                  @check="handleCheck"
                  :check-strictly="false"
                  :render-content="renderNode"
                  :default-checked-keys="defaultCheckedKeys"
                  :default-expanded-keys="defaultExpandedKeys"
              />
            </div>
          </div>

          <!-- 右侧趋势图 -->
          <div class="right-panel">
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

                  <el-button :class="{ active: selectedRange === '30min' }"  @click="setQuickTime('30min')" style="margin-left: 10px" type="primary">
                    最近30分钟
                  </el-button>
                  <el-button :class="{ active: selectedRange === '1day' }"  @click="setQuickTime('1day')" type="primary">
                    最近1天
                  </el-button>
                  <el-button :class="{ active: selectedRange === '7day' }" @click="setQuickTime('7day')" type="primary">
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

      <!-- 第三个标签页：比较分析 -->
      <div v-if="activeTab === 2" class="tab-pane">
        <div class="comparison-section">
          <!-- 左侧测点 -->
          <div class="left-panel">
            <div class="analysis-title">测点选择</div>
            <div class="tree-container">
              <el-tree
                  ref="compareTreeRef"
                  :data="treeData"
                  show-checkbox
                  node-key="id"
                  :props="defaultProps"
                  @check="handleCompareCheck"
                  :check-strictly="false"
                  :render-content="renderNode"
                  :default-checked-keys="compareDefaultCheckedKeys"
                  :default-expanded-keys="defaultExpandedKeys"
              />
            </div>
            <!-- <div class="tree-container">
              <el-tree
                  :data="treeData"
                  show-checkbox
                  node-key="id"
                  :props="defaultProps"
                  :default-checked-keys="defaultCheckedKeys"
                  :default-expanded-keys="defaultExpandedKeys"
                  @check="handleCheck"
              >
                <template #default="{ node, data }">
                  <span :style="{ color: data.used === 1 ? 'yellow' : 'white' }">
                    {{ data.label }}
                  </span>
                </template>
              </el-tree>
            </div> -->
          </div>

          <!-- 对比散点图 -->
          <div class="right-panel">
            <div class="comparison-info">
            <div class="comparison-scatter">散点图绘制</div>
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

                <el-button :class="{ active: selectedRange === '30min' }" @click="setQuickTime('30min')" style="margin-left: 10px" type="primary">
                  最近30分钟
                </el-button>
                <el-button :class="{ active: selectedRange === '1day' }" @click="setQuickTime('1day')" type="primary">
                  最近1天
                </el-button>
                <el-button :class="{ active: selectedRange === '7day' }" @click="setQuickTime('7day')" type="primary">
                  最近7天
                </el-button>
              </div>
            <div v-if="selectedComparePoints.length === 2 && compareScatterData.length">
              <scatter-chart
                  :width="'100%'"
                  :height="'480px'"
                  title="测点对比散点图"
                  :x-name="selectedComparePoints[0]?.name || '测点1'"
                  :y-name="selectedComparePoints[1]?.name || '测点2'"
                  :data="compareScatterData"
              />
            </div>
            <div v-else class="no-data">请选择两个测点并确保有重合时间点以绘制散点图</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.comparison-scatter {
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #0d96d1;
  padding: 10px 20px;
  border-radius: 5px;
  width: 90px;
}
.time .active {
  background-color: #f6c555 !important; /* 黄色 */
  border-color: #f6c555 !important;
  color: #000 !important;
}
.el-descriptions {
  --el-descriptions-item-bordered-label-background: transparent;
  --el-descriptions-table-border: 1px solid #164b6d;
  
}

:deep(.el-descriptions__body){
  background-color: transparent;
}

:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label){
  color: #0d96d1;
}

:deep(.el-descriptions__content.el-descriptions__cell.is-bordered-content){
  color:#fff
}

.warning-detail-container {
  background-color: #0a1a2a;
  color: white;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 标签页样式 */
.tab-header {
  display: flex;
  border-bottom: 2px solid #164b6d;
  margin-bottom: 20px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  background-color: #143f5c;
  border: 1px solid #164b6d;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  margin-right: 5px;
}

.tab-item.active {
  background-color: #0d96d1;
  font-weight: bold;
}

.tab-content {
  height: calc(100% - 60px);
  overflow-y: auto;
  overflow: hidden;
}

.tab-pane {
  height: 100%;
}

/* 概要页面样式 */
.summary-section {
  margin-bottom: 20px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0px;
  background: linear-gradient(to bottom, #102842, #15608a);
  border: 1px solid #164b6d;
  border-radius: 5px;
  
}

.info-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #164b6d;
  height: 45px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  margin-left: 30px;
  width: 200px;
  font-weight: bold;
  color: #0d96d1;
}

.info-value {
  flex: 1;
  padding-left: 15px;
  background-color: #0a1a2a;
  height: 100%;
  line-height: 300%;
}

.charts-section {
  height: calc(100% - 250px);
}

/* 分析测点页面样式 */
.analysis-section {
  display: flex;
  height: calc(100% - 40px);
  gap: 20px;
  overflow: scroll;
}

.left-panel {
  flex: 1;
  background: rgba(16, 40, 66, 0.8);
  border: 1px solid #164b6d;
  border-radius: 5px;
  padding: 15px;
  overflow-y: auto;
  min-height: 400px;
}
.right-panel {
  flex: 3;
  background: rgba(16, 40, 66, 0.8);
  border: 1px solid #164b6d;
  border-radius: 5px;
  padding: 15px;
  min-height: 400px;
}

.comparison-section {
  display: flex;
  height: calc(100% - 40px);
  gap: 20px;
  overflow: scroll;
}
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
.charts-container {
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
/* 其他趋势图 */
.trend-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;      /* 超过容器高度就滚动 */
  height: 100%;
}
.trend-wrapper {
  width: 97%;
  border: 1px solid #164b6d;
  padding: 12px;
  background: rgba(16, 40, 66, 0.8);
}
.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
  color: #fff;
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