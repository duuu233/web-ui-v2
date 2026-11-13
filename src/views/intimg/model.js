// 内置图管理纯逻辑（无 Vue / 浏览器依赖，tests/intimg-admin.test.mjs 直接引用）。
// 口径来自产品提供的《前端内置图开发清单》定稿（2026-11-13），见 docs/intimg-admin.md。

// 菜单 / 按钮权限码（scripts/sync-admin-menu.mjs 的 intimg 范围）；系统管理员不受按钮权限限制
export const permission = {
  slots: 'Get_IotIntimg_SlotList',
  upload: 'Post_IotIntimg_UploadSlotImage',
  render: 'Post_IotIntimg_RenderSlot',
  devices: 'Get_IotIntimg_DeviceList',
  createTask: 'Post_IotIntimg_AddTask',
  tasks: 'Get_IotIntimg_TaskList',
  taskDetail: 'Get_IotIntimg_TaskDetail',
  cancel: 'Post_IotIntimg_CancelTaskItems',
  retry: 'Post_IotIntimg_RetryTaskItems',
  locks: 'Get_IotIntimg_LockList',
  release: 'Post_IotIntimg_ReleaseLock'
}

// 6 个槽位，顺序固定（下发清单必须是从 FACTORY 开始的连续前缀）
export const SLOTS = [
  { key: 'FACTORY', name: '出厂图', short: 'F' },
  { key: 'SET', name: '设置图', short: 'S' },
  { key: 'NO_WIFI', name: '无 WiFi 提示', short: 'N' },
  { key: 'LOW_BATTERY', name: '低电量提示', short: 'LB' },
  { key: 'LOW_POWER_OFF', name: '低电量关机页', short: 'LP' },
  { key: 'CONNECTED', name: '连接页', short: 'C' }
]
export const SLOT_KEYS = SLOTS.map(slot => slot.key)
export const SLOT_TOTAL = SLOTS.length

export function slotName(key) {
  return SLOTS.find(slot => slot.key === key)?.name || key || '—'
}

export const SLOT_STATUS = {
  READY: { text: '已配置', tone: 'success' },
  RENDERING_DISABLED: { text: '未配置', tone: 'info' }
}

// 设备整体 / 单槽位版本状态
export const VERSION_STATES = [
  { value: 'LATEST', text: '最新', tone: 'success' },
  { value: 'OUTDATED', text: '落后', tone: 'warning' },
  { value: 'NOT_PUSHED', text: '未推送', tone: 'info' }
]
export function versionStateInfo(value) {
  return VERSION_STATES.find(item => item.value === value) || { value, text: value || '—', tone: 'info' }
}

