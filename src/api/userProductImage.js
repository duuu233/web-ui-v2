import request from '@/utils/request'

export function getUserProductImgList(params) {
  return request({
    url: '/UserProductImg/getUserProductImgList',
    method: 'get',
    params
  })
}

export function deleteUserProductImg(data) {
  return request({
    url: '/UserProductImg/deleteUserProductImg',
    method: 'post',
    data
  })
}

export function setUserProductImgVerify(data) {
  return request({
    url: '/UserProductImg/setUserProductImgVerify',
    method: 'post',
    data
  })
}
