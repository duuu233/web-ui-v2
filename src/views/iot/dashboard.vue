<script setup name="iotDashboard">
import { computed, shallowRef, watch, onMounted, onActivated, onDeactivated, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IotPage from './components/IotPage.vue'
import IotError from './components/IotError.vue'
import { useIotResource } from './useIotResource'
import { iotGet } from './service'
import { recent24Hours, valueText } from './model'
const route = useRoute(), router = useRouter(), automatic = shallowRef(true)
const { data, loading, error, updatedAt, load } = useIotResource(signal => iotGet('/admin/stats', {}, signal), () => 'stats', () => route.name === 'iotDashboard')
const cards = computed(() => [
  { key: 'totalDevices', label: '设备总数', value: valueText(data.value?.totalDevices), unit: '台', note: '已登记的全部设备', target: { name: 'iotDevices' } },
  { key: 'onlineDevices', label: '在线设备', value: valueText(data.value?.onlineDevices), unit: '台', note: '查看当前在线设备', target: { name: 'iotDevices', query: { online: 'true' } } },
  { key: 'onlineRate', label: '在线率', value: data.value?.onlineRate == null ? '—' : Number(data.value.onlineRate).toFixed(1), unit: '%', note: '在线设备 / 设备总数' },
  { key: 'activeDevices7d', label: '7 日活跃', value: valueText(data.value?.activeDevices7d), unit: '台', note: '最近7天有上线记录', target: { name: 'iotDevices' } },
  { key: 'alarmCount24h', label: '24h 告警', value: valueText(data.value?.alarmCount24h), unit: '条', note: '查看最近24小时告警日志', target: { name: 'iotLogs', query: { category: 'ALARM', ...recent24Hours() } } }
])
let timer
function stop() { clearInterval(timer); timer = null }
function start() { stop(); if (automatic.value && route.name === 'iotDashboard') timer = setInterval(() => { if (!loading.value) load() }, 60000) }
watch(() => [automatic.value, route.name], start)
onMounted(start); onActivated(start); onDeactivated(stop); onBeforeUnmount(stop)
</script>
<template>
  <IotPage title="设备概览" subtitle="掌握设备规模、连接状态与最近告警" :loading="loading" :updated-at="updatedAt" @refresh="load">
    <IotError :error="error" @retry="load" />
    <div class="iot-overview-band"><div><strong>连接概况</strong><span>在线数据约 60 秒延迟，统计值以服务端为准</span></div><el-switch v-model="automatic" active-text="每60秒自动刷新" /></div>
    <el-skeleton v-if="loading && !data" animated class="iot-stat-grid"><template #template><div v-for="n in 5" :key="n" class="iot-stat-card"><el-skeleton-item variant="text" style="width: 70px" /><el-skeleton-item variant="h1" style="margin: 20px 0" /><el-skeleton-item variant="text" /></div></template></el-skeleton>
    <div v-else class="iot-stat-grid"><button v-for="card in cards" :key="card.key" class="iot-stat-card" :class="{ 'iot-stat-card--online': card.key === 'onlineDevices', 'iot-stat-card--alarm': card.key === 'alarmCount24h', 'is-static': !card.target }" :disabled="!card.target" @click="card.target && router.push(card.target)"><span class="iot-stat-label">{{ card.label }}</span><strong>{{ card.value }}<small>{{ card.unit }}</small></strong><span class="iot-stat-note">{{ card.note }} <span v-if="card.target">↗</span></span></button></div>
    <section class="iot-summary"><div><span class="iot-eyebrow">运维工作台</span><h2>从设备状态，追溯到每一条日志。</h2><p>查看单台设备的实时状态、影子与最近活动，或按时间与分类定位问题。</p></div><div class="iot-summary-actions"><el-button type="primary" @click="router.push({ name: 'iotDevices' })">查看设备</el-button><el-button @click="router.push({ name: 'iotLogs' })">查询日志</el-button></div></section>
  </IotPage>
</template>
