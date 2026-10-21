import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer as createHttpServer } from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parseVersionId, buildVersionPayload, safeDownloadUrl } from '../src/views/sms/productVersionFpga/model.js'

test('FPGA contract keeps grade=0, omits output/auth fields and validates IDs', () => {
  const form = { productId: '7', versionNumber: ' v1.2 ', downloadPath: ' https://example.com/fpga.bin ', compulsory: '4', grade: 0, verify: 1, adminId: 88, id: 99 }
  const expected = { productId: 7, versionNumber: 'v1.2', downloadPath: 'https://example.com/fpga.bin', compulsory: 4, grade: 0 }
  assert.deepEqual(buildVersionPayload(form), expected)
  assert.deepEqual(buildVersionPayload(form, '12'), { ...expected, id: 12 })
  for (const value of [null, undefined, [], ['1'], 0, -1, '1.2', '1e2', 'abc', 2147483648]) assert.equal(parseVersionId(value), null)
  assert.equal(parseVersionId('2147483647'), 2147483647)
  for (const url of ['javascript:alert(1)', 'data:text/html,<b>x</b>', '5654', '//example.com/a']) assert.equal(safeDownloadUrl(url), '')
  assert.equal(safeDownloadUrl('https://example.com/fpga.bin'), 'https://example.com/fpga.bin')
})

test('latest-only paging ignores stale success and errors while default remains compatible', async () => {
  const vite = await createViteServer({ server: { middlewareMode: true }, logLevel: 'silent' })
  try {
    const { usePagedList, cleanQuery } = await vite.ssrLoadModule('/src/composables/usePagedList.js')
    assert.deepEqual(cleanQuery({ verify: 0, grade: 0, blank: '', empty: null }), { verify: 0, grade: 0 })
    const pending = [], failures = []
    let paged
    await renderToString(createSSRApp({ setup() {
      paged = usePagedList({ immediate: false, reloadOnActivated: false, latestRequestOnly: true,
        fetchList: () => new Promise((resolve, reject) => pending.push({ resolve, reject })), onError: error => failures.push(error) })
      return () => h('div')
    } }))
    const a = paged.getList(), b = paged.getList()
    pending[0].resolve({ retData: { pageData: ['old'], recordCount: 1 } }); await a
    assert.equal(paged.listLoading.value, true)
    assert.deepEqual(paged.list.value, [])
    pending[1].resolve({ retData: { pageData: ['new'], recordCount: 1 } }); await b
    assert.deepEqual(paged.list.value, ['new']); assert.equal(paged.listLoading.value, false)
    const c = paged.getList(), d = paged.getList()
    pending[3].resolve({ retData: { pageData: ['latest'], recordCount: 1 } }); await d
    pending[2].reject(new Error('old request failed')); await c
    assert.deepEqual(paged.list.value, ['latest']); assert.deepEqual(failures, [])
    let legacy
    await renderToString(createSSRApp({ setup() { legacy = usePagedList({ immediate: false, reloadOnActivated: false, fetchList: async () => ({ retData: { pageData: ['legacy'], recordCount: 2 } }) }); return () => h('div') } }))
    await legacy.getList(); assert.deepEqual(legacy.list.value, ['legacy']); assert.equal(legacy.total.value, 2)
  } finally { await vite.close() }
})

test('FPGA menu preview/apply/reapply touches only six nodes beside existing firmware', async () => {
  const oldCode = 'Get_ProductVersion_GetProductVersionList'
  const tree = [{ id: 0, childs: [{ id: 108, appName: '产品管理', appCode: '#', childs: [{ id: 120, appCode: oldCode, childs: [] }] }, { id: 133, appName: '商品管理', appCode: '#', childs: [] }] }]
  const originalGroups = structuredClone(tree[0].childs)
  const writes = []
  let nextId = 900
  const find = (nodes, id) => { for (const node of nodes) { if (node.id === id) return node; const match = find(node.childs || [], id); if (match) return match } }
  const server = createHttpServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.method === 'POST') {
      let text = ''; for await (const chunk of req) text += chunk
      const body = JSON.parse(text)
      assert.equal(body.id, 0, 'must create only, never overwrite existing menus')
      const { randomString, sign, userToken, ...payload } = body
      writes.push(payload)
      find(tree, payload.parentId).childs.push({ ...payload, id: nextId++, childs: [] })
      res.end(JSON.stringify({ retCode: 200, retData: true }))
    } else res.end(JSON.stringify({ retCode: 200, retData: tree }))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  async function run(...flags) {
    const script = fileURLToPath(new URL('../scripts/sync-admin-menu.mjs', import.meta.url))
    const child = spawn(process.execPath, [script, '--scope=fpga-firmware', '--api-base=http://127.0.0.1:' + server.address().port, ...flags], { env: { ...process.env, BOLTFOX_USER_TOKEN: 'local-test-only' }, windowsHide: true })
    let output = ''; child.stdout.on('data', x => { output += x }); child.stderr.on('data', x => { output += x })
    const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', resolve) })
    return { code, output }
  }
  try {
    assert.equal((await run()).code, 0); assert.equal(writes.length, 0)
    const first = await run('--apply'); assert.equal(first.code, 0, first.output); assert.equal(writes.length, 6)
    assert.equal(writes[0].parentId, 108); assert.equal(writes[0].appUrl, 'productVersionFpga'); assert.equal(writes[0].isNav, 1)
    assert.ok(writes.slice(1).every(item => item.parentId === 900 && item.isNav === 0))
    assert.equal(new Set(writes.map(item => item.appCode)).size, 6)
    const second = await run('--apply'); assert.equal(second.code, 0, second.output); assert.equal(writes.length, 6)
    assert.deepEqual(tree[0].childs[0].childs[0], originalGroups[0].childs[0]); assert.deepEqual(tree[0].childs[1], originalGroups[1])
    tree[0].childs[1].childs.push({ id: 777, appCode: oldCode, childs: [] })
    const ambiguous = await run('--apply'); assert.equal(ambiguous.code, 1); assert.match(ambiguous.output, /不唯一/); assert.equal(writes.length, 6)
  } finally { await new Promise(resolve => server.close(resolve)) }
})
