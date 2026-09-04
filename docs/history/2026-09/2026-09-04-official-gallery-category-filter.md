# 官网图库按分类筛选

> 文档类型：Historical Change Record
> 日期：2026-09-04
> 环境：本地 Windows 工作区（Asia/Shanghai）
> 分支与起始版本：main / 66705528fa3b20b99119546a09e15b57d31d9ce5
> 范围：`web-ui-v2` 官网图库列表筛选与接口契约文档
> 当前权威文档：[`AI_CONTEXT.md`](../../../AI_CONTEXT.md)、[`docs/interface-list.md`](../../interface-list.md)、[`docs/api-integration-progress.md`](../../api-integration-progress.md)

## 背景与目标

项目负责人要求官网图库列表新增“图库分类”筛选条件，选择的分类通过 `categoryId` 查询参数传给 `/ProductImg/getProductImgList`。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/commerce/productImage/components/ProductImageFilters.vue` | 增加可清空、可搜索的图库分类下拉框，通过具名 `v-model` 输出数值型 `categoryId`。 |
| `src/views/commerce/productImage/useProductImageList.js` | 列表查询模型增加 `categoryId`，加载图库分类选项及加载状态；查询、分页和重置继续复用公共列表逻辑。 |
| `src/views/commerce/productImage/index.vue` | 连接分类筛选值、分类选项和加载状态，保持页面为列表组合层。 |
| `AI_CONTEXT.md`、`docs/interface-list.md`、`docs/api-integration-progress.md` | 更新图库列表当前筛选能力和 `categoryId` 请求契约。 |
| `docs/README.md`、`docs/history/README.md` | 索引本次历史记录。 |

## 关键决策

- 分类选项复用现有 `/ProductImg/getImgCategoryList`，一次请求最多 1000 条，保持与图库新增/编辑表单一致。
- `categoryId` 进入 `usePagedList` 的唯一查询状态；选中时作为数字传递，空值由 `cleanQuery` 移除，避免发送空参数。
- 查询时页码重置为 1，翻页和改变每页条数时保留当前分类；重置筛选恢复 `categoryId: null`。
- 不把选项请求放进展示组件，分类数据由列表 composable 管理，并通过 props 下传。

## 外部操作

无。未执行菜单同步、部署、数据写入或其他服务端变更。

## 验证结果

- `node --check src/views/commerce/productImage/useProductImageList.js`：通过。
- `npm run build`：通过；仅出现依赖中 `/* #__PURE__ */` 注释位置和大分包的既有非阻断警告。
- `codegraph sync .`：完成，同步本次列表源码改动。
- `codegraph status .`：通过，索引状态为 up to date。
- `git diff --check`：通过；仅输出工作区 LF/CRLF 转换提示。
- 未在真实登录态下执行图库分类筛选的人工接口回归。

## 未完成项与风险

- 分类选项和筛选结果依赖目标环境后端正确支持 `categoryId`；上线前需在真实登录态下选择分类并核对请求参数与返回结果。

## 回滚或恢复

移除 `ProductImageFilters` 的分类下拉及具名模型，从 `defaultListQuery`、分类选项加载和 `index.vue` 连接中移除对应字段，并回退相关 Active 文档与索引即可恢复原行为。
