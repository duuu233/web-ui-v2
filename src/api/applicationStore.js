import request from '@/utils/request'

// 获取应用市场详情
export function getAppMarketDetail(params) {
  return request({
    url: '/AppVersion/getAppMarketDetail',
    method: 'get',
    params
  })
}

// 获取应用市场列表
export function getAppMarketList(params) {
  return request({
    url: '/AppVersion/getAppMarketList',
    method: 'get',
    params
  })
}

// 添加编辑应用市场列表
export function setAppMarketEdit(data) {
  return request({
    url: '/AppVersion/setAppMarketEdit',
    method: 'post',
    data
  })
}

export function setAppMarketGrade(data) {
  return request({
    url: '/AppVersion/setAppMarketGrade',
    method: 'post',
    data
  })
}

// 禁用启用应用市场列表
export function setAppMarketVerify(data) {
  return request({
    url: '/AppVersion/setAppMarketVerify',
    method: 'post',
    data
  })
}

// 删除应用市场
export function setAppMarketDelete(data) {
  return request({
    url: '/AppVersion/setAppMarketDelete',
    method: 'post',
    data
  })
}
