import request from '@/utils/request'

// 用户列表(用户昵称、手机号采用关键参数 keyword，注册日期采用参数 startDate,endDate)
export function getUsers(params) {
  return request({
    url: '/User/getUserList',
    method: 'get',
    params
  })
}

// 用户详情(id=用户id)
export function getUserDetails(params) {
  return request({
    url: '/User/getUserDetail',
    method: 'get',
    params
  })
}

export function getUserListExcel(params) {
  return request({
    url: '/User/getUserListExcel',
    method: 'get',
    params
  })
}

// 用户详情订单列表(id=用户id,日期采用参数 startDate,endDate)
export function getUserDetailsOrders(params) {
  return request({
    url: '/User/getUserDetailsOrders',
    method: 'get',
    params
  })
}

// 用户启用/禁用
export function setUserVerify(data) {
  return request({
    url: '/User/setUserVerify',
    method: 'post',
    data
  })
}

// 用户编辑
export function setUserInfo(data) {
  return request({
    url: '/User/setUserInfo',
    method: 'post',
    data
  })
}
