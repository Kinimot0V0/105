import axios from '../utils/request'

export function getCompany(params = {}) {
  return axios.get('/ews/company/list', { params })
}

export function getWindFarmList(params) {
  return axios.get('/ews/windfarm/getwindfarmList', { params })
}