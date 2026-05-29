# web-ui-v2（后台管理系统 · Vue3 升级版）

在保留原 Vue2 项目（`xbb/web-ui`，mall-admin 风格）**接口调用与业务实现**的前提下，对前端做的全面技术栈升级。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>`） |
| 构建 | Vite 5 |
| UI 组件 | Element Plus |
| 列表组件 | vxe-table 4.5（列表页主力） |
| 状态管理 | Pinia |
| 路由 | Vue Router 4（hash 模式） |
| 网络 | axios |
| 工具 | dayjs、lodash-es、js-cookie、js-md5、nprogress |

## 快速开始

```bash
yarn install      # 安装依赖
yarn dev          # 开发，默认 http://localhost:8090
yarn build        # 生产构建，输出 dist/
yarn preview      # 预览生产构建
```

## 环境变量

见 `.env.development` / `.env.production`：

- `VITE_APP_BASE_API`：axios 的 baseURL。开发用 `/api`，由 Vite 代理转发到 `VITE_APP_PROXY_TARGET`（规避跨域）；生产为后端完整地址。
- `VITE_APP_PROXY_TARGET`：开发代理目标（对应原项目 `BASE_API`）。
- `VITE_APP_BASE_PAY` / `VITE_APP_BASE_UPLOAD` / `VITE_APP_BASE_BIGUPLOAD`：支付 / 上传接口地址。

## 目录结构

```
src/
├─ api/                # 所有接口模块（与原项目一一对应，已全部迁移）
├─ assets/images/      # 图片
├─ components/SvgIcon/ # svg 图标组件
├─ directive/          # v-permission 权限指令
├─ icons/svg/          # svg 雪碧图源文件（vite-plugin-svg-icons）
├─ layout/             # 布局外壳：TopNav / Sidebar / TagsView / AppMain
├─ router/             # routes.js（路由表）+ index.js（路由实例）
├─ store/              # Pinia：user / app / tagsView / permission
├─ styles/             # 全局样式
├─ utils/              # request（签名/token/retCode）、auth、validate、date、index 等
├─ views/              # 页面
├─ permission.js       # 路由守卫（登录态 + 菜单拉取）
└─ main.js             # 入口
```

## 接口调用 / 业务实现（与原项目一致）

- **请求层 `utils/request.js`**：完整保留原签名机制（`randomString` + md5 `sign`）、token（cookie `loginToken` 注入为 `userToken`）、响应约定 `{ retCode, retMsg, retData }`（200 为成功），以及 406 被登出处理。`utils/requestPay.js` 对应支付接口实例。
- **权限指令 `v-permission`**：检查 Pinia `user.permissions`（即 `getChildAppCodes` 返回的 `childAppCodes`），cookie `isSysAdmin === '1'` 时放行。用法不变：`v-permission="['xxx']"`。
- **菜单模型（后端驱动）**：登录后由路由守卫调用 `getSysMenus` 得到顶部系统导航（`app.sidebarTop`）；点击顶部导航调用 `getLeftMenus` 得到左侧分组菜单（`app.sidebarRight`），`menuUrl` 即路由 `name`。实际路由表使用本地静态表 `router/routes.js`。

## 已完成 / 待迁移

**已完成（可运行基座 + 样板模块）：**

- 全部基础设施：请求层、Pinia、路由、权限指令、路由守卫、布局、SvgIcon、全局样式
- 全部 20 个 `api/*.js` 接口模块
- 样板页面：登录、首页、404、用户列表（vxe-table）+ 编辑 + 详情、产品列表（vxe-table）

**待迁移：** `ums`（员工/角色/菜单/部门/系统配置/地区）、`oms`（运单）、`log`（各类日志）、`sms` 其余页面（配送员/配送点/取货点/调度/版本/应用市场/消息/常见问题等）。按下方模式逐个补充即可。

## 如何新增一个列表页（vxe-table 模式）

1. 在 `src/api/` 写接口（`import request from '@/utils/request'`，照搬原项目 url/method）。
2. 在 `src/views/<module>/<page>/index.vue` 参考 `views/sms/userList/index.vue`：
   - 顶部 `el-card` 搜索区（`el-form` inline）
   - 操作区 `el-card`（按钮配 `v-permission`）
   - `vxe-table` + `vxe-column`（自定义单元格用 `#default="{ row }"`）
   - `el-pagination` 分页，`listQuery`（`pageIndex`/`pageSize`）驱动
   - `<script setup name="路由name">`（name 需与路由 name 一致，供 keep-alive 缓存）
3. 在 `src/router/routes.js` 的 `asyncRouterMap` 补一条路由（`name` 与组件 name 一致）。
```
