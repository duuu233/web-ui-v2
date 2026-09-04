# 官网图库权重字段

> 文档类型：Historical Change Record
> 日期：2026-09-04
> 环境：本地 Windows 工作区（Asia/Shanghai）
> 分支与起始版本：main / beab46b6a6387ac0350adbe8e7cf12ea4008f4da
> 范围：`web-ui-v2` 官网图库新增、编辑、详情表单与接口契约文档
> 当前权威文档：[`AI_CONTEXT.md`](../../../AI_CONTEXT.md)、[`docs/interface-list.md`](../../interface-list.md)、[`docs/api-integration-progress.md`](../../api-integration-progress.md)

## 背景与目标

官网图库图片的新增、编辑和详情需要增加权重字段 `grade`。2026-09-04 只读核对当前 Swagger 后确认，新增与编辑共用的 `ProductImgAddApiIn` 已声明 `grade`，类型为 `int32`；`ProductImgDetailApiOut` 暂未声明该字段。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/commerce/productImage/useProductImageForm.js` | 表单模型增加默认权重 `0`，增加必填校验，详情响应存在 `grade` 时转为整数回填，缺失或无效时回落为 `0`，新增/编辑提交时显式发送数字 `grade`。 |
| `src/views/commerce/productImage/components/ProductImageForm.vue` | 在新增、编辑、详情共用表单的投放范围区增加图片权重整数控件；详情模式沿用现有只读状态。 |
| `AI_CONTEXT.md`、`docs/interface-list.md`、`docs/api-integration-progress.md` | 更新当前图库能力、请求字段契约和详情兼容策略。 |
| `docs/README.md`、`docs/history/README.md` | 索引本次历史记录。 |

## 关键决策

- 继续复用 `ProductImageForm` 与 `useProductImageForm`，三个薄路由页面不重复实现字段。
- `grade` 按 Swagger `int32` 使用整数输入，范围为 `-2147483648` 到 `2147483647`；默认值为 `0`，数值越大排序越靠前。
- 详情优先消费实际响应中的 `grade`。为兼容当前 Swagger 详情模型和旧响应，缺失或非整数值显示为 `0`，不阻断页面加载。
- 本次范围只覆盖用户指定的新增、编辑和详情，不向图库列表增加权重列。

## 外部操作

- 只读下载并解析 `https://api.boltfox.cn/v2/api-docs`，核对图库新增、编辑和详情模型；临时 Swagger 文件已从工作区删除。
- 未执行菜单同步、部署、数据写入或其他服务端变更。

## 验证结果

- `node --check src/views/commerce/productImage/useProductImageForm.js`：通过。
- `npm run build`：通过；仅出现依赖中 `/* #__PURE__ */` 注释位置和大分包的既有非阻断警告。
- `git diff --check`：通过；仅输出工作区 LF/CRLF 转换提示。
- `codegraph sync .`：完成，报告索引已是最新。
- `codegraph status .`：通过，索引状态为 up to date。
- 未在真实登录态下执行图库新增、编辑或详情的人工接口回归。

## 未完成项与风险

- 当前 Swagger 的 `ProductImgDetailApiOut` 尚未声明 `grade`。前端已经支持实际响应字段；若后端详情接口仍不返回该字段，详情和编辑页只能显示兼容默认值 `0`，后端应补齐详情出参与文档。

## 回滚或恢复

移除共享图库表单中的图片权重控件，并从 `defaultForm`、校验规则、详情归一化和提交负载中移除 `grade`；同时回退对应 Active 文档与索引即可恢复原行为。
