# AI 项目上下文

> 文档类型：当前项目上下文
> 状态：Active
> 最后核验：2026-09-03
> 适用范围：`web-ui-v2` 当前工作树
> 事实来源：源码与 CodeGraph、`package.json`、环境配置、`docs/` 中的 Active 文档

## 1. 项目定位

`web-ui-v2` 是 BoltFox 业务的 PC 管理后台前端，负责登录、后台导航、权限控制以及商品、公共图库、订单、AI 配置和系统管理等页面。后端接口统一由 `/ZoneAdmin` 前缀提供；本仓库不包含后端实现。

Git 是办公室电脑、家庭电脑和远程 SSH 环境之间唯一共享的事实来源。本机的 `.codegraph/`、依赖目录、构建产物和未提交工作区都不属于跨机器共享状态。

## 2. 技术栈与常用命令

- Vue 3.5，业务组件以 `<script setup>` 为主。
- Vite 5，Vue Router 4（Hash 模式），Pinia。
- Element Plus、vxe-table、Apache ECharts 6、SCSS、WangEditor。
- Axios 请求层；Cookie 保存登录态；接口响应约定为 `{ retCode, retMsg, retData }`。
- 统一请求层对超过 200ms 的接口等待显示 Element Plus 全屏 Loading，文案为“等待接口 Loading 中……”，并发请求全部结束后才关闭；单个请求可用 `showLoading: false` 关闭。
- Node.js `>=18`。

```bash
npm run dev
npm run build
npm run preview
npm run menu:sync:commerce -- --help
npm run menu:sync:user-account -- --help
```

仓库没有独立的 `test`、`lint` 或 `type-check` 脚本。修改后的最低验证是运行与改动相关的静态检查，并执行 `npm run build`；菜单同步脚本先预览，确认后才允许带 `--apply`。

## 3. 运行环境

- `VITE_APP_API_PREFIX`：接口路径前缀，缺省通常为 `/ZoneAdmin`。
- `VITE_APP_API_ORIGIN`：生产环境接口源站。
- `VITE_APP_PROXY_TARGET`：开发代理目标，未设置时可回退到接口源站。
- `VITE_APP_BASE_PAY`：支付请求使用的独立地址。

只在本地环境文件或受控密钥系统中保存真实值。文档、源码、历史记录和提交信息中不得记录 Token、签名、密码、Cookie 或完整 `.env` 内容。

## 4. 架构概览

```text
src/views 与 src/components
        ↓
src/api/*.js
        ↓
src/utils/request.js
        ↓
VITE_APP_API_PREFIX（通常为 /ZoneAdmin）
        ↓
管理后台接口
```

登录和权限链：

```text
/login
  → src/store/modules/user.js 调用 /Passport/adminLogin
  → /Jurisdiction/getSysMenus 生成顶部系统导航
  → /Jurisdiction/getLeftMenus 生成左侧菜单
  → src/router/routes.js 中的本地静态路由加载页面
  → /Jurisdiction/getChildAppCodes 提供按钮权限码
  → v-permission 控制操作入口
```

后端菜单只决定导航和授权，本地 `src/router/routes.js` 才决定实际组件映射。后端 `menuUrl`、路由 `name` 和页面组件 `name` 必须保持一致，否则会出现菜单无法跳转、缓存失效或标签页异常。

## 5. 关键目录

| 路径 | 职责 |
| --- | --- |
| `src/api/` | 按业务域封装管理后台接口；URL 通常不重复写 `/ZoneAdmin`。 |
| `src/views/` | 页面和模块内组件。 |
| `src/components/` | 跨模块复用的表格、搜索、分页、上传等 UI。 |
| `src/composables/` | 列表查询、刷新等可复用状态逻辑。 |
| `src/router/` | 本地静态路由和 Hash Router。 |
| `src/store/modules/` | 用户、布局菜单、权限与标签页状态。 |
| `src/utils/request.js` | 主请求实例、签名、登录态和统一响应处理。 |
| `scripts/` | 后台菜单等受控自动化脚本。 |
| `docs/` | 当前事实文档、流程说明和冻结的历史记录。 |

