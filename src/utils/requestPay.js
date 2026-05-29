import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import md5 from 'js-md5'
import { getToken, removeToken } from '@/utils/auth'

// 支付相关接口实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_PAY,
  timeout: 15000
})

function fedLogOut() {
  removeToken()
  location.reload()
}

service.interceptors.request.use(
  (config) => {
    const tokenTime = sessionStorage.getItem('tokenTime')
    const newTime = new Date().getTime()
    if (!tokenTime) {
      sessionStorage.setItem('tokenTime', newTime)
    } else {
      if (
        newTime - tokenTime >= 1800000 &&
        config.url.indexOf('login') === -1
      ) {
        fedLogOut()
        sessionStorage.removeItem('tokenTime')
      } else {
        sessionStorage.setItem('tokenTime', newTime)
      }
    }

    // 签名
    let randomString =
      new Date().toLocaleDateString().split('/').join('') +
      Math.floor(Math.random() * 10).toString()
    if (randomString.length === 7) {
      randomString = randomString + Math.floor(Math.random() * 10).toString()
    }
    let sign = randomString + '8e808087-08b3-3e10-8e83-93bf078df4b2'
    sign = md5(sign)

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
    }

    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.retCode !== 200) {
      ElMessage({
        message: res.retMsg,
        type: 'error',
        duration: 3 * 1000
      })
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
    console.log('err' + error)
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
