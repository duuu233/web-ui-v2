// 2026-11-13：页面去掉「升级类型」，新增 / 编辑一律提交 4 = 不提示升级（接口 compulsory 仍必填）
export const DEFAULT_COMPULSORY = 4
// 2026-11-13：只有渲染模式 = fpga16 的产品才有 FPGA 版本
export function isFpgaProduct(product) {
  return String(product?.renderMode ?? '').trim().toLowerCase() === 'fpga16'
}
export function fpgaProducts(rows) {
  return (rows || []).filter(isFpgaProduct)
}
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
  return { productId: null, versionNumber: '', downloadPath: '', grade: 0 }
}
export function buildVersionPayload(form, id) {
  const payload = {
    productId: Number(form.productId), versionNumber: form.versionNumber.trim(),
    downloadPath: form.downloadPath.trim(), compulsory: DEFAULT_COMPULSORY, grade: Number(form.grade)
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
