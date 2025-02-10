import axios from '../utils/request'

//获取待处理预警-预警列表
export function getWarnInfoList(data) {
  return axios.post('/ews/warning/getWarnInfoList ', data)
}

//预警处理
export function operate(data) {
  return axios.post('/ews/warning/operate', data)
}
