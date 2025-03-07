<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'

// 登录状态
const isLogin = ref(true)
// 表单数据
const loginForm = ref({
  username: '',
  password: ''
})
// 路由实例
const router = useRouter()

// 预设的账号密码
const users = {
  user: { username: 'user', password: 'user123', role: 'user' },
  admin: { username: 'admin', password: 'admin123', role: 'admin' }
}

// 处理登录
function handleLogin() {
  const { username, password } = loginForm.value

  // 校验用户名和密码
  if (username && password) {
    const user = users[username]
    if (user && user.password === password) {
      // 保存登录信息到 localStorage
      localStorage.setItem('userInfo', JSON.stringify({ username, role: user.role }))

      // 登录成功后跳转页面
      router.push('/intelligentEarlyWarning')
    } else {
      alert('用户名或密码错误')
    }
  } else {
    alert('请输入用户名和密码')
  }
}
</script>

<template>
  <el-row class="login-page">
    <el-col class="form">
      <el-form :model="loginForm" v-if="isLogin" class="login-form">
        <h1 class="title">风机智能监测与故障预警系统</h1>
        <h1 class="login-title">登录</h1>
        <el-form-item class="input-item">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            class="input"
          ></el-input>
        </el-form-item>
        <el-form-item class="input-item">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            type="password"
            show-password
            class="input"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="login-button" type="primary" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style scoped>
/* 整体背景和页面布局 */
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #cce7ff, #a2c8ff); /* 蓝绿色渐变背景 */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 表单区域 */
.form {
  background-color: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  /* Ensures that the form remains centered */
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 标题 */
.title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  background: linear-gradient(45deg, #00b4db, #00bf8f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

/* 标题 */
.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

/* 输入框 */
.input-item {
  margin-bottom: 20px;
}

.input {
  border-radius: 25px;
  padding: 12px;
  font-size: 16px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  border-radius: 25px;
  padding: 20px;
  font-size: 16px;
  background-color: #42b883;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #35495e;
}
</style>
