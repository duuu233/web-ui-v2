import { IotAdminError } from '@/api/iotAdminClient'
import { categories, results, shanghaiTime, timeValue } from './model'

export function createIotMock(now = Date.now()) {
  const devices = Array.from({ length: 56 }, (_, i) => ({ deviceNo: 'A0B1C2' + (i + 1).toString(16).padStart(6, '0').toUpperCase(), online: i % 3 !== 0, lastOnlineAt: i % 7 === 0 ? null : shanghaiTime(now - i * 2400000), firmwareVersion: i % 7 === 0 ? null : '0.6.' + (i % 3), battery: i % 7 === 0 ? null : (i * 17) % 101, wifiRssi: i % 7 === 0 ? null : -30 - (i * 7) % 60, tfStatus: i % 7 === 0 ? null : i % 2 ? 'present' : 'absent' }))
  const logs = Array.from({ length: 145 }, (_, i) => ({ id: 500 - i, deviceNo: devices[i % devices.length].deviceNo, category: categories[i % categories.length].value, action: ['login', 'play', 'ota', 'LOW_BATTERY', 'EXCEPTION_UP_PARSE'][i % 5], result: results[i % results.length], msgid: i % 7 ? 'DEMO-' + (9000 + i) : null, detail: '演示日志：设备状态回执。' + (i % 4 === 0 ? '包含完整诊断说明与响应内容，供展开查看。'.repeat(8) : '任务已记录。'), createdAt: shanghaiTime(now - i * 900000) }))
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
    let rows = empty ? [] : path === '/admin/device/list' ? devices : logs
    rows = rows.filter(row => (!params.keyword || row.deviceNo.includes(params.keyword)) && (params.online === undefined || row.online === params.online) && (!params.deviceNo || row.deviceNo === params.deviceNo) && (!params.category || row.category === params.category) && (!params.result || row.result === params.result) && (!params.startTime || timeValue(row.createdAt) >= timeValue(params.startTime)) && (!params.endTime || timeValue(row.createdAt) <= timeValue(params.endTime)))
    const page = params.page || 1, size = params.size || 20
    return { total: rows.length, page, size, list: rows.slice((page - 1) * size, page * size) }
  }
}
