import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer as createHttpServer } from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { createRenderer, h, shallowRef, nextTick } from 'vue'
import { createIotAdminClient } from '../src/api/iotAdminClient.js'
import { normalizeDeviceNo, displayDeviceNo, buildListQuery, shanghaiTime, timeValue, statusValue, otherShadowEntries, recent24Hours } from '../src/views/iot/model.js'

test('device query normalizes colons while preserving offline=false and page boundaries', () => {
  assert.equal(normalizeDeviceNo(' a0:b1:c2:00:00:01 ', true), 'A0B1C2000001')
  assert.equal(displayDeviceNo('A0B1C2000001'), 'A0:B1:C2:00:00:01')
  assert.equal(displayDeviceNo(null), '—')
  assert.throws(() => normalizeDeviceNo('bad', true))
  assert.deepEqual(buildListQuery('devices', { keyword: ' a0:b1 ', online: false }, 2, 50), { page: 2, size: 50, keyword: 'A0B1', online: false })
  assert.deepEqual(buildListQuery('devices', { online: null }), { page: 1, size: 20 })
  assert.throws(() => buildListQuery('devices', {}, 0))
  assert.throws(() => buildListQuery('devices', {}, 1, 101))
})

test('log queries validate device/category/results and Shanghai time without local timezone conversion', () => {
  assert.equal(shanghaiTime('2026-10-27T00:00:00Z'), '2026-10-27 08:00:00')
  assert.equal(shanghaiTime('2026-10-27 09:20:00'), '2026-10-27 09:20:00')
  assert.equal(shanghaiTime(0), '1970-01-01 08:00:00')
  assert.equal(shanghaiTime(null), '—')
  const dates = recent24Hours(Date.parse('2026-10-27T00:00:00Z'))
  assert.deepEqual(dates, { startTime: '2026-10-26 08:00:00', endTime: '2026-10-27 08:00:00' })
  assert.equal(timeValue(dates.endTime) - timeValue(dates.startTime), 86400000)
  for (const invalid of ['2026-02-30 12:00:00', '2026-10-27', '2026-10-27 25:00:00']) assert.throws(() => timeValue(invalid))
  const params = buildListQuery('logs', { deviceNo: 'a0:b1:c2:00:00:01', category: 'ALARM', result: 'FAILED', ...dates })
  assert.equal(params.deviceNo, 'A0B1C2000001')
  for (const draft of [{ category: 'bad' }, { result: 'bad' }, { deviceNo: 'bad' }, { startTime: dates.endTime, endTime: dates.startTime }]) assert.throws(() => buildListQuery('logs', draft))
  assert.deepEqual(buildListQuery('logs', {}), { page: 1, size: 20 })
})

test('status thresholds preserve zero, missing data and unknown shadow entries', () => {
  assert.deepEqual(statusValue('battery', 0), { text: '0%', tone: 'danger' })
  for (const [value, tone] of [[19, 'danger'], [20, 'warning'], [40, 'warning'], [41, 'success']]) assert.equal(statusValue('battery', value).tone, tone)
  for (const [value, tone] of [[-59, 'success'], [-60, 'success'], [-61, 'warning'], [-75, 'warning'], [-76, 'danger']]) assert.equal(statusValue('wifiRssi', value).tone, tone)
  assert.equal(statusValue('online', false).text, '离线')
  assert.equal(statusValue('online', null).text, '—')
  assert.equal(statusValue('tfStatus', 'new-value').text, 'new-value')
  for (const result of ['FAILED', 'TIMEOUT']) assert.equal(statusValue('result', result).tone, 'danger')
  assert.deepEqual(otherShadowEntries({ battery: 0, diagnostic: { healthy: true }, future: 0 }), [['diagnostic', { healthy: true }], ['future', 0]])
})

test('IoT client is GET-only, isolates ZoneAdmin credentials and forwards internal header only when set', async () => {
  const calls = []
  const get = createIotAdminClient({ transport: async (url, options) => { calls.push({ url, options }); return { ok: true, status: 200, json: async () => ({ code: 0, data: { total: 0 } }) } } })
  assert.deepEqual(await get('/admin/device/list', { page: 1, size: 20, online: false, userToken: 'never-send', sign: 'never-send', randomString: 'never-send' }), { total: 0 })
  assert.equal(calls[0].url, 'https://iot.boltfox.cn/admin/device/list?page=1&size=20&online=false')
  assert.equal(calls[0].options.method, 'GET'); assert.equal(calls[0].options.credentials, 'omit')
  assert.deepEqual(calls[0].options.headers, { Accept: 'application/json' })
  const authorized = createIotAdminClient({ baseURL: '/iot-api/', internalToken: () => 'local-internal-demo', transport: async (url, options) => { calls.push({ url, options }); return { ok: true, status: 200, json: async () => ({ code: 0, data: 0 }) } } })
  assert.equal(await authorized('/admin/stats'), 0)
  assert.equal(calls[1].options.headers['X-Internal-Token'], 'local-internal-demo')
  assert.equal(calls[1].url, '/iot-api/admin/stats')
  await assert.rejects(get('/admin/device/control'), /不支持/)
})

