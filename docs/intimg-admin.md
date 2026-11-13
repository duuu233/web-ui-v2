# 内置图管理

> 文档类型：模块与接口契约
> 状态：Active
> 最后核验：2026-11-13
> 事实来源：产品提供的 [前端内置图开发清单（定稿）](V2/前端内置图开发清单.md)、[内置图管理功能清单 v8](V2/内置图管理功能清单.md)、[原型](V2/内置图后台原型.html)；线上 `/admin/intimg/*` 只读响应；当前源码

## 页面与范围

运营为每个 WiFi 产品维护 6 张内置图（槽位），推送到设备。核心规则：**下发清单必须从 FACTORY 开始连续**——只更新 FACTORY 就只发 FACTORY；要更新 NO_WIFI，必须同时带上 FACTORY、SET；槽位中间缺一个，后面的都不能推。

| 页面 | 路由名 / 路径 | 行为 |
| --- | --- | --- |
| 槽位管理 | intimgSlots / /intimg/slots | WiFi 产品卡片（尺寸、方向、渲染模式、已配置 x/6）；选定产品后 6 个槽位：缩略图（可放大）、画布、版本、状态、更新人 / 时间；上传 / 替换、重新渲染 |
| 设备内置图状态 | intimgDevices / /intimg/devices | 选产品；版本状态、在线、登记状态、设备号筛选（没有槽位筛选）；20/50/100 分页；可「按当前筛选新建推送任务」 |
| 新建推送任务 | intimgTaskCreate / /intimg/tasks/create | ① 选产品 ② 选目标槽位（实时展示实际下发清单）③ 选设备 ④ 确认；提交后跳任务列表 |
| 推送任务列表 | intimgTasks / /intimg/tasks | 产品、状态筛选；按任务号直接查详情；列：任务号、产品、目标槽位、实际下发清单、五项计数、状态、创建人 / 时间 |
| 任务详情 | intimgTaskDetail / /intimg/tasks/:taskNo | 非导航，高亮任务列表；计数卡片、7 个状态 Tab、批量移除所选 / 重发失败、行内取消推送 / 重发 |
| 设备锁排查 | intimgLocks / /intimg/locks | 设备号查询；锁持有任务（可跳详情）、历史槽位、到期时间；强制释放锁 |

页面共用 IoT 模块的外观（`iot-page` 样式、220px 侧栏、错误提示组件、可取消请求 `useIotResource`），页头带子导航与连续前缀规则提示。

### 产品与渲染参数

产品复用老后台「产品列表」（`getProductList`，按 `versionType=2` 逐页拉全并排除蓝牙版，与「设备管理」同一实现 `fetchWifiProducts`），会话内缓存，刷新按钮重拉。上传时取：

| 产品字段 | 用途 |
| --- | --- |
| `width` / `height`（表单「尺寸(cm)」，值是像素） | `canvasWidth` / `canvasHeight`；上传图转好后必须正好等于它 |
| `screenType`（0 竖屏 / 1 横屏） | `orientation` = `PORTRAIT` / `LANDSCAPE`；画布是否转 90° 由服务端处理 |
| `renderMode`（`esp32` / `fpga16`） | 原值提交 |
| `verticalRotation`（竖屏）/ `rotationDegree`（横屏） | 上传前由前端把图片内容按该度数顺时针旋转（只支持 90 的倍数） |

任何一项不合法（尺寸 ≤ 0、渲染模式不是 esp32 / fpga16、方向缺失）都禁止上传并提示，不兜底默认值。旋转度数为 0 时原文件直接上传；需要旋转时用 canvas 转好后导出 PNG 上传。校验失败会提示实际尺寸、产品要求及需要的原图尺寸。

### 目标槽位与下发清单

「可更新上限」= 从 FACTORY 起连续 READY 的最后一个槽位。超过上限的槽位不可勾选，悬停提示需先配置哪个槽位；FACTORY 未配置时该产品不能推送。勾选的是**目标槽位**（提交 `slotKeys`），实际下发清单 = FACTORY 到最靠后的目标，页面以「目标 / 自动带上 / 可选 / 不可更新」标注，并显示 `FACTORY v3 → SET v1 → NO_WIFI v1`。服务端同样自动补齐前缀。

### 选设备与确认

- 逐台勾选：`selectable=false` 的行禁用并显示锁任务号与到期时间；勾选跨页保留，换产品清空。
- 「全选当前筛选结果」：提交 `selectAll: true` + `filter`（版本状态 / 在线 / 登记状态），不翻页收集。设备号关键词不在接口 filter 里，全选时有关键词会提示并拒绝提交。
- 确认弹框写明实际下发清单、覆盖 N 台（在线 X / 离线 Y）、离线进入待补发（7 天）、覆盖不可逆。全选时在线 / 离线台数按同一筛选各查一次总数。
- 提交只等创建结果（`taskNo`），随后跳任务列表，推送在后台执行。

### 状态文案

