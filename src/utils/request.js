import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import md5 from 'js-md5'
import { getToken, removeToken } from '@/utils/auth'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // api 的 base_url
  timeout: 60000 // 请求超时时间
})

// 退出登录并刷新（重新实例化 vue-router 对象，避免 bug）
function fedLogOut() {
  removeToken()
  location.reload()
}

// request 拦截器
service.interceptors.request.use(
  (config) => {
    try {
      // 前端通过时间判断 token 是否过期
      const tokenTime = sessionStorage.getItem('tokenTime')
      const newTime = new Date().getTime()
      if (!tokenTime) {
        sessionStorage.setItem('tokenTime', newTime)
      } else {
        if (
          newTime - tokenTime >= 86400000 &&
          config.url.indexOf('login') === -1
        ) {
          fedLogOut()
          sessionStorage.removeItem('tokenTime')
        } else {
          sessionStorage.setItem('tokenTime', newTime)
        }
      }

      // 签名 -------------s
      let randomString =
        new Date().toLocaleDateString().split('/').join('') +
        Math.floor(Math.random() * 10).toString()
      if (randomString.length === 7) {
        randomString = randomString + Math.floor(Math.random() * 10).toString()
      }
      let sign = randomString + '8e808087-08b3-3e10-8e83-93bf078df4b2'
      sign = md5(sign)
      // 签名 -------------e

      if (config.method === 'get') {
        if (!config.params) {
          config.params = {}
        }
        config.params.randomString = randomString
        config.params.sign = sign
        if (getToken()) {
          config.params.userToken = getToken()
        }
      }
      if (config.method === 'post') {
        if (!config.data) {
          config.data = {}
        }
        config.data.randomString = randomString
        config.data.sign = sign
        if (getToken()) {
          config.data.userToken = getToken()
        }
        // 过滤 null
        for (const key in config.data) {
          if (config.data[key] === null) {
            config.data[key] = ''
          }
        }
      }

      return config
    } catch (error) {
      console.log('error', error)
    }
  },
  (error) => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  (response) => {
    // retCode 为非 200 时抛错
    const res = response.data

    if (res.retCode !== 200) {
      ElMessage({
        message: res.retMsg,
        type: 'error',
        duration: 3 * 1000
      })
      // 406：被登出
      if (res.retCode === 406) {
        ElMessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          fedLogOut()
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  (error) => {
    console.log('err' + error) // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
