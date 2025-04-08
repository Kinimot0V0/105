import axios from '../utils/request'

//通知信息展示
export function getReport(data) {
  return axios.post('/ews/report/getReportList', data)
}
//根据风场找风机
export function getTurbineList(params) {
  return axios.get('/ews/turbine/getTurbineList', { params })
}
//通知详情处理
export function getReportDetail(params) {
  return axios.get('/ews/warning/getWarnInfoListByReportId', { params })
}
//通知处理
export function reportOperate(data) {
  return axios.post('/ews/report/operate', data)
}
