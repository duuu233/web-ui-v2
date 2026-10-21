# FPGA 固件版本

> 文档类型：模块与接口契约
> 状态：Active
> 最后核验：2026-10-21
> 事实来源：当前 Swagger、线上只读接口、页面和菜单自动化

## 页面与操作

入口为“产品管理 → FPGA固件版本”，列表路由名为 `productVersionFpga`。新增、编辑、详情分别为同名前缀加 `Add`、`Edit`、`Detail`，编辑与详情通过查询参数 `id` 接收固件版本主键。该模块独立于原有 MCU 固件版本页面。

列表支持版本号、产品、升级类型、启用状态、创建日期范围筛选，以及分页和重置。状态筛选保留有效值 `0`。删除与启禁用先确认，成功后重新查询；删除当前末页唯一记录时回到上一页。保存成功后使列表缓存失效并刷新。

列表使用公共搜索、工具栏、分页和分页状态逻辑。分页工具的 `latestRequestOnly` 为可选项，默认关闭；FPGA 列表启用它，迟到的旧响应和旧错误不覆盖新查询，也不提前关闭新请求的列表 Loading。已有模块保持原配置。

新增和编辑维护产品、版本号、固件下载地址、升级类型、权重。固件可通过公共上传接口上传，也可填写已有地址。上传期间禁止保存，失败保留旧地址；详情为只读。只有 HTTP/HTTPS 地址生成下载链接，其他后端历史值以文字展示。加载失败可重试；非法或缺失 ID、详情加载失败时禁止保存。详情切换、离开页面后忽略旧响应。

## 接口

公共前缀为 `/ZoneAdmin`；封装在 `src/api/productVersionFpga.js`，签名和登录态沿用统一请求层。

| 操作 | 方法与路径 | 业务入参 | 权限码 |
| --- | --- | --- | --- |
| 列表 | GET /ProductVersionFpga/getProductVersionFpgaList | pageIndex、pageSize；可选 keyword、productId、compulsory、verify、startDate、endDate | Get_ProductVersionFpga_GetProductVersionFpgaList |
| 详情 | GET /ProductVersionFpga/getProductVersionFpgaDetail | id | Get_ProductVersionFpga_GetProductVersionFpgaDetail |
| 添加 | POST /ProductVersionFpga/addProductVersionFpga | productId、versionNumber、downloadPath、compulsory、grade | Post_ProductVersionFpga_AddProductVersionFpga |
| 编辑 | POST /ProductVersionFpga/editProductVersionFpga | 添加字段加 id | Post_ProductVersionFpga_EditProductVersionFpga |
| 删除 | POST /ProductVersionFpga/deleteProductVersionFpga | id | Post_ProductVersionFpga_DeleteProductVersionFpga |
| 启禁用 | POST /ProductVersionFpga/setProductVersionFpgaVerify | id、verify | Post_ProductVersionFpga_SetProductVersionFpgaVerify |

- `id` 为固件版本主键，不是产品 ID；页面仅接受正 int32。
- `versionNumber` 为 1–200 字符；保存前修剪版本号和下载地址的首尾空白。
- `compulsory`：1 强制升级，2 强提示升级，3 弱提示升级，4 不提示升级。
- `grade` 为非负 int32，默认 0，数值越大优先级越高。
- `verify`：0 禁用，1 启用；新增/编辑不提交该输出字段。
- 列表读取 `retData.pageData` 和 `recordCount`；详情读取 `id/productId/versionNumber/downloadPath/compulsory/grade/verify/joinTime/upTime`，展示时优先采用后端状态和升级类型文案。
- 写操作的 `retData=false` 视为未成功；接口错误保留编辑草稿。
- Swagger 列表另有可选 `language`，固件保存模型没有语种字段，本模块不提供或提交语种筛选。
- 公共上传调用 `POST /Common/setFileUpload`，使用现有 `fileParam` 和返回地址归一化逻辑；不按图片处理固件文件，不额外生成缩略图。

## 菜单与权限

使用 `npm run menu:sync:fpga` 预览、`npm run menu:sync:fpga -- --apply` 新增。该范围先按旧固件列表权限码定位其唯一父级，在同级新增 FPGA 导航与五项操作权限，不依赖“产品管理/商品管理”的分组名称。找不到或父级不唯一即停止。

凭证只由进程环境变量提供。实际操作与回滚见 [历史记录](history/2026-10/2026-10-21-fpga-firmware.md)，通用流程见 [动态菜单同步](dynamic-menu-sync.md)。普通角色需由管理员绑定新增权限并重新登录。

## 验证

`npm run test:fpga` 使用 Node 内置测试与 Vite SSR，验证提交字段白名单、ID、下载链接、分页响应顺序、菜单预览/幂等创建和父级歧义保护。菜单测试仅调用本地模拟服务器。

页面交互验证与线上只读检查的实际范围见历史记录。构建通过不代表线上前端已发布，也不代表已在生产执行固件写操作。
