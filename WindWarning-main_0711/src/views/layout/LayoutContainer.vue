<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

///权限相关///
//登录获取角色
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
const isAdmin = userInfo?.isAdmin
///权限相关///

// 从 localStorage 获取用户信息
// const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
// const userRole = userInfo?.role || 'user'

// 导航函数
function iew() {
  router.push('/intelligentEarlyWarning')
}
// function home() {
//   router.push('/home')
// }
function measurePoint() {
  router.push('/measurePoint')
}
function standardMeasurePoint() {
  router.push('/standardMeasurePoint')
}
function algorithm() {
  router.push('/algorithm')
}
// function overview() {
//   router.push('/overview')
// }
function modelInfo() {
  router.push('/modelInfo')
}
</script>

<template>
  <el-menu
    mode="horizontal"
    background-color="#042c54"
    text-color="#fff"
    active-text-color="#fff"
    :default-active="route.path"
  >
    <!-- 标题部分 -->
    <h2 class="title">
      <span style="margin-left: 10px;margin-right: 10px;">风电智能监测与故障预警系统</span>
    </h2>

    <el-menu-item index="/intelligentEarlyWarning" @click="iew">智能预警</el-menu-item>
    <el-menu-item index="/modelInfo" @click="modelInfo" v-if="isAdmin">预警生成管理</el-menu-item>
    <el-sub-menu index="others" v-if="isAdmin">
      <template #title>其他功能</template>
        <el-menu-item index="/measurePoint" @click="measurePoint">测点管理</el-menu-item>
        <el-menu-item index="/standardMeasurePoint" @click="standardMeasurePoint">标准测点管理</el-menu-item>
        <el-menu-item index="/algorithm" @click="algorithm">规则生成</el-menu-item>
    </el-sub-menu>
    <!-- 用户头像和退出按钮 -->
    <!-- <div class="user-avatar">
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-avatar class="custom-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="user-info">
            {{ userRole === 'admin' ? '管理员' : '普通用户' }}
          </span>
        </span>
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div> -->
  </el-menu>

  <!-- 路由内容展示 -->
  <div class="content">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.content {
  flex-grow: 1;
  overflow: auto;
}
/* .title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  margin: 20px 0;
  padding: 10px;
  background-color: #042c54;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
} */

.title span {
  display: inline-block;
  padding: 0 10px;
}

.user-avatar {
  position: absolute;
  top: 10px;
  right: 10px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}
.el-menu {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #042c54; /* 导航栏背景颜色 */
}

/* 导航栏标题 */
.title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-left: 20px;
}

/* 选中菜单项的样式 */
.el-menu-item.is-active {
  background-color: #f8a306;
  color: #fff;
}

.user-info {
  margin-left: 6px;
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  background-color: #f8a306;
  padding: 8px;
  border-radius: 5px;
}
::v-deep .el-sub-menu__title .el-icon {
  display: none !important; /* 隐藏默认图标 */
}

</style>
