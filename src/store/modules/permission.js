import { defineStore } from 'pinia'
import { constantRouterMap, asyncRouterMap } from '@/router/routes'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routers: constantRouterMap,
    addRouters: []
  }),
  actions: {
    // 与原项目一致：路由表使用本地静态表（菜单可见性由后端菜单接口控制）
    setRouters() {
      this.addRouters = constantRouterMap
      this.routers = constantRouterMap.concat(asyncRouterMap)
    }
  }
})
