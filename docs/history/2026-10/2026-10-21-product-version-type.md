# 产品版本类型字段

> 文档类型：Historical Change Record
> 日期：2026-10-21
> 环境：办公室（work）
> 分支与起始版本：main / 8b40a8e
> 范围：相框产品列表、新增、编辑、详情和相关列表刷新
> 当前权威文档：[接口清单](../../interface-list.md)

## 背景与目标

按产品口径为四个 Product 接口接入 versionType，1=蓝牙版、2=wifi版。工作区干净，核实 origin 和远端同名 main 后先显式 pull --ff-only 成功，再核对规则、文档及 CodeGraph；当前公开 Swagger 的新增/编辑模型及列表/详情输出均已包含 int32 versionType。

## 变更内容与关键决策

- productList/index.vue：新增版本类型列。
- productList/template/DetailForm.vue：共享新增/编辑表单选择、有效枚举校验、详情回填和只读展示；发送数字1或2。版型、尺寸、广播ID和原有提交字段保持原流程；同时把当前表单已有的上传组件 import 大小写对齐实际 multiUpload.vue 文件名，避免区分大小写的环境解析失败。
- productList/versionType.js：两种类型及归一化/展示共用逻辑。缺失或无效值不自动猜测为某一种版本，编辑须显式选择。
- usePagedList.js：浏览器首次新增返回发现旧缓存未刷新；修正挂载后才开始缓存时的首次激活处理。挂载查询前消费旧标记，保存后新标记在首次返回时触发刷新；已有缓存首次挂载避免重复查询。
- tests/use-paged-list-lifecycle.test.mjs：使用真实 Vue KeepAlive 生命周期覆盖初始缓存、延迟缓存保存返回、无保存返回三个分支。
- 维护接口、接入进度、上下文和文档索引；列表查询沿用当前 Swagger 参数，无需新菜单。

## 外部操作

仅只读获取当前 Swagger。所有产品新增、编辑、上传和业务响应验证均由本地浏览器拦截模拟，没有调用线上产品写接口、修改菜单角色或部署。

## 验证结果

- 本地 Chrome 15项页面检查通过：列表两种文案与缺字段、添加无默认类型/必选校验/数字1提交、成功刷新、编辑字符串2回填/数字2提交/切换类型、失败保留选择、详情只读及旧数据显式选择；浏览器运行时异常0。检查1440及768宽度截图。
- node --test tests/use-paged-list-lifecycle.test.mjs tests/product-version-fpga.test.mjs：7项通过，覆盖本轮缓存生命周期和既有分页、字段及菜单模拟回归。首次返回不刷新已在修复前浏览器实际复现。
- npm run build：最终构建通过，保留现有大分包提示。
- CodeGraph sync/status、静态语法、差异、import大小写、文档链接及信息隔离检查通过。

## 未完成项与风险

没有真实创建或编辑线上产品；字段真实数据验收由使用者在发布后完成。旧数据缺失类型时新增/编辑需选择蓝牙或wifi，避免误赋默认值。未部署前端。

## 回滚或恢复

回退本次提交并重新构建即可。无菜单、数据库或签名迁移；真实产品数据未修改。
