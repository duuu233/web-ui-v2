# IoT 菜单改名与设备管理并入

> 文档类型：Historical Change Record
> 日期：2026-11-12
> 环境：SSH
> 分支与起始版本：main / 8e9ddfc
> 范围：后台系统1菜单（IoT 分组、产品设备）、菜单同步脚本、相关页面标题
> 当前权威文档：[IoT监控](../../iot-admin.md)、[产品设备](../../product-device.md)、[动态菜单同步](../../dynamic-menu-sync.md)

## 需求

1. 「产品设备」改名「设备管理」，放到 IoT 菜单下；
2. 原「设备管理」（IoT 设备只读列表）改名「设备监控」；
3. 「IoT监控」改名「IoT管理」。

## 后台菜单（已写入）

用户提供临时管理员 userToken 并要求更新。只读拉取系统1菜单树核对后，按与脚本 `--apply --update` 相同的载荷调 `/Jurisdiction/setAdminAppli`（带原 id，即改名 / 换父级，不新建）：

| id | 原 | 现 |
|---|---|---|
| 174 | IoT监控（grade 2） | IoT管理 |
| 175 | 概览 grade 3 | 概览 grade 4 |
| 169 | 产品设备，父级 108 产品管理，grade 0 | 设备管理，父级 174，grade 3（子节点 170–173 跟随） |
| 176 | 设备管理 | 设备监控 |

复核：`getAdminAppliBySys` 中 108 下已无 169；`getLeftMenus(parentMenuId=1)` 的 IoT管理 顺序为 概览 → 设备管理 → 设备监控 → 日志查询。节点 id 与权限编码不变，角色已绑定的权限照旧有效。token 未写入任何文件或日志。

## 代码

- `scripts/sync-admin-menu.mjs`：
  - `iot-monitoring` 范围改为 IoT管理（`aliases` 认旧名 IoT监控）、概览 grade 4、设备管理（复用 product-device 节点）、设备监控、日志查询；
  - `product-device` 范围改按组内「概览」`Get_IotAdmin_Stats` 定位父级；
  - 新增「同编码节点挂在别的父级下」处理：预览标「待移动」；`--apply` 不带 `--update` 时停止且不建重复节点；带 `--update` 时以原 id 换父级移动。
- 标题：路由 IoT管理 / 设备监控 / 设备监控详情 / 设备管理 / 新增设备 / 编辑设备 / 设备详情；IoT 页面标题与页内导航「设备监控」；设备管理列表标题与提示同步。路由路径与 name 不变（`/sms/productDevice*`、`/iot/*`）。
- 测试：`tests/iot-admin.test.mjs` 新建用例改为 10 个节点、导航顺序与名称；新增「改名 + 移动、不带 --update 不动、重复执行无变化」用例；`tests/product-device.test.mjs` 父级判据改为 IoT 分组。

## 验证

后台菜单写入后已只读复核（见上）。本机无 node：`npm run test:iot`、`npm run test:product-device`、`npm run build` 未运行；git diff --check 通过。前端标题改动需发布后生效。
