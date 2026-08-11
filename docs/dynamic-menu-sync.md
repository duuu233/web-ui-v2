# 后端菜单自动同步指南

本项目的页面可访问性由两部分共同决定：

1. `src/router/routes.js` 提供本地 Vue Router 路由与组件映射。
2. 后端 `/Jurisdiction/*` 接口提供顶部系统、左侧菜单和按钮权限。

仅新增页面不会自动出现在左侧菜单；仅新增后端菜单也无法找到本地组件。两边必须使用同一个稳定的路由 `name` 连接。

## 字段映射

| 后端字段 | 前端含义 | 约定 |
| --- | --- | --- |
| `appName` | 菜单或操作名称 | 面向管理员展示的中文名称 |
| `appCode` | 权限编码 | 与页面 `v-permission` 中的字符串完全一致 |
| `appUrl` | 路由标识 | 导航节点填写 Vue Router 的 `name`；非导航节点填写占位符 `#`，因为后端要求至少 1 个字符 |
| `parentId` | 父权限 ID | 由同步脚本在创建父节点后自动解析 |
| `systemId` | 所属后台系统 | 当前运营管理系统为 `1` |
| `isNav` | 是否展示为菜单 | 列表页为 `1`，详情/按钮权限为 `0` |
| `isRefresh` | 点击是否刷新 | 当前 SPA 页面统一为 `0` |
| `grade` | 排序权重 | 数值越大通常越靠前 |

例如，后端返回 `menuUrl: "goodsList"` 时，侧栏会执行：

```vue
<router-link :to="{ name: 'goodsList' }" />
```

因此本地路由必须存在同名配置：

```js
{
  path: 'goods',
  name: 'goodsList',
  component: () => import('@/views/commerce/goods/index.vue')
}
```

## 商品与订单菜单树

`scripts/sync-commerce-menu.mjs` 声明了本次模块的完整权限树：

```text
商品管理 (#)
└─ 商品列表 (Get_Goods_GetGoodsList, appUrl=goodsList)
   ├─ 详情 (Get_Goods_GetGoodsDetail)
   │  ├─ 新增商品 (Post_Goods_AddGoods)
   │  └─ 编辑商品 (Post_Goods_EditGoods)
   └─ 启用/禁用 (Post_Goods_SetGoodsVerify)

订单管理 (#)
└─ 订单列表 (Get_Order_GetOrderList, appUrl=orderList)
   └─ 详情 (Get_Order_GetOrderDetail)
```

树形层级遵循现有 `/Jurisdiction/getAdminAppliBySys?id=1` 返回结构；只有 `goodsList` 和 `orderList` 是左侧导航，其余节点只用于按钮/操作授权。

## 执行同步

脚本不会把 token 写入代码、配置或日志。请把当前管理员 `userToken` 临时放在进程环境变量中。

PowerShell：

```powershell
$env:BOLTFOX_USER_TOKEN = '<当前管理员 userToken>'

# 只读预览（默认，不会写后端）
npm run menu:sync:commerce

# 新增缺失节点；已有节点保持不变
npm run menu:sync:commerce -- --apply

# 可选：同时修正已有节点的名称、编码、路由、权重和导航配置
npm run menu:sync:commerce -- --apply --update

Remove-Item Env:BOLTFOX_USER_TOKEN
```

其他系统可传入 `--system-id`：

```powershell
npm run menu:sync:commerce -- --system-id=2 --apply
```

脚本的安全特性：

- 默认是只读预览，必须显式传 `--apply` 才写入。
- 在同一父节点下优先按 `appCode` 查重；编码为 `#` 的分组按 `appName` 查重。
- 每次创建父节点后重新读取权限树，以真实后端 ID 创建子节点。
- 重复执行只会跳过已存在节点，不会重复插入。
- 默认不覆盖已有配置；只有显式传 `--update` 才会修正差异。

## 新模块复用步骤

1. 从 `https://api.boltfox.cn/v2/api-docs` 核对接口路径、HTTP 方法、入参和输出模型。
2. 在 `src/api/<module>.js` 中新增请求封装；路径省略 `/ZoneAdmin`，由环境变量统一补齐。
3. 在 `src/router/routes.js` 注册列表和隐藏的详情/编辑路由，固定路由 `name`。
4. 在菜单同步脚本的声明树中新增节点：导航节点的 `appUrl` 填路由 `name`。
5. 页面按钮通过 `v-permission="['对应 appCode']"` 使用同一权限编码。
6. 先执行只读预览，再执行 `--apply`，最后重新读取权限树确认。
7. 非系统管理员需要在“角色管理 → 绑定权限”中勾选新增节点，并重新登录刷新 `getChildAppCodes` 与左侧菜单缓存。
8. 执行 `npm run build`，并在有 `.codegraph/` 的环境运行 `codegraph sync` 更新本地索引。

## 常见问题

### 菜单已创建但左侧不显示

- 检查 `appUrl` 是否与本地路由 `name` 完全一致，注意大小写。
- 检查菜单节点 `isNav` 是否为 `1`。
- 检查当前角色是否绑定了新增节点。
- 退出并重新登录，让顶部菜单、左侧菜单和 `childAppCodes` 重新加载。

### 菜单可以点击但页面空白或跳转失败

- 本地路由可能尚未注册，或路由组件 import 路径错误。
- 父级路由与子级路由的 path 组合可能不正确。
- route `name` 与组件的 `<script setup name="...">` 应保持一致，以免 `keep-alive` 缓存异常。

### 按钮未显示

- `v-permission` 只检查 `getChildAppCodes` 返回值。
- 确认按钮编码与后端 `appCode` 完全一致，包括 `Get`/`Post` 大小写。
- 系统管理员由指令直接放行；普通管理员必须重新绑定角色权限。
