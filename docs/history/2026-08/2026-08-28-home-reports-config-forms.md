# 首页经营报表与配置表单调整

> 文档类型：Historical Change Record
> 日期：2026-08-28
> 环境：本地 Windows 工作区（办公室/家庭环境未确认）
> 分支与起始版本：main / e1edab3
> 范围：首页、公共图库、基础配置、前端依赖与项目文档
> 当前权威文档：[`AI_CONTEXT.md`](../../../AI_CONTEXT.md)、[`interface-list.md`](../../interface-list.md)、[`api-integration-progress.md`](../../api-integration-progress.md)、[`project-structure.md`](../../project-structure.md)

## 背景与目标

首页需要增加订单收益报表并将注册统计改为 ECharts 柱状图；公共图库新增/编辑的适用设备选择改为非必填；基础配置的系统配置不再展示平台设备 ID。订单收益尚无后端接口，本次只建立诚实空态和清晰的数据接入边界。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `package.json`、`pnpm-lock.yaml`、`yarn.lock` | 增加 `echarts@^6.1.0`，两份锁文件仅增加 ECharts 及其直接依赖记录。 |
| `src/views/home/index.vue` | 保留首页取数与编排；增加订单收益三档周期状态，并组合两张独立报表卡片。 |
| `src/views/home/components/AnalyticsChartCard.vue` | 提供报表标题、状态、周期切换、加载和空态的统一展示。 |
| `src/views/home/components/EChartCanvas.vue` | 按需注册柱状图、折线图及必要组件，集中处理实例、更新、缩放和销毁。 |
| `src/views/home/chartOptions.js` | 将注册用户与订单收益视图模型映射为 ECharts 配置。 |
| `src/views/commerce/productImage/**` | 移除 `productIdList` 必填校验并把表单文案改为可选；其他必填校验保持不变。 |
| `src/views/ums/config/index.vue` | 从展示列表和保存负载中排除平台设备 ID 配置项。 |
| Active 文档 | 更新首页报表、公共图库、系统配置、依赖与待接入接口的当前事实。 |

## 关键决策

- 订单收益接口路径、参数、金额单位和响应结构未确认，因此不新增猜测性的 API 包装，也不展示模拟财务数据。
- 订单收益前端预留 `{ queryDate, orderAmount }[]` 视图模型；后端契约确定后只需接入取数和字段归一化。
- 注册统计继续复用 `GET /Common/getStatisticsUser` 与既有 `queryType=0/1/2`，只替换展示层。
- 系统配置通过配置名称识别平台设备 ID，并同时从 UI 与 `setConfigDataEdit` 负载排除，避免隐藏字段仍被回传。
- 首页路由页保持编排职责；图表生命周期、报表外壳和 option 映射分别放在独立文件中。

## 外部操作

- 从 npm registry 安装 Apache ECharts 6.1.0。发现本机默认 pnpm 8 与仓库 v9 锁文件不兼容后，仅还原该次机械锁文件改写，并使用 pnpm 10.17.1 重新生成最小差异；同时补齐仓库保留的 Yarn v1 锁文件，避免跨环境安装契约不一致。
- 启动仅监听 `127.0.0.1:4173` 的本地预览并完成 HTTP 可达性检查，随后停止服务。
- 未调用后台写接口，未执行菜单同步、部署或数据迁移。

## 验证结果

- `node --check src/views/home/chartOptions.js`：通过。
- `node --check src/views/commerce/productImage/useProductImageForm.js`：通过。
- `git diff --check`：通过。
- `npm run build`：通过；Vite 5.4.21 共转换 3033 个模块，保留依赖中的 PURE 注释位置提示和既有大分块提示。
- `curl.exe -I http://127.0.0.1:4173/`：返回 `HTTP/1.1 200 OK`。
- 浏览器截图级检查：未运行；当前会话未发现可用的内置或扩展浏览器实例。
- `codegraph sync .`：通过；`codegraph status .` 显示索引最新（164 个文件、1795 个节点、4891 条边）。同步后的调用检查确认首页仅通过两个报表组件消费图表配置，图库表单与系统配置变更均无额外调用扩散。

## 未完成项与风险

- 订单收益后端接口仍需确认路径、权限码、查询参数、金额单位、退款/负值口径和响应结构。
- 未在真实登录态下人工切换三个周期或保存图库/系统配置；上线前需要结合实际接口数据回归。
- 若后台将平台设备 ID 的 `configContent/configKey` 改为未覆盖的新名称，需要同步更新前端识别规则。

## 回滚或恢复

源码和依赖变更均可通过回退对应 Git 提交恢复；本次没有外部数据写入、菜单变更或不可逆操作。订单收益接入时应保留当前空态作为接口无数据或不可用时的降级展示。
