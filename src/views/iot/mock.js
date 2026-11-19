import { IotAdminError } from '@/api/iotAdminClient'
import { categories, results, shanghaiTime, timeValue } from './model'

export function createIotMock(now = Date.now()) {
  const devices = Array.from({ length: 56 }, (_, i) => ({ deviceNo: 'A0B1C2' + (i + 1).toString(16).padStart(6, '0').toUpperCase(), online: i % 3 !== 0, lastOnlineAt: i % 7 === 0 ? null : shanghaiTime(now - i * 2400000), firmwareVersion: i % 7 === 0 ? null : '0.6.' + (i % 3), battery: i % 7 === 0 ? null : (i * 17) % 101, wifiRssi: i % 7 === 0 ? null : -30 - (i * 7) % 60, tfStatus: i % 7 === 0 ? null : i % 2 ? 'present' : 'absent' }))
  const logs = Array.from({ length: 145 }, (_, i) => ({ id: 500 - i, deviceNo: devices[i % devices.length].deviceNo, category: categories[i % categories.length].value, action: ['login', 'play', 'ota', 'LOW_BATTERY', 'EXCEPTION_UP_PARSE'][i % 5], result: results[i % results.length], msgid: i % 7 ? 'DEMO-' + (9000 + i) : null, detail: '演示日志：设备状态回执。' + (i % 4 === 0 ? '包含完整诊断说明与响应内容，供展开查看。'.repeat(8) : '任务已记录。'), createdAt: shanghaiTime(now - i * 900000) }))
  // 消息通知：前 3 台设备各 45 条，覆盖四个类别、空 payload、成对上下线抖动与四种语言文案
  const kinds = [
    ['DEVICE', 'DEVICE_OFFLINE', null, { 'zh-CN': ['设备已离线', '设备已断开连接，请检查电源和网络。'], 'zh-TW': ['裝置已離線', '裝置已中斷連線，請檢查電源和網路。'], en: ['Device offline', 'The device is disconnected. Check power and network.'], ja: ['デバイスがオフライン', 'デバイスの接続が切れました。'] }],
    ['DEVICE', 'DEVICE_ONLINE', null, { 'zh-CN': ['设备已上线', '设备已连接网络，可以正常使用。'], 'zh-TW': ['裝置已上線', '裝置已連線，可以正常使用。'], en: ['Device online', 'The device is connected and ready.'], ja: ['デバイスがオンライン', 'デバイスがネットワークに接続されました。'] }],
    ['BUSINESS', 'PLAY_SUCCESS', i => ({ msgid: 'DEMO-' + (8000 + i), result: 113, corrected: false }), { 'zh-CN': ['投屏成功', '图片已显示在设备上。'], 'zh-TW': ['投屏成功', '圖片已顯示在裝置上。'], en: ['Cast succeeded', 'The photo is now on the device.'], ja: ['送信完了', '写真がデバイスに表示されました。'] }],
    ['ALARM', 'LOW_BATTERY', i => ({ level: 2, battery: 10 + i % 10 }), { 'zh-CN': ['电量低', '设备电量偏低，请及时充电。'], 'zh-TW': ['電量低', '裝置電量偏低，請及時充電。'], en: ['Low battery', 'Battery is low. Please charge the device.'], ja: ['バッテリー残量低下', '充電してください。'] }],
    ['EXCEPTION', 'EXCEPTION_UP_PARSE', () => ({ reason: 'unexpected token' }), { 'zh-CN': ['上报解析失败', '设备上报数据解析失败。'], 'zh-TW': ['上報解析失敗', '裝置上報資料解析失敗。'], en: ['Report parse failed', 'Failed to parse device report.'], ja: ['レポート解析失敗', 'デバイスのレポートを解析できませんでした。'] }]
  ]
  const notifications = devices.slice(0, 3).flatMap((device, d) => Array.from({ length: 45 }, (_, i) => {
    const [category, type, payload, texts] = kinds[i % kinds.length]
    return { id: 900 - d * 100 - i, deviceNo: device.deviceNo, category, type, payload: payload ? payload(i) : null, createdAt: shanghaiTime(now - i * 1800000), texts: Object.fromEntries(Object.entries(texts).map(([lang, [title, content]]) => [lang, { title, content }])) }
  }))
  return async (path, params = {}, scenario = 'normal', signal) => {
    await new Promise((resolve, reject) => { const timer = setTimeout(resolve, 180); signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true }) })
    if (scenario === '401') throw new IotAdminError(401, '后台鉴权失败，请联系管理员配置 Token', 401)
    if (scenario === 'error') throw new IotAdminError(5000, '服务异常，请稍后重试')
    if (scenario === '4000') throw new IotAdminError(4000, '参数错误，请检查筛选条件')
    const empty = scenario === 'empty'
    if (path === '/admin/stats') return { totalDevices: empty ? 0 : 56, onlineDevices: empty ? 0 : 37, onlineRate: empty ? 0 : 66.1, activeDevices7d: empty ? 0 : 49, alarmCount24h: empty ? 0 : 12 }
    if (path === '/admin/device/detail') {
      const device = devices.find(item => item.deviceNo === params.deviceNo)
      if (!device || empty || scenario === '4044') throw new IotAdminError(4044, '设备不存在')
      const index = devices.indexOf(device)
      return { ...device, productModel: '10.1', onlineRealtime: index % 4 ? device.online : !device.online, onlineUpdatedAt: shanghaiTime(now), createdAt: shanghaiTime(now - 25 * 86400000), updatedAt: shanghaiTime(now), shadow: index % 7 === 0 ? {} : { battery: device.battery, wifiRssi: device.wifiRssi, wifiCh: 1, wifiOn: 'on', bleOn: 'off', tfStatus: device.tfStatus, tfTotal: 0, tfUsed: 0, orientation: 0, countryCode: '1', statype: '3', version: 'M H:2 F:0.6.2', espVersion: '0.6.2', lastHeartAt: shanghaiTime(now), diagnostic: { source: 'demo', healthy: true } }, recentLogs: logs.filter(log => log.deviceNo === device.deviceNo).slice(0, 20) }
    }
    if (path === '/admin/notification/list') {
      if (!params.deviceNo) throw new IotAdminError(4000, '参数错误')
      const rows = empty ? [] : notifications.filter(row => row.deviceNo === params.deviceNo).map(({ deviceNo, texts, ...row }) => ({ ...row, ...(texts[params.lang] || texts['zh-CN']), read: false }))
      const page = params.page || 1, size = params.size || 20
      return { total: rows.length, page, size, unreadCount: 0, list: rows.slice((page - 1) * size, page * size) }
    }
    let rows = empty ? [] : path === '/admin/device/list' ? devices : logs
    rows = rows.filter(row => (!params.keyword || row.deviceNo.includes(params.keyword)) && (params.online === undefined || row.online === params.online) && (!params.deviceNo || row.deviceNo === params.deviceNo) && (!params.category || row.category === params.category) && (!params.result || row.result === params.result) && (!params.startTime || timeValue(row.createdAt) >= timeValue(params.startTime)) && (!params.endTime || timeValue(row.createdAt) <= timeValue(params.endTime)))
    const page = params.page || 1, size = params.size || 20
    return { total: rows.length, page, size, list: rows.slice((page - 1) * size, page * size) }
  }
}
