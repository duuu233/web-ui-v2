import { createHash } from 'node:crypto'

const SIGN_SALT = '8e808087-08b3-3e10-8e83-93bf078df4b2'
const DEFAULT_API_BASE = 'https://api.boltfox.cn/ZoneAdmin'

export const commerceMenuTree = [
  {
    appName: '产品管理',
    aliases: ['商品管理'],
    appCode: '#',
    appUrl: '#',
    grade: 5,
    isNav: 1,
    isRefresh: 0,
    children: [
      {
        appName: '商品管理',
        appCode: 'Get_Goods_GetGoodsList',
        appUrl: 'goodsList',
        grade: 3,
        isNav: 1,
        isRefresh: 0,
        children: [
          {
            appName: '详情',
            appCode: 'Get_Goods_GetGoodsDetail',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0,
            children: [
              {
                appName: '新增商品',
                appCode: 'Post_Goods_AddGoods',
                appUrl: '#',
                grade: 0,
                isNav: 0,
                isRefresh: 0
              },
              {
                appName: '编辑商品',
                appCode: 'Post_Goods_EditGoods',
                appUrl: '#',
                grade: 0,
                isNav: 0,
                isRefresh: 0
              }
            ]
          },
          {
            appName: '启用/禁用',
            appCode: 'Post_Goods_SetGoodsVerify',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          }
        ]
      },
      {
        appName: '图库管理',
        appCode: 'Get_ProductImg_GetProductImgList',
        appUrl: 'productImageList',
        grade: 2,
        isNav: 1,
        isRefresh: 0,
        children: [
          {
            appName: '新增',
            appCode: 'Post_ProductImg_AddProductImg',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '详情',
            appCode: 'Get_ProductImg_GetProductImgDetail',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '编辑',
            appCode: 'Post_ProductImg_EditProductImg',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '启用/禁用',
            appCode: 'Post_ProductImg_SetProductImgVerify',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '删除',
            appCode: 'Post_ProductImg_DeleteProductImg',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          }
        ]
      },
      {
        appName: '图库分类',
        appCode: 'Get_ProductImg_GetImgCategoryList',
        appUrl: 'imageCategoryList',
        grade: 1,
        isNav: 1,
        isRefresh: 0,
        children: [
          {
            appName: '新增',
            appCode: 'Post_ProductImg_AddImgCategory',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '详情',
            appCode: 'Get_ProductImg_GetImgCategoryDetail',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '编辑',
            appCode: 'Post_ProductImg_EditImgCategory',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '启用/禁用',
            appCode: 'Post_ProductImg_SetImgCategoryVerify',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          }
        ]
      }
    ]
  },
  {
    appName: '订单管理',
    appCode: '#',
    appUrl: '#',
    grade: 4,
    isNav: 1,
    isRefresh: 0,
    children: [
      {
        appName: '订单管理',
        appCode: 'Get_Order_GetOrderList',
        appUrl: 'orderList',
        grade: 0,
        isNav: 1,
        isRefresh: 0,
        children: [
          {
            appName: '详情',
            appCode: 'Get_Order_GetOrderDetail',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          }
        ]
      }
    ]
  },
  {
    appName: 'AI配置',
    appCode: '#',
    appUrl: '#',
    grade: 3,
    isNav: 1,
    isRefresh: 0,
    children: [
      {
        appName: 'AI配置列表',
        appCode: 'Get_AiConfig_GetAiConfigList',
        appUrl: 'aiConfigList',
        grade: 0,
        isNav: 1,
        isRefresh: 0,
        children: [
          {
            appName: '编辑',
            appCode: 'Post_AiConfig_EditAiConfig',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          },
          {
            appName: '启用/禁用',
            appCode: 'Post_AiConfig_SetAiConfigVerify',
            appUrl: '#',
            grade: 0,
            isNav: 0,
            isRefresh: 0
          }
        ]
      }
    ]
  }
]

