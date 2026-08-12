# 本地操作更新记录

> 文档类型：历史记录规范与索引
> 状态：Active
> 最后核验：2026-08-12
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
