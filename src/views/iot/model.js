export const categories = [
  { value: 'ONLINE_OFFLINE', label: '上下线' }, { value: 'COMMAND', label: '指令' },
  { value: 'OTA', label: '升级' }, { value: 'ALARM', label: '告警' }, { value: 'EXCEPTION', label: '异常' }
]
export const results = ['SUCCESS', 'FAILED', 'TIMEOUT', 'DOWNLOADING', 'FLASHING']
export function normalizeDeviceNo(value, exact = false) {
  const result = String(value ?? '').trim().replaceAll(':', '').toUpperCase()
  if (exact && !/^[0-9A-F]{12}$/.test(result)) throw new Error('设备号须为12位十六进制字符，可带冒号')
  return result
}
export function displayDeviceNo(value) {
  if (value === null || value === undefined || value === '') return '—'
  const normalized = normalizeDeviceNo(value)
  return /^[0-9A-F]{12}$/.test(normalized) ? normalized.match(/.{2}/g).join(':') : String(value)
}
export function shanghaiTime(value = new Date()) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)) return value.slice(0, 19).replace('T', ' ')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]))
  return parts.year + '-' + parts.month + '-' + parts.day + ' ' + parts.hour + ':' + parts.minute + ':' + parts.second
}
export function recent24Hours(now = Date.now()) { return { startTime: shanghaiTime(now - 86400000), endTime: shanghaiTime(now) } }
export function timeValue(text) {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(text))) throw new Error('时间格式须为yyyy-MM-dd HH:mm:ss')
  const time = Date.parse(text.replace(' ', 'T') + '+08:00')
  if (!Number.isFinite(time) || shanghaiTime(time) !== text) throw new Error('请输入有效的日期和时间')
  return time
}
export function buildListQuery(kind, draft, page = 1, size = 20) {
  if (!Number.isInteger(page) || page < 1 || ![20, 50, 100].includes(size)) throw new Error('分页参数无效')
  const query = { page, size }
  if (kind === 'devices') {
    const keyword = normalizeDeviceNo(draft.keyword)
    if (keyword) query.keyword = keyword
    if (draft.online === true || draft.online === false) query.online = draft.online
  } else {
    if (String(draft.deviceNo ?? '').trim()) query.deviceNo = normalizeDeviceNo(draft.deviceNo, true)
    if (draft.category) { if (!categories.some(x => x.value === draft.category)) throw new Error('日志分类无效'); query.category = draft.category }
    if (draft.result) { if (!results.includes(draft.result)) throw new Error('日志结果无效'); query.result = draft.result }
    for (const key of ['startTime', 'endTime']) if (draft[key]) { timeValue(draft[key]); query[key] = draft[key] }
    if (query.startTime && query.endTime && timeValue(query.startTime) > timeValue(query.endTime)) throw new Error('开始时间不能晚于结束时间')
  }
  return query
}
export function fromRoute(kind, query, initial = false) {
  const one = value => typeof value === 'string' ? value : ''
  return kind === 'devices'
    ? { keyword: one(query.keyword), online: query.online === 'true' ? true : query.online === 'false' ? false : null }
    : { deviceNo: one(query.deviceNo), category: one(query.category), result: one(query.result), ...(initial ? recent24Hours() : { startTime: '', endTime: '' }), ...(query.startTime ? { startTime: one(query.startTime) } : {}), ...(query.endTime ? { endTime: one(query.endTime) } : {}) }
}
export function valueText(value) {
  if (value === null || value === undefined || value === '') return '—'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}
export function statusValue(kind, value) {
  if (value === null || value === undefined || value === '') return { text: '—', tone: 'info' }
  if (kind === 'online') return value === true ? { text: '在线', tone: 'success' } : value === false ? { text: '离线', tone: 'info' } : { text: '未知', tone: 'info' }
  const number = Number(value)
  if (kind === 'battery') return Number.isFinite(number) ? { text: number + '%', tone: number < 20 ? 'danger' : number <= 40 ? 'warning' : 'success' } : { text: '—', tone: 'info' }
  if (kind === 'wifiRssi') return Number.isFinite(number) ? { text: number + ' dBm', tone: number >= -60 ? 'success' : number >= -75 ? 'warning' : 'danger' } : { text: '—', tone: 'info' }
  if (kind === 'tfStatus') return { text: value === 'present' ? '已插卡' : value === 'absent' ? '无卡' : String(value), tone: value === 'present' ? 'success' : 'info' }
  return { text: String(value), tone: value === 'SUCCESS' ? 'success' : ['FAILED', 'TIMEOUT'].includes(value) ? 'danger' : ['DOWNLOADING', 'FLASHING'].includes(value) ? 'primary' : 'info' }
}
export const shadowGroups = [
  { title: '电源与连接', fields: [['battery', '电量'], ['wifiRssi', 'WiFi 信号'], ['wifiCh', 'WiFi 信道'], ['wifiOn', 'WiFi'], ['bleOn', '蓝牙'], ['bleRssi', '蓝牙信号'], ['wifiName', 'WiFi 名称']] },
  { title: '存储与显示', fields: [['tfStatus', 'TF 卡'], ['tfTotal', 'TF 容量 (MB)'], ['tfUsed', 'TF 已用 (MB)'], ['orientation', '方向'], ['countryCode', '国家码'], ['statype', '基站类型']] },
  { title: '版本与心跳', fields: [['version', '版本'], ['espVersion', 'ESP 版本'], ['fpgaVersion', 'FPGA 版本'], ['lastHeartAt', '最后心跳'], ['lastTagAt', '最后标签上报']] }
]
export function otherShadowEntries(shadow) {
  const known = new Set(shadowGroups.flatMap(group => group.fields.map(([key]) => key)))
  return Object.entries(shadow || {}).filter(([key]) => !known.has(key))
}