test('client exposes 401/4000/4044/5000, non-JSON and network errors without logging credentials', async () => {
  for (const code of [4000, 4044, 5000]) {
    const get = createIotAdminClient({ transport: async () => ({ ok: true, status: 200, json: async () => ({ code, msg: 'server message' }) }) })
    await assert.rejects(get('/admin/stats'), error => error.code === code && error.message === 'server message')
  }
  const unauthorized = createIotAdminClient({ transport: async () => ({ ok: false, status: 401 }) })
  await assert.rejects(unauthorized('/admin/stats'), error => error.code === 401 && /鉴权/.test(error.message))
  const malformed = createIotAdminClient({ transport: async () => ({ ok: true, status: 200, json: async () => { throw new Error('bad json') } }) })
  await assert.rejects(malformed('/admin/stats'), error => error.code === 'RESPONSE')
  const network = createIotAdminClient({ transport: async () => { throw new Error('secret URL') } })
  await assert.rejects(network('/admin/stats'), error => error.code === 'NETWORK' && !error.message.includes('secret'))
})

test('resource ignores stale responses, preserves refresh data and aborts on navigation/unmount', async () => {
  const vite = await createViteServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  const renderer = createRenderer({ createElement: tag => ({ tag, children: [] }), createText: text => ({ text }), createComment: () => ({}), setText() {}, setElementText() {}, parentNode: node => node.parent, nextSibling: () => null, patchProp() {}, insert(node, parent) { node.parent = parent; parent.children.push(node) }, remove() {} })
  try {
    const { useIotResource } = await vite.ssrLoadModule('/src/views/iot/useIotResource.js')
    const enabled = shallowRef(true), key = shallowRef('a'), requests = []
    let resource
    const app = renderer.createApp({ setup() { resource = useIotResource(signal => new Promise((resolve, reject) => requests.push({ resolve, reject, signal })), () => key.value, () => enabled.value); return () => h('div') } })
    app.mount({ children: [] })
    assert.equal(requests.length, 1)
    key.value = 'b'; await nextTick(); assert.equal(requests.length, 2); assert.equal(requests[0].signal.aborted, true)
    requests[0].resolve({ marker: 'old' }); await nextTick(); assert.equal(resource.data.value, null)
    requests[1].resolve({ marker: 'new' }); await nextTick(); await nextTick(); assert.deepEqual(resource.data.value, { marker: 'new' })
    const refresh = resource.load(); requests[2].reject(Object.assign(new Error('failure'), { code: 5000 })); await refresh
    assert.deepEqual(resource.data.value, { marker: 'new' }); assert.equal(resource.error.value.code, 5000)
    const pending = resource.load(); enabled.value = false; await nextTick(); assert.equal(requests[3].signal.aborted, true)
    requests[3].resolve({ marker: 'hidden' }); await pending; assert.deepEqual(resource.data.value, { marker: 'new' })
    app.unmount(); assert.equal(resource.loading.value, false)
  } finally { await vite.close() }
})

test('mock covers all categories, paginates logs, includes time boundaries and shadow absence', async () => {
  const vite = await createViteServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  try {
    const { createIotMock } = await vite.ssrLoadModule('/src/views/iot/mock.js')
    const get = createIotMock(Date.parse('2026-10-27T00:00:00Z'))
    const devices = await get('/admin/device/list', { page: 1, size: 20, online: false }); assert.equal(devices.total, 19); assert.ok(devices.list.every(x => x.online === false))
    const logs = await get('/admin/log/list', { page: 2, size: 20 }); assert.equal(logs.total, 145); assert.equal(logs.list.length, 20)
    for (const category of ['ONLINE_OFFLINE', 'COMMAND', 'OTA', 'ALARM', 'EXCEPTION']) { const response = await get('/admin/log/list', { category }); assert.ok(response.total > 0); assert.ok(response.list.every(x => x.category === category)) }
    const boundary = await get('/admin/log/list', { startTime: '2026-10-27 08:00:00', endTime: '2026-10-27 08:00:00' }); assert.equal(boundary.total, 1)
    const detail = await get('/admin/device/detail', { deviceNo: 'A0B1C2000001' }); assert.deepEqual(detail.shadow, {}); assert.notEqual(detail.online, detail.onlineRealtime)
    await assert.rejects(get('/admin/device/detail', { deviceNo: 'FFFFFFFFFFFF' }), error => error.code === 4044)
  } finally { await vite.close() }
})

