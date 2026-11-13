# 内置图管理

> 文档类型：Historical Change Record
> 日期：2026-11-13
> 环境：SSH
> 分支与起始版本：main / f221ecb
> 范围：web-ui-v2 新增内置图管理模块与后台菜单
> 当前权威文档：[内置图管理](../../intimg-admin.md)

## 背景与目标

按产品提供的 `docs/V2` 三份资料（前端内置图开发清单定稿、功能清单 v8、原型）开发内置图管理：每个 WiFi 产品 6 个槽位，推送时下发清单必须从 FACTORY 开始连续。后端 13 项 `/admin/intimg/*` 已上线。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/api/intimgClient.js` | 新增：13 条接口白名单、GET / JSON POST / multipart / 无体 POST，不带 ZoneAdmin 鉴权字段，可选 `X-Internal-Token` |
| `src/views/intimg/` | 新增：`model.js`（纯逻辑）、`image.js`（上传前读图 / 旋转）、`service.js`（接口与 WiFi 产品缓存）、`intimg.scss`、`components/`（页头、产品卡片、设备筛选）及 `slots` / `devices` / `taskCreate` / `tasks` / `taskDetail` / `locks` 六页 |
| `src/router/routes.js` | 新增 `/intimg` 分组六个路由（详情非导航，高亮任务列表） |
| `scripts/sync-admin-menu.mjs`、`package.json` | 新增 `intimg` 范围与 `menu:sync:intimg`、`test:intimg` |
| `tests/intimg-admin.test.mjs` | 新增回归 |
| 文档 | 新增 `intimg-admin.md`；README、AI_CONTEXT、project-structure、dynamic-menu-sync、api-integration-progress、interface-list、history 索引同步 |

## 关键决策

- 菜单做成顶层分组「内置图管理」（同原型），grade 2 排在 IoT管理 之后；不挂进 IoT管理。
- 写操作挂按钮权限（上传、重新渲染、新建任务、取消、重发、释放锁），与 FPGA 模块同一做法；系统管理员不受限。
- 上传前旋转：竖屏产品用「竖向旋转度数」、横屏产品用「横向旋转度数」，转好后须正好等于画布尺寸；旋转 0° 时原文件直接上传，否则导出 PNG。横屏（10.1 fpga16）这条组合未在实机验证。
- 「全选当前筛选结果」时设备号关键词不在接口 filter 里，有关键词就提示并拒绝提交，避免实际推送范围比页面看到的大。
- 重发允许所选 FAILED / EXPIRED / SKIPPED_BUSY（任务 failed 计数的三类）；不选设备时按服务端口径重发全部 FAILED。
- 不做演示数据模式（后端已上线，可直接联调）。

## 外部操作

- 后台菜单：本机无 Node，按 `scripts/sync-admin-menu.mjs` 的同一请求与「只新增」规则用 Python 执行。先只读预览（全部待新增、树中无同名 / 同编码节点），用户授权后写入系统 1 根下 179（分组）、180 槽位管理 + 181 / 182、183 设备内置图状态、184 新建推送任务、185 推送任务列表 + 186 / 187 / 188、189 设备锁排查 + 190，共 12 个；随后只读复核 12 个均存在。未改已有节点、未绑定角色。
- 线上只读：GET 任务列表、锁列表、槽位汇总、槽位列表、设备状态，字段与文档一致；OPTIONS 返回允许 POST 与 `content-type`。未调用任何写接口。

## 验证结果

- 本机无 Node：`npm run build`、`npm run test:intimg` 均未运行。
- 已做：新文件脚本段括号配平、模板标签配对的静态检查；测试断言对照实现逐条人工核对；权限码在页面与菜单脚本间一致（11 个）。

## 未完成项与风险

- 需本地执行 `npm run build` 与 `npm run test:intimg`，并在浏览器联调上传（尤其横屏产品旋转）、建任务、取消 / 重发、释放锁。
- 普通角色需绑定 179–190 并重新登录；前端未部署。
- 启用 `X-Internal-Token` 校验后需放开该 CORS 请求头或改同源代理。

## 回滚或恢复

前端回滚本次提交即可；菜单回滚在后台删除 179–190（先删子节点）。
