export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024

export function isValidUploadSize(file) {
  return !file?.size || file.size <= MAX_UPLOAD_SIZE
}

function getFileUrl(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.url || item.fileUrl || item.filePath || item.path || ''
}

export function getUploadPreviewUrl(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.previewUrl || getFileUrl(item)
}

export function createUploadPreviewUrl(file) {
  if (typeof URL === 'undefined' || typeof Blob === 'undefined') return ''
  if (!(file instanceof Blob)) return ''
  return URL.createObjectURL(file)
}

export function revokeUploadPreviewUrl(item) {
  const previewUrl = item?.previewUrl
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl)
  }
}

export function normalizeUploadFileList(files, fallbackFile) {
  const result = Array.isArray(files) ? files : [files]
  return result
    .filter(Boolean)
    .map((item) => {
      const url = getFileUrl(item)
      if (!url) return null

      if (typeof item === 'string') {
        return {
          name: fallbackFile?.name || 'file',
          url
        }
      }

      return {
        ...item,
        name: item.name || fallbackFile?.name || 'file',
        url
      }
    })
    .filter(Boolean)
}

export function normalizeUploadedFiles(retData, fallbackFile) {
  return normalizeUploadFileList(retData, fallbackFile)
}
