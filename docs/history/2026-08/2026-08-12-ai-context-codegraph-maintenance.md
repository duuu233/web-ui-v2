# 建立 AI 上下文与 CodeGraph 长期维护机制

> 文档类型：Historical Change Record
> 日期：2026-08-12
> 环境：本地工作区
> 分支与起始版本：`main` / `b08c01b`
> 范围：文档治理、AI 上下文、CodeGraph 工作流
> 当前权威文档：[`AI_CONTEXT.md`](../../../AI_CONTEXT.md)、[`docs/README.md`](../../README.md)、[`AGENTS.md`](../../../AGENTS.md)

## 背景与目标

原 `AI_CONTEXT.md` 是其他项目的微信小程序上下文，包含 BLE、OTA 等与本仓库无关的事实；`docs/` 也缺少统一入口和可持续的操作更新记录。目标是以当前源码、CodeGraph 和现有项目文档为依据，重建本项目的长期维护入口，并把同类规则同步给兄弟项目但保留各自差异。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `AI_CONTEXT.md` | 改为 BoltFox PC 管理后台的当前事实、架构、风险和跨项目边界。 |
| `AGENTS.md` | 增加阅读顺序、知识来源、CodeGraph 同步、历史记录和跨环境交接规则。 |
| `docs/README.md` | 建立统一文档索引、状态和冲突处理流程。 |
| `docs/history/` | 建立按月归档的一次性操作更新记录与模板。 |
| 现有 Active/Tracking 文档 | 补充状态、核验日期和事实来源元信息。 |

## 关键决策

- CodeGraph 用于当前源码结构、依赖和影响分析；Markdown 用于契约、流程、决策与历史。
- 不使用无限增长的单文件日志；每次集中修改建立一份冻结记录。
- 三个兄弟项目共享维护方法，但项目定位、命令、模块、接口和风险必须基于各自源码填写。

## 外部操作

本次没有调用后台写接口、部署或迁移数据。历史记录不保存此前提供的登录凭证、签名或 Token。

## 验证结果

- 修改前运行 CodeGraph 探索，确认登录、动态菜单、本地路由和 `v-permission` 的调用关系。
- `codegraph sync .`：Already up to date。
- `codegraph status .`：159 files、1,712 nodes、4,690 edges，索引为最新。
- 新增治理文档的相对链接检查通过；未发现粘贴凭证或行尾空白。
- `git diff --check`：通过；任务开始前已有的 `dist.zip` 删除保持不变。
- 本次仅修改 Markdown，不需要运行应用构建。

## 未完成项与风险

- 仓库缺少自动化测试、lint 和类型检查脚本。
- `yarn.lock` 与 `pnpm-lock.yaml` 并存，主包管理器仍待项目维护者确认。

## 回滚或恢复

这些变更仅涉及文档，可按文件回退；不得回退或覆盖工作区中与本任务无关的用户改动。
