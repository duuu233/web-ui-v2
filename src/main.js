import { createApp } from 'vue'

// svg 雪碧图注册
import 'virtual:svg-icons-register'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// vxe-table（列表页面主力组件）
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

// 全局样式
import '@/styles/index.scss'

import App from './App.vue'
import router from './router'
import pinia from './store'
import SvgIcon from '@/components/SvgIcon/index.vue'
import permissionDirective from '@/directive/permission'
import '@/permission' // 路由守卫

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('svg-icon', SvgIcon)
app.directive('permission', permissionDirective)

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.use(VXETable)

app.mount('#app')
