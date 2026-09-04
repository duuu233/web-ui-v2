# 官方图库物理删除与缩略图列表展示

> 文档类型：Historical Change Record
> 日期：2026-09-04
> 环境：本地 Windows 工作区（具体物理环境未声明）
> 分支与起始版本：main / 4a639c2
> 范围：`web-ui-v2` 官方图库 API、列表交互、权限声明与项目文档
> 当前权威文档：[`../../interface-list.md`](../../interface-list.md)、[`../../api-integration-progress.md`](../../api-integration-progress.md)、[`../../dynamic-menu-sync.md`](../../dynamic-menu-sync.md)

## 背景与目标

后台新增 `POST /ZoneAdmin/ProductImg/deleteProductImg`，请求体的 `id` 取官方图库记录的 `productImgId`。该操作会物理删除记录并清理关联 OSS 文件。官方图库管理列表同时要求只使用缩略图字段展示图片，避免列表加载原图。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/api/productImage.js` | 新增 `deleteProductImg` 请求封装。 |
| `src/views/commerce/productImage/useProductImageList.js` | 新增不可恢复删除确认、`{ id: productImgId }` 请求、删除中状态、成功提示与列表刷新。 |
| `src/views/commerce/productImage/index.vue` | 向表格传递删除状态并接收删除事件。 |
| `src/views/commerce/productImage/components/ProductImageTable.vue` | 列表图片改为只读取 `imgThumb`；新增权限控制的删除按钮。 |
| `scripts/sync-admin-menu.mjs` | 在图库管理节点下声明 `Post_ProductImg_DeleteProductImg` 非导航权限。 |
| `AI_CONTEXT.md`、`docs/*.md` | 更新当前图库能力、接口契约、菜单权限和文档索引。 |

## 关键决策

- 删除接口严格提交 `{ id: row.productImgId }`，认证字段继续由统一请求层追加。
- 删除确认明确提示“物理删除、清理 OSS、不可恢复”，避免管理员误操作。
- 列表图片的展示地址和预览地址均使用 `imgThumb`，不回退到 `img`，确保列表不会加载原图。
- 删除按钮权限编码采用接口对应的 `Post_ProductImg_DeleteProductImg`，与菜单声明保持一致。

## 外部操作

- 只读访问 Swagger，确认删除接口为 `POST`、请求模型为 `BaseAdminIdInput`，且 `id` 传 `productImgId`。
- 未执行菜单写入、角色绑定、实际删除、部署或数据迁移。

## 验证结果

- `node --check src/api/productImage.js`：通过。
- `node --check src/views/commerce/productImage/useProductImageList.js`：通过。
- `node --check scripts/sync-admin-menu.mjs`：通过。
- `npm run build`：通过；仅出现既有的依赖纯函数注释和大 chunk 警告。
- `git diff --check`：通过；仅出现 Git 的 LF/CRLF 转换提示。
- `codegraph sync .`：完成，识别 2 个可索引源文件变化。
- `codegraph status .`：索引为最新状态，1812 个节点、4918 条边。

## 未完成项与风险

- 未在登录后台执行真实物理删除，以避免在未获指定测试数据时破坏 OSS 与业务数据。
- 当前 Swagger 的 `ProductImgApiOut` 列表模型尚未声明 `imgThumb`，但本次产品契约要求列表使用该字段；目标后端列表响应必须实际返回 `imgThumb`，否则列表按设计显示占位符 `-`。
- 目标环境需先只读预览并同步新增权限节点，再为非系统管理员角色绑定权限、重新登录验证按钮可见性。

## 回滚或恢复

回滚上述前端、脚本和文档文件即可恢复原列表行为。已经通过新接口物理删除的记录和 OSS 文件无法由前端回滚，真实环境验证必须使用明确允许删除的测试记录。
