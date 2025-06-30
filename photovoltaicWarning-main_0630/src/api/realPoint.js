import axios from '../utils/request'

//新增测点
export function addRealPoint(data) {
  return axios.post('/pvs/realpoint/add', data)
}

//测点信息展示
export function getRealPoint(params) {
  return axios.get('/pvs/realpoint/list', { params })
}

//根据逆变器id查场站
export function getFarmInfo(params) {
  return axios.get('/pvs/inverter/getfarmInfo', { params })
}

//获取模块数据
export function getModuleList(params = {}) {
  return axios.get('/pvs/module/list', { params })
}
