import request from '@/utils/request'

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
    url: '/Common/setFileUpload',
    method: 'post',
    data: buildUploadFormData(files)
  })
}

export const policy = setFileUpload
