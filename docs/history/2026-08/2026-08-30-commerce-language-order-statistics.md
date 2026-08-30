# 首页订单统计与内容语种接入

> 文档类型：Historical Change Record
> 日期：2026-08-30
> 环境：其他（本地 Windows 工作区）
> 分支与起始版本：`main` / `d39cfff`；实施前 fast-forward 到 `a8a3475`
> 范围：首页、商品、AI 配置、公共图库、图库分类及接口状态文档
> 当前权威文档：[`AI_CONTEXT.md`](../../../AI_CONTEXT.md)、[`docs/interface-list.md`](../../interface-list.md)、[`docs/api-integration-progress.md`](../../api-integration-progress.md)

## 背景与目标

依据 2026-08-30 提供的变更清单和 BoltFox Swagger，为管理后台接入首页订单统计，并为商品、AI 配置、公共图库和图库分类补齐内容语种参数。变更清单同时包含用户端商品列表的 `currencySymbol` 出参，需要先确认其是否属于本仓库调用链。

任务开始时本地 `main` 比 `origin/main` 落后 6 个提交，商品、AI 配置、公共图库和图库分类模块仅存在于远端版本；工作区另有用户原有的 `dist.zip` 修改。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/api/home.js` | 新增 `GET /Common/getStatisticsOrder` wrapper。 |
| `src/views/home/index.vue` | 使用 `queryType` 加载 `{ queryDate, orderCount }[]`，将原订单收益占位卡片替换为真实订单数量趋势。 |
| `src/views/home/chartOptions.js` | 将预留收益图表改为订单数量折线图，数量按“笔”展示。 |
| `src/views/commerce/utils.js` | 新增独立的 `contentLanguageOptions`：`1=英语`、`2=简中`、`3=繁中`、`4=日文`。 |
| 商品模块 | 列表使用正确的内容语种筛选；新增/编辑表单增加必填 `language` 并显式提交。 |
| AI 配置模块 | 列表语言筛选改用内容语种枚举，沿用现有查询、清空和重置链路。 |
| 公共图库与图库分类模块 | 列表使用正确的内容语种筛选；新增/编辑表单增加必填 `language`、默认值、详情兼容回填和提交透传。 |
| Active 文档 | 更新当前项目事实、接口清单和接入状态，移除首页订单接口待定状态并记录用户端接口边界。 |

## 关键决策

- Swagger 对本次管理端内容字段约定为 `1`–`4`，因此新增 `contentLanguageOptions`，不修改仍被其他接口使用的 0–6 `languageOptions`。
- 变更清单中的产品图片和图片分类列表路径写为 `/AiConfig/*`，Swagger 与现有 wrapper 均确认真实路径为 `/ProductImg/getProductImgList` 和 `/ProductImg/getImgCategoryList`，按真实契约实现。
- `/Client/Order/getGoodsList` 不在本仓库 API wrapper、调用链或页面范围内；`currencySymbol` 应由对应用户端项目消费，未在管理端创建无调用 wrapper 或误导性展示。
- 首页新增接口返回订单数量而非收益金额，因此把先前的“订单收益待接入”占位替换为“订单统计”趋势图，不继续保留错误的金额语义。
- Swagger 的公共图库和图库分类详情出参未声明 `language`。前端优先使用实际响应字段，缺失时回落到英语，避免提交空值。

## 外部操作

- 只读核对 `https://api.boltfox.cn/v2/api-docs` 中相关路径、参数和响应模型；未调用业务写接口。
- 在保留用户 `dist.zip` 原始字节的前提下，执行 `git merge --ff-only origin/main`，从 `d39cfff` fast-forward 到 `a8a3475`；随后恢复并以 SHA-256 校验该本地文件未变化。
- 执行 CodeGraph 同步；未运行菜单同步、部署、数据迁移或后端写操作。

## 验证结果

- `npm run build` 通过：Vite 转换 3033 个模块并生成生产构建。构建仅报告既有的第三方 PURE 注释和大 chunk 警告。
- `node --check src/api/home.js` 通过。
- `node --check src/views/home/chartOptions.js` 通过。
- `git diff --check` 返回 0；仅显示工作区 LF/CRLF 转换提示，无空白错误。
- CodeGraph 在源码与文档完成后执行 `codegraph sync .` 和 `codegraph status .`，索引状态正常。

未执行带登录态的真实接口请求或浏览器人工回归；当前环境未提供管理后台凭证。

## 未完成项与风险

- 用户端项目仍需消费 `/Client/Order/getGoodsList` 返回的 `currencySymbol`；本仓库不包含对应页面。
- 后端应确认公共图库和图库分类详情接口是否会返回 `language`，否则编辑非英语记录时无法仅靠详情响应恢复原语种。
- 项目没有自动化测试、lint 或类型检查脚本，除生产构建外仍建议在有权限的环境人工验证列表筛选、表单回填和首页三档周期切换。

## 回滚或恢复

源码和文档变更可通过回退本记录列出的文件恢复。本次没有外部业务数据、菜单或角色权限写入。用户原有 `dist.zip` 修改被完整保留，仍是有意的本地未提交状态。
