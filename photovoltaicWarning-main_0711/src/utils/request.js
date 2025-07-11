import axios from 'axios'

// 判断是否登录相关接口
function isLoginUrl(url) {
  return url.startsWith('/proxy-api/')
}

// 创建 axios 实例
const instance = axios.create({
  timeout: 100000
})

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 判断当前是否是登录接口（即以 /proxy-api/ 开头）
    const isLogin = isLoginUrl(config.url || '')

    // 如果是登录接口，让它走当前 origin（通过 Vite 代理）
    // 否则走 ipConfig.js 中配置的 localhost:8080 地址
    config.baseURL = isLogin ? '' : (window.g && window.g.localBaseUrl)

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default instance