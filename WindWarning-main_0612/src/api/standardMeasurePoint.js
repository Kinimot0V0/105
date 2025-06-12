import axios from '../utils/request'

//标准测点
export function getStandpoint(params) {
    return axios.get('/ews/standpoint/list', { params })
}

//新增测点
export function addStandPoint(data) {
    return axios.post('/ews/standpoint/add', data)
}