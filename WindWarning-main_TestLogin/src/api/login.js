import axios from '../utils/request'

//获取公钥
export function getPublicKey(params = {}) {
  return axios.get('/login/getPublicKey', { params }, {
    baseURL: window.g?.loginBaseUrl
  })
}
//登录
// export function login(data) {
//     return axios.post('/login/login', data, {
//       baseURL: window.g?.loginBaseUrl
//     })
// }
//登录(开发环境测试用)
export function login(data) {
  return axios.post('/ews/login/login', data)
}