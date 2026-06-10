export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024

export function isValidUploadSize(file) {
  return !file?.size || file.size <= MAX_UPLOAD_SIZE
}

export function normalizeUploadedFiles(retData, fallbackFile) {
  const result = Array.isArray(retData) ? retData : [retData]
  return result
    .filter(Boolean)
    .map((item) => ({
      name: item.name || fallbackFile?.name || 'file',
      url: item.url || item.fileUrl || item.filePath || item.path || ''
    }))
    .filter((item) => item.url)
}
