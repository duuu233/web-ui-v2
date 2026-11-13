# 固件版本隐藏「强制升级」选项

> 文档类型：Historical Change Record
> 日期：2026-11-13
> 环境：SSH
> 分支与起始版本：main / 9589fa1
> 范围：固件版本（`src/views/sms/productVersion`）
> 当前权威文档：[api-integration-progress.md](../../api-integration-progress.md)「管理后台-固件版本控制接口」

## 背景与目标

产品要求去掉固件强制升级：小程序 / APP 只保留强提示升级（进入设备详情页弹框）与弱提示升级（红点），后台隐藏「强制升级」选项。

## 变更内容

| 文件或模块 | 变更 |
| --- | --- |
| `productVersion/detail.vue` | 新增 / 编辑的「升级类型」只剩强提示、弱提示、不提示；编辑存量 `compulsory = 1` 的记录时清空该项，须重新选择后才能保存 |
| `productVersion/index.vue` | 筛选「升级类型」隐藏强制升级；列表列仍按 1–4 显示存量数据 |

## 关键决策

- 存量 1 不在后台批量改；小程序 / APP 把 1 按强提示处理。编辑时清空而不是自动改成 2，避免用户不知情改了类型（自行决定，可改）。

## 外部操作

无。

## 验证结果

本机无 Node，未运行 build / lint，未在浏览器核对。

## 未完成项与风险

- 线上已有 `compulsory = 1` 的版本仍会显示「强制升级」，需要的话逐条编辑改选。

## 回滚或恢复

恢复两处 `compulsoryOptions` 中的 `{ value: 1, label: '强制升级' }` 并去掉编辑时的清空即可。
