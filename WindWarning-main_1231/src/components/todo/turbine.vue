<script setup>
import { reactive } from 'vue'
import { House } from '@element-plus/icons-vue'
import { Document } from '@element-plus/icons-vue'
// 初始化树形数据
const treeData = reactive([
  {
    windFarm_id: 1,
    label: '化德分散式',
    expanded: false,
    children: [
      {
        turbine_id: 1,
        turbine_name: '#101风机'
      },
      {
        turbine_id: 2,
        turbine_name: '#102风机'
      },
      {
        turbine_id: 3,
        turbine_name: '#103风机'
      },
      {
        turbine_id: 4,
        turbine_name: '#104风机'
      },
      {
        turbine_id: 5,
        turbine_name: '#105风机'
      }
    ]
  },
  {
    windFarm_id: 2,
    label: '化德长顺',
    expanded: false,
    children: []
  },
  {
    windFarm_id: 1,
    label: '协和扎兰屯',
    expanded: false,
    children: []
  },
  {
    windFarm_id: 1,
    label: '扎兰屯二期',
    expanded: false,
    children: []
  },
  {
    windFarm_id: 1,
    label: '丰镇分散式',
    expanded: false,
    children: [
      {
        turbine_id: 1,
        turbine_name: '#101风机'
      },
      {
        turbine_id: 2,
        turbine_name: '#102风机'
      },
      {
        turbine_id: 3,
        turbine_name: '#103风机'
      },
      {
        turbine_id: 4,
        turbine_name: '#104风机'
      },
      {
        turbine_id: 5,
        turbine_name: '#105风机'
      }
    ]
  },
  {
    windFarm_id: 1,
    label: '伊旗风储',
    expanded: false,
    children: []
  }
])

// 切换展开/收起状态
const toggleExpand = (node) => {
  node.expanded = !node.expanded
}
</script>

<template>
  <div class="top">
    <span class="custom-span">
      <el-icon><Document /></el-icon>
      内蒙古公司
    </span>
  </div>
  <div class="tree-container">
    <ul class="tree">
      <li v-for="(node, index) in treeData" :key="index" class="tree-node">
        <div class="tree-label">
          <span @click="toggleExpand(node)" class="expand-icon">
            {{ node.expanded ? '▼' : '▶' }} <el-icon style="font-size: 15px"><House /></el-icon>
          </span>

          <span class="label">{{ node.label }}</span>
        </div>
        <ul v-if="node.expanded && node.children">
          <li v-for="(child, childIndex) in node.children" :key="childIndex" class="child-node">
            <div class="tree-label">
              <span class="label">{{ child.turbine_name }}</span>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  height: 50px;
  margin-bottom: 10px;
}
.custom-span {
  display: inline-flex;
  align-items: center;
  background-color: #164476;
  color: white;
  padding: 5px 10px;
  font-size: 15px;
  border-radius: 5px;
  position: relative;
  font-weight: bold;
}
.tree-container {
  max-height: 100%;
  /* overflow-y: auto; */
  border-radius: 5px;
  margin: 10px;
}

.tree {
  list-style-type: none;
  padding-left: 0;
  margin-left: 20px;
}

.tree-node {
  margin-bottom: 25px;
}
.child-node {
  margin-bottom: 25px;
  margin-left: 40px;
}
.label {
  background: linear-gradient(
    rgba(30, 96, 120, 0) 0%,
    rgba(30, 96, 120, 0.5) 25%,
    rgba(30, 96, 120, 1) 50%,
    rgba(30, 96, 120, 0.5) 75%,
    rgba(30, 96, 120, 0) 100%
  );
  padding: 5px 12px;
}
.tree-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  cursor: pointer;
  font-size: 16px;
  text-align: center;
}
</style>
