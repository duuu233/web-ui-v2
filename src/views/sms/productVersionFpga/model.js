export const compulsoryOptions = [
  { value: 1, label: '强制升级' }, { value: 2, label: '强提示升级' },
  { value: 3, label: '弱提示升级' }, { value: 4, label: '不提示升级' }
]
export const verifyOptions = [{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]
export const permission = {
  list: 'Get_ProductVersionFpga_GetProductVersionFpgaList',
  detail: 'Get_ProductVersionFpga_GetProductVersionFpgaDetail',
  add: 'Post_ProductVersionFpga_AddProductVersionFpga',
  edit: 'Post_ProductVersionFpga_EditProductVersionFpga',
  remove: 'Post_ProductVersionFpga_DeleteProductVersionFpga',
  verify: 'Post_ProductVersionFpga_SetProductVersionFpgaVerify'
}
export function parseVersionId(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  if (!/^\d+$/.test(String(value))) return null
  const id = Number(value)
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null
}
export function defaultVersion() {
  return { productId: null, versionNumber: '', downloadPath: '', compulsory: null, grade: 0 }
}
export function buildVersionPayload(form, id) {
  const payload = {
    productId: Number(form.productId), versionNumber: form.versionNumber.trim(),
    downloadPath: form.downloadPath.trim(), compulsory: Number(form.compulsory), grade: Number(form.grade)
  }
  if (id !== undefined) payload.id = parseVersionId(id)
  return payload
}
export function safeDownloadUrl(value) {
  try { const url = new URL(String(value)); return ['http:', 'https:'].includes(url.protocol) ? url.href : '' }
  catch { return '' }
}
export function fileName(value) {
  const last = String(value || '').split(/[?#]/)[0].split('/').pop() || '固件文件'
  try { return decodeURIComponent(last) } catch { return last }
}
export function compulsoryText(value) {
  return compulsoryOptions.find(item => item.value === Number(value))?.label || '未知类型'
}
