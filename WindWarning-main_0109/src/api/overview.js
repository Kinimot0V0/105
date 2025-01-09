import axios from '../utils/request'

//获取风场数据
export function getWindFarmList(params = {}) {
  return axios.get('/ews/windfarm/getWindFarmList', { params })
}

//获取预警列表信息
export function getWarnList(data) {
  return axios.post('/ews/warning/getWarnList', data)
}

//获取风机矩阵信息
export function getTurbineWarnList(data) {
  return axios.post('/ews/warning/queryTurbineWarnMatrix', data)
}
