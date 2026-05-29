import request from '@/utils/request'

// 首页统计
export function getUserCount(params) {
  return request({
    url: '/Common/getUserCount',
    method: 'get',
    params
  })
}

// 获取首页用户注册统计
export function getStatisticsUser(params) {
  return request({
    url: '/Common/getStatisticsUser',
    method: 'get',
    params
  })
}

// 首页统计--运单统计--统计图(如开始时间与结束时间时同一天则按照有小时的时间显示)
export function getStatisticsToTmsWayBillByDay(params) {
  return request({
    url: '/Common/getStatisticsToTmsWayBillByDay',
    method: 'get',
    params
  })
}

// 首页统计--运单统计--相比比例
export function getStatisticsToTmsWayBillRatio(params) {
  return request({
    url: '/Common/getStatisticsToTmsWayBillRatio',
    method: 'get',
    params
  })
}
