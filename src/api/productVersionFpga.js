import request from '@/utils/request'

// This module's IDs are the FPGA version primary key, not the product ID.
export function getProductVersionFpgaList(params) {
  return request({ url: '/ProductVersionFpga/getProductVersionFpgaList', method: 'get', params })
}
export function getProductVersionFpgaDetail(params) {
  return request({ url: '/ProductVersionFpga/getProductVersionFpgaDetail', method: 'get', params })
}
export function addProductVersionFpga(data) {
  return request({ url: '/ProductVersionFpga/addProductVersionFpga', method: 'post', data })
}
export function editProductVersionFpga(data) {
  return request({ url: '/ProductVersionFpga/editProductVersionFpga', method: 'post', data })
}
export function deleteProductVersionFpga(data) {
  return request({ url: '/ProductVersionFpga/deleteProductVersionFpga', method: 'post', data })
}
export function setProductVersionFpgaVerify(data) {
  return request({ url: '/ProductVersionFpga/setProductVersionFpgaVerify', method: 'post', data })
}
