import axios from '../utils/request'

//新增测点
export function addRealPoint(data) {
  return axios.post('/realPoint/add', data)
}

//测点信息展示
export function getRealPoint(params) {
  return axios.get('/realPoint/list', { params })
}
