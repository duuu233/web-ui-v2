import request from '@/utils/request'

export function getUserCount(params) {
  return request({
    url: '/Common/getUserCount',
    method: 'get',
    params
  })
}

export function getStatisticsUser(params) {
  return request({
    url: '/Common/getStatisticsUser',
    method: 'get',
    params
  })
}

export function getStatisticsOrder(params) {
  return request({
    url: '/Common/getStatisticsOrder',
    method: 'get',
    params
  })
}
