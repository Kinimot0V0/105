import axios from '../utils/request'

//提交模型数据
export function addModel(data) {
  return axios.post('/ews/model/add', data)
}

//模型信息展示
export function getModel(params) {
  return axios.get('/ews/model/list', { params })
}

//开始训练
export function train(data) {
  return axios.post('/ews/model/train', data)
}

//开始预测
export function predict(data) {
  return axios.post('/ews/model/predict', data)
}

//停止预测
export function stopPredict(data) {
  return axios.post('/ews/model/stopPredict', data)
}

//根据算法获取测点
export function getPoint(id) {
  return axios.get(`/ews/model/getStandPoint/${id}`)
}
