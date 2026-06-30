import request from '@/utils/request'

export function addProductVersion(data) {
  return request({
    url: '/ProductVersion/addProductVersion',
    method: 'post',
    data
  })
}

export function deleteProductVersion(data) {
  return request({
    url: '/ProductVersion/deleteProductVersion',
    method: 'post',
    data
  })
}

export function editProductVersion(data) {
  return request({
    url: '/ProductVersion/editProductVersion',
    method: 'post',
    data
  })
}

export function getUserDeviceVersionDetail(params) {
  return request({
    url: '/ProductVersion/getProductVersionDetail',
    method: 'get',
    params
  })
}

export const getProductVersionDetail = getUserDeviceVersionDetail

export function getProductVersionList(params) {
  return request({
    url: '/ProductVersion/getProductVersionList',
    method: 'get',
    params
  })
}

export function setProductVersionVerify(data) {
  return request({
    url: '/ProductVersion/setProductVersionVerify',
    method: 'post',
    data
  })
}
