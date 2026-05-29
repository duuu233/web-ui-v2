import { createRouter, createWebHashHistory } from 'vue-router'
import { constantRouterMap, asyncRouterMap } from './routes'

const router = createRouter({
  // 与原项目保持一致，默认使用 hash 模式（后端支持可改 createWebHistory）
  history: createWebHashHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes: constantRouterMap.concat(asyncRouterMap)
})

export default router
