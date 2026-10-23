# 产品尺寸型号字段

> 文档类型：Historical Change Record
> 日期：2026-10-23
> 环境：SSH
> 分支与起始版本：main / 7ea5e56
> 范围：相框产品新增、编辑、详情共享表单
> 当前权威文档：[接口清单](../../interface-list.md)

## 背景与目标

按产品口径，产品新增/编辑/详情增加“尺寸型号”输入框，字段 `sizeModel`（如“3.6寸”）。用户端设备列表、详情接口同样下发该字段，小程序与 App 直接展示，不再由端上按屏型或宽高推断。工作区干净，显式 `pull --ff-only origin main` 已是最新后修改。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/sms/productList/template/DetailForm.vue` | 默认表单加 `sizeModel`；详情回填缺省为空串；在“尺寸(cm)”与“广播ID”之间新增选填输入框，详情只读；提交时去首尾空白并始终提交（含空串）。 |
| `docs/interface-list.md`、`docs/api-integration-progress.md`、`AI_CONTEXT.md`、`docs/README.md` | 同步字段契约与索引。 |

## 关键决策

- 选填：没有值时用户端不展示，不设默认值、不做格式校验，原样保存运营填写的文本。
- 共享 `buildSubmitData` 会删掉空串字段；`sizeModel` 例外，始终提交，否则编辑时清空不会生效。后端对空串的处理未实测。
- 列表不新增列（需求只涉及新增/编辑/详情）。

## 外部操作

仅只读获取公开 Swagger，核实 `ProductAddApiIn`、`ProductDetailApiOut`、`ProductApiOut` 含 `sizeModel`（string）。未调用任何写接口，未部署。

## 验证结果

- 本机无 Node.js 与 CodeGraph，`npm run build`、`node --test`、`codegraph sync` 均未运行；未做浏览器验收。
- `git diff --check` 通过。

## 未完成项与风险

- 需在有 Node 的环境执行 `npm run build` 并在浏览器验证新增、编辑（含清空）、详情回填。
- 清空后提交空串，后端是否按空串覆盖待联调确认。

## 回滚或恢复

回退本次提交并重新构建即可，无菜单、权限或数据迁移。
