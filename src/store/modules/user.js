import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { login, getSysMenus, getChildAppCodes } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password)
          .then((response) => {
            const data = response.retData
            const tokenStr = data.adminToken
            setToken(tokenStr)
            this.token = tokenStr
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 获取顶部菜单栏数据，并拉取已授权权限集合
    getSysMenus(params) {
      return new Promise((resolve, reject) => {
        getSysMenus(params)
          .then((response) => {
            getChildAppCodes()
              .then((res) => {
                if (res.retCode === 200) {
                  this.permissions = res.retData
                  resolve(response)
                } else {
                  ElMessage({
                    type: 'error',
                    message: '获取用户权限失败',
                    duration: 2000
                  })
                  resolve(response)
                }
              })
              .catch(reject)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 登出
    logOut() {
      return new Promise((resolve) => {
        this.token = ''
        this.roles = []
        removeToken()
        resolve()
      })
    },
    // 前端登出
    fedLogOut() {
      return new Promise((resolve) => {
        this.token = ''
        removeToken()
        resolve()
      })
    }
  }
})
