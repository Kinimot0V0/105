import axios from '../utils/request'

//获取公钥
export function getPublicKey() {
  return axios.post('/proxy-api/workapis/login/getPublicKey') 
}
//登录
// export function login(data) {
//     return axios.post('/proxy-api/workapis/login/login', data)
// }
//登录(开发环境测试用)
export function login(data) {
  return axios.post('/ews/login/login', data)
}