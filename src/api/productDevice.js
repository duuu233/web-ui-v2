import request from '@/utils/request'

export function getProductDeviceList(params) {
  return request({ url: '/ProductDevice/getProductDeviceList', method: 'get', params })
}
export function getProductDeviceDetail(params) {
  return request({ url: '/ProductDevice/getProductDeviceDetail', method: 'get', params })
}
export function addProductDevice(data) {
  return request({ url: '/ProductDevice/addProductDevice', method: 'post', data })
}
export function editProductDevice(data) {
  return request({ url: '/ProductDevice/editProductDevice', method: 'post', data })
}
export function setProductDeviceVerify(data) {
  return request({ url: '/ProductDevice/setProductDeviceVerify', method: 'post', data })
}
