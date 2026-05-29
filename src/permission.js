import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from '@/router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login'] // 不重定向白名单

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const appStore = useAppStore()
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()
      if (appStore.sidebarTop.length === 0) {
        userStore
          .getSysMenus()
          .then((res) => {
            appStore.setSidebarTop(res.retData)
            permissionStore.setRouters()
            next()
          })
          .catch(() => {
            // 拉取菜单失败也放行，避免页面卡死
            next()
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
