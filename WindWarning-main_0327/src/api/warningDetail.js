import axios from '../utils/request'

//查询风机下的模块和测点信息
export function getTurbineInfo(params) {
  return axios.get('/ews/turbine/getTurbineInfo', { params })
}

//查询测点详细信息
export function getTrendData(data) {
  return axios.post('/ews/warning/trendData', data)
}

//根据风机id查风场
export function getFarmInfo(params) {
  return axios.get('/ews/turbine/getfarmInfo', { params })
}
