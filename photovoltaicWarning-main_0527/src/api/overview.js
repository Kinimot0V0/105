import axios from '../utils/request'

//获取场站数据
export function getPvFarmList(params = {}) {
  return axios.get('/pvs/pvFarm/getpvfarmList', { params })
}

//根据场站查设备
export function getDevice(params) {
  return axios.get('/pvs/device/list', { params })
}

//获取预警列表信息
// export function getWarnList(data) {
//   return axios.post('/pvs/warning/getWarnList', data)
// }

//获取设备矩阵信息
export function getDeviceWarnList(data) {
  return axios.post('/pvs/warning/queryDeviceWarnMatrix', data)
}

//根据逆变器id查场站
export function getFarmInfo(params) {
  return axios.get('/pvs/inverter/getfarmInfo', { params })
}