export const userAccountMenuNodes = [
  {
    appName: '编辑用户账户',
    appCode: 'Post_User_SetUserAccount',
    appUrl: '#',
    grade: 1,
    isNav: 0,
    isRefresh: 0
  },
  {
    appName: '账户操作日志',
    appCode: 'Get_User_GetOperatUserAccountLog',
    appUrl: '#',
    grade: 0,
    isNav: 0,
    isRefresh: 0
  }
]

// 2026-11-13：「FPGA固件版本」改名「优雅刷新管理」（中间一度叫 FPGA版本），并随「固件版本」一起移到一级菜单「OTA管理」（grade 1，排在固件版本之后）
export const fpgaFirmwareMenuNodes = [{
  appName: '优雅刷新管理', appCode: 'Get_ProductVersionFpga_GetProductVersionFpgaList',
  appUrl: 'productVersionFpga', grade: 1, isNav: 1, isRefresh: 0,
  children: [
    ['详情', 'Get_ProductVersionFpga_GetProductVersionFpgaDetail'],
    ['新增', 'Post_ProductVersionFpga_AddProductVersionFpga'],
    ['编辑', 'Post_ProductVersionFpga_EditProductVersionFpga'],
    ['删除', 'Post_ProductVersionFpga_DeleteProductVersionFpga'],
    ['启用/禁用', 'Post_ProductVersionFpga_SetProductVersionFpgaVerify']
  ].map(([appName, appCode]) => ({ appName, appCode, appUrl: '#', grade: 0, isNav: 0, isRefresh: 0 }))
}]

// 2026-11-12：原「产品设备」改名「设备管理」，从产品管理挪到 IoT管理 分组（排在概览之后）
export const productDeviceMenuNodes = [{
  appName: '设备管理', appCode: 'Get_ProductDevice_GetProductDeviceList',
  appUrl: 'productDevice', grade: 3, isNav: 1, isRefresh: 0,
  children: [
    ['详情', 'Get_ProductDevice_GetProductDeviceDetail'],
    ['新增', 'Post_ProductDevice_AddProductDevice'],
    ['编辑', 'Post_ProductDevice_EditProductDevice'],
    ['启用/禁用', 'Post_ProductDevice_SetProductDeviceVerify']
  ].map(([appName, appCode]) => ({ appName, appCode, appUrl: '#', grade: 0, isNav: 0, isRefresh: 0 }))
}]

// 2026-11-12：分组「IoT监控」改名「IoT管理」（aliases 认旧名）；原「设备管理」（IoT 设备只读列表）改名「设备监控」；
// 产品设备并入本组改名「设备管理」。顺序：概览 → 设备管理 → 设备监控 → 日志查询
export const iotMonitoringMenuNodes = [{
  appName: 'IoT管理', aliases: ['IoT监控'], appCode: '#', appUrl: '#', grade: 2, isNav: 1, isRefresh: 0,
  children: [
    { appName: '概览', appCode: 'Get_IotAdmin_Stats', appUrl: 'iotDashboard', grade: 4, isNav: 1, isRefresh: 0 },
    ...productDeviceMenuNodes,
    { appName: '设备监控', appCode: 'Get_IotAdmin_DeviceList', appUrl: 'iotDevices', grade: 2, isNav: 1, isRefresh: 0,
      children: [{ appName: '设备详情', appCode: 'Get_IotAdmin_DeviceDetail', appUrl: '#', grade: 0, isNav: 0, isRefresh: 0 }] },
    { appName: '日志查询', appCode: 'Get_IotAdmin_LogList', appUrl: 'iotLogs', grade: 1, isNav: 1, isRefresh: 0 }
  ]
}]

