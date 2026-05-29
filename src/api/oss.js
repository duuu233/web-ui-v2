import request from '@/utils/request'

// 文件上传
export function policy(data) {
  return request({
    url: '/Common/setFileUpload',
    method: 'post',
    data
  })
}
