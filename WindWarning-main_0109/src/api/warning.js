import axios from '../utils/request'

//预警信息展示
export function getWarning(params) {
  return axios.get('/ews/warning/list', { params })
}