// 2026-11-13：内置图管理（IoT 服务 /admin/intimg），顶层分组，排在 IoT管理 之后；appUrl = 路由名
const intimgNav = (appName, appCode, appUrl, grade, actions = []) => ({
  appName, appCode, appUrl, grade, isNav: 1, isRefresh: 0,
  children: actions.map(([name, code]) => ({ appName: name, appCode: code, appUrl: '#', grade: 0, isNav: 0, isRefresh: 0 }))
})
export const intimgMenuNodes = [{
  appName: '内置图管理', appCode: '#', appUrl: '#', grade: 2, isNav: 1, isRefresh: 0,
  children: [
    intimgNav('槽位管理', 'Get_IotIntimg_SlotList', 'intimgSlots', 5, [['上传/替换', 'Post_IotIntimg_UploadSlotImage'], ['重新渲染', 'Post_IotIntimg_RenderSlot']]),
    intimgNav('设备内置图状态', 'Get_IotIntimg_DeviceList', 'intimgDevices', 4),
    intimgNav('新建推送任务', 'Post_IotIntimg_AddTask', 'intimgTaskCreate', 3),
    intimgNav('推送任务列表', 'Get_IotIntimg_TaskList', 'intimgTasks', 2, [['任务详情', 'Get_IotIntimg_TaskDetail'], ['取消推送', 'Post_IotIntimg_CancelTaskItems'], ['重发失败', 'Post_IotIntimg_RetryTaskItems']]),
    intimgNav('设备锁排查', 'Get_IotIntimg_LockList', 'intimgLocks', 1, [['强制释放锁', 'Post_IotIntimg_ReleaseLock']])
  ]
}]

// 2026-11-13：一级菜单「OTA管理」（建时叫「固件管理」，aliases 认旧名），固件版本（原在产品管理下，id 120）与优雅刷新管理（id 163）按原 id 移入；
// 已存在的节点在别的父级下时需 --apply --update 才移动（子节点跟随）
const action = (appName, appCode, children) => ({ appName, appCode, appUrl: '#', grade: 0, isNav: 0, isRefresh: 0, ...(children ? { children } : {}) })
export const firmwareMenuNodes = [{
  appName: 'OTA管理', aliases: ['固件管理'], appCode: '#', appUrl: '#', grade: 4, isNav: 1, isRefresh: 0,
  children: [
    {
      appName: '固件版本', appCode: 'Get_ProductVersion_GetProductVersionList', appUrl: 'productVersion', grade: 2, isNav: 1, isRefresh: 0,
      children: [
        action('详情', 'Get_ProductVersion_GetProductVersionDetail', [
          action('添加固件版本', 'Post_ProductVersion_AddProductVersion'),
          action('编辑固件版本', 'Post_ProductVersion_EditProductVersion')
        ]),
        action('启用/禁用', 'Post_ProductVersion_SetProductVersionVerify'),
        action('删除', 'Post_ProductVersion_DeleteProductVersion')
      ]
    },
    ...fpgaFirmwareMenuNodes
  ]
}]

const menuScopes = {
  firmware: { label: 'OTA管理（固件版本、优雅刷新管理）', parentCode: null, nodes: firmwareMenuNodes },
  intimg: { label: '内置图管理（槽位、设备状态、推送任务、设备锁）', parentCode: null, nodes: intimgMenuNodes },
  'iot-monitoring': { label: 'IoT管理（概览、设备管理、设备监控、日志）', parentCode: null, nodes: iotMonitoringMenuNodes },
  'product-device': {
    label: '设备管理（原产品设备，仅本模块，挂在 IoT管理 分组下）',
    parentOfCode: 'Get_IotAdmin_Stats',
    nodes: productDeviceMenuNodes
  },
  'fpga-firmware': {
    label: '优雅刷新管理（原 FPGA固件版本；按固件版本定位父级，现为一级菜单「OTA管理」）',
    parentOfCode: 'Get_ProductVersion_GetProductVersionList',
    nodes: fpgaFirmwareMenuNodes
  },
  commerce: {
    label: '商品、图库、订单与 AI 配置',
    parentCode: null,
    nodes: commerceMenuTree
  },
  'user-account': {
    label: '用户账户与账户日志',
    parentCode: 'Get_User_GetUserList',
    nodes: userAccountMenuNodes
  }
}

