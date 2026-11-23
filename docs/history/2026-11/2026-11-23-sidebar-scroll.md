# 左侧菜单内容过多时可纵向滚动

> 文档类型：历史记录
> 日期：2026-11-23；环境：远程 SSH 服务器
> 分支与起始版本：main / 41b1166

## 范围

反馈：左侧菜单内容多、高度撑开时是否禁用了滚动条，超出可视区时需要能滚动。

## 原因

- `src/layout/index.vue` 写的是 `<sidebar class="sidebar-container" />`，`Sidebar.vue` 只有一个根节点 `.sidebar-inner`，两个类落在同一个元素上。
- `Sidebar.vue` 作用域样式 `.sidebar-inner { height: 100%; overflow-y: auto }` 本意可滚动，但全局 `src/styles/sidebar.scss` 的 `#app .sidebar-container { overflow: hidden }` 优先级更高（带 id），实际生效的是 `overflow: hidden`：菜单超出部分被裁掉，没有滚动条，滚轮也滚不动。
- 该元素是 `position: fixed; top: 顶栏高度; bottom: 0`，同时被 `.sidebar-inner` 设了 `height: 100%`，高度按整屏算、bottom 失效，比可视区多出顶栏高度（72px）；只改 overflow 的话最底下一截仍滚不出来。

## 改动

- `src/styles/sidebar.scss` 的 `.sidebar-container`：`overflow: hidden` 改为 `overflow-x: hidden; overflow-y: auto`，加 `height: auto`（高度回到由 top / bottom 决定）和 `overscroll-behavior: contain`（滚到头不带动整页）。
- 滚动条样式沿用 `Sidebar.vue` 里 `.sidebar-inner` 的 6px 细滚动条（同一元素，直接生效）。菜单内容与路由未改。

## 验证

服务器上没有 Node，未运行 `npm run build`，未在浏览器核对。需本地运行 `npm run build`，并在较矮窗口（或展开菜单较多的账号）确认侧栏出现滚动条、能滚到最后一个菜单、底部留白可见，收起侧栏时无横向滚动条。

## 回滚

`sidebar.scss` 的这几行改回 `overflow: hidden` 即可。
