<!-- 更改开发和实际登录，只需要切换router.index.js文件的引用和login.js的引用 -->
<script setup>
import { ref , onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { adminLogin,getPublicKey } from '@/api/login'

const router = useRouter()
const loginForm = ref({
  account: '',
  pwd: '',
  rememberMe: true
})

// 登录逻辑
const handleLogin = async () => {
  try {
    // 前端验证
    if (!loginForm.value.account) {
      return ElMessage.error('请输入账号')
    }
    if (!loginForm.value.pwd) {
      return ElMessage.error('请输入密码')
    }

    // 调用登录接口
    const params = {
      account: loginForm.value.account,
      // ***
      //开发用password，实际用pwd
      password: loginForm.value.pwd,
      // ***
      rememberMe: loginForm.value.rememberMe,
      sysType: 2
    }
    console.log("登录参数:",params)
    const response = await adminLogin(params)
    console.log("登录返回:",response)
    const data = response.data
    if (data.code === 200) {
      // 保存登录状态
      // 构建用户信息对象
      const userInfo = {
        roles: ['B37', '1I', '其它'],
        userId: 145,
        userName: "牛华"
      }
      // 存储登录状态
      const storage = sessionStorage
      storage.setItem('userInfo', JSON.stringify(userInfo))
      await router.push('/intelligentEarlyWarning')
      ElMessage.success('登录成功')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  }
}
</script>

<template>
  <el-row class="login-page">
    <el-col class="form">
      <el-form :model="loginForm" class="login-form">
        <h1 class="title">风机智能监测与故障预警系统</h1>
        <h1 class="login-title">登录</h1>
        
        <!-- 账号输入 -->
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入账号"
            :prefix-icon="User"
          />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="pwd">
          <el-input
            v-model="loginForm.pwd"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            type="password"
            show-password
          />
        </el-form-item>

        <!-- 记住我 -->
        <!-- <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">保持登录</el-checkbox>
        </el-form-item> -->

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
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
  /* background: linear-gradient(135deg, #cce7ff, #a2c8ff); 蓝绿色渐变背景 */
  background-image: url('/background.png');
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 表单区域 */
.form {
  background-color: #143f5c;
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
  color: white;
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