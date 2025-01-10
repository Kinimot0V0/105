import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://192.168.1.213:8080',
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