完整结构说明见 [`docs/project-structure.md`](docs/project-structure.md)。

## 6. 当前核心模块

- 商品管理：商品列表、详情、新增、编辑和启禁用；单条商品同时维护简中、英语、繁中和日文名称与金额，列表不再按 `language` 筛选。新增/编辑/详情表单按语种分行，一行是一组“该语种名称 + 该语种金额”，金额输入框后展示对应币种文字（简中人民币、英语与繁中美元、日文日元），不再展示单次购买预计发放 Token 汇总。
- 首页统计：用户总数、绑定设备数、订单金额、产品数、常见问题数；注册趋势使用 ECharts 柱状图，订单统计使用 `/Common/getStatisticsOrder` 和 ECharts 趋势图，均支持近一周、近一个月、近一年。
- 用户管理：用户列表、详情、基础资料编辑、状态、星币账户调整与账户操作日志。
- 图库管理：公共图库图片的列表、详情、新增、编辑和启禁用；单条图片同时维护简中、英语、繁中和日文标题与说明，列表不再按 `language` 筛选；新增/编辑原图时上传接口携带 `isUploadThumb=1`，并优先使用返回的 `urlThumb` 作为缩略图；适用产品/设备选择为非必填。
- 图库分类：分类列表、详情、新增、编辑和启禁用；单条分类同时维护简中、英语、繁中和日文名称，列表不再按 `language` 筛选。
- 订单管理：订单列表与详情；金额按订单 `language` 前置币种符号（`¥` 人民币、`$` 美元、`JP¥` 日元），接口返回 `currencySymbol` 时优先使用后端值；订单详情优先展示后端 `currencyName` 币种名称，旧数据缺失该字段时按 `language` 回退。
- AI 配置：配置列表、编辑和启禁用；列表可按内容语种筛选。
- 基础配置：系统配置继续使用 `/Common/getConfigDataList` 与 `/Common/setConfigDataEdit`，平台设备 ID 不在表单中展示，也不进入保存负载。
- UMS/权限：员工、角色、菜单和授权关系。

接口完成度以 [`docs/api-integration-progress.md`](docs/api-integration-progress.md) 为当前状态入口；接口清单以 [`docs/interface-list.md`](docs/interface-list.md) 为核对依据。

## 7. 重要设计约束

1. `src/api/*.js` 默认只写业务路径，公共 `/ZoneAdmin` 前缀由环境和请求层统一处理。
2. 菜单、路由、组件名称和按钮权限码是一组跨前后端契约，任何一处变化都要联动检查。
3. 菜单同步必须可重复执行、默认只预览、显式 `--apply` 才写入；凭证只能从环境变量读取。
4. 列表页优先复用项目现有公共组件和 composable，不为单个页面复制一套分页、刷新或查询状态。
5. 修改 `src/utils/request.js`、用户 Store、权限指令或路由会影响多数模块，必须先用 CodeGraph 查看调用与影响范围。
6. CodeGraph 描述当前源码结构；Markdown 负责产品契约、操作方法、决策原因和历史。二者不能互相替代。
7. 商品、公共图库和图库分类已经改为单条记录同时提交四语种字段，不再提交或筛选 `language`；AI 配置等仍声明 `language` 的接口继续按各自契约使用语种选项，不能混用不同取值范围。
8. 全局接口 Loading 由 `src/utils/request.js` 统一维护并发计数；页面不得自行创建另一套全屏请求遮罩。只有明确需要非阻塞后台刷新时才在请求配置中传 `showLoading: false`。
9. 语种与结算币种的对应关系集中在 `src/views/commerce/utils.js`：`0/1=美元`、`2=人民币`、`3=美元`、`4=日元`，缺少语种时回落到人民币。页面不得各自复制一份币种映射。

