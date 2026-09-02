# 本地操作更新记录

> 文档类型：历史记录规范与索引
> 状态：Active
> 最后核验：2026-09-02
> 事实来源：`AGENTS.md` 与项目文档治理约定

本目录保存已经发生的集中修改、外部操作和跨环境交接。它补充 Git 提交，记录提交本身难以表达的背景、验证和未完成项，但不替代源码、提交历史或 Active 文档。

## 目录约定

```text
docs/history/
├── README.md
└── YYYY-MM/
    └── YYYY-MM-DD-topic.md
```

文件名使用日期和简短主题。每项任务使用一份文档，完成后冻结；后续新变化另建记录。

## 记录模板

```markdown
# 主题

> 文档类型：Historical Change Record
> 日期：YYYY-MM-DD
> 环境：办公室 / 家庭 / SSH / 其他
> 分支与起始版本：branch / short-sha
> 范围：涉及的模块或仓库
> 当前权威文档：相关 Active 文档链接

## 背景与目标

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |

## 关键决策

## 外部操作

写明菜单同步、部署、数据迁移等实际动作；没有则写“无”。不得包含凭证。

## 验证结果

只写实际运行的命令和结果；未运行的验证明确标为未运行。

## 未完成项与风险

## 回滚或恢复
```

跨项目同步记录还应写明上游来源、新契约、已同步内容、有意保留的差异以及未同步事项。

## 索引

- [`2026-08/2026-08-12-ai-context-codegraph-maintenance.md`](2026-08/2026-08-12-ai-context-codegraph-maintenance.md)：建立项目专属 AI 上下文、文档入口与 CodeGraph/历史记录维护规则。
- [`2026-08/2026-08-12-official-gallery-upload-thumbnail.md`](2026-08/2026-08-12-official-gallery-upload-thumbnail.md)：官方图库新增/编辑原图上传请求生成缩略图并提交返回地址。
- [`2026-08/2026-08-13-user-account-statistics.md`](2026-08/2026-08-13-user-account-statistics.md)：首页新增绑定设备与订单金额统计，用户列表接入星币账户编辑、账户日志及对应后台权限。
- [`2026-08/2026-08-28-home-reports-config-forms.md`](2026-08/2026-08-28-home-reports-config-forms.md)：首页接入 ECharts 注册柱状图并预留订单收益报表，同时调整图库设备必填和系统配置字段。
- [`2026-08/2026-08-30-commerce-language-order-statistics.md`](2026-08/2026-08-30-commerce-language-order-statistics.md)：接入首页订单统计，并为商品、AI 配置、公共图库和图库分类补齐内容语种。
- [`2026-08/2026-08-31-list-language-filters.md`](2026-08/2026-08-31-list-language-filters.md)：统一所有列表页的前端固定语种筛选项，并明确 `language=0` 是有效筛选值。
- [`2026-09/2026-09-01-commerce-multilingual-fields.md`](2026-09/2026-09-01-commerce-multilingual-fields.md)：商品、公共图库图片和图库分类移除 `language` 并改为单条记录同时维护四语种字段。
- [`2026-09/2026-09-01-global-request-loading.md`](2026-09/2026-09-01-global-request-loading.md)：统一请求层为全站接口等待提供带文案的并发安全 Loading。
- [`2026-09/2026-09-02-order-currency-goods-form-layout.md`](2026-09/2026-09-02-order-currency-goods-form-layout.md)：订单金额按语种前置币种符号，商品表单改为一行一组语种名称与金额并补充币种文字。
