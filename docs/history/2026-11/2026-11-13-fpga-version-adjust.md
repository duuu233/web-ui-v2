# FPGA版本调整

> 文档类型：Historical Change Record
> 日期：2026-11-13
> 环境：SSH
> 分支与起始版本：main / a3bce9b
> 范围：web-ui-v2 FPGA 固件版本模块
> 当前权威文档：[FPGA版本](../../product-version-fpga.md)

## 背景与目标

产品要求：① 「FPGA固件版本」改名「FPGA版本」；② 去掉升级类型，前端默认传「不提示升级」；③ 产品只读取渲染模式 = FPGA16 的产品（目前只有 WiFi 10.1寸）；④ 版本简介说明重新开放。用户端同步做「渲染固件管理」（另在用户端仓库）。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/sms/productVersionFpga/model.js` | 删除升级类型选项与文案；新增 `DEFAULT_COMPULSORY = 4`、`isFpgaProduct` / `fpgaProducts`；提交固定 `compulsory: 4` |
| `FpgaVersionEditor.vue` | 去升级类型；产品只列 fpga16；编辑时原产品不是 fpga16 提示并清空要求重选；标题改名 |
| `FpgaVersionFilters.vue` / `FpgaVersionTable.vue` / `index.vue` / `useFpgaVersionList.js` | 去升级类型筛选与列；筛选产品只列 fpga16；改名 |
| `src/router/routes.js`、`scripts/sync-admin-menu.mjs` | 标题与菜单节点名改为 FPGA版本 |
| `tests/product-version-fpga.test.mjs` | 新增固定传 4 与 fpga16 产品筛选用例 |

## 关键决策

- 版本简介：Swagger（`ProductVersionFpgaAddApiIn` / `ProductVersionFpgaApiOut`）和线上详情都没有简介字段，用户确认先跳过，待后端加字段。
- 列表筛选也只列 fpga16 产品；表格产品名仍按全部产品映射，旧记录（如线上 id=1 挂在产品 1）照常显示名称。

## 外部操作

- 只读：读取 FPGA 列表 / 详情与 WiFi 产品渲染模式（线上 fpga16 仅产品 20 IJ_101）、Swagger 模型。
- 后台菜单节点 163 改名：已预览（只改 appName，parentId 108、appCode、appUrl、grade 不变），写入被本机权限拦下，**未执行**。

## 验证结果

本机无 Node，`npm run build`、`npm run test:fpga` 未运行；改动处人工核对。

## 未完成项与风险

- 执行 `npm run menu:sync:fpga -- --apply --update` 完成后台菜单改名（或在后台手动改名节点 163）。
- 版本简介待后端字段。
- 线上已有记录 id=1 的产品不是 fpga16，编辑它需重新选产品。

## 回滚或恢复

回滚本次提交；菜单若已改名，可在后台改回「FPGA固件版本」。

## 补充（同日）：改名「优雅刷新管理」

- 产品追加：「FPGA版本」再改名「优雅刷新管理」。路由 / 页面 / 按钮 / 确认文案 / 菜单脚本节点名同步，列表列改「版本号」。后台节点 163 改名仍待执行（同上命令）。
- 「推送用户」按钮（`POST /internal/notification/send`，带内部 Token、一次一个设备号）：推送范围待定，用户要求先暂停，等接口调整；内部 Token 不能写进前端源码，届时走运行时注入或同源代理。
- 本机无 Node，build / test 未运行。

## 补充（同日）：版本说明 upgradeTips，取消消息推送

- 接口新增 `upgradeTips`（添加 / 编辑入参，详情 / 列表出参，Swagger 说明「升级提示语 1–200 位字符」）：表单「版本说明」必填、最多 200 字，提交修剪空白；列表加「版本说明」列；`test:fpga` 期望负载加 `upgradeTips`。
- 产品取消后台「推送用户」（改为用户端按本地缓存版本号亮红点）；该按钮此前未实现，无代码可删。
- 本机无 Node，build / test 未运行。
