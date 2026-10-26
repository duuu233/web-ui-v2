# 产品设备

> 文档类型：模块与接口契约
> 状态：Active
> 最后核验：2026-10-26
> 事实来源：产品要求、官方 Swagger、线上只读接口、当前页面及菜单同步结果

## 页面与数据

入口为“产品管理 → 产品设备”，路由名为 `productDevice`。新增、编辑、详情分别为同名前缀加 `Add`、`Edit`、`Detail`；编辑和详情查询参数 `id` 表示产品设备记录主键。

列表支持设备ID关键词、WiFi产品、启用状态、创建日期和分页；查询回第一页，重置清空筛选，`verify=0` 保留。列表使用公共搜索、工具栏、分页和 `usePagedList`，启用 latestRequestOnly 以忽略迟到响应；保存后使列表缓存失效。详情只读，详情错误或非法ID时禁止保存，离开页面忽略旧请求。

新增、编辑维护必选产品和1–50字符设备ID；保存前修剪设备ID首尾空白。产品选项逐页请求 `getProductList({ pageIndex, pageSize: 100, versionType: 2 })`，再排除返回中的非WiFi项。保存前再次校验所选产品属于当前WiFi列表，不把旧产品或蓝牙产品伪造为可选项；旧产品不在当前列表时，编辑须重新选择，详情仍可显示产品ID。空选项、加载失败均提供明确提示；失败保留草稿，重复保存被阻止。

## 接口与字段

公共前缀为 `/ZoneAdmin`，封装在 `src/api/productDevice.js`，签名、登录态和错误处理沿用统一请求层。

| 操作 | 方法与业务路径 | 业务参数 | 权限码 |
| --- | --- | --- | --- |
| 列表 | GET /ProductDevice/getProductDeviceList | pageIndex、pageSize；可选 keyword、productId、verify、startDate、endDate | Get_ProductDevice_GetProductDeviceList |
| 详情 | GET /ProductDevice/getProductDeviceDetail | id | Get_ProductDevice_GetProductDeviceDetail |
| 添加 | POST /ProductDevice/addProductDevice | productId、deviceId | Post_ProductDevice_AddProductDevice |
| 编辑 | POST /ProductDevice/editProductDevice | pDeviceId、productId、deviceId | Post_ProductDevice_EditProductDevice |
| 启禁用 | POST /ProductDevice/setProductDeviceVerify | id、verify（0禁用，1启用） | Post_ProductDevice_SetProductDeviceVerify |

产品设备主键 `pDeviceId` 与产品 `productId`、设备标识 `deviceId` 是三个不同字段。Swagger与实际返回同时含 `pDeviceId/pdeviceId`，页面优先前者、兼容后者；写入编辑只使用产品明确的 `pDeviceId`。详情和启禁用将同一主键作为 `id` 传递。主键限定正int32；提交采用字段白名单，不提交输出字段、状态文案或鉴权字段。列表读取 `retData.pageData/recordCount`，写操作 `retData=false` 视为失败。启禁用先确认，成功后刷新。

产品列表本身新增版本类型筛选，清空或重置时省略 `versionType`。2026-10-26 Swagger 将该参数误命名为第二个 `verify`，但描述为版本类型；按产品明确要求发送 `versionType`，线上只读请求已核实1返回蓝牙产品、2返回WiFi产品。其他产品选择器保持原行为。

Swagger另有逻辑删除接口，本轮没有需求，不接入删除操作。

## 菜单、验证和交付

`npm run menu:sync:product-device` 只预览，显式 `-- --apply` 才新增。该范围按现有产品列表权限码 `Get_Product_ProductList` 找到唯一父级，缺失或歧义时停止；不会维护其他模块或改写现有节点。凭证仅从进程环境变量读取，操作方法见 [动态菜单同步](dynamic-menu-sync.md)。

2026-10-26 在系统1、产品管理父级108下创建导航169及详情170、新增171、编辑172、启禁用173，并只读复核五项均存在。普通角色需要管理员绑定新增权限并重新登录。菜单创建不代表前端已部署。

`npm run test:product-device` 覆盖主键/字段白名单、WiFi分页及蓝牙排除、五项API方法与参数、菜单预览/创建/幂等和父级歧义。实际验证边界与外部操作见 [本次记录](history/2026-10/2026-10-26-product-device.md)。