function parseOptions(args) {
  const options = {
    apply: false,
    update: false,
    scope: process.env.BOLTFOX_MENU_SCOPE || 'commerce',
    systemId: Number(process.env.BOLTFOX_SYSTEM_ID || 1),
    apiBase: process.env.BOLTFOX_API_BASE || DEFAULT_API_BASE,
    token: process.env.BOLTFOX_USER_TOKEN || ''
  }

  for (const argument of args) {
    if (argument === '--apply') options.apply = true
    else if (argument === '--update') options.update = true
    else if (argument.startsWith('--scope=')) {
      options.scope = argument.slice('--scope='.length)
    }
    else if (argument.startsWith('--system-id=')) {
      options.systemId = Number(argument.slice('--system-id='.length))
    } else if (argument.startsWith('--api-base=')) {
      options.apiBase = argument.slice('--api-base='.length)
    } else if (argument === '--help' || argument === '-h') {
      options.help = true
    } else {
      throw new Error(`未知参数：${argument}`)
    }
  }

  if (!Number.isInteger(options.systemId) || options.systemId < 1) {
    throw new Error('system-id 必须是大于 0 的整数')
  }
  if (options.update && !options.apply) {
    throw new Error('--update 必须与 --apply 一起使用')
  }
  if (!menuScopes[options.scope]) {
    throw new Error(`scope 必须是以下值之一：${Object.keys(menuScopes).join(', ')}`)
  }

  return options
}

function printHelp() {
  console.log(`
幂等同步管理后台菜单与操作权限

环境变量：
  BOLTFOX_USER_TOKEN   必填，当前管理员 userToken
  BOLTFOX_SYSTEM_ID    可选，默认 1
  BOLTFOX_API_BASE     可选，默认 ${DEFAULT_API_BASE}
  BOLTFOX_MENU_SCOPE   可选，默认 commerce

参数：
  --scope=<scope>      同步范围：commerce、user-account、fpga-firmware、product-device、iot-monitoring、intimg 或 firmware
  --apply              实际新增缺失节点；省略时只预览
  --update             同时更新已存在但配置漂移的节点（必须搭配 --apply）
  --system-id=<id>     覆盖系统 ID
  --api-base=<url>     覆盖管理后台 API 根地址
  --help               显示帮助
`)
}

function createRandomString() {
  let value =
    new Date().toLocaleDateString().split('/').join('') +
    Math.floor(Math.random() * 10).toString()
  if (value.length === 7) {
    value += Math.floor(Math.random() * 10).toString()
  }
  return value
}

function createSignature(randomString) {
  return createHash('md5')
    .update(`${randomString}${SIGN_SALT}`)
    .digest('hex')
}

function createAdminClient(options) {
  const apiBase = options.apiBase.replace(/\/$/, '')

  async function request(path, requestOptions = {}) {
    const method = requestOptions.method || 'GET'
    const randomString = createRandomString()
    const authFields = {
      randomString,
      sign: createSignature(randomString),
      userToken: options.token
    }
    const url = new URL(`${apiBase}/${path.replace(/^\//, '')}`)
    const fetchOptions = {
      method,
      headers: { Accept: 'application/json' }
    }

    if (method === 'GET') {
      const params = { ...(requestOptions.params || {}), ...authFields }
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.set(key, String(value))
        }
      }
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify({
        ...(requestOptions.data || {}),
        ...authFields
      })
    }

    const response = await fetch(url, fetchOptions)
    const responseText = await response.text()
    let result
    try {
      result = JSON.parse(responseText)
    } catch (error) {
      throw new Error(`接口返回了非 JSON 数据（HTTP ${response.status}）`)
    }

    if (!response.ok || result.retCode !== 200) {
      throw new Error(result.retMsg || `接口请求失败（HTTP ${response.status}）`)
    }
    return result
  }

  return {
    getMenuTree(systemId) {
      return request('/Jurisdiction/getAdminAppliBySys', {
        params: { id: systemId }
      })
    },
    saveMenu(data) {
      return request('/Jurisdiction/setAdminAppli', {
        method: 'POST',
        data
      })
    }
  }
}

