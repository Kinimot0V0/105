import axios from '../utils/request'

//提交模型数据
export function addModel(data) {
  return axios.post('/pvs/model/add', data)
}

//模型信息展示
export function getModel(params) {
  return axios.get('/pvs/model/list', { params })
}

//开始训练
export function train(data) {
  return axios.post('/pvs/model/train', data)
}

//开始预测
export function predict(data) {
  return axios.post('/pvs/model/predict', data)
}

//停止预测
export function stopPredict(data) {
  return axios.post('/pvs/model/stopPredict', data)
}

//根据算法获取测点
export function getPoint(id) {
  return axios.get(`/pvs/model/getStandPoint/${id}`)
}

//编辑
export function edit(data) {
  return axios.post('/pvs/model/change', data)
}

//测试
export function test(data) {
  return axios.post('/pvs/model/test', data)
}
//删除
export function Delete(ids) {
  return axios.delete('/pvs/model/delete', {
    data: ids 
  })
}
//获取公司数据
export function getCompany(params = {}) {
  return axios.get('/pvs/company/list', { params })
}

//获取场站数据
export function getPvFarmList(params) {
  return axios.get('/pvs/pvfarm/getpvfarmList', { params })
}

//获取逆变器数据
export function getInverterList(params) {
  return axios.get('/pvs/inverter/list', { params })
}

//获取算法数据
export function getAlg(params = {}) {
  return axios.get('/pvs/algorithms/list', { params })
}

//获取模块数据
export function getModuleList(params = {}) {
  return axios.get('/pvs/module/list', { params })
}
//查看模型阈值
export function getThr(params) {
  return axios.get('/pvs/model/showThreshold', { params })
}
//更改上下限
export function changeThreshold(data) {
  return axios.post('/pvs/model/changeThreshold', data)
}