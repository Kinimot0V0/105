import axios from '../utils/request'

//通知信息展示
export function getReport(data) {
  return axios.post('/pvs/report/getReportList', data)
}
//根据场站找逆变器
export function getDeviceList(params) {
  return axios.get('/pvs/inverter/getInverterList', { params })
}
//通知详情处理
export function getReportDetail(params) {
  return axios.get('/pvs/warning/getWarnInfoListByReportId', { params })
}
//通知处理
export function reportOperate(data) {
  return axios.post('/pvs/report/operate', data)
}
