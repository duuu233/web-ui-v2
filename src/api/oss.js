import request from '@/utils/request'
import { getToken } from '@/utils/auth'

function appendUserTokenQuery(url) {
  const token = getToken()
  if (!token) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}userToken=${encodeURIComponent(token)}`
}

function buildUploadFormData(files) {
  if (files instanceof FormData) return files

  const formData = new FormData()
  const fileList = Array.isArray(files) ? files : [files]
  fileList.filter(Boolean).forEach((file) => {
    formData.append('fileParam', file, file.name)
  })
  return formData
}

export function setFileUpload(files) {
  return request({
    url: appendUserTokenQuery('/Common/setFileUpload'),
    method: 'post',
    data: buildUploadFormData(files)
  })
}

export const policy = setFileUpload
