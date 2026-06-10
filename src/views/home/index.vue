<script setup name="home">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { getStatisticsUser, getUserCount } from '@/api/home'
import { getCookie } from '@/utils/support'
import avatar from '@/assets/images/user.png'

const trueName = shallowRef(getCookie('trueName') || '')
const statsLoading = shallowRef(false)
const statisticsLoading = shallowRef(false)
const statisticsQueryType = shallowRef(0)
const statisticsList = ref([])

const stats = reactive({
  userCount: '-',
  productCount: '-',
  productFaqCount: '-'
})

const queryTypeOptions = [
  { value: 0, label: '近一周' },
  { value: 1, label: '近一个月' },
  { value: 2, label: '近一年' }
]

const cards = computed(() => [
  { key: 'userCount', label: '用户总数', value: stats.userCount, icon: 'User', color: '#2274e7' },
  { key: 'productCount', label: '产品数量', value: stats.productCount, icon: 'Goods', color: '#67c23a' },
  { key: 'productFaqCount', label: '常见问题', value: stats.productFaqCount, icon: 'QuestionFilled', color: '#e6a23c' }
])

const maxRegistrationCount = computed(() => {
  return statisticsList.value.reduce((max, item) => {
    const count = Number(item.userCount) || 0
    return Math.max(max, count)
  }, 0)
})

function formatCount(value) {
  return value ?? '-'
}

function getBarWidth(count) {
  const value = Number(count) || 0
  if (!value || !maxRegistrationCount.value) return '0%'
  return `${Math.max((value / maxRegistrationCount.value) * 100, 6)}%`
}

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await getUserCount()
    const data = res.retData || {}
    stats.userCount = formatCount(data.userCount)
    stats.productCount = formatCount(data.productCount)
    stats.productFaqCount = formatCount(data.productFaqCount)
  } finally {
    statsLoading.value = false
  }
}

async function loadRegistrationStats() {
  statisticsLoading.value = true
  try {
    const res = await getStatisticsUser({ queryType: statisticsQueryType.value })
    statisticsList.value = res.retData || []
  } finally {
    statisticsLoading.value = false
  }
}

onMounted(() => {
  loadStats()
  loadRegistrationStats()
})
</script>

<template>
  <div class="app-container home">
    <el-card shadow="never" class="welcome">
      <div class="welcome-inner">
        <img :src="avatar" class="avatar" alt="avatar" />
        <div class="hello">
          <div class="title">你好，{{ trueName || '管理员' }}</div>
          <div class="sub">欢迎使用 Gleam 管理中心</div>
        </div>
      </div>
    </el-card>

    <el-row v-loading="statsLoading" :gutter="16" class="stat-row">
      <el-col v-for="card in cards" :key="card.key" :xs="24" :sm="8">
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

    <el-card v-loading="statisticsLoading" shadow="never" class="trend-card">
      <template #header>
        <div class="trend-header">
          <span class="font-title-medium">用户注册统计</span>
          <el-radio-group
            v-model="statisticsQueryType"
            size="small"
            @change="loadRegistrationStats"
          >
            <el-radio-button
              v-for="item in queryTypeOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div v-if="statisticsList.length" class="trend-list">
        <div v-for="item in statisticsList" :key="item.queryDate" class="trend-row">
          <span class="trend-date">{{ item.queryDate || '-' }}</span>
          <div class="trend-track">
            <div class="trend-bar" :style="{ width: getBarWidth(item.userCount) }" />
          </div>
          <span class="trend-count">{{ item.userCount ?? 0 }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无数据" :image-size="80" />
    </el-card>
  </div>
</template>

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
    border-radius: 8px;
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

.trend-card {
  margin-top: 4px;
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.trend-list {
  display: grid;
  gap: 12px;
}

.trend-row {
  display: grid;
  grid-template-columns: 120px minmax(120px, 1fr) 64px;
  align-items: center;
  gap: 12px;
  min-height: 24px;
}

.trend-date {
  color: #606266;
  font-size: 13px;
}

.trend-track {
  height: 8px;
  border-radius: 999px;
  background: #edf1f7;
  overflow: hidden;
}

.trend-bar {
  height: 100%;
  border-radius: 999px;
  background: #2274e7;
}

.trend-count {
  color: #303133;
  font-weight: 600;
  text-align: right;
}
</style>
