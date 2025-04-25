import axios from '../utils/request'

//历史预警信息展示
export function getWarning(params) {
  return axios.get('/ews/warning/list', { params })
}
//实时预警
export function getRealWarning(params) {
  return axios.get('/ews/warning/nowList', { params })
}
