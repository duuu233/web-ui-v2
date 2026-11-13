import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { allowedRoute, createIntimgClient, intimgPath, IntimgError } from '../src/api/intimgClient.js'
import {
  SLOT_KEYS, buildDeviceQuery, buildLockQuery, buildTaskPayload, buildTaskQuery, checkUploadSize, manifestOf, manifestText,
  normalizeDeviceNo, orderedTargets, outdatedSlotText, permission, productRenderParams, readyPrefixLimit, selectAllKeywordWarning,
  slotBlockReason, targetSlotsText, uploadFields
} from '../src/views/intimg/model.js'

const ready = keys => SLOT_KEYS.map((slotKey, index) => ({ slotKey, status: keys.includes(slotKey) ? 'READY' : 'RENDERING_DISABLED', version: index + 1 }))

test('连续前缀：可更新上限、不可选提示与实际下发清单', () => {
  assert.equal(readyPrefixLimit(ready(SLOT_KEYS)), 5)
  assert.equal(readyPrefixLimit(ready([])), -1, 'FACTORY 未配置')
  // 13.3 反例：只配了 FACTORY 和 NO_WIFI，SET 缺 → 上限 FACTORY，NO_WIFI 及之后不可选
  const broken = ready(['FACTORY', 'NO_WIFI'])
  assert.equal(readyPrefixLimit(broken), 0)
  assert.equal(slotBlockReason(broken, 'FACTORY'), '')
  assert.match(slotBlockReason(broken, 'SET'), /「设置图」未配置/)
  assert.match(slotBlockReason(broken, 'NO_WIFI'), /请先配置「设置图」/)
  assert.deepEqual(manifestOf(['NO_WIFI']), ['FACTORY', 'SET', 'NO_WIFI'], '只勾 NO_WIFI 也要带上 FACTORY、SET')
  assert.deepEqual(manifestOf(['FACTORY']), ['FACTORY'])
  assert.deepEqual(manifestOf(['SET', 'FACTORY', 'BAD']), ['FACTORY', 'SET'])
  assert.deepEqual(manifestOf([]), [])
  assert.equal(manifestText(['FACTORY', 'SET'], ready(SLOT_KEYS)), 'FACTORY v1 → SET v2')
  assert.deepEqual(orderedTargets(['NO_WIFI', 'FACTORY', 'X']), ['FACTORY', 'NO_WIFI'])
})

test('产品渲染参数与上传尺寸校验', () => {
  const portrait = { width: 1200, height: 1600, screenType: 0, renderMode: 'esp32', rotationDegree: 270, verticalRotation: 0 }
  const params = productRenderParams(portrait)
  assert.deepEqual(uploadFields(params), { renderMode: 'esp32', orientation: 'PORTRAIT', canvasWidth: 1200, canvasHeight: 1600 })
  assert.equal(params.rotation, 0, '竖屏用竖向旋转度数')
  assert.equal(checkUploadSize(1200, 1600, params), '')
  assert.match(checkUploadSize(1600, 1200, params), /与产品要求 1200 × 1600 不符/)
  const landscape = productRenderParams({ ...portrait, screenType: 1, renderMode: 'fpga16' })
  assert.equal(landscape.orientation, 'LANDSCAPE')
  assert.equal(landscape.rotation, 270, '横屏用横向旋转度数')
  assert.equal(checkUploadSize(1600, 1200, landscape), '', '原图转 270° 后正好是画布')
  assert.match(checkUploadSize(1200, 1600, landscape), /原图须为 1600 × 1200/)
  assert.equal(productRenderParams({ ...portrait, verticalRotation: -180 }).rotation, 180)
  assert.match(productRenderParams({ ...portrait, width: 0 }).error, /尺寸未配置/)
  assert.match(productRenderParams({ ...portrait, renderMode: '' }).error, /渲染模式/)
  assert.match(checkUploadSize(1200, 1600, productRenderParams({ ...portrait, renderMode: 'x' })), /渲染模式/, '参数不合法时一律拒绝，不兜底')
})