// 任务明细状态（§5.3）；设备只回 106 时停在 SENT，按「已下发」展示，不能写成成功
export const ITEM_STATUSES = [
  { value: 'PENDING', text: '待补发', tone: 'warning' },
  { value: 'SENT', text: '已下发', tone: 'primary' },
  { value: 'SUCCESS', text: '成功', tone: 'success' },
  { value: 'FAILED', text: '失败', tone: 'danger' },
  { value: 'EXPIRED', text: '已失效', tone: 'danger' },
  { value: 'SKIPPED_BUSY', text: '设备忙', tone: 'danger' },
  { value: 'CANCELED', text: '已取消', tone: 'info' }
]
export function itemStatusInfo(value) {
  return ITEM_STATUSES.find(item => item.value === value) || { value, text: value || '—', tone: 'info' }
}
// 详情 Tab：全部 / 待补发 / 已下发 / 成功 / 失败 / 已失效 / 已取消
export const ITEM_TABS = [{ value: '', text: '全部' }, ...['PENDING', 'SENT', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELED'].map(value => ({ value, text: itemStatusInfo(value).text }))]
// 取消只对待补发 / 已下发生效；重发针对失败类（任务 failed 计数 = FAILED + EXPIRED + SKIPPED_BUSY）。
// 不传设备时服务端只重发 FAILED。
export const CANCELABLE = ['PENDING', 'SENT']
export const RETRYABLE = ['FAILED', 'EXPIRED', 'SKIPPED_BUSY']

export const TASK_STATUSES = [
  { value: 'RUNNING', text: '执行中', tone: 'primary' },
  { value: 'DONE', text: '已完成', tone: 'success' },
  { value: 'CANCELED', text: '已取消', tone: 'info' }
]
export function taskStatusInfo(value) {
  return TASK_STATUSES.find(item => item.value === value) || { value, text: value || '—', tone: 'info' }
}

export const PAGE_SIZES = [20, 50, 100]

// ── 设备号 ─────────────────────────────────────────────
// 接口要 12 位十六进制、不带冒号；搜索允许部分关键词
export function normalizeDeviceNo(value, exact = false) {
  const result = String(value ?? '').trim().replaceAll(':', '').replaceAll('-', '').toUpperCase()
  if (exact && !/^[0-9A-F]{12}$/.test(result)) throw new Error('设备号须为12位十六进制字符，可带冒号')
  return result
}

export function textOr(value, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : String(value)
}

// ── 连续前缀 ─────────────────────────────────────────────
// 「可更新上限」：从 FACTORY 起连续 READY 的最后一个槽位下标；FACTORY 未配置为 -1
export function readyPrefixLimit(slots) {
  const ready = new Set((slots || []).filter(slot => slot && slot.status === 'READY').map(slot => slot.slotKey))
  let limit = -1
  for (let i = 0; i < SLOT_KEYS.length; i++) {
    if (!ready.has(SLOT_KEYS[i])) break
    limit = i
  }
  return limit
}

// 目标槽位能不能勾：超过可更新上限的不可选，返回提示（需先配置哪个槽位）；可选返回空串
export function slotBlockReason(slots, key) {
  const index = SLOT_KEYS.indexOf(key)
  if (index < 0) return '未知槽位'
  const limit = readyPrefixLimit(slots)
  if (index <= limit) return ''
  const missing = SLOT_KEYS[limit + 1]
  return missing === key ? `「${slotName(key)}」未配置，请先上传` : `请先配置「${slotName(missing)}」，链路在此断开`
}

// 实际下发清单：从 FACTORY 到所选目标里最靠后的那个（服务端同样自动补齐）
export function manifestOf(targetKeys) {
  const indexes = (targetKeys || []).map(key => SLOT_KEYS.indexOf(key)).filter(index => index >= 0)
  if (!indexes.length) return []
  return SLOT_KEYS.slice(0, Math.max(...indexes) + 1)
}

// 清单文案，如「FACTORY v3 → SET v1」；slots 为当前槽位列表（取版本号）
export function manifestText(keys, slots) {
  const versions = Object.fromEntries((slots || []).map(slot => [slot.slotKey, slot.version]))
  return keys.map(key => (versions[key] ? `${key} v${versions[key]}` : key)).join(' → ')
}

// 槽位勾选的规范化：只保留合法 key，按固定顺序
export function orderedTargets(keys) {
  const set = new Set(keys || [])
  return SLOT_KEYS.filter(key => set.has(key))
}

// ── 产品 → 渲染参数 ─────────────────────────────────────────────
// 老后台产品：width / height = 画布像素（字段名「尺寸(cm)」，值是像素）；screenType 0 竖 / 1 横；
// renderMode esp32 / fpga16；rotationDegree 横向旋转度数、verticalRotation 竖向旋转度数（前端上传前应用到图片内容上）
export function productRenderParams(product) {
  const canvasWidth = Number(product?.width)
  const canvasHeight = Number(product?.height)
  const landscape = Number(product?.screenType) === 1
  const renderMode = String(product?.renderMode ?? '').trim()
  const errors = []
  if (!Number.isInteger(canvasWidth) || !Number.isInteger(canvasHeight) || canvasWidth <= 0 || canvasHeight <= 0) errors.push('产品尺寸未配置正确，请先联系管理员')
  if (!['esp32', 'fpga16'].includes(renderMode)) errors.push('产品渲染模式未配置（须为 esp32 / fpga16）')
  if (![0, 1].includes(Number(product?.screenType))) errors.push('产品屏幕方向未配置')
  const rotation = normalizeRotation(landscape ? product?.rotationDegree : product?.verticalRotation)
  return {
    canvasWidth,
    canvasHeight,
    renderMode,
    orientation: landscape ? 'LANDSCAPE' : 'PORTRAIT',
    orientationText: landscape ? '横屏' : '竖屏',
    rotation,
    error: errors[0] || ''
  }
}

export function normalizeRotation(value) {
  const number = Math.round(Number(value) || 0)
  return ((number % 360) + 360) % 360
}

// 旋转后的宽高（只支持 90 的倍数）
export function rotatedSize(width, height, rotation) {
  return rotation === 90 || rotation === 270 ? { width: height, height: width } : { width, height }
}

// 上传前校验：图片按旋转度数转好后必须正好等于画布尺寸
export function checkUploadSize(imageWidth, imageHeight, params) {
  if (params.error) return params.error
  if (params.rotation % 90 !== 0) return `产品旋转度数 ${params.rotation}° 不是 90 的倍数，无法自动旋转`
  const size = rotatedSize(imageWidth, imageHeight, params.rotation)
  if (size.width === params.canvasWidth && size.height === params.canvasHeight) return ''
  const need = rotatedSize(params.canvasWidth, params.canvasHeight, params.rotation)
  const rotateText = params.rotation ? `（上传前会按产品旋转 ${params.rotation}°，原图须为 ${need.width} × ${need.height}）` : ''
  return `图片尺寸 ${imageWidth} × ${imageHeight} 与产品要求 ${params.canvasWidth} × ${params.canvasHeight} 不符${rotateText}`
}

export function uploadFields(params) {
  return {
    renderMode: params.renderMode,
    orientation: params.orientation,
    canvasWidth: params.canvasWidth,
    canvasHeight: params.canvasHeight
  }
}

// ── 查询与提交 ─────────────────────────────────────────────
function pageQuery(page, size) {
  if (!Number.isInteger(page) || page < 1 || !PAGE_SIZES.includes(size)) throw new Error('分页参数无效')
  return { page, size }
}

function boolOrNull(value) {
  return value === true || value === false ? value : null
}

// 设备筛选：versionState / online / registered（筛选同 §2.2，不含槽位）
export function deviceFilter(draft) {
  const filter = {}
  if (VERSION_STATES.some(item => item.value === draft?.versionState)) filter.versionState = draft.versionState
  const online = boolOrNull(draft?.online)
  if (online !== null) filter.online = online
  const registered = boolOrNull(draft?.registered)
  if (registered !== null) filter.registered = registered
  return filter
}

export function buildDeviceQuery(productId, draft, page = 1, size = 20) {
  if (!String(productId ?? '').trim()) throw new Error('请先选择产品')
  const query = { productId: String(productId), ...deviceFilter(draft), ...pageQuery(page, size) }
  const keyword = normalizeDeviceNo(draft?.keyword)
  if (keyword) query.keyword = keyword
  return query
}

export function buildTaskQuery(draft, page = 1, size = 20) {
  const query = pageQuery(page, size)
  if (String(draft?.productId ?? '').trim()) query.productId = String(draft.productId)
  if (TASK_STATUSES.some(item => item.value === draft?.status)) query.status = draft.status
  return query
}

export function buildLockQuery(draft, page = 1, size = 20) {
  const query = pageQuery(page, size)
  const deviceNo = normalizeDeviceNo(draft?.deviceNo)
  if (deviceNo) query.deviceNo = deviceNo
  return query
}

// 新建推送任务：指定设备与「全选当前筛选结果」二选一；全选时带当前筛选（keyword 不在接口 filter 里，带了也不生效）
export function buildTaskPayload({ productId, targets, selectAll, deviceNos, draft }) {
  if (!String(productId ?? '').trim()) throw new Error('请先选择产品')
  const slotKeys = orderedTargets(targets)
  if (!slotKeys.length) throw new Error('请至少选择一个目标槽位')
  const payload = { productId: String(productId), slotKeys }
  if (selectAll) {
    payload.selectAll = true
    payload.filter = deviceFilter(draft)
  } else {
    const list = [...new Set((deviceNos || []).map(no => normalizeDeviceNo(no, true)))]
    if (!list.length) throw new Error('请至少选择一台设备')
    payload.deviceNos = list
  }
  return payload
}

// 「全选当前筛选结果」时设备号关键词不会进入任务筛选：有关键词时要提醒
export function selectAllKeywordWarning(draft) {
  return normalizeDeviceNo(draft?.keyword) ? '「全选当前筛选结果」按版本状态 / 在线 / 登记状态筛选，设备号关键词不参与，请清空关键词后再全选' : ''
}

// 设备行：落后的槽位名，如「SET v1 落后」
export function outdatedSlotText(device) {
  const slots = (device?.slots || []).filter(slot => slot.state === 'OUTDATED')
  return slots.map(slot => `${slot.slotKey} v${slot.currentVersion ?? '—'}→v${slot.latestVersion}`).join('、')
}

// 任务五个计数之和 = total（用于展示进度）
export function taskProgress(task) {
  const total = Number(task?.total) || 0
  const done = (Number(task?.success) || 0) + (Number(task?.sent) || 0) + (Number(task?.failed) || 0) + (Number(task?.canceled) || 0)
  return total ? Math.round((done / total) * 100) : 0
}

// 目标槽位文案（历史单槽位任务只有 slotKey）
export function targetSlotsText(task) {
  const targets = Array.isArray(task?.targetSlots) && task.targetSlots.length ? task.targetSlots : task?.slotKey ? [task.slotKey] : []
  return targets.length ? targets.join('、') : '—'
}

export function productLabel(product) {
  if (!product) return '—'
  return [product.productName, product.sizeModel].filter(Boolean).join(' · ') || String(product.productId)
}
