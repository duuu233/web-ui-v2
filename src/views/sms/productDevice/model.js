export const verifyOptions = [{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]
export const permission = {
  list: 'Get_ProductDevice_GetProductDeviceList',
  detail: 'Get_ProductDevice_GetProductDeviceDetail',
  add: 'Post_ProductDevice_AddProductDevice',
  edit: 'Post_ProductDevice_EditProductDevice',
  verify: 'Post_ProductDevice_SetProductDeviceVerify'
}
export function parseDeviceId(value) {
  if (!['string', 'number'].includes(typeof value) || !/^\d+$/.test(String(value))) return null
  const id = Number(value)
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null
}
export function recordId(row) { return parseDeviceId(row?.pDeviceId ?? row?.pdeviceId) }
export function defaultDevice() { return { productId: null, deviceId: '' } }
export function buildDevicePayload(form, id) {
  const productId = parseDeviceId(form.productId)
  const deviceId = String(form.deviceId ?? '').trim()
  if (productId === null) throw new Error('请选择有效的 WiFi 产品')
  if (!deviceId || deviceId.length > 50) throw new Error('设备ID须为1到50个字符')
  const payload = { productId, deviceId }
  if (id !== undefined) {
    payload.pDeviceId = parseDeviceId(id)
    if (payload.pDeviceId === null) throw new Error('产品设备主键无效')
  }
  return payload
}

// Every page must be requested from the WiFi product list; never mix in BLE products.
export async function fetchWifiProducts(fetchList) {
  const products = new Map()
  const pageSize = 100
  for (let pageIndex = 1; ; pageIndex++) {
    const response = await fetchList({ pageIndex, pageSize, versionType: 2 })
    const data = response.retData
    if (!data || !Array.isArray(data.pageData)) throw new Error('产品列表返回格式无效')
    const rows = data.pageData
    for (const row of rows) {
      const id = parseDeviceId(row.productId)
      if (id !== null && Number(row.versionType) === 2) products.set(id, { ...row, productId: id })
    }
    if (rows.length === 0 || (data.recordCount != null && Number.isFinite(Number(data.recordCount)) && pageIndex * pageSize >= Number(data.recordCount)) || (data.recordCount == null && rows.length < pageSize)) break
  }
  return [...products.values()]
}
