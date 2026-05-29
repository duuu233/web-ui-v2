import { useUserStore } from '@/store/modules/user'
import { getCookie } from '@/utils/support'

function checkPermission(el, binding) {
  const { value } = binding
  const userStore = useUserStore()
  const roles = userStore.permissions || []

  if (value && value instanceof Array) {
    // 系统管理员直接放行
    if (getCookie('isSysAdmin') === '1') return
    if (value.length > 0) {
      if (!roles.includes(value[0])) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','editor']"`)
  }
}

const permission = {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  }
}

export default permission
