# 商品列表隐藏 Token 单价列

> 文档类型：Historical Change Record
> 日期：2026-09-08
> 环境：公司电脑
> 分支与起始版本：main / 5e794fe
> 当前权威文档：[AI_CONTEXT.md](../../../AI_CONTEXT.md)

## 背景与变更

按用户要求，商品列表移除 Token 单价列，仅删除 GoodsTable.vue 中对应列模板。商品表单、接口字段、实际售价、基础数量和赠送数量不变。CodeGraph 已确认该表格由商品列表页面使用。

本次跨项目任务另由相册小程序和 APP 各自调整星币管理页的划线金额及六位价格展示，维护记录留在对应项目。

## 同步与本地文件

修改前在当前 main 分支执行 git pull --ff-only，结果 Already up to date。未切分支。
开始检查时 dist.zip 存在本地修改，用户随后明确不忽略本地文件，继续执行时该文件已处于删除状态；本次按用户指示将已有删除一并提交，不恢复旧压缩包，也不重新生成它。

## 验证

npm run build 通过（3033 个模块）；存在第三方注释和大 chunk 提示，无构建错误。CodeGraph sync / status 通过，索引为最新。未做登录后台的人工页面验收。

## 外部操作与回滚

用户授权 commit 和 push，无部署或接口写操作。需要恢复本轮前状态时 revert 本次提交；这也会恢复被删除的 dist.zip。
