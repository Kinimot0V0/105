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

//编辑
export function edit(data) {
  return axios.post('/ews/model/change', data)
}

//测试
export function test(data) {
  return axios.post('/ews/model/test', data)
}
//删除
export function Delete(ids) {
  return axios.delete('/ews/model/delete', {
    data: ids 
  })
}
//获取公司数据
export function getCompany(params = {}) {
  return axios.get('/ews/company/list', { params })
}

//获取风场数据
export function getWindFarmList(params) {
  return axios.get('/ews/windfarm/getwindfarmList', { params })
}

//获取风机数据
export function getTurbineList(params) {
  return axios.get('/ews/turbine/list', { params })
}

//获取算法数据
export function getAlg(params = {}) {
  return axios.get('/ews/algorithms/list', { params })
}

//获取模块数据
export function getModuleList(params = {}) {
  return axios.get('/ews/module/list', { params })
}
//查看模型阈值
export function getThr(params) {
  return axios.get('/ews/model/showThreshold', { params })
}