function getVirtualRoot(tree) {
  const root = tree.find(node => Number(node.id) === 0)
  return root || { id: 0, childs: tree }
}

function findNodeById(nodes, id) {
  for (const node of nodes || []) {
    if (Number(node.id) === Number(id)) return node
    const child = findNodeById(node.childs, id)
    if (child) return child
  }
  return null
}

function findNodeByCode(nodes, appCode) {
  for (const node of nodes || []) {
    if (node.appCode === appCode) return node
    const child = findNodeByCode(node.childs, appCode)
    if (child) return child
  }
  return null
}

function findParentsByChildCode(root, code) {
  const matches = []
  if ((root.childs || []).some(child => child.appCode === code)) matches.push(root)
  for (const child of root.childs || []) matches.push(...findParentsByChildCode(child, code))
  return matches
}

function resolveScopeParent(root, scope) {
  if (scope.parentOfCode) {
    const parents = findParentsByChildCode(root, scope.parentOfCode)
    if (parents.length !== 1) throw new Error('同步模块父级不存在或不唯一，停止同步')
    return parents[0]
  }
  if (!scope.parentCode) return root
  const parent = findNodeByCode([root], scope.parentCode)
  if (!parent) {
    throw new Error(`未找到同步范围的父节点权限：${scope.parentCode}`)
  }
  return parent
}

function findMatchingChild(parent, expected) {
  const children = parent?.childs || []
  if (expected.appCode !== '#') {
    return children.find(node => node.appCode === expected.appCode) || null
  }
  const acceptedNames = [expected.appName, ...(expected.aliases || [])]
  return children.find(node => acceptedNames.includes(node.appName)) || null
}

// 同编码节点挂在别的父级下（如产品设备从产品管理挪到 IoT管理）：返回 [节点, 父级]；不唯一时停止，避免挪错
function findElsewhereByCode(root, parentId, expected) {
  if (expected.appCode === '#') return null
  const matches = []
  const visit = (node, parent) => {
    if (node.appCode === expected.appCode && parent && Number(parent.id) !== Number(parentId)) matches.push([node, parent])
    for (const child of node.childs || []) visit(child, node)
  }
  visit(root, null)
  if (matches.length > 1) throw new Error(`权限编码 ${expected.appCode} 在多个父级下存在，停止同步`)
  return matches[0] || null
}

function normalizedUrl(value) {
  if (value === null || value === undefined) return ''
  if (["''", '""', '“”', '‘’'].includes(String(value))) return ''
  return String(value)
}

function getDrift(node, expected) {
  const fields = ['appName', 'appCode', 'grade', 'isNav', 'isRefresh']
  const drift = fields.filter(field => String(node[field] ?? '') !== String(expected[field] ?? ''))
  if (normalizedUrl(node.appUrl) !== normalizedUrl(expected.appUrl)) drift.push('appUrl')
  return drift
}

function buildPayload(expected, parentId, systemId, id = 0) {
  return {
    id,
    parentId: Number(parentId),
    systemId,
    appName: expected.appName,
    appCode: expected.appCode,
    appUrl: expected.appUrl,
    grade: expected.grade,
    isNav: expected.isNav,
    isRefresh: expected.isRefresh
  }
}

function printPreview(parent, expectedNodes, depth = 0) {
  for (const expected of expectedNodes) {
    const existing = parent ? findMatchingChild(parent, expected) : null
    const indent = '  '.repeat(depth)
    const elsewhere = !existing && previewRoot ? findElsewhereByCode(previewRoot, parent?.id, expected) : null
    const marker = existing ? '存在' : elsewhere ? `待移动（现挂在 ${elsewhere[1].appName || elsewhere[1].id} 下，需 --apply --update）` : '待新增'
    const drift = existing ? getDrift(existing, expected) : elsewhere ? getDrift(elsewhere[0], expected) : []
    const driftText = drift.length ? `（配置差异：${drift.join(', ')}）` : ''
    console.log(`${indent}- [${marker}] ${expected.appName} <${expected.appCode}>${driftText}`)
    printPreview(existing || elsewhere?.[0], expected.children || [], depth + 1)
  }
}
let previewRoot = null

