import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    sidebarTop: [], // 顶部导航（系统/模块）
    sidebarRight: [], // 左侧菜单分组
    device: 'desktop'
  }),
  actions: {
    setSidebarTop(arr) {
      this.sidebarTop = arr
    },
    setSidebarRight(arr) {
      this.sidebarRight = arr
    },
    toggleSideBar() {
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      this.sidebar.opened = !this.sidebar.opened
    },
    closeSideBar(withoutAnimation) {
      Cookies.set('sidebarStatus', 1)
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device) {
      this.device = device
    }
  }
})
