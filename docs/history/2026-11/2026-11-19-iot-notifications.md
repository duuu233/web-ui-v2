# IoT 消息通知查询

> 文档类型：Historical Change Record
> 日期：2026-11-19
> 环境：SSH
> 分支与起始版本：main / 8872d77
> 范围：web-ui-v2 IoT 模块新增消息通知查询页与后台菜单
> 当前权威文档：[IoT 只读监控](../../iot-admin.md)、[动态菜单同步](../../dynamic-menu-sync.md)

## 背景与目标

按产品提供的 [消息通知后台原型](../../V2/消息通知后台原型.html) v1，后台按设备查看服务端产生的全部消息通知，数据来自 IoT 服务 `GET /admin/notification/list`。

## 改动

- `src/api/iotAdminClient.js`：只读路径白名单加入 `/admin/notification/list`。
- `src/views/iot/model.js`：消息类别（DEVICE / ALARM / EXCEPTION / BUSINESS）与文案语言（zh-CN / zh-TW / en / ja）常量、`notificationCategory`、`payloadText`；`buildListQuery` / `fromRoute` 支持 `notifications`（设备号去冒号转大写、语言校验）。
- `src/views/iot/useIotList.js`：按 kind 选接口；消息通知没有设备号时不请求，用户点查询才提示「设备编号必填」；换设备 / 语言时清空旧数据。设备、日志两页行为不变。
- 新页 `src/views/iot/notifications.vue`（路由 `iotNotifications` / `/iot/notifications`）：筛选、总数与页码、表格（ID、时间、类别、消息类型、标题、内容、payload）、点行抽屉看完整 payload、抽屉里可跳设备详情。
- `IotFilters` 增加消息通知变体；`IotPage` 子导航加「消息通知」；设备详情页加「消息通知」按钮预填设备号；演示数据为前 3 台设备各 45 条、四种语言。
- `scripts/sync-admin-menu.mjs`：`iot-monitoring` 范围加「消息通知查询」节点；`tests/iot-admin.test.mjs` 增加查询参数、演示数据断言，菜单幂等测试节点数 10 → 11。

## 外部操作

- 线上只读核验 `/admin/notification/list`：返回结构与原型一致；带冒号设备号返回 total 0（所以前端去冒号）；缺 deviceNo、size > 100 返回 4000；未知设备 total 0；非法 lang 回落简中。
- 后台菜单：本机无 Node，按 `sync-admin-menu.mjs` 相同请求与「只新增」规则用 Python 执行。先只读预览（树中无同编码节点），用户提供 userToken 后在 IoT管理 174 下新增 192「消息通知查询」（`Get_IotAdmin_NotificationList` / `iotNotifications`，grade 0，isNav 1）；复核 `getLeftMenus` 顺序为 概览 → 设备管理 → 设备监控 → 日志查询 → 消息通知查询。未改已有节点、未绑定角色。Token 未写入任何文件。

## 验证

- 本机无 Node：`npm run build`、`npm run test:iot` 均未运行。
- 已做：改动文件括号配平、模板标签配对的静态检查；`git diff --check` 通过；菜单编码 / 路由名 / 组件名三处一致（`iotNotifications`）。

## 剩余事项

- 本地或 CI 运行 `npm run test:iot` 与 `npm run build`，页面真实接口联调（跨域只放行正式后台域名，本地开发需走代理或用演示数据）。
- 非超级管理员角色需在角色管理中勾选 192 后重新登录；前端发布后菜单才能打开页面。

## 回滚

前端回滚本次提交；菜单在后台删除 192。