test('IoT menu scope previews and idempotently creates only its own five nodes', async () => {
  const tree = [{ id: 0, childs: [{ id: 108, appName: '产品管理', appCode: '#', childs: [] }] }], writes = []
  const baseline = structuredClone(tree[0].childs[0]); let nextId = 900
  const find = (nodes, id) => { for (const node of nodes) { if (node.id === id) return node; const match = find(node.childs || [], id); if (match) return match } }
  const server = createHttpServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.method === 'POST') { let text = ''; for await (const chunk of req) text += chunk; const { randomString, sign, userToken, ...payload } = JSON.parse(text); writes.push(payload); find(tree, payload.parentId).childs.push({ ...payload, id: nextId++, childs: [] }); res.end(JSON.stringify({ retCode: 200, retData: true })) }
    else res.end(JSON.stringify({ retCode: 200, retData: tree }))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  async function run(...flags) { const child = spawn(process.execPath, [fileURLToPath(new URL('../scripts/sync-admin-menu.mjs', import.meta.url)), '--scope=iot-monitoring', '--api-base=http://127.0.0.1:' + server.address().port, ...flags], { windowsHide: true, env: { ...process.env, BOLTFOX_USER_TOKEN: 'local-test-only' } }); let output = ''; child.stdout.on('data', x => { output += x }); child.stderr.on('data', x => { output += x }); const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', resolve) }); return { code, output } }
  try { assert.equal((await run()).code, 0); assert.equal(writes.length, 0); const first = await run('--apply'); assert.equal(first.code, 0, first.output); assert.equal(writes.length, 5); assert.equal(writes[0].appName, 'IoT监控'); assert.equal(writes[0].parentId, 0); assert.deepEqual(writes.filter(x => x.isNav === 1).map(x => x.appUrl), ['#', 'iotDashboard', 'iotDevices', 'iotLogs']); assert.equal((await run('--apply')).code, 0); assert.equal(writes.length, 5); assert.deepEqual(tree[0].childs[0], baseline) }
  finally { await new Promise(resolve => server.close(resolve)) }
})

test('paging keeps total during loading and failed refresh; switching source clears old data', async () => {
  const vite = await createViteServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  const renderer = createRenderer({ createElement: tag => ({ tag, children: [] }), createText: text => ({ text }), createComment: () => ({}), setText() {}, setElementText() {}, parentNode: node => node.parent, nextSibling: () => null, patchProp() {}, insert(node, parent) { node.parent = parent; parent.children.push(node) }, remove() {} })
  const { demoMode, demoScenario } = await vite.ssrLoadModule('/src/views/iot/service.js')
  const originalMode = demoMode.value, originalScenario = demoScenario.value
  let app
  try {
    const { useIotResource } = await vite.ssrLoadModule('/src/views/iot/useIotResource.js')
    const page = shallowRef(1), requests = []; let resource
    app = renderer.createApp({ setup() { resource = useIotResource(signal => new Promise((resolve, reject) => requests.push({ resolve, reject, signal })), () => page.value, () => true, () => 'devices'); return () => h('div') } })
    app.mount({ children: [] })
    requests[0].resolve({ total: 56, list: ['page1'] }); await nextTick(); await nextTick()
    page.value = 2; await nextTick(); assert.equal(resource.loading.value, true); assert.equal(resource.data.value.total, 56)
    requests[1].resolve({ total: 56, list: ['page2'] }); await nextTick(); await nextTick(); assert.deepEqual(resource.data.value.list, ['page2'])
    demoScenario.value = 'error'; await nextTick(); assert.equal(resource.data.value.total, 56)
    requests[2].reject(Object.assign(new Error('failed'), { code: 5000 })); await nextTick(); await nextTick(); assert.equal(resource.data.value.total, 56)
    demoMode.value = !demoMode.value; await nextTick(); assert.equal(resource.data.value, null)
    app.unmount(); app = null; assert.equal(requests[3].signal.aborted, true)
  } finally { app?.unmount(); demoMode.value = originalMode; demoScenario.value = originalScenario; await vite.close() }
})
