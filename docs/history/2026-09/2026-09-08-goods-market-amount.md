# 商品表单新增四语种划线价（原价）

> 文档类型：Historical Change Record
> 日期：2026-09-08
> 环境：SSH 开发机
> 分支与起始版本：main / 58813ff（本轮提交 e949ce3）
> 当前权威文档：[AI_CONTEXT.md](../../../AI_CONTEXT.md)

## 背景与变更

商品详情 / 新增 / 编辑共用的表单为每个语种增加一个划线价（原价）输入，字段与售价一一对应：

| 语种 | 售价字段 | 原价字段 |
| --- | --- | --- |
| 简中 | `amount` | `marketAmount` |
| 英文 | `amountEnglish` | `marketAmountEnglish` |
| 繁中 | `amountFan` | `marketAmountFan` |
| 日文 | `amountJapanese` | `marketAmountJapanese` |

处理口径：

- **允许为空**，用于兼容没有原价的旧商品；空值提交 `null`，不写 0 冒充「没有原价」。
- `0` 是合法金额，校验与提交都不能用真假值判断（`optionalAmount` 只对 `null` / `undefined` / `''` 返回 null）。
- 取值范围 0 ~ 99999999，精度两位小数，由 `marketAmountRules` 校验；**不强制原价大于售价**，是否高于售价由运营自己把关。
- 详情页沿用只读模式，四个原价输入随 `isReadOnly` 一起禁用。

版式上每个语种由「名称 + 售价」两列改为「名称 + 售价 + 原价」三列（`.form-row--pair` → `.form-row--localized`），容器最大宽度 840px → 1080px，窄屏断点由 680px 提到 1000px 后单列堆叠。

客户端只展示原价、不参与支付：小程序与 APP 的接入见各自项目的变更记录。

## 同步与验证

修改前在当前 main 分支执行 `git pull --ff-only`，未切分支。本机（SSH 开发机）无 CodeGraph 索引，未执行索引同步。

- `node scripts/check-goods-market-amount.mjs`：通过（新增/编辑负载、详情回填、只读模式、旧商品空值、零值、精度与数值校验）。该脚本用实际 composable 源码配合模拟 API / Router，不写后端。
- `npm run build`：通过，3044 个模块，44.85s。⚠️ 见下一节，在区分大小写的文件系统上需要先绕过四处引用名不符才能跑到这一步。
- 未做登录后台的人工页面验收；四语种原价的实际回填与提交未在真实后端上验证。

## ⚠️ 已发现但本轮未修：四处 import 大小写与文件名不符

在区分大小写的文件系统（Linux、本项目的 SSH 开发机，以及任何 Linux CI）上，`npm run build` 会在这四处直接 `ENOENT` 中断：

| 引用写法 | 仓库中的实际文件名 | 引用方 |
| --- | --- | --- |
| `@/components/Upload/FileUpload.vue` | `fileUpload.vue` | `src/views/sms/productVersion/detail.vue` |
| `@/components/Upload/MultiUpload.vue` | `multiUpload.vue` | `src/views/sms/productList/template/DetailForm.vue` |
| `@/views/log/handle/productBasic.vue` | `productbasic.vue` | `src/router/routes.js` |
| `@/views/log/handle/shopData.vue` | `shopdata.vue` | `src/router/routes.js` |

Windows / macOS 的文件系统不区分大小写，所以在公司电脑上从来不报错。与本轮改动无关，属既有问题。本轮为了验证构建，临时建了四个软链跑完 `npm run build` 后立即删除，**仓库文件未改动**。

修法二选一，需要用户决定：把四处 import 改成实际文件名（改 3 个文件、4 行，最小），或把文件 `git mv` 成驼峰名（要注意 Git 在不区分大小写的机器上做纯大小写重命名的坑）。

## 外部操作与回滚

本轮无部署、无接口写操作。需要恢复本轮前状态时 revert e949ce3。
