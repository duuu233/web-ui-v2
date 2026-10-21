# FPGA 固件版本模块与菜单自动化

> 文档类型：Historical Change Record
> 日期：2026-10-21
> 环境：办公室（work）
> 分支与起始版本：main / 27c1238
> 范围：FPGA 固件页面、六项接口、权限菜单与定向回归
> 当前权威文档：[FPGA 模块](../../product-version-fpga.md)、[菜单同步](../../dynamic-menu-sync.md)

## 背景与目标

按产品提供的六个 ProductVersionFpga 接口新增独立模块，并通过现有自动化脚本创建后台菜单。本轮先核实当前 main 干净、origin 和同名远端分支，显式 pull --ff-only 成功后实施。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| src/api/productVersionFpga.js | 六项 GET/POST 封装，沿用统一鉴权、签名与响应处理。 |
| src/views/sms/productVersionFpga/ | 列表筛选分页；新增、编辑、只读详情共用编辑器；上传、启禁用和逻辑删除；权限与异步保护。 |
| src/router/routes.js | 列表与三个隐藏表单路由，路由名与页面名一致。 |
| src/composables/usePagedList.js | 可选 latestRequestOnly；默认关闭，FPGA 启用并验证旧调用方式。 |
| scripts/sync-admin-menu.mjs、package.json | fpga-firmware 范围、menu:sync:fpga 和 test:fpga 命令。 |
| tests/product-version-fpga.test.mjs | 模型契约、分页异步顺序、模拟菜单预览/创建/幂等与歧义回归。 |
| AI_CONTEXT.md、docs/ | 模块契约、接口清单、进度、菜单操作与历史索引。 |

## 关键决策

- 独立 FPGA 模块，与原固件版本列表并列，不改原 MCU 固件流程。
- 按当前 Swagger 核实编辑、删除与状态的 id 主键；保留有效 verify=0 和 grade=0；保存只提交字段白名单。
- 版本号最长 200 字符，权重为非负 int32，升级类型为 1–4；固件上传使用公共文件接口，不走图片缩略图流程。
- 详情加载失败和非法 ID 禁止保存；快速切换详情、离开页面或查询返回顺序异常时忽略旧响应。上传与保存互斥，接口失败保留用户草稿。
- 当前系统存在两个旧商品相关分组。本轮以原固件列表编码定位其唯一父级，仅运行 FPGA 范围；没有运行 commerce 迁移或删除旧分组。

## 外部操作

在系统 1 下先只读预览，再执行 menu:sync:fpga -- --apply：新增 6，更新 0。权限树回读确认原有节点全部未变，新增如下：

| ID | 父级 | 名称 | 权限码 |
| --- | --- | --- | --- |
| 163 | 108 | FPGA固件版本 | Get_ProductVersionFpga_GetProductVersionFpgaList |
| 164 | 163 | 详情 | Get_ProductVersionFpga_GetProductVersionFpgaDetail |
| 165 | 163 | 新增 | Post_ProductVersionFpga_AddProductVersionFpga |
| 166 | 163 | 编辑 | Post_ProductVersionFpga_EditProductVersionFpga |
| 167 | 163 | 删除 | Post_ProductVersionFpga_DeleteProductVersionFpga |
| 168 | 163 | 启用/禁用 | Post_ProductVersionFpga_SetProductVersionFpgaVerify |

导航 appUrl=productVersionFpga、isNav=1；五个操作节点 isNav=0。再次只读预览六项均已存在且无配置差异；实际左侧菜单接口已返回 FPGA 导航与 productVersionFpga 路由。当前凭证返回的权限码集合未包含新编码，本轮未修改角色绑定，普通角色仍需授权。临时管理员凭证仅用于进程环境，完成后移除；不保存凭证。

## 验证结果

- npm run test:fpga：3 项通过，包含字段白名单、int32 ID、危险下载链接、0 值保留、分页旧响应/错误、默认兼容、菜单预览不写、首次新增 6、重复新增 0、父级歧义拒绝及旧分组未改。
- Chrome 无头浏览器在本地拦截接口：六项固件接口均覆盖，日期/状态筛选和重置、分页、保存后刷新、增改字段、详情只读、非法 ID、详情失败重试、切换 ID 的迟到响应、上传失败保留原地址与重试、上传中禁止保存、保存失败保留草稿、启禁用双向确认/取消、删除确认/取消及空末页回退、普通角色隐藏未授权按钮、危险地址不生成链接均通过；运行时错误为 0。
- 1440 和 768 宽度检查页面截图，表格横向滚动、固定操作列与筛选布局可用；新增表单视觉检查完成。
- 线上只读：FPGA 列表、id=1 详情、产品列表和权限树 retCode=200；产品选项返回 4 项；操作前后固件列表完全一致。
- npm run build：最终构建通过（29.41 秒），保留现有大分包提示；node --check 及 git diff --check 通过。
- CodeGraph sync/status、文档链接、文件名大小写、凭证与信息隔离检查在提交前完成。

## 未完成项与风险

本轮未执行线上固件添加、编辑、删除、启禁用或真实文件上传；写操作在模拟接口中验证，不能称为生产数据验收。未部署前端。普通角色需管理员绑定新增六项权限并重新登录，系统管理员可直接刷新菜单。服务端权限校验仍由后端负责。

## 回滚或恢复

源码可回退本次提交并重建前端。菜单为独立外部数据：若需撤销，由管理员核对角色绑定后仅移除 164–168 和 163，不删除父级 108 或原有固件菜单。不要运行 commerce 范围清理本轮节点；自动化脚本不会自动删除菜单。
