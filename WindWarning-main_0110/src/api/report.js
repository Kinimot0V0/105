import axios from '../utils/request'

//通知信息展示
export function getReport(data) {
  return axios.post('/ews/report/getReportList', data)
}
//根据风场找风机
export function getTurbineList(params) {
  return axios.get('/ews/turbine/getTurbineList', { params })
}
