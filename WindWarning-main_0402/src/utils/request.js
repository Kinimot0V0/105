// request.js
import axios from 'axios'

const instance = axios.create({
  // 使用从 window.g.localBaseUrl 获取的地址作为 baseURL
  baseURL: window.g && window.g.localBaseUrl ? window.g.localBaseUrl : 'http://default-backend-url/api', // 设置默认地址作为回退
  timeout: 10000
})

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default instance
