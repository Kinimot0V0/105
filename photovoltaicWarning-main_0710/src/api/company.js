import axios from '../utils/request'

export function getCompany(params = {}) {
  return axios.get('/pvs/company/list', { params })
}