test('查询与提交负载', () => {
  assert.equal(normalizeDeviceNo(' 38:44:be:2e:52:20 ', true), '3844BE2E5220')
  assert.throws(() => normalizeDeviceNo('38:44', true))
  assert.deepEqual(buildDeviceQuery(709, { versionState: 'NOT_PUSHED', online: false, registered: null, keyword: ' 38:44 ' }, 2, 50),
    { productId: '709', versionState: 'NOT_PUSHED', online: false, page: 2, size: 50, keyword: '3844' })
  assert.deepEqual(buildDeviceQuery('709', { versionState: 'BAD', online: '' }), { productId: '709', page: 1, size: 20 })
  assert.throws(() => buildDeviceQuery('', {}), /选择产品/)
  assert.throws(() => buildDeviceQuery('709', {}, 1, 30), /分页/)
  assert.deepEqual(buildTaskQuery({ productId: 709, status: 'DONE' }), { page: 1, size: 20, productId: '709', status: 'DONE' })
  assert.deepEqual(buildLockQuery({ deviceNo: 'aa:bb' }), { page: 1, size: 20, deviceNo: 'AABB' })

  assert.deepEqual(buildTaskPayload({ productId: 709, targets: ['NO_WIFI'], deviceNos: ['38:44:BE:2E:52:20', '3844BE2E5220'] }),
    { productId: '709', slotKeys: ['NO_WIFI'], deviceNos: ['3844BE2E5220'] }, '只传目标槽位，前缀由服务端补齐；设备号去冒号去重')
  assert.deepEqual(buildTaskPayload({ productId: '709', targets: ['FACTORY'], selectAll: true, draft: { versionState: 'NOT_PUSHED', online: true, keyword: 'x' } }),
    { productId: '709', slotKeys: ['FACTORY'], selectAll: true, filter: { versionState: 'NOT_PUSHED', online: true } }, '全选用 selectAll + filter')
  assert.throws(() => buildTaskPayload({ productId: '709', targets: [], deviceNos: ['3844BE2E5220'] }), /目标槽位/)
  assert.throws(() => buildTaskPayload({ productId: '709', targets: ['FACTORY'], deviceNos: [] }), /一台设备/)
  assert.match(selectAllKeywordWarning({ keyword: '38' }), /关键词不参与/)
  assert.equal(selectAllKeywordWarning({ keyword: '' }), '')

  assert.equal(outdatedSlotText({ slots: [{ slotKey: 'SET', state: 'OUTDATED', currentVersion: 1, latestVersion: 2 }, { slotKey: 'FACTORY', state: 'LATEST' }] }), 'SET v1→v2')
  assert.equal(targetSlotsText({ targetSlots: ['FACTORY', 'NO_WIFI'] }), 'FACTORY、NO_WIFI')
  assert.equal(targetSlotsText({ targetSlots: [], slotKey: 'SET' }), 'SET', '历史单槽位任务兼容 slotKey')
})

test('客户端：只允许 13 条接口，不带 ZoneAdmin 鉴权字段，multipart 不手写 Content-Type', async () => {
  assert.equal(allowedRoute('GET', '/admin/intimg/slots'), true)
  assert.equal(allowedRoute('POST', intimgPath('/admin/intimg/slots', 709, 'FACTORY', 'image')), true)
  assert.equal(allowedRoute('POST', intimgPath('/admin/intimg/tasks', 'P20261110-004', 'items', 'retry')), true)
  assert.equal(allowedRoute('GET', '/admin/intimg/slots/709/FACTORY/image'), false, '方法不对')
  assert.equal(allowedRoute('GET', '/admin/device/list'), false, '不是内置图接口')
  assert.equal(intimgPath('/admin/intimg/locks', 'A/B', 'release'), '/admin/intimg/locks/A%2FB/release', '路径参数编码')

  const calls = []
  const transport = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, json: async () => ({ code: 0, msg: 'ok', data: { ok: 1 } }) } }
  const client = createIntimgClient({ baseURL: 'https://iot.example/', transport, internalToken: () => 'internal' })
  assert.deepEqual(await client.get('/admin/intimg/devices', { productId: '709', userToken: 'x', sign: 'y', online: false, keyword: '' }), { ok: 1 })
  assert.equal(calls[0].url, 'https://iot.example/admin/intimg/devices?productId=709&online=false')
  assert.equal(calls[0].init.credentials, 'omit')
  assert.equal(calls[0].init.headers['X-Internal-Token'], 'internal')
  await client.postJson('/admin/intimg/tasks', { productId: '709' })
  assert.equal(calls[1].init.headers['Content-Type'], 'application/json')
  assert.equal(calls[1].init.body, '{"productId":"709"}')
  const form = { marker: true }
  await client.postForm(intimgPath('/admin/intimg/slots', 709, 'SET', 'image'), form)
  assert.equal(calls[2].init.body, form)
  assert.equal(calls[2].init.headers['Content-Type'], undefined)
  await assert.rejects(client.get('/admin/stats'), error => error instanceof IntimgError && error.code === 'PATH')

  const failing = createIntimgClient({ transport: async () => ({ ok: true, status: 200, json: async () => ({ code: 4000, msg: '槽位「设置图」未配置，无法更新「无 WiFi 提示」', data: null }) }) })
  await assert.rejects(failing.postJson('/admin/intimg/tasks', {}), error => error.code === 4000 && /设置图/.test(error.message))
  const unauthorized = createIntimgClient({ transport: async () => ({ ok: false, status: 401, json: async () => ({}) }) })
  await assert.rejects(unauthorized.get('/admin/intimg/locks'), error => error.code === 401)
})

test('菜单范围：权限码与页面一致，导航 appUrl 都是已注册的路由名', () => {
  const script = readFileSync(new URL('../scripts/sync-admin-menu.mjs', import.meta.url), 'utf8')
  const routes = readFileSync(new URL('../src/router/routes.js', import.meta.url), 'utf8')
  const scriptCodes = new Set(script.match(/(?:Get|Post)_IotIntimg_\w+/g))
  assert.deepEqual([...scriptCodes].sort(), Object.values(permission).sort())
  assert.match(script, /intimg: \{ label: '内置图管理/)
  for (const name of ['intimgSlots', 'intimgDevices', 'intimgTaskCreate', 'intimgTasks', 'intimgLocks']) {
    assert.ok(script.includes(`'${name}'`), `菜单 ${name}`)
    assert.ok(routes.includes(`name: '${name}'`), `路由 ${name}`)
  }
  assert.ok(routes.includes("name: 'intimgTaskDetail'") && routes.includes("activeMenu: 'intimgTasks'"), '详情页高亮任务列表')
})
