import axios from '../utils/request'

//获取待处理预警-预警种类
export function getWarnInfoList(data) {
  return axios.post('/ews/warning/getWarnInfoList ', data)
}
//根据种类获取待处理预警-预警列表
export function getWarnInfoListByDesc(data) {
  return axios.post('/ews/warning/getWarnInfoListByDesc ', data)
}

//预警处理
export function operate(data) {
  return axios.post('/ews/warning/operate', data)
}
