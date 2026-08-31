# 列表语种筛选统一

> 文档类型：Historical Change Record
> 日期：2026-08-31
> 环境：其他（Windows 本地开发环境）
> 分支与起始版本：main / a8a3475
> 范围：用户列表、账户操作日志、常见问题列表、商业模块列表筛选与接口契约文档
> 当前权威文档：[接口清单](../../interface-list.md)

## 背景与目标

列表接口的 `language` 筛选值统一为前端固定选项：`0=英语`、`1=英语`、`2=简中`、`3=繁中`、`4=日文`。任务开始时，不同模块仍分别存在旧的欧洲语种选项、缺少 `0=英语` 以及默认英语文案不一致的问题。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/commerce/utils.js` | 更新商业模块共享语种选项，覆盖商品、订单、公共图库、图库分类和 AI 配置列表筛选。 |
| `src/views/sms/userList/index.vue` | 更新用户列表的固定语种选项。 |
| `src/views/sms/userList/accountLogs.vue` | 更新账户操作日志列表的固定语种选项。 |
| `src/views/sms/productFaqList/index.vue` | 为常见问题列表补充 `0=英语`，并保持其余四项与契约一致。 |
| `docs/interface-list.md` | 记录所有列表 `language` 筛选的统一枚举及 `0` 值约束。 |
| `docs/README.md`、`docs/history/README.md` | 登记本次历史记录。 |

## 关键决策

- 沿用现有组件边界与前端常量组织方式，不引入后端字典请求或新的共享状态。
- 两个英语编码 `0` 和 `1` 都按契约显示为“英语”，不擅自添加“默认”等区分文案。
- 现有 `cleanQuery` 仅清除 `null`、`undefined` 和空字符串，会保留数值 `0`，因此无需修改公共请求逻辑。
- 本任务只统一已有列表筛选条件，不改变新增、编辑或详情表单中的语种业务规则。

## 外部操作

无。

## 验证结果

- `rg` 核对四份列表语种常量均为 `0/1=英语`、`2=简中`、`3=繁中`、`4=日文`，并确认列表源码不再出现德语、西班牙语、法语、意大利语、葡萄牙语或“英语（默认）”旧文案。
- `git diff --check` 未发现空白错误；Git 仅提示部分工作区文件后续会按本机配置从 LF 转为 CRLF。
- `npm run build` 通过；Vite 完成 3033 个模块转换。构建保留现有第三方 PURE 注释和大 chunk 警告，无新增编译错误。
- `codegraph sync .` 完成，随后 `codegraph status .` 显示索引为最新状态。

## 未完成项与风险

- 未调用线上接口或执行浏览器人工筛选；后端是否分别返回 `language=0` 与 `language=1` 的英语数据，仍以目标环境实际响应为准。
- 任务开始时工作区已有 `dist.zip`、`docs/api-integration-progress.md`、`src/router/routes.js` 和 `src/views/sms/productVersion/*` 的未提交修改，本次未改动这些既有变更。

## 回滚或恢复

回滚本记录列出的四份前端语种常量和接口清单变更即可恢复原筛选选项；无需数据库、菜单或服务端回滚。