## 8. 开发与维护流程

开始任务时按以下顺序读取：

1. `AGENTS.md`
2. 本文件
3. `docs/README.md`
4. 与任务相关的 Active 文档
5. CodeGraph 中的源码符号、调用链和影响范围
6. 仅在追查原因时读取相关 Historical 记录

执行约定：

1. 先运行 `git status --short`，识别并保护已有用户改动。
2. `.codegraph/` 存在时，结构分析先运行 `codegraph status .` 和 `codegraph explore "问题或符号"`。
3. 拉取代码后运行 `codegraph sync .`；完成有意义的源码修改后再次同步并检查状态。
4. 行为、接口、架构、命令、权限或部署方式变化时，更新对应 Active 文档。
5. 一次集中修改建立一份 `docs/history/YYYY-MM/YYYY-MM-DD-主题.md`；不要把流水账追加到 AI_CONTEXT。
6. 记录实际运行过的验证，不把“计划验证”写成“已通过”。

## 9. 已知风险与待确认项

- 项目暂无自动化测试、lint 和类型检查脚本，回归主要依赖构建与人工验证。
- 后台菜单与本地路由可能独立演进；新增页面后需要重新绑定角色权限并重新登录验证。
- 请求签名和统一错误处理集中在请求层，修改的影响面很大。
- Swagger、线上返回值和已有页面可能短期不一致，应在文档中标明核验日期与事实来源。
- `/Client/Order/getGoodsList` 的 `currencySymbol` 属于用户端契约，本管理后台仓库没有该接口的 wrapper、调用链或展示页面；应在对应用户端项目消费，不能误接到管理端商品列表。
- 图库分类繁中字段按当前后端契约拼写为 `categoryNameeFan`（双 `e`）；前端不能自行改成 `categoryNameFan`。
- 仓库同时保留 `yarn.lock` 与 `pnpm-lock.yaml`；主包管理器尚未形成明确的仓库规则，不应擅自重写锁文件。
- 支付请求使用独立请求地址，修改通用接口环境变量时不能默认覆盖支付链路。

## 10. 文档地图

- [`docs/README.md`](docs/README.md)：文档导航、生命周期和维护规则。
- [`docs/project-structure.md`](docs/project-structure.md)：当前目录与模块组织。
- [`docs/interface-list.md`](docs/interface-list.md)：接口核对清单。
- [`docs/api-integration-progress.md`](docs/api-integration-progress.md)：接口接入状态。
- [`docs/dynamic-menu-sync.md`](docs/dynamic-menu-sync.md)：动态菜单同步、验证和回滚。
- [`docs/history/README.md`](docs/history/README.md)：本地操作更新记录规范与模板。

## 11. 兄弟项目边界与同步触发

| 项目 | 主要职责 | 需要同步的变化 |
| --- | --- | --- |
| `web-ui-v2` | BoltFox PC 管理后台 | 管理端接口、权限码、菜单/路由契约、运营配置字段。 |
| `flowerpot` | 花盆产品微信小程序 | 面向用户的接口模型、设备/产品状态、登录与业务口径。 |
| `flowerpot-web` | 花盆产品 PC 管理后台 | 花盆后台接口、管理菜单、权限和运营字段。 |

只有共享契约发生变化时才同步事实和影响；各项目按自己的源码、技术栈与部署方式填写，不能复制另一项目的模块或命令。跨项目同步要在各自历史记录中写明上游来源、实际同步内容、有意保留的差异和未完成项。

## 12. AI 工作备注

- 不根据文件名猜行为；先看 CodeGraph 和当前源码。
- 不覆盖与当前任务无关的未提交改动。
- 不把本机绝对路径、临时缓存或某台机器的安装状态写成跨环境事实。
- 历史记录只用于追溯；若历史与 Active 文档或源码冲突，以当前源码和最新 Active 文档为准，并修正文档。
