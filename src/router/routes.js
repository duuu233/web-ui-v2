/**
 * 路由约定（沿用原项目）：
 * hidden: true            侧边栏不展示
 * meta.title              菜单/面包屑标题
 * meta.icon               svg 图标名
 * meta.affix             固定在 tagsView
 * name                    用于 <keep-alive> 缓存（务必与组件 name 一致）
 *
 * 说明：原项目左侧菜单由后端接口（getLeftMenus）驱动，menuUrl 即路由 name；
 * 此处的 asyncRouterMap 为本地静态路由表，新增模块时按下方结构补充即可。
 */

const Layout = () => import('@/layout/index.vue')

export const constantRouterMap = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    hidden: true
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'home',
          affix: true
        }
      }
    ]
  }
]

export const asyncRouterMap = [
  {
    path: '/sms',
    component: Layout,
    redirect: '/sms/userList',
    name: 'sms',
    meta: {
      title: '运营'
    },
    children: [
      {
        path: 'userList',
        name: 'userList',
        component: () => import('@/views/sms/userList/index.vue'),
        meta: {
          title: '用户列表',
          icon: 'sms-flash'
        }
      },
      {
        path: 'userListEdit',
        name: 'userListEdit',
        component: () => import('@/views/sms/userList/edit.vue'),
        meta: {
          title: '用户编辑',
          icon: 'sms-flash'
        },
        hidden: true
      },
      {
        path: 'userListDetail',
        name: 'userListDetail',
        component: () => import('@/views/sms/userList/detail.vue'),
        meta: {
          title: '用户详情',
          icon: 'sms-flash'
        },
        hidden: true
      },
      {
        path: 'productList',
        name: 'productList',
        component: () => import('@/views/sms/productList/index.vue'),
        meta: {
          title: '产品列表',
          icon: 'sms-flash'
        }
      }
    ]
  }

  // 待迁移模块（ums/oms/log 等）按上方结构在此补充对应 children 与视图组件
]

export const routerMap = constantRouterMap.concat(asyncRouterMap)
