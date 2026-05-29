<template>
  <div class="app-container home">
    <el-card shadow="never" class="welcome">
      <div class="welcome-inner">
        <img :src="avatar" class="avatar" alt="avatar" />
        <div class="hello">
          <div class="title">你好，{{ trueName || '管理员' }} 👋</div>
          <div class="sub">欢迎使用 Gleam 管理中心（Vue3 升级版）</div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in cards" :key="card.key" :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="tip-card">
      <template #header>
        <span class="font-title-medium">技术栈</span>
      </template>
      <el-space wrap>
        <el-tag type="success">Vue 3</el-tag>
        <el-tag type="success">Vite</el-tag>
        <el-tag>Element Plus</el-tag>
        <el-tag>Pinia</el-tag>
        <el-tag>Vue Router 4</el-tag>
        <el-tag type="warning">vxe-table</el-tag>
        <el-tag type="info">axios</el-tag>
        <el-tag type="info">dayjs</el-tag>
        <el-tag type="info">lodash-es</el-tag>
      </el-space>
    </el-card>
  </div>
</template>

<script setup name="home">
import { ref, onMounted } from 'vue'
import { getUserCount } from '@/api/home'
import { getCookie } from '@/utils/support'
import avatar from '@/assets/images/user.png'

const trueName = ref(getCookie('trueName') || '')

const cards = ref([
  { key: 'userCount', label: '用户总数', value: '-', icon: 'User', color: '#2274e7' },
  { key: 'todayCount', label: '今日新增', value: '-', icon: 'Plus', color: '#67c23a' },
  { key: 'orderCount', label: '运单总数', value: '-', icon: 'Tickets', color: '#e6a23c' },
  { key: 'activeCount', label: '活跃用户', value: '-', icon: 'DataLine', color: '#f56c6c' }
])

async function loadStats() {
  try {
    const res = await getUserCount()
    const data = res.retData || {}
    // 后端字段不固定，做安全映射
    cards.value[0].value = data.userCount ?? data.totalCount ?? '-'
    cards.value[1].value = data.todayCount ?? data.todayAddCount ?? '-'
    cards.value[2].value = data.orderCount ?? data.wayBillCount ?? '-'
    cards.value[3].value = data.activeCount ?? data.activeUserCount ?? '-'
  } catch (e) {
    // 未登录或后端不可达时静默
  }
}

onMounted(loadStats)
</script>

<style lang="scss" scoped>
.home {
  margin-top: 10px;
}
.welcome-inner {
  display: flex;
  align-items: center;
  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    margin-right: 16px;
  }
  .title {
    font-size: 18px;
    color: #303133;
    font-weight: 600;
  }
  .sub {
    font-size: 13px;
    color: #909399;
    margin-top: 6px;
  }
}
.stat-row {
  margin-top: 16px;
}
.stat-card {
  margin-bottom: 16px;
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
  }
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    color: #fff;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
  }
  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #303133;
  }
  .stat-label {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
  }
}
.tip-card {
  margin-top: 4px;
}
</style>
