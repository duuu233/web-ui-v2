export class IotAdminError extends Error {
  constructor(code, message, status = 0) { super(message); this.name = 'IotAdminError'; this.code = code; this.status = status }
}
const paths = new Set(['/admin/stats', '/admin/device/list', '/admin/device/detail', '/admin/log/list'])
export function createIotAdminClient({ baseURL = 'https://iot.boltfox.cn', internalToken = () => '', transport = globalThis.fetch, timeoutMs = 15000 } = {}) {
  return async function get(path, params = {}, signal) {
    if (!paths.has(path)) throw new IotAdminError('PATH', '不支持的只读接口')
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) if (value !== '' && value !== null && value !== undefined && !['userToken', 'sign', 'randomString'].includes(key)) query.set(key, String(value))
    const headers = { Accept: 'application/json' }
    const token = internalToken()
    if (token) headers['X-Internal-Token'] = token
    let response
    try { response = await transport(baseURL.replace(/\/$/, '') + path + (query.size ? '?' + query : ''), { method: 'GET', headers, credentials: 'omit', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs) }) }
    catch (error) { if (error?.name === 'AbortError') throw error; throw new IotAdminError(error?.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK', error?.name === 'TimeoutError' ? '请求超时，请稍后重试' : '网络请求失败，请检查连接后重试') }
    if (response.status === 401) throw new IotAdminError(401, '后台鉴权失败，请联系管理员配置 Token', 401)
    let body
    try { body = await response.json() } catch { throw new IotAdminError('RESPONSE', '接口未返回有效的JSON数据', response.status) }
    if (!response.ok || body.code !== 0) throw new IotAdminError(body.code ?? response.status, body.msg || '服务异常，请稍后重试', response.status)
    return body.data
  }
}
