# 商品与公共图库四语种字段契约

> 文档类型：Historical Change Record
> 日期：2026-09-01
> 环境：本地 Windows 工作区
> 分支与起始版本：main / 10f7a60
> 范围：`web-ui-v2` 商品、公共图库图片、图库分类及接口契约文档
> 当前权威文档：[`../../interface-list.md`](../../interface-list.md)、[`../../api-integration-progress.md`](../../api-integration-progress.md)

## 背景与目标

项目负责人提供了新的多语言接口契约：商品、公共图库图片和图库分类从按 `language` 分记录维护改为单条记录同时携带简中、英语、繁中和日文内容；对应列表不再按 `language` 搜索。用户端商品列表新增 `currencySymbol`，但该接口不属于本管理后台仓库。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/commerce/goods/**` | 移除列表和表单的 `language`，新增四语种商品名称与金额输入、提交和列表展示。 |
| `src/views/commerce/productImage/**` | 移除列表和表单的 `language`，新增四语种标题与说明输入、提交和列表展示。 |
| `src/views/commerce/imageCategory/**` | 移除列表和表单的 `language`，新增四语种分类名称输入、提交和列表展示。 |
| `AI_CONTEXT.md`、`docs/interface-list.md`、`docs/api-integration-progress.md` | 更新当前模块事实、接口字段、路径边界与完成状态。 |
| `docs/README.md`、`docs/history/README.md` | 登记本次历史记录，并修复历史索引中已有的合并冲突标记。 |

## 关键决策

- 保留基础字段 `goodsName`/`amount`、`title`/`content`、`categoryName` 作为简中内容，新增后缀字段承载英语、繁中和日文。
- 图库分类繁中字段严格使用后端契约拼写 `categoryNameeFan`（双 `e`），不在前端自行改名。
- 变更清单中的 `/ZoneAdmin/AiConfig/getProductImgList` 和 `/ZoneAdmin/AiConfig/getImgCategoryList` 与现有接口、权限和页面调用链不一致，继续使用已核验的 `/ZoneAdmin/ProductImg/*` 路径并记录为清单笔误。
- `/Client/Order/getGoodsList` 的 `currencySymbol` 仅记录跨项目边界，不在管理后台添加无调用者的 wrapper 或展示字段。

## 外部操作

无。未调用写接口、未同步后台菜单、未部署，也未直接执行针对 `dist.zip` 的删除或移动命令。任务开始时该文件显示为未跟踪文件，构建后已不在工作区；Git 无法恢复未跟踪文件，如仍需要应从原始来源或既有构建产物重新生成。

## 验证结果

- 六个改动 composable 均通过 `node --check`。
- `npm run build` 于 2026-09-01 通过。
- `git diff --check` 通过，仅输出工作区 LF/CRLF 转换警告。
- `codegraph sync .` 与 `codegraph status .` 完成，索引为最新状态。

## 未完成项与风险

- `/Client/Order/getGoodsList` 的 `currencySymbol` 仍需对应用户端项目接入。
- 未对真实后台执行写请求；四语种字段仍需在目标环境完成新增、编辑、详情回填和列表显示的人工联调。

## 回滚或恢复

回滚本记录对应的源码和 Active 文档修改即可恢复原来的 `language` 单语种模式；不涉及数据库、菜单或外部系统回滚。
