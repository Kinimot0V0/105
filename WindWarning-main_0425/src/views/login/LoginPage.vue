<!-- 更改开发和实际登录，只需要切换router.index.js文件的引用和login.js的引用 -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { login, getPublicKey, adminLogin } from '@/api/login'
import JSEncrypt from 'jsencrypt' 

const router = useRouter()
const loginForm = ref({
  account: '',
  pwd: '',
  rememberMe: true
})

const publicKey = ref('') // 存储PEM格式的公钥

// 获取公钥并格式化
const fetchPublicKey = async () => {
  try {
    const res = await getPublicKey()
    if (res.data.code === 0) {
      publicKey.value = res.data.data
    }
  } catch (error) {
    console.error('公钥获取失败:', error)
    ElMessage.error('公钥获取失败，请重试')
  }
}

// 登录逻辑
const handleLogin = async () => {
  try {
    // 输入验证
    if (!loginForm.value.account.trim()) return ElMessage.error('请输入账号')
    if (!loginForm.value.pwd.trim()) return ElMessage.error('请输入密码')

    //区分普通登录和管理员登录
    const isAdmin = loginForm.value.account.trim() === 'admin'
    
    if(!isAdmin){
      //普通登录
      // 确保公钥存在
      if (!publicKey.value) await fetchPublicKey()
      
      // RSA加密
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(publicKey.value)
      const encryptedPwd = encryptor.encrypt(loginForm.value.pwd.trim())
      
      if (!encryptedPwd) {
        ElMessage.error('密码加密失败')
        return
      }

      // 构造请求参数
      const params = {
        account: loginForm.value.account.trim(),
        pwd: encryptedPwd, // 使用加密后的密码
        rememberMe: loginForm.value.rememberMe,
        sysType: 2
      }
      
      // console.log("登录参数:",params)
      // 发送登录请求
      const response = await login(params)
      const responseData = response.data
      
      if (responseData.code === 0 && responseData.data.companyId === 15) {
        const userData = responseData.data
        
        // 处理角色数据：将逗号分隔的字符串转为数组，并去重
        const roles = [...new Set(userData.workRoleName.split(','))].filter(Boolean)
        
        // 构建用户信息对象
        const userInfo = {
          userId: userData.userId,
          userName: userData.userName,
          isAdmin: isAdmin,
          roles: roles  // 存储处理后的角色数组
        }

        // 存储登录状态
        const storage = sessionStorage
        storage.setItem('userInfo', JSON.stringify(userInfo))
        
        await router.push('/intelligentEarlyWarning')
        ElMessage.success('登录成功')
      }else {
        ElMessage.error('账号或密码错误')
        return
      }
    }else{
      //管理员登录

      // 构造请求参数
      const params = {
        account: loginForm.value.account.trim(),
        pwd: loginForm.value.pwd.trim()
      }

      // console.log("登录参数:",params)
      // 发送登录请求
      const response = await adminLogin(params)
      // console.log("登录返回:",response)
      const responseData = response.data
      
      if (responseData.code === 200) {
        // 构建用户信息对象
        const userInfo = {
          roles: ['B37', 'C6', 'B17'],
          isAdmin: isAdmin
        }

        // 存储登录状态
        const storage = sessionStorage
        storage.setItem('userInfo', JSON.stringify(userInfo))
        
        await router.push('/intelligentEarlyWarning')
        ElMessage.success('登录成功')
      }else {
        ElMessage.error('账号或密码错误')
        return
      }
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  }
}

// 组件挂载时预取公钥
// onMounted(fetchPublicKey)
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