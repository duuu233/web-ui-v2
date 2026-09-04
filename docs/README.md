# 项目文档导航

> 文档类型：文档治理入口
> 状态：Active
> 最后核验：2026-09-04
> 事实来源：当前源码、CodeGraph、项目配置与下列 Active 文档

本文件是 `docs/` 的统一入口。根目录只保留执行规则 `AGENTS.md` 和当前 AI 快照 `AI_CONTEXT.md`；其他项目知识、流程和历史记录统一放在这里。

## 推荐阅读顺序

1. 根目录 `AGENTS.md`
2. 根目录 `AI_CONTEXT.md`
3. 本文件
4. 与任务相关的 Active 文档
5. CodeGraph 中的当前源码和调用链
6. 仅在需要理解原因时读取 Historical 记录

## 当前文档

| 文档 | 状态 | 职责 |
| --- | --- | --- |
| [`project-structure.md`](project-structure.md) | Active | 当前目录、分层和模块组织。 |
| [`interface-list.md`](interface-list.md) | Active | 已核对的管理后台接口清单与来源。 |
| [`dynamic-menu-sync.md`](dynamic-menu-sync.md) | Active | 后端动态菜单同步、验证和回滚流程。 |
| [`api-integration-progress.md`](api-integration-progress.md) | Tracking | 当前接口接入进度与未完成项。 |
| [`history/README.md`](history/README.md) | Active | 本地操作更新记录规则、模板与历史索引。 |

## CodeGraph 与文档的边界

- 查当前文件、符号、依赖、调用者、被调用者和修改影响时，以源码与 CodeGraph 为准。
- 查产品口径、接口约定、人工流程、部署方式和架构不变量时，以最新 Active 文档为准。
- 查某次修改为什么发生时，读取对应 Historical 记录。
- Historical 文档或被标为 Superseded 的内容不能作为当前实现依据。

常用命令：

```bash
codegraph status .
codegraph explore "要理解的问题、文件或符号"
codegraph sync .
```

拉取代码后运行 `codegraph sync .`。完成结构性源码修改后再次同步并运行 `codegraph status .`。只有索引缺失、损坏或工具明确建议时才重新执行完整索引。

## 文档状态

- `Active`：描述当前有效事实，正文直接更新，不追加流水账。
- `Tracking`：持续维护的进度或核对清单，必须写清核验日期。
- `Historical`：一次任务结束后冻结，只用于追溯。
- `Superseded`：已被新文档替代，开头必须链接当前权威文档。

每份 Active 或 Tracking 文档应在标题下声明文档类型、状态、最后核验日期和事实来源。架构、接口、命令、权限或流程变化时，要同时更新负责该事实的文档。

## 历史记录规则

历史记录使用 `history/YYYY-MM/YYYY-MM-DD-topic.md`。一项集中修改对应一份记录，不建立无限增长的单文件流水账。记录完成后保持冻结；若产生长期有效的结论，还要同步更新 AI_CONTEXT 或对应 Active 文档。

最新记录：[`history/2026-09/2026-09-04-official-gallery-grade.md`](history/2026-09/2026-09-04-official-gallery-grade.md)（官网图库新增、编辑和详情共用表单增加整数权重 `grade`）。

文档中不得出现 Token、签名、密码、Cookie、完整环境变量、个人数据或本机缓存内容。

## 冲突处理

发现文档与源码不一致时：

1. 用 CodeGraph 和源码确认当前行为。
2. 查配置、接口文档或实际只读响应确认外部契约。
3. 修正负责该事实的 Active 文档。
4. 若修正属于实质性变更，新增一份 Historical 记录说明范围和验证。
5. 更新本索引中的状态、职责或替代关系。
