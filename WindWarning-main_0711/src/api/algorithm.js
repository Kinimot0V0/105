import axios from '../utils/request'

//算法信息展示
export function getAlgorithm(params) {
  return axios.get('/ews/algorithms/list', { params })
}

//获取模块数据
export function getModuleList(params) {
    return axios.get('/ews/module/list', { params })
}

//算法新增
export function addAlgorithm(data) {
    return axios.post('/ews/algorithms/add', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}