async function waitForCreatedNode(client, options, parentId, expected) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await client.getMenuTree(options.systemId)
    const root = getVirtualRoot(response.retData || [])
    const parent = Number(parentId) === 0
      ? root
      : findNodeById([root], parentId)
    const created = findMatchingChild(parent, expected)
    if (created) return created
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`新增后未能找到菜单节点：${expected.appName}`)
}

async function syncNode(client, options, parentId, expected, depth, stats) {
  const response = await client.getMenuTree(options.systemId)
  const root = getVirtualRoot(response.retData || [])
  const parent = Number(parentId) === 0
    ? root
    : findNodeById([root], parentId)
  if (!parent) throw new Error(`未找到父节点 ID ${parentId}`)

  const indent = '  '.repeat(depth)
  let current = findMatchingChild(parent, expected)
  const elsewhere = current ? null : findElsewhereByCode(root, parentId, expected)
  if (elsewhere) {
    // 已在别的父级下：只在 --update 时整节点挪过来（子节点跟着走），否则停止，不建重复节点
    if (!options.update) throw new Error(`${expected.appName} <${expected.appCode}> 现挂在 ${elsewhere[1].appName || elsewhere[1].id} 下，需 --apply --update 才会移动`)
    await client.saveMenu(buildPayload(expected, parentId, options.systemId, Number(elsewhere[0].id)))
    current = await waitForCreatedNode(client, options, parentId, expected)
    stats.updated += 1
    console.log(`${indent}↪ 已移动 ${expected.appName}（原父级 ${elsewhere[1].appName || elsewhere[1].id}）`)
  } else if (!current) {
    await client.saveMenu(buildPayload(expected, parentId, options.systemId))
    current = await waitForCreatedNode(client, options, parentId, expected)
    stats.created += 1
    console.log(`${indent}+ 已新增 ${expected.appName} <${expected.appCode}>`)
  } else {
    const drift = getDrift(current, expected)
    if (drift.length && options.update) {
      await client.saveMenu(
        buildPayload(expected, parentId, options.systemId, Number(current.id))
      )
      current = await waitForCreatedNode(client, options, parentId, expected)
      stats.updated += 1
      console.log(`${indent}~ 已更新 ${expected.appName}（${drift.join(', ')}）`)
    } else {
      stats.existing += 1
      const driftText = drift.length ? `，保留配置差异：${drift.join(', ')}` : ''
      console.log(`${indent}= 已存在 ${expected.appName}${driftText}`)
    }
  }

  for (const child of expected.children || []) {
    await syncNode(client, options, current.id, child, depth + 1, stats)
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  if (options.help) {
    printHelp()
    return
  }
  if (!options.token) {
    throw new Error('请通过 BOLTFOX_USER_TOKEN 环境变量提供管理员 userToken')
  }

  const client = createAdminClient(options)
  const response = await client.getMenuTree(options.systemId)
  const root = getVirtualRoot(response.retData || [])
  const scope = menuScopes[options.scope]
  const scopeParent = resolveScopeParent(root, scope)

  console.log(`目标系统：${options.systemId}`)
  console.log(`同步范围：${scope.label}`)
  console.log(`执行模式：${options.apply ? '写入' : '只读预览'}`)

  if (!options.apply) {
    previewRoot = root
    printPreview(scopeParent, scope.nodes)
    console.log('\n未写入任何数据。确认后追加 --apply 执行。')
    return
  }

  const stats = { created: 0, updated: 0, existing: 0 }
  for (const node of scope.nodes) {
    await syncNode(client, options, scopeParent.id, node, 0, stats)
  }

  console.log(
    `\n同步完成：新增 ${stats.created}，更新 ${stats.updated}，已存在 ${stats.existing}。`
  )
  console.log('非系统管理员还需要在角色管理中绑定新增权限，重新登录后菜单生效。')
}

main().catch(error => {
  console.error(`菜单同步失败：${error.message}`)
  process.exitCode = 1
})
