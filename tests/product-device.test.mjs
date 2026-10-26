import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { parseDeviceId, recordId, buildDevicePayload, fetchWifiProducts } from '../src/views/sms/productDevice/model.js'

test('device contract separates record/product/device IDs and excludes output and auth fields', () => {
  const form = { productId: '7', deviceId: ' SN-DEMO ', pDeviceId: 999, id: 456, verify: 0, userToken: 'not-to-send' }
  assert.deepEqual(buildDevicePayload(form), { productId: 7, deviceId: 'SN-DEMO' })
  assert.deepEqual(buildDevicePayload(form, '12'), { productId: 7, deviceId: 'SN-DEMO', pDeviceId: 12 })
  assert.equal(recordId({ pDeviceId: 12, productId: 7, deviceId: 'SN' }), 12)
  assert.equal(recordId({ pdeviceId: '13' }), 13)
  for (const id of [null, undefined, [], ['1'], 0, -1, '1.2', '1e2', 'abc', 2147483648]) assert.equal(parseDeviceId(id), null)
  for (const deviceId of ['', '   ', 'a'.repeat(51)]) assert.throws(() => buildDevicePayload({ productId: 7, deviceId }))
  assert.equal(buildDevicePayload({ productId: 7, deviceId: 'a'.repeat(50) }).deviceId.length, 50)
  assert.throws(() => buildDevicePayload({ productId: null, deviceId: 'SN' }))
  assert.throws(() => buildDevicePayload(form, null))
})

test('WiFi selection requests every page with versionType=2 and excludes BLE/unknown products', async () => {
  const calls = []
  const result = await fetchWifiProducts(async params => {
    calls.push(params)
    const rows = params.pageIndex === 1
      ? Array.from({ length: 100 }, (_, i) => ({ productId: i + 1, productName: 'WiFi ' + i, versionType: 2 }))
      : [{ productId: 101, versionType: '2' }, { productId: 102, versionType: 1 }, { productId: 103 }]
    return { retData: { recordCount: 103, pageData: rows } }
  })
  assert.deepEqual(calls, [{ pageIndex: 1, pageSize: 100, versionType: 2 }, { pageIndex: 2, pageSize: 100, versionType: 2 }])
  assert.equal(result.length, 101)
  assert.equal(result.at(-1).productId, 101)
  assert.ok(result.every(item => Number(item.versionType) === 2))
  assert.deepEqual(await fetchWifiProducts(async () => ({ retData: { pageData: [], recordCount: 0 } })), [])
  await assert.rejects(fetchWifiProducts(async () => ({ retData: {} })), /格式/)
  await assert.rejects(fetchWifiProducts(async () => { throw new Error('offline') }), /offline/)
})

test('five API wrappers preserve HTTP methods, ID names and verify=0', async () => {
  const calls = []
  globalThis.__deviceApiMock = config => { calls.push(config); return Promise.resolve({ retData: true }) }
  const vite = await createViteServer({ server: { middlewareMode: true }, logLevel: 'silent', plugins: [{ name: 'mock-request', enforce: 'pre', load(id) { if (id.replaceAll('\\', '/').endsWith('/src/utils/request.js')) return 'export default config => globalThis.__deviceApiMock(config)' } }] })
  try {
    const api = await vite.ssrLoadModule('/src/api/productDevice.js')
    await api.getProductDeviceList({ pageIndex: 1, verify: 0 })
    await api.getProductDeviceDetail({ id: 12 })
    await api.addProductDevice({ productId: 7, deviceId: 'SN' })
    await api.editProductDevice({ pDeviceId: 12, productId: 7, deviceId: 'SN2' })
    await api.setProductDeviceVerify({ id: 12, verify: 0 })
    assert.deepEqual(calls.map(x => [x.url, x.method]), [
      ['/ProductDevice/getProductDeviceList', 'get'], ['/ProductDevice/getProductDeviceDetail', 'get'],
      ['/ProductDevice/addProductDevice', 'post'], ['/ProductDevice/editProductDevice', 'post'], ['/ProductDevice/setProductDeviceVerify', 'post']
    ])
    assert.deepEqual(calls[3].data, { pDeviceId: 12, productId: 7, deviceId: 'SN2' })
    assert.deepEqual(calls[4].data, { id: 12, verify: 0 })
  } finally { await vite.close(); delete globalThis.__deviceApiMock }
})

test('product-device menu previews, creates five nodes once and rejects ambiguous parents', async () => {
  const productCode = 'Get_Product_ProductList'
  const tree = [{ id: 0, childs: [{ id: 108, appName: '产品管理', appCode: '#', childs: [{ id: 109, appCode: productCode, childs: [] }] }, { id: 133, appName: '商品管理', appCode: '#', childs: [] }] }]
  const baseline = structuredClone(tree)
  const writes = []
  let nextId = 900
  const find = (nodes, id) => { for (const node of nodes) { if (node.id === id) return node; const match = find(node.childs || [], id); if (match) return match } }
  const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.method === 'POST') {
      let text = ''; for await (const chunk of req) text += chunk
      const { randomString, sign, userToken, ...payload } = JSON.parse(text)
      assert.equal(payload.id, 0)
      writes.push(payload)
      find(tree, payload.parentId).childs.push({ ...payload, id: nextId++, childs: [] })
      res.end(JSON.stringify({ retCode: 200, retData: true }))
    } else res.end(JSON.stringify({ retCode: 200, retData: tree }))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  async function run(...flags) {
    const script = fileURLToPath(new URL('../scripts/sync-admin-menu.mjs', import.meta.url))
    const child = spawn(process.execPath, [script, '--scope=product-device', '--api-base=http://127.0.0.1:' + server.address().port, ...flags], { env: { ...process.env, BOLTFOX_USER_TOKEN: 'local-test-only' }, windowsHide: true })
    let output = ''; child.stdout.on('data', x => { output += x }); child.stderr.on('data', x => { output += x })
    const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', resolve) })
    return { code, output }
  }
  try {
    assert.equal((await run()).code, 0); assert.equal(writes.length, 0)
    const first = await run('--apply'); assert.equal(first.code, 0, first.output); assert.equal(writes.length, 5)
    assert.equal(writes[0].appName, '产品设备'); assert.equal(writes[0].parentId, 108); assert.equal(writes[0].appUrl, 'productDevice')
    assert.ok(writes.slice(1).every(x => x.parentId === 900 && x.isNav === 0 && x.appUrl === '#'))
    const second = await run('--apply'); assert.equal(second.code, 0, second.output); assert.equal(writes.length, 5)
    assert.deepEqual(tree[0].childs[0].childs[0], baseline[0].childs[0].childs[0]); assert.deepEqual(tree[0].childs[1], baseline[0].childs[1])
    tree[0].childs[1].childs.push({ id: 777, appCode: productCode, childs: [] })
    const ambiguous = await run('--apply'); assert.equal(ambiguous.code, 1); assert.match(ambiguous.output, /不唯一/); assert.equal(writes.length, 5)
  } finally { await new Promise(resolve => server.close(resolve)) }
})
