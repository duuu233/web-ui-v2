<template>
  <div class="login_content_bg">
    <img :src="login_bg" class="login_bg_img" alt="bg" />
    <div class="logon_content_bx">
      <div class="login_content_tp">
        <img :src="login_bx" class="login_bx_img" alt="" />
        <p>Gleam管理中心</p>
      </div>
      <div class="login_content_bm">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="left"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              class="login_input"
              name="username"
              type="text"
              placeholder="请输入用户名"
            >
              <template #prefix>
                <svg-icon icon-class="loginuser" class="login-prefix" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              class="login_input"
              name="password"
              type="password"
              show-password
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <svg-icon icon-class="loginpwd" class="login-prefix" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              class="logon_btn"
              type="primary"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <p class="login_copyright">
      版权所有 深圳市火芯纪元智能有限公司2024～2030年 版本号:V1.0.0
    </p>
  </div>
</template>

<script setup name="login">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import md5 from 'js-md5'
import { validateE_N, validateC_E_N } from '@/utils/validate'
import { setCookie, getCookie } from '@/utils/support'
import { useUserStore } from '@/store/modules/user'
import login_bg from '@/assets/images/login_bg.png'
import login_bx from '@/assets/images/login_bx.png'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = ref({
  username: getCookie('username') || '',
  password: getCookie('password') || ''
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入账号'))
  } else if (!validateC_E_N(value)) {
    return callback(new Error('请输入中英文或数字'))
  } else if ((value + '').length < 2 || (value + '').length > 20) {
    return callback(new Error('请输入2~20个中英文数字'))
  } else {
    callback()
  }
}
const validatePass = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  } else if (!validateE_N(value)) {
    return callback(new Error('请输入6~20个英文数字或下划线'))
  } else if ((value + '').length < 6 || (value + '').length > 20) {
    return callback(new Error('请输入6~20个英文数字或下划线'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  password: [{ required: true, trigger: 'blur', validator: validatePass }]
}

function handleLogin() {
  loginFormRef.value.validate((valid) => {
    if (!valid) return false
    loading.value = true
    const payload = {
      password: md5(loginForm.value.password),
      username: loginForm.value.username
    }
    userStore
      .login(payload)
      .then((res) => {
        loading.value = false
        setCookie('trueName', res.retData.trueName, 15)
        if (res.retCode === 200) {
          setCookie('countyName', res.retData.countyName, 15)
          setCookie('cityName', res.retData.cityName, 15)
          setCookie('isSysAdmin', res.retData.isSysAdmin, 15)
        }
        ElMessage({ message: '登录成功！', type: 'success', duration: 1000 })
        router.push({ path: '/' })
      })
      .catch(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped lang="scss">
.login-prefix {
  font-size: 16px;
  color: #2274e7;
}
.login_content_bg {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  box-sizing: content-box;
}
.login_bg_img {
  display: inline-block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.logon_content_bx {
  width: 400px;
  height: 420px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  background-color: #fff;
  overflow: hidden;
}
.login_content_tp {
  width: 100%;
  height: 130px;
  position: relative;
}
.login_bx_img {
  width: 400px;
  height: 130px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.login_content_tp p {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  height: 130px;
  line-height: 130px;
  font-size: 28px;
  color: #fff;
  font-weight: 500;
  z-index: 9;
}
.login_copyright {
  width: 100vw;
  text-align: center;
  font-size: 14px;
  color: #555;
  bottom: 74px;
  line-height: 14px;
  position: absolute;
}
.login_content_bm {
  width: 317px;
  margin: 40px auto 0;
}
.login_input {
  margin-bottom: 30px;
}
.logon_btn {
  margin-top: 5px;
  width: 100%;
  height: 45px;
  border-radius: 22.5px;
  font-weight: 400;
  background-color: #409eff;
  border-color: #409eff;
  box-shadow: 0px 6px 23px 0px #b6d5ff;
  font-size: 16px;
}
</style>
