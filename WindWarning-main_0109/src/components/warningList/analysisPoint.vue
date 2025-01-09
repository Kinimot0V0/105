<script setup>
import { reactive, ref } from 'vue'

// 初始化树形数据
const treeData = reactive([
  {
    id: 1,
    label: '化德风电场-11号风机',
    expanded: false,
    children: [
      {
        id: 2,
        label: '变流器系统',
        expanded: false,
        children: []
      },
      {
        id: 3,
        label: '传动系统',
        expanded: false,
        children: [
          { id: 31, label: '齿轮箱高速度轴承温度' },
          { id: 32, label: '主轴温度' },
          { id: 33, label: '齿轮箱油温' },
          { id: 34, label: '齿轮箱油泵启动' },
          { id: 35, label: '齿轮箱油箱温度' }
        ]
      },
      {
        id: 4,
        label: '发电机系统',
        expanded: false,
        children: [
          { id: 41, label: '发电机定子温度' },
          { id: 42, label: '发电机转子温度' }
        ]
      },
      {
        id: 5,
        label: '传动系统2',
        expanded: false,
        children: [
          { id: 51, label: '齿轮箱高速度轴承温度' },
          { id: 52, label: '主轴温度' },
          { id: 53, label: '齿轮箱油温' },
          { id: 54, label: '齿轮箱油泵启动' },
          { id: 55, label: '齿轮箱油箱温度' }
        ]
      },
      {
        id: 6,
        label: '传动系统3',
        expanded: false,
        children: [
          { id: 61, label: '齿轮箱高速度轴承温度' },
          { id: 62, label: '主轴温度' },
          { id: 63, label: '齿轮箱油温' },
          { id: 64, label: '齿轮箱油泵启动' },
          { id: 65, label: '齿轮箱油箱温度' }
        ]
      }
    ]
  }
])

// 切换展开/收起状态
const toggleExpand = (node) => {
  node.expanded = !node.expanded
}

// 搜索框绑定值
const searchQuery = ref('')

// 搜索功能
const searchTree = () => {
  const query = searchQuery.value.trim()
  if (!query) return

  // 先折叠所有树节点
  collapseAll(treeData)

  const foundNodes = []
  findAndExpand(treeData, query, foundNodes)
}

// 折叠所有树节点
const collapseAll = (nodes) => {
  nodes.forEach((node) => {
    node.expanded = false
    if (node.children && node.children.length > 0) {
      collapseAll(node.children)
    }
  })
}

// 递归查找匹配的测点，并展开其父节点
const findAndExpand = (nodes, query, foundNodes) => {
  let foundInCurrentNode = false
  for (const node of nodes) {
    // 如果是父节点，递归其子节点
    if (node.children && node.children.length > 0) {
      const foundInChildren = findAndExpand(node.children, query, foundNodes)
      if (foundInChildren) {
        node.expanded = true // 展开当前父节点
        foundInCurrentNode = true
      }
    }
    // 如果当前节点是叶子节点，模糊匹配 label
    if (node.label.includes(query)) {
      node.expanded = true // 展开匹配的节点
      foundNodes.push(node) // 保存匹配的节点
      foundInCurrentNode = true
    }
  }
  return foundInCurrentNode
}

// 获取选中的测点数据
const getSelectedData = () => {
  const selectedData = []
  collectSelected(treeData, selectedData)
  console.log('Selected Data:', selectedData)

  // 清空已选择的内容
  clearSelected(treeData)

  // 先折叠所有树节点
  collapseAll(treeData)

  searchQuery.value = null

  return selectedData
}

// 递归收集选中节点的数据
const collectSelected = (nodes, selectedData) => {
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      collectSelected(node.children, selectedData)
    } else if (node.selected) {
      selectedData.push({ id: node.id, label: node.label })
    }
  })
}

// 递归清空已选择的节点
const clearSelected = (nodes) => {
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      clearSelected(node.children)
    }
    node.selected = false // 清空选中状态
  })
}
</script>

<template>
  <div class="tree-container">
    <div class="analysis-title">
      分析测点 <el-button @click="getSelectedData" type="success" class="confirm-button">确定</el-button>
    </div>

    <hr />
    <!-- 搜索框 -->
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="请输入测点" @keyup.enter="searchTree" />
      <button @click="searchTree">搜索</button>
    </div>
    <ul class="tree">
      <li v-for="(node, index) in treeData" :key="index" class="tree-node">
        <div class="tree-label">
          <span @click="toggleExpand(node)" class="expand-icon">
            {{ node.expanded ? '▼' : '▶' }}
          </span>
          <span>{{ node.label }}</span>
        </div>
        <ul v-if="node.expanded && node.children">
          <li v-for="(child, childIndex) in node.children" :key="childIndex" class="tree-node">
            <div class="tree-label">
              <span @click="toggleExpand(child)" class="expand-icon">
                {{ child.expanded ? '▼' : '▶' }}
              </span>
              <span>{{ child.label }}</span>
            </div>
            <ul v-if="child.expanded && child.children">
              <li v-for="(subChild, subChildIndex) in child.children" :key="subChildIndex" class="tree-node">
                <div class="tree-label">
                  <!-- <input type="checkbox" :value="subChild.value" v-model="selected" /> -->
                  <input type="checkbox" v-model="subChild.selected" />
                  <span>{{ subChild.label }}</span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* 搜索框样式 */
.search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-bar button {
  padding: 0.5rem 1rem;
  font-size: 14px;
  background-color: #0490f5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.analysis-title {
  text-align: left;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 1rem;
  position: relative; /* 确保浮动元素位置正确 */
}

.confirm-button {
  float: right; /* 按钮右对齐 */
}

.tree-container {
  max-height: 100%; /* 设置最大高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
  padding: 0.5rem;
  border-radius: 5px;
}

.tree {
  list-style-type: none;
  padding-left: 0;
}

.tree-node {
  margin-bottom: 0.5rem;
}

.tree-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  cursor: pointer;
  font-size: 1rem;
  width: 1rem;
  text-align: center;
}

input[type='checkbox'] {
  margin-right: 0.2rem;
}
</style>
