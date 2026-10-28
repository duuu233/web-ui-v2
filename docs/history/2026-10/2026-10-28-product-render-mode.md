# 产品渲染模式字段

> 文档类型：Historical Change Record
> 日期：2026-10-28
> 环境：SSH
> 分支与起始版本：main / d2b0b78
> 范围：相框产品新增、编辑、详情共享表单
> 当前权威文档：[接口清单](../../interface-list.md)

## 背景与目标

按产品口径，产品新增/编辑/详情增加必填下拉框“渲染模式”，字段 `renderMode`，两个值 `esp32`、`fpga16`，选中后原值提交；放在“版本类型”下方，蓝牙版隐藏、wifi版显示。用户端从产品配置取该字段，原样传给设备播放接口。工作区干净，显式 `pull --ff-only origin main` 快进到 d2b0b78 后修改。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/sms/productList/template/DetailForm.vue` | 默认表单加 `renderMode`；详情回填缺省为空串；版本类型下方新增下拉，仅 `versionType=2` 时渲染并必选；详情只读显示原值；提交时非 wifi 版删除该字段。 |
| `docs/interface-list.md`、`docs/api-integration-progress.md`、`AI_CONTEXT.md`、`docs/README.md`、`docs/history/README.md` | 同步字段契约与索引。 |

## 关键决策

- 用 `v-if` 控制表单项：隐藏时字段从 el-form 校验中移除，蓝牙版不会被必填拦住。
- 蓝牙版不提交 `renderMode`（含从 wifi 改成蓝牙的编辑场景，回填的旧值也删掉）；后端是否因此保留旧值未实测，对蓝牙版无影响。
- 选项标签即提交值，不另做中文名；旧 wifi 产品缺值时编辑须先选择。
- 列表不新增列（需求只涉及新增/编辑/详情）。

## 外部操作

仅只读获取公开 Swagger，核实 `ProductAddApiIn`、`ProductDetailApiOut`、`ProductApiOut` 及用户端 `ClientProductApiOut`、`ClientUserProductDetailApiOut` 含 `renderMode`（string，“渲染模式：esp32,fpga16”）。未调用任何写接口，未部署。

## 验证结果

- 本机无 Node.js 与 CodeGraph，`npm run build`、`node --test`、`codegraph sync` 均未运行；未做浏览器验收。
- `git diff --check` 通过。

## 未完成项与风险

- 需在有 Node 的环境执行 `npm run build` 并在浏览器验证：切换版本类型时显示/隐藏、wifi 版必选拦截、编辑回填、详情只读、蓝牙版提交负载不含 `renderMode`。

## 回滚或恢复

回退本次提交并重新构建即可，无菜单、权限或数据迁移。
