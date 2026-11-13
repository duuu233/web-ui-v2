// 内置图管理接口封装。服务地址与内部 Token 与 IoT 只读监控同一套配置（同一 IoT 服务）：
// window.__IOT_ADMIN_CONFIG__.baseURL / internalToken → VITE_IOT_ADMIN_BASE_URL → https://iot.boltfox.cn。
import { createIntimgClient, intimgPath } from '@/api/intimgClient'
import { getProductList } from '@/api/productList'
import { fetchWifiProducts } from '@/views/sms/productDevice/model'

function runtime() {
  return globalThis.window?.__IOT_ADMIN_CONFIG__ || {}
}

function client() {
  const config = runtime()
  return createIntimgClient({
    baseURL: config.baseURL || import.meta.env.VITE_IOT_ADMIN_BASE_URL || 'https://iot.boltfox.cn',
    internalToken: () => runtime().internalToken || ''
  })
}

const BASE = '/admin/intimg'

export const intimgApi = {
  slotSummary: (productIds, signal) => client().get(`${BASE}/slots/summary`, { productIds: (productIds || []).join(',') }, signal),
  slots: (productId, signal) => client().get(`${BASE}/slots`, { productId }, signal),
  uploadSlot(productId, slotKey, file, fields) {
    const form = new FormData()
    form.append('file', file)
    for (const [key, value] of Object.entries(fields)) form.append(key, String(value))
    return client().postForm(intimgPath(`${BASE}/slots`, productId, slotKey, 'image'), form)
  },
  renderSlot: (productId, slotKey) => client().post(intimgPath(`${BASE}/slots`, productId, slotKey, 'render')),
  devices: (query, signal) => client().get(`${BASE}/devices`, query, signal),
  createTask: payload => client().postJson(`${BASE}/tasks`, payload),
  tasks: (query, signal) => client().get(`${BASE}/tasks`, query, signal),
  task: (taskNo, signal) => client().get(intimgPath(`${BASE}/tasks`, taskNo), {}, signal),
  taskItems: (taskNo, query, signal) => client().get(intimgPath(`${BASE}/tasks`, taskNo, 'items'), query, signal),
  cancelItems: (taskNo, deviceNos) => client().postJson(intimgPath(`${BASE}/tasks`, taskNo, 'items', 'cancel'), { deviceNos }),
  retryItems: (taskNo, deviceNos) => client().postJson(intimgPath(`${BASE}/tasks`, taskNo, 'items', 'retry'), deviceNos?.length ? { deviceNos } : {}),
  locks: (query, signal) => client().get(`${BASE}/locks`, query, signal),
  releaseLock: deviceNo => client().post(intimgPath(`${BASE}/locks`, deviceNo, 'release'))
}

// 产品下拉复用老后台「产品列表」，只要 WiFi 版（逐页拉全，排除蓝牙版）。本次会话缓存一份，force 时重拉。
let productCache = null
export function loadWifiProducts(force = false) {
  if (!productCache || force) {
    productCache = fetchWifiProducts(getProductList).catch(error => {
      productCache = null
      throw error
    })
  }
  return productCache
}

// 按产品 ID 取产品记录（任务 / 锁列表展示用）
export async function productMap() {
  try {
    const products = await loadWifiProducts()
    return new Map(products.map(product => [String(product.productId), product]))
  } catch {
    return new Map()
  }
}

// 错误展示：与 IoT 模块同口径
export function errorText(error) {
  const code = Number(error?.code)
  if (code === 401) return '后台鉴权失败，请联系管理员配置 Token'
  if (code === 4044) return '任务不存在'
  if (code === 5001) return `渲染失败：${error.message}`
  if (code === 5002) return `OSS 上传失败：${error.message}`
  return error?.message || '请求失败，请重试'
}
