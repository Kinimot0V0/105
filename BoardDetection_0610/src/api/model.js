import axios from '../utils/request'

//提交模型数据
export function addModel(data) {
  return axios.post('/ews/model/add', data)
}

//模型信息展示
export function getModel(params) {
  return axios.get('/ews/model/list', { params })
}
