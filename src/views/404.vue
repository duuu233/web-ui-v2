<template>
  <div class="page-404">
    <img :src="img404" alt="404" class="img-404" />
    <div class="text">
      <h1>404</h1>
      <p>抱歉，你访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup name="Page404">
import { useRouter } from 'vue-router'
import img404 from '@/assets/images/404.png'

const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.page-404 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #fff;
}
.img-404 {
  max-width: 360px;
  width: 40vw;
}
.text {
  text-align: center;
  margin-top: 20px;
  h1 {
    font-size: 60px;
    color: #2274e7;
  }
  p {
    font-size: 14px;
    color: #909399;
    margin: 12px 0 20px;
  }
}
</style>
