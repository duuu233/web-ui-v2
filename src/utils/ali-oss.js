function resolveUploadUrl(data) {
  if (typeof data === 'string') return data
  if (!data || typeof data !== 'object') return ''

  const payload = data.retData ?? data.data ?? data
  if (typeof payload === 'string') return payload
  if (!payload || typeof payload !== 'object') return ''

  return (
    payload.url ||
    payload.fileUrl ||
    payload.filePath ||
    payload.path ||
    payload.src ||
    ''
  )
}

export function getFileNameUUID() {
  const random = Math.random().toString(16).slice(2)
  return `${Date.now()}_${random}`
}

export async function client() {
  const uploadUrl = import.meta.env.VITE_APP_BASE_UPLOAD

  return {
    async put(fileName, file) {
      if (!uploadUrl) {
        throw new Error('VITE_APP_BASE_UPLOAD is not configured')
      }

      const formData = new FormData()
      formData.append('file', file, file.name || fileName)
      formData.append('fileName', fileName)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed with HTTP ${response.status}`)
      }

      const data = await response.json()
      const url = resolveUploadUrl(data)
      if (!url) {
        throw new Error('Upload response does not include a file URL')
      }

      return { url }
    }
  }
}
