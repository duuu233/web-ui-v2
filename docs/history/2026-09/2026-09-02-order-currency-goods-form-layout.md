# 订单金额币种符号与商品表单布局调整

> 文档类型：Historical Change Record
> 日期：2026-09-02
> 环境：其他（Linux 开发机 SSH 工作区）
> 分支与起始版本：main / c1aef21
> 范围：`web-ui-v2` 订单列表与详情、商品新增/编辑/详情表单、商业模块共享工具与接口清单
> 当前权威文档：[`AI_CONTEXT.md`](../../../AI_CONTEXT.md)、[`../../interface-list.md`](../../interface-list.md)

## 背景与目标

项目负责人提出两项展示优化：

1. 管理后台订单详情和订单列表中涉及币种的金额，要在金额前面加上币种符号。
2. 商品新增、编辑和详情页的表单改为按语种分行，一行是一组“该语种商品名称 + 该语种金额”，并在商品金额后补充币种文字（简中人民币、繁中美元、英语美元、日语日元）；同时去掉“单次购买预计发放 N Token”的内容。

商品四语种字段在 2026-09-01 已经落地，本次只调整展示与布局，不改动任何请求参数或接口契约。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/commerce/utils.js` | 新增语种到币种的单一映射 `getCurrency`、`getCurrencyLabel`、`getCurrencySymbol` 与 `formatCurrencyAmount`；`formatCurrencyAmount` 优先使用接口返回的 `currencySymbol`，缺失时按 `language` 回落。 |
| `src/views/commerce/order/components/OrderTable.vue` | 金额列改用 `formatCurrencyAmount` 前置币种符号，列宽由 100 调整为 120，并用 `title` 提示币种名称。 |
| `src/views/commerce/order/components/OrderDetailPanel.vue` | 订单金额指标卡与商品快照金额统一前置币种符号，指标卡说明补充币种名称。 |
| `src/views/commerce/goods/components/GoodsForm.vue` | 表单由四列栅格改为按组分行：每个语种的名称与金额同占一行，其余字段各占一行；金额输入框后新增币种文字；删除注释状态的“单次购买预计发放”区块及其 `totalTokenCount`、`formatAmount` 依赖和 `token-summary` 样式。 |
| `AI_CONTEXT.md`、`docs/interface-list.md` | 记录币种展示口径、商品表单布局与映射集中位置。 |
| `docs/README.md`、`docs/history/README.md` | 登记本次历史记录。 |

## 关键决策

- 语种与币种的对应关系只写在 `src/views/commerce/utils.js` 一处：`0/1=美元`、`2=人民币`、`3=美元`、`4=日元`，页面不再各自维护映射。
- 人民币与日元的符号同为 `¥`，订单列表没有语种列，直接同符号会让两种金额无法区分，因此日元使用 `JP¥`，人民币保留 `¥`，美元使用 `$`。
- 订单缺少或无法识别 `language` 时回落到人民币，理由是基础 `amount` 字段承载的就是简中价格；若后端在订单响应中返回非空 `currencySymbol`，则后端值优先。
- 商品表单的币种文字取自同一份映射，不写死在模板里，避免与订单展示口径漂移。
- 本次没有新增、删除或修改任何请求参数，商品提交负载与订单查询条件保持不变。
- 发现 `src/router/routes.js` 等处存在大小写不一致的导入（详见未完成项），属于既有问题，未在本次任务范围内改动。

## 外部操作

无。未调用业务写接口、未同步后台菜单、未部署。为在本机执行构建执行了 `npm install --no-package-lock`（不生成也不改写任何锁文件），`node_modules/` 与 `dist/` 均在 `.gitignore` 中。

## 验证结果

- `node --check src/views/commerce/utils.js` 通过。
- 三个改动 SFC 的 `<script setup>` 块单独通过 `node --check`，模板标签配对检查通过。
- `npm run build` 通过：Vite 转换 3044 个模块并生成生产构建（44.45s），仅保留既有的大 chunk 警告。
- 首次构建在 Linux 上因既有的导入大小写不一致失败（`productBasic.vue`、`shopData.vue`、`FileUpload.vue`、`MultiUpload.vue`）。为完成构建验证临时建立了四个同名软链接，构建结束后立即删除；`git status --short` 确认工作区只剩本次预期的 6 个文件修改。
- 未执行带登录态的真实接口请求，也未做浏览器人工回归；当前环境没有管理后台凭证。

## 未完成项与风险

- 订单列表和详情的币种符号依赖订单响应中的 `language`。若目标环境的 `/Order/getOrderList`、`/Order/getOrderDetail` 不返回该字段，所有金额会按回落规则显示为人民币，需要在有权限的环境确认一次真实响应。
- `src/router/routes.js` 导入 `@/views/log/handle/productBasic.vue` 与 `@/views/log/handle/shopData.vue`，`src/views/sms/productVersion/*` 导入 `@/components/Upload/FileUpload.vue` 与 `@/components/Upload/MultiUpload.vue`，磁盘上的实际文件名分别是 `productbasic.vue`、`shopdata.vue`、`fileUpload.vue`、`multiUpload.vue`。Windows 大小写不敏感所以构建正常，Linux 或大小写敏感的构建机上会直接失败。这是既有问题，本次未修改，建议单独处理（统一文件名或导入路径大小写）。
- 商品列表 `GoodsTable.vue` 的四语种金额仍只显示数字，本次按需求范围未加币种符号。

## 回滚或恢复

回滚本记录列出的四个源码文件即可恢复原来的金额展示与四列表单布局；`src/views/commerce/utils.js` 新增的币种函数没有其他调用者，可一并移除。不涉及数据库、菜单、权限或外部系统回滚。
