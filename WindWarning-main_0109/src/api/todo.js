import axios from '../utils/request'

//待办信息展示
export function getWaitDoneInfo(data) {
  return axios.post('/ews/waitdone/getWaitDoneInfo', data)
}
