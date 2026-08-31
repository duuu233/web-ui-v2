<script setup name="home">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { getStatisticsOrder, getStatisticsUser, getUserCount } from '@/api/home'
import { getCookie } from '@/utils/support'
import avatar from '@/assets/images/user.png'
import AnalyticsChartCard from './components/AnalyticsChartCard.vue'
import {
  createOrderCountOption,
  createRegistrationBarOption
} from './chartOptions'

const trueName = shallowRef(getCookie('trueName') || '')
const statsLoading = shallowRef(false)
const statisticsLoading = shallowRef(false)
const statisticsQueryType = shallowRef(0)
const statisticsList = ref([])
const orderStatisticsLoading = shallowRef(false)
const orderStatisticsQueryType = shallowRef(0)
const orderStatisticsList = ref([])

const stats = reactive({
  userCount: '-',
  userBindProductCount: '-',
  orderAmount: '-',
  productCount: '-',
  productFaqCount: '-'
})

const cards = computed(() => [
  {
    key: 'userCount',
    label: '用户总数',
    value: stats.userCount,
    icon: 'User',
    span: 8
  },
  {
    key: 'userBindProductCount',
    label: '绑定设备',
    value: stats.userBindProductCount,
    icon: 'Connection',
    span: 8
  },
  {
    key: 'orderAmount',
    label: '订单金额',
    value: stats.orderAmount,
    icon: 'Wallet',
    span: 8
  },
  {
    key: 'productCount',
    label: '产品数量',
    value: stats.productCount,
    icon: 'Goods',
    span: 6
  },
  {
    key: 'productFaqCount',
    label: '常见问题',
    value: stats.productFaqCount,
    icon: 'QuestionFilled',
    span: 6
  }
])

const registrationChartOption = computed(() =>
  createRegistrationBarOption(statisticsList.value)
)
const orderStatisticsChartOption = computed(() =>
  createOrderCountOption(orderStatisticsList.value)
)

function formatCount(value) {
  return value ?? '-'
}

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await getUserCount()
    const data = res.retData || {}
    stats.userCount = formatCount(data.userCount)
    stats.userBindProductCount = formatCount(data.userBindProductCount)
    stats.orderAmount = formatCount(data.orderAmount)
    stats.productCount = formatCount(data.productCount)
    stats.productFaqCount = formatCount(data.productFaqCount)
  } finally {
    statsLoading.value = false
  }
}

async function loadRegistrationStats(queryType = statisticsQueryType.value) {
  statisticsLoading.value = true
  try {
    const res = await getStatisticsUser({
      queryType: Number(queryType)
    })
    statisticsList.value = Array.isArray(res.retData) ? res.retData : []
  } finally {
    statisticsLoading.value = false
  }
}

async function loadOrderStatistics(queryType = orderStatisticsQueryType.value) {
  orderStatisticsLoading.value = true
  try {
    const res = await getStatisticsOrder({
      queryType: Number(queryType)
    })
    orderStatisticsList.value = Array.isArray(res.retData) ? res.retData : []
  } finally {
    orderStatisticsLoading.value = false
  }
}

onMounted(() => {
  loadStats()
  loadRegistrationStats()
  loadOrderStatistics()
})
</script>

<template>
  <div class="app-container home">
    <el-card shadow="never" class="welcome">
      <div class="welcome-inner">
        <img :src="avatar" class="avatar" alt="avatar" />
        <div class="hello">
          <div class="title">你好，{{ trueName || '管理员' }}</div>
          <div class="sub">欢迎使用 曝石相框 管理中心</div>
        </div>
      </div>
    </el-card>

    <el-row v-loading="statsLoading" :gutter="16" class="stat-row">
      <el-col v-for="card in cards" :key="card.key" :xs="24" :sm="12" :md="card.span">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <section class="analytics-grid" aria-label="首页经营报表">
      <AnalyticsChartCard
        v-model:range="statisticsQueryType"
        title="用户注册统计"
        eyebrow="USER GROWTH"
        description="按注册日期查看新增用户数量"
        :option="registrationChartOption"
        :has-data="statisticsList.length > 0"
        :loading="statisticsLoading"
        empty-description="暂无注册数据"
        aria-label="用户注册数量柱状图"
        @range-change="loadRegistrationStats"
      />

      <AnalyticsChartCard
        v-model:range="orderStatisticsQueryType"
        title="订单统计"
        eyebrow="ORDER VOLUME"
        description="按订单日期查看订单数量变化趋势"
        :option="orderStatisticsChartOption"
        :has-data="orderStatisticsList.length > 0"
        :loading="orderStatisticsLoading"
        empty-description="暂无订单数据"
        aria-label="订单数量趋势图"
        accent="success"
        @range-change="loadOrderStatistics"
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  margin-top: 16px;
}

.welcome {
  position: relative;
  overflow: hidden;

  &::after {
    position: absolute;
    top: -52px;
    right: -52px;
    width: 170px;
    height: 170px;
    border: 26px solid var(--brand-50);
    border-radius: 50%;
    content: '';
    pointer-events: none;
  }
}

.welcome-inner {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;

  .avatar {
    width: 60px;
    height: 60px;
    border: 4px solid var(--brand-50);
    border-radius: 16px;
    margin-right: 18px;
  }

  .title {
    font-size: 20px;
    color: var(--app-ink);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .sub {
    font-size: 13px;
    color: var(--app-text);
    margin-top: 6px;
  }
}

.stat-row {
  margin-top: 18px;
}

.stat-card {
  margin-bottom: 16px;
  min-height: 118px;
  transition:
    transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(43, 39, 36, 0.07);
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    min-height: 116px;
    padding: 20px 22px;
  }

  // 三块实心饱和橙是首页最刺眼的部分。改成品牌浅底 + 品牌深色图标：
  // 同样能认出品牌，但橙色面积和亮度都降下来了。
  .stat-icon {
    width: 54px;
    height: 54px;
    border-radius: 15px;
    border: 1px solid var(--brand-100);
    background: var(--brand-50);
    color: var(--brand-600);
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--app-ink);
    letter-spacing: -0.03em;
  }

  .stat-label {
    font-size: 13px;
    color: var(--app-text);
    margin-top: 4px;
  }
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 2px;
  padding-bottom: 24px;
}

@media (max-width: 1180px) {
  .analytics-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
