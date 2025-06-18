import axios from '../utils/request'

//新增测点
export function addRealPoint(data) {
  return axios.post('/ews/realpoint/add', data)
}

//测点信息展示
export function getRealPoint(params) {
  return axios.get('/ews/realpoint/list', { params })
}

//根据风机id查风场
export function getFarmInfo(params) {
  return axios.get('/ews/turbine/getfarmInfo', { params })
}

//获取模块数据
export function getModuleList(params = {}) {
  return axios.get('/ews/module/list', { params })
}
