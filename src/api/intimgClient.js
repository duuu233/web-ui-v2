// 内置图管理接口客户端（IoT 服务 /admin/intimg/*，产品提供的《前端内置图开发清单》定稿 2026-11-13）。
//
// 与 IoT 只读监控同一服务、同一套鉴权方式：不走 ZoneAdmin 请求实例，不发送 userToken / randomString / sign / Cookie；
// 运行环境注入了内部 Token 时才带 X-Internal-Token。响应体 { code, msg, data }，code=0 成功。
// 只允许下列 13 条接口，路径参数逐段编码，避免拼出别的路径。
export class IntimgError extends Error {
  constructor(code, message, status = 0) {
    super(message)
    this.name = 'IntimgError'
    this.code = code
    this.status = status
  }
}

const SEGMENT = '[^/]+'
const routes = [
  ['GET', '/admin/intimg/slots/summary'],
  ['GET', '/admin/intimg/slots'],
  ['POST', `/admin/intimg/slots/${SEGMENT}/${SEGMENT}/image`],
  ['POST', `/admin/intimg/slots/${SEGMENT}/${SEGMENT}/render`],
  ['GET', '/admin/intimg/devices'],
  ['GET', '/admin/intimg/tasks'],
  ['POST', '/admin/intimg/tasks'],
  ['GET', `/admin/intimg/tasks/${SEGMENT}`],
  ['GET', `/admin/intimg/tasks/${SEGMENT}/items`],
  ['POST', `/admin/intimg/tasks/${SEGMENT}/items/cancel`],
  ['POST', `/admin/intimg/tasks/${SEGMENT}/items/retry`],
  ['GET', '/admin/intimg/locks'],
  ['POST', `/admin/intimg/locks/${SEGMENT}/release`]
].map(([method, pattern]) => ({ method, pattern: new RegExp(`^${pattern}$`) }))

const AUTH_FIELDS = ['userToken', 'sign', 'randomString']

export function allowedRoute(method, path) {
  return routes.some(route => route.method === method && route.pattern.test(path))
}

// 路径参数编码：intimgPath('/admin/intimg/slots', productId, slotKey, 'image')
export function intimgPath(base, ...segments) {
  return [base.replace(/\/$/, ''), ...segments.map(segment => encodeURIComponent(String(segment)))].join('/')
}

export function createIntimgClient({
  baseURL = 'https://iot.boltfox.cn',
  internalToken = () => '',
  transport = globalThis.fetch,
  timeoutMs = 15000,
  uploadTimeoutMs = 120000
} = {}) {
  async function send(method, path, { params, json, form, signal } = {}) {
    if (!allowedRoute(method, path)) throw new IntimgError('PATH', '不支持的内置图接口')
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params || {})) {
      if (value !== '' && value !== null && value !== undefined && !AUTH_FIELDS.includes(key)) query.set(key, String(value))
    }
    const headers = { Accept: 'application/json' }
    const token = internalToken()
    if (token) headers['X-Internal-Token'] = token
    let body
    if (json !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(json)
    } else if (form) {
      body = form // multipart：浏览器自动带 boundary，不能手写 Content-Type
    }
    const timeout = AbortSignal.timeout(form ? uploadTimeoutMs : timeoutMs)
    let response
    try {
      response = await transport(baseURL.replace(/\/$/, '') + path + (query.size ? '?' + query : ''), {
        method,
        headers,
        body,
        credentials: 'omit',
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout
      })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      const isTimeout = error?.name === 'TimeoutError'
      throw new IntimgError(isTimeout ? 'TIMEOUT' : 'NETWORK', isTimeout ? '请求超时，请稍后重试' : '网络请求失败，请检查连接后重试')
    }
    if (response.status === 401) throw new IntimgError(401, '后台鉴权失败，请联系管理员配置 Token', 401)
    let result
    try {
      result = await response.json()
    } catch {
      throw new IntimgError('RESPONSE', '接口未返回有效的JSON数据', response.status)
    }
    if (!response.ok || result.code !== 0) throw new IntimgError(result.code ?? response.status, result.msg || '服务异常，请稍后重试', response.status)
    return result.data
  }

  return {
    get: (path, params, signal) => send('GET', path, { params, signal }),
    postJson: (path, json = {}, signal) => send('POST', path, { json, signal }),
    postForm: (path, form, signal) => send('POST', path, { form, signal }),
    // 无请求体的 POST（重新渲染、强制释放锁）
    post: (path, signal) => send('POST', path, { signal })
  }
}
