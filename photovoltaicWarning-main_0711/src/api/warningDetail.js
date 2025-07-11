import axios from '../utils/request'

//查询设备下的测点信息
export function getDeviceInfo(params) {
  return axios.get('/pvs/device/getDeviceInfo', { params })
}

//查询测点详细信息
export function getTrendData(data) {
  return axios.post('/pvs/warning/trendData', data)
}

//根据设备查场站
export function getFarmInfo(params) {
  return axios.get('/pvs/device/getfarmInfo', { params })
}

//查询散点图详细信息
export function showPictures(data) {
  return axios.post('/pvs/warning/showPictures', data)
}