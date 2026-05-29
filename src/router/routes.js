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
      },
      {
        path: 'productFaqList',
        name: 'productFaqList',
        component: () => import('@/views/sms/productFaqList/index.vue'),
        meta: {
          title: '常见问题',
          icon: 'sms-flash'
        }
      },
      {
        path: 'productFaqListAdd',
        name: 'productFaqListAdd',
        component: () => import('@/views/sms/productFaqList/add.vue'),
        meta: {
          title: '新增常见问题',
          icon: 'sms-flash'
        },
        hidden: true
      },
      {
        path: 'productFaqListEdit',
        name: 'productFaqListEdit',
        component: () => import('@/views/sms/productFaqList/edit.vue'),
        meta: {
          title: '编辑常见问题',
          icon: 'sms-flash'
        },
        hidden: true
      },
      {
        path: 'productFaqListDetail',
        name: 'productFaqListDetail',
        component: () => import('@/views/sms/productFaqList/detail.vue'),
        meta: {
          title: '常见问题详情',
          icon: 'sms-flash'
        },
        hidden: true
      },
      {
        path: 'appVersion',
        name: 'appVersion',
        component: () => import('@/views/sms/appVersion/index.vue'),
        meta: {
          title: '版本管理',
          icon: 'sms-flash'
        }
      },
      {
        path: 'versionDetail',
        name: 'versionDetail',
        component: () => import('@/views/sms/appVersion/versionDetail.vue'),
        meta: {
          title: '版本详情',
          icon: 'sms-flash'
        },
        hidden: true
      },
      {
        path: 'applicationStore',
        name: 'applicationStore',
        component: () => import('@/views/sms/applicationStore/index.vue'),
        meta: {
          title: '应用市场',
          icon: 'sms-flash'
        }
      },
      {
        path: 'messagePush',
        name: 'messagePush',
        component: () => import('@/views/sms/messagePush/index.vue'),
        meta: {
          title: '消息推送',
          icon: 'sms-flash'
        }
      },
      {
        path: 'messageUser',
        name: 'messageUser',
        component: () => import('@/views/sms/messageUser/index.vue'),
        meta: {
          title: '用户消息',
          icon: 'sms-flash'
        }
      }
    ]
  },
  {
    path: '/ums',
    component: Layout,
    redirect: '/ums/admin',
    name: 'ums',
    meta: {
      title: '权限'
    },
    children: [
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/ums/admin/index.vue'),
        meta: {
          title: '员工列表',
          icon: 'ums-admin'
        }
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/ums/role/index.vue'),
        meta: {
          title: '角色列表',
          icon: 'ums-role'
        }
      },
      {
        path: 'allocMenu',
        name: 'allocMenu',
        component: () => import('@/views/ums/role/allocMenu.vue'),
        meta: {
          title: '分配菜单',
          icon: 'ums-role'
        },
        hidden: true
      },
      {
        path: 'menuList',
        name: 'menuList',
        component: () => import('@/views/ums/menuList/index.vue'),
        meta: {
          title: '菜单列表',
          icon: 'ums-menu'
        }
      },
      {
        path: 'setPermission',
        name: 'setPermission',
        component: () => import('@/views/ums/menuList/setPermission.vue'),
        meta: {
          title: '设置权限',
          icon: 'ums-menu'
        },
        hidden: true
      },
      {
        path: 'department',
        name: 'department',
        component: () => import('@/views/ums/department/index.vue'),
        meta: {
          title: '部门列表',
          icon: 'ums-dept'
        }
      },
      {
        path: 'config',
        name: 'config',
        component: () => import('@/views/ums/config/index.vue'),
        meta: {
          title: '系统配置',
          icon: 'ums-config'
        }
      },
      {
        path: 'area',
        name: 'area',
        component: () => import('@/views/ums/area/index.vue'),
        meta: {
          title: '地区设置',
          icon: 'ums-area'
        }
      }
    ]
  }

  ,
  {
    path: '/oms',
    component: Layout,
    redirect: '/oms/waybill',
    name: 'oms',
    meta: {
      title: '订单'
    },
    children: [
      {
        path: 'waybill',
        name: 'waybill',
        component: () => import('@/views/oms/waybill/index.vue'),
        meta: {
          title: '运单列表',
          icon: 'oms-waybill'
        }
      },
      {
        path: 'waybillDetail',
        name: 'waybillDetail',
        component: () => import('@/views/oms/waybill/detail.vue'),
        meta: {
          title: '运单详情',
          icon: 'oms-waybill'
        },
        hidden: true
      }
    ]
  }

  // 待迁移模块（log 等）按上方结构在此补充对应 children 与视图组件
]

export const routerMap = constantRouterMap.concat(asyncRouterMap)
