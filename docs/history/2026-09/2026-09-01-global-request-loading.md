# 全局接口等待 Loading

> 文档类型：Historical Change Record
> 日期：2026-09-01
> 环境：本地 Windows 工作区
> 分支与起始版本：main / 10f7a60
> 范围：统一 Axios 请求层与全站接口等待反馈
> 当前权威文档：[`../../project-structure.md`](../../project-structure.md)、[`../../../AI_CONTEXT.md`](../../../AI_CONTEXT.md)

## 背景与目标

为了区分“接口响应慢”与“接口返回后前端渲染卡顿”，所有页面需要在等待管理后台接口时提供统一且可识别的 Loading 文案。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `src/utils/request.js` | 引入 Element Plus 全屏 Loading，集中处理延迟展示、并发计数、成功/失败回收和单请求关闭选项。 |
| `AI_CONTEXT.md`、`docs/project-structure.md` | 记录全局 Loading 的当前行为和页面使用约束。 |
| `docs/README.md`、`docs/history/README.md` | 登记本次历史记录。 |

## 关键决策

- 在统一 Axios 请求层实现，自动覆盖现有约 145 个 API 调用，避免每个页面重复维护请求遮罩。
- 延迟 200ms 再显示，避免快速请求引起闪屏；显示文案固定为“等待接口 Loading 中……”。
- 使用并发计数，多个接口同时请求时必须等全部完成才关闭。
- 默认开启；明确属于非阻塞后台刷新的请求可传 `showLoading: false`。
- 页面现有表格、表单局部 `v-loading` 保留，它们表达组件范围；全屏 Loading 只由请求层管理。

## 外部操作

无。未调用外部接口、未部署、未修改后台数据。

## 验证结果

- `node --check src/utils/request.js` 通过。
- `npm run build` 于 2026-09-01 通过。
- `git diff --check` 通过，仅输出工作区 LF/CRLF 转换警告。
- `codegraph sync .` 与 `codegraph status .` 完成，索引为最新状态。

## 未完成项与风险

- 尚未连接真实慢接口进行浏览器人工计时验证；目标环境可通过慢接口或网络限速确认 200ms 后展示、所有并发请求结束后关闭。
- Loading 只能表明 Axios 请求仍未结束；如果浏览器主线程本身被长任务阻塞，遮罩也可能延迟绘制，仍需结合浏览器 Performance/Network 面板判断。

## 回滚或恢复

回滚 `src/utils/request.js` 中的全局 Loading 计数与拦截器调用，并同步恢复 Active 文档即可；不涉及外部系统回滚。