槽位 `READY` 已配置 / `RENDERING_DISABLED` 未配置；设备整体 `LATEST` 最新 / `OUTDATED` 落后 / `NOT_PUSHED` 未推送；任务 `RUNNING` 执行中 / `DONE` 已完成 / `CANCELED` 已取消；明细 `PENDING` 待补发、`SENT` 已下发、`SUCCESS` 成功、`FAILED` 失败、`EXPIRED` 已失效、`SKIPPED_BUSY` 设备忙、`CANCELED` 已取消。设备目前只回 106，明细停在「已下发」，不写成成功。

取消只对待补发 / 已下发生效，取消「已下发」只是不再等待结果，设备仍可能生效；重发针对失败类（FAILED / EXPIRED / SKIPPED_BUSY），不选设备时服务端重发全部 FAILED，重发生成新任务并跳到它的详情。

## 接口与鉴权

独立客户端 `src/api/intimgClient.js`，与 IoT 只读监控同一服务和鉴权方式：不走 ZoneAdmin 请求实例，不发送 `userToken` / `randomString` / `sign` / Cookie，运行环境注入内部 Token 时才带 `X-Internal-Token`。只允许下列 13 条接口，路径参数逐段编码；普通请求 15 秒超时，上传 120 秒。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | /admin/intimg/slots/summary | 槽位汇总 `productIds` |
| GET | /admin/intimg/slots | 槽位列表 `productId` |
| POST | /admin/intimg/slots/{productId}/{slotKey}/image | 上传 / 替换（multipart：file、renderMode、orientation、canvasWidth、canvasHeight） |
| POST | /admin/intimg/slots/{productId}/{slotKey}/render | 重新渲染 |
| GET | /admin/intimg/devices | 设备内置图状态 |
| POST | /admin/intimg/tasks | 新建推送任务（JSON） |
| GET | /admin/intimg/tasks | 任务列表 |
| GET | /admin/intimg/tasks/{taskNo} | 任务详情 |
| GET | /admin/intimg/tasks/{taskNo}/items | 任务明细 |
| POST | /admin/intimg/tasks/{taskNo}/items/cancel | 取消（释放锁） |
| POST | /admin/intimg/tasks/{taskNo}/items/retry | 重发 |
| GET | /admin/intimg/locks | 设备锁 |
| POST | /admin/intimg/locks/{deviceNo}/release | 强制释放锁 |

响应 `{ code, msg, data }`，`code=0` 成功；服务端返回的 `msg`（如「槽位「设置图」未配置，无法更新「无 WiFi 提示」」）直接提示。401 提示联系管理员配置 Token，5001 / 5002 前缀「渲染失败」/「OSS 上传失败」，任务详情 4044 提示任务不存在。

服务地址与 IoT 模块同一套配置：`window.__IOT_ADMIN_CONFIG__.baseURL` / `internalToken` → `VITE_IOT_ADMIN_BASE_URL` → `https://iot.boltfox.cn`。2026-11-13 线上 OPTIONS 返回 `Access-Control-Allow-Origin: *`、允许 POST 与 `content-type`；启用 `X-Internal-Token` 后需同时放开该请求头或改走同源代理。

## 菜单与权限

`npm run menu:sync:intimg`（`--scope=intimg`）默认只预览，`-- --apply` 才新增。顶层分组「内置图管理」grade 2（排在 IoT管理 之后），appUrl 为路由名：

| 节点 | 权限码 | 页面用途 |
| --- | --- | --- |
| 槽位管理 | Get_IotIntimg_SlotList | 导航 |
| └ 上传/替换 · 重新渲染 | Post_IotIntimg_UploadSlotImage · Post_IotIntimg_RenderSlot | 按钮 |
| 设备内置图状态 | Get_IotIntimg_DeviceList | 导航 |
| 新建推送任务 | Post_IotIntimg_AddTask | 导航；也控制「确认推送」「按当前筛选新建推送任务」按钮 |
| 推送任务列表 | Get_IotIntimg_TaskList | 导航 |
| └ 任务详情 · 取消推送 · 重发失败 | Get_IotIntimg_TaskDetail · Post_IotIntimg_CancelTaskItems · Post_IotIntimg_RetryTaskItems | 详情为非导航节点；取消 / 重发为按钮 |
| 设备锁排查 | Get_IotIntimg_LockList | 导航 |
| └ 强制释放锁 | Post_IotIntimg_ReleaseLock | 按钮 |

2026-11-13 已在系统 1 根下新增 179–190（分组 179，导航 180 / 183 / 184 / 185 / 189）。系统管理员不受按钮权限限制；普通角色需管理员绑定新增节点并重新登录。菜单已创建不等于前端已发布。

## 验证

`npm run test:intimg` 覆盖连续前缀（上限、不可选提示、清单展开）、产品渲染参数与上传尺寸 / 旋转校验、查询与任务负载（指定设备 / 全选、关键词提醒）、客户端路径白名单与鉴权隔离、错误码、菜单权限码与路由一致性。实际运行情况见 [本次记录](history/2026-11/2026-11-13-intimg-admin.md)。
