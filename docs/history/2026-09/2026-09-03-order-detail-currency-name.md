# 订单详情展示币种名称

> 文档类型：Historical Change Record
> 日期：2026-09-03
> 环境：Windows 本地工作区（具体设备未声明）
> 分支与起始版本：main / 7fd5097
> 范围：订单详情与管理后台接口契约文档
> 当前权威文档：[`../../interface-list.md`](../../interface-list.md)、[`../../api-integration-progress.md`](../../api-integration-progress.md)

## 背景与目标

项目负责人确认 `GET /ZoneAdmin/Order/getOrderDetail` 响应新增 `currencyName`，表示用于界面展示的币种名称。订单详情需要消费该字段，同时兼容尚未返回新字段的旧响应。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/views/commerce/order/components/OrderDetailPanel.vue` | 订单金额卡片优先展示响应中的 `currencyName`；字段缺失或为空时，继续按订单 `language` 推导币种名称。 |
| `AI_CONTEXT.md` | 更新订单模块当前契约摘要。 |
| `docs/interface-list.md` | 记录 `currencyName` 响应字段及兼容回退规则。 |
| `docs/api-integration-progress.md` | 更新订单接口接入状态。 |
| `docs/README.md`、`docs/history/README.md` | 登记本次历史记录。 |

## 关键决策

- 复用现有订单详情接口响应对象，不在 API wrapper 或详情 composable 中复制字段。
- 后端非空 `currencyName` 是详情展示的首选事实；仅在旧响应缺失或返回空白字符串时使用现有语种映射。
- `currencySymbol` 的金额前缀规则保持不变，本次不影响订单列表。

## 外部操作

无。未调用线上接口、未同步菜单、未部署。

## 验证结果

- `npm run build`：通过；Vite 构建退出码为 0，仅报告依赖 `@vueuse/core` 中 `/* #__PURE__ */` 注释位置的既有 Rollup 警告。
- `git diff --check`：通过；无空白错误，仅有工作区 LF 将转换为 CRLF 的提示。
- `codegraph sync .`：完成，索引同步 2 个变更文件。
- `codegraph status .`：通过，索引状态为最新。
- 浏览器人工验证：未运行；本地未配置本次后端样例响应。

## 未完成项与风险

- 尚未使用真实订单详情响应核对 `currencyName` 的具体文案；页面对缺失或空白值已有兼容回退。
- 已有用户改动 `dist.zip` 未触碰，不属于本次变更。

## 回滚或恢复

回退 `OrderDetailPanel.vue` 中的 `currencyName` 计算和金额卡片提示，并同步撤销本次 Active 文档更新；不涉及后端数据或外部状态恢复。
