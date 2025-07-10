<script setup>
const props = defineProps({
  deviceList: {
    type: Array,
    default: () => []
  }
})

// 提取名称末尾段落
const extractLastName = (fullName) => {
  const parts = fullName.split('-')
  return parts[parts.length - 1]
}
</script>

<template>
  <div class="top">
    <span class="custom-span"> 光伏预警矩阵 </span>
  </div>
  <div class="container">
    <div 
      class="station-block" 
      v-for="(station, sIdx) in deviceList" 
      :key="sIdx"
    >
      <!-- 场站名称 -->
      <h3 class="station-title">{{ station.pvFarmName }}</h3>

      <!-- 三层结构 -->
      <template v-if="station.pvFarmType === 0">
        <div 
          class="device-block" 
          v-for="(device, dIdx) in station.devices" 
          :key="dIdx"
        >
          <div
            class="main-box"
            v-if="device.innerDeviceInfoList.length"
          >
            {{ device.boxTrans.boxName }} - {{ extractLastName(device.innerDeviceInfoList[0].inverter.inverterName) }}
          </div>

          <!-- 汇流箱组 -->
          <div 
            class="small-box-group"
            v-for="(info, iIdx) in device.innerDeviceInfoList"
            :key="iIdx"
          >
            <div 
              class="small-box" 
              v-for="(cb, cIdx) in info.combinerBoxList" 
              :key="cIdx"
            >
              {{ extractLastName(cb.combinerBoxName) }}
            </div>
          </div>
        </div>
      </template>

      <!-- 两层结构 -->
      <template v-else-if="station.pvFarmType === 1">
        <div 
          class="device-block" 
          v-for="(device, dIdx) in station.devices" 
          :key="dIdx"
        >
          <div class="main-box">{{ device.boxTrans.boxName }}</div>
          <div class="small-box-group">
            <div 
              class="small-box" 
              v-for="(info, iIdx) in device.innerDeviceInfoList" 
              :key="iIdx"
            >
              {{ extractLastName(info.inverter.inverterName) }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  height: 50px;
}

.custom-span {
  display: inline-flex;
  align-items: center;
  background-color: #164476;
  color: white;
  padding: 5px 10px;
  font-size: 17px;
  border-radius: 5px;
  position: relative;
  font-weight: bold;
}

.container {
  display: flex;
  flex-direction: column; /* ← 加这一行，让内容垂直排列 */
  gap: 30px; 
  margin-left: 20px;     
  margin-right: 20px; 
  margin-bottom: 20px;          /* 可选：让上下场站有间距 */
}


/* 垂直排列每个场站 */
.station-block {
  display: block;         /* 让每个场站块是块级元素 */
  width: 100%;            /* 占满整行 */
  margin-bottom: 40px;
  /* border-bottom: 1px solid #ccc; */
}


/* 场站标题 */
.station-title {
  font-size: 20px;
  font-weight: bold;
  background-color: #164476;
  padding: 8px 12px;
  border-radius: 5px;
  display: inline-block;
  margin-bottom: 12px;
}

/* 每个箱变 + 内容块 */
.device-block {
  margin-bottom: 20px;
}

/* 主块（绿色） */
.main-box {
  background-color: #1f5b4c;
  color: #fff;
  padding: 8px 12px;
  margin-bottom: 10px;
  border: 1px solid #39a58a;
  border-radius: 5px;
  display: inline-block;
  font-weight: bold;
}

.small-box-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.small-box {
  background-color: #20667f;
  color: #fff;
  padding: 6px 0;
  border-radius: 4px;
  border: 1px solid #0a85d9;
  font-size: 14px;
  text-align: center;
  flex: 0 0 calc((100% - 14 * 6px) / 9); /* 一行 15 个块，每个之间 6px */
  box-sizing: border-box;
}

</style>
