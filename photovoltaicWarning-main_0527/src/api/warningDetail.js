import axios from '../utils/request'

//查询逆变器下的模块和测点信息
export function getInverterInfo(params) {
  return axios.get('/pvs/inverter/getInverterInfo', { params })
}

//查询测点详细信息
export function getTrendData(data) {
  return axios.post('/pvs/warning/trendData', data)
}

//根据逆变器id查场站
export function getFarmInfo(params) {
  return axios.get('/pvs/inverter/getfarmInfo', { params })
}

//查询散点图详细信息
export function showPictures(data) {
  return axios.post('/pvs/warning/showPictures', data)
}