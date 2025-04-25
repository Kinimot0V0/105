import axios from '../utils/request'

//获取风场数据
export function getWindFarmList(params = {}) {
  return axios.get('/ews/windfarm/getwindfarmList', { params })
}

//获取预警列表信息
// export function getWarnList(data) {
//   return axios.post('/ews/warning/getWarnList', data)
// }
export function getWarnList(params) {
  return axios.get('/ews/warning/list', { params })
}

//获取风机矩阵信息
export function getTurbineWarnList(data) {
  return axios.post('/ews/warning/queryTurbineWarnMatrix', data)
}

//根据风机id查风场
export function getFarmInfo(params) {
  return axios.get('/ews/turbine/getfarmInfo', { params })
}