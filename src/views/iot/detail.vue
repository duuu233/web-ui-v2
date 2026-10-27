<script setup name="iotDeviceDetail">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IotPage from './components/IotPage.vue'
import IotError from './components/IotError.vue'
import IotValue from './components/IotValue.vue'
import IotShadow from './components/IotShadow.vue'
import IotLogsTable from './components/IotLogsTable.vue'
import { useIotResource } from './useIotResource'
import { iotGet } from './service'
import { displayDeviceNo, normalizeDeviceNo, shanghaiTime, valueText } from './model'
const props = defineProps({ deviceNo: { type: String, required: true } })
const route = useRoute(), router = useRouter()
const { data, loading, error, updatedAt, load } = useIotResource(async signal => {
  let deviceNo
  try { deviceNo = normalizeDeviceNo(props.deviceNo, true) } catch (error) { error.code = 4000; throw error }
  return iotGet('/admin/device/detail', { deviceNo }, signal)
}, () => props.deviceNo, () => route.name === 'iotDeviceDetail' && route.params.deviceNo === props.deviceNo)
const mismatch = computed(() => typeof data.value?.online === 'boolean' && typeof data.value?.onlineRealtime === 'boolean' && data.value.online !== data.value.onlineRealtime)
const recent = computed(() => [...(data.value?.recentLogs || [])].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')) || Number(b.id) - Number(a.id)).slice(0, 20))
function logs() { router.push({ name: 'iotLogs', query: { deviceNo: normalizeDeviceNo(props.deviceNo, true) } }) }
</script>
<template>
  <IotPage :title="'设备 ' + displayDeviceNo(deviceNo)" subtitle="设备表状态、实时连接、影子数据与最近活动" :loading="loading" :updated-at="updatedAt" @refresh="load">
    <div class="iot-detail-actions"><el-button icon="ArrowLeft" @click="router.push({ name: 'iotDevices' })">返回设备列表</el-button><el-button type="primary" :disabled="!data" @click="logs">查看全部日志</el-button></div>
    <IotError :error="error" @retry="load" />
    <el-skeleton v-if="loading && !data" :rows="9" animated class="iot-data-card" />
    <template v-if="data">
      <el-alert v-if="mismatch" title="设备表状态可能滞后，实时状态来自 Redis" type="warning" show-icon :closable="false" class="iot-error" />
      <div class="iot-detail-grid"><section class="iot-data-card"><h2>基本信息</h2><dl><dt>设备号</dt><dd class="iot-mono">{{ displayDeviceNo(data.deviceNo) }}</dd><dt>产品型号</dt><dd>{{ valueText(data.productModel) }}</dd><dt>固件版本</dt><dd class="iot-mono">{{ valueText(data.firmwareVersion) }}</dd><dt>创建时间</dt><dd>{{ shanghaiTime(data.createdAt) }}</dd><dt>更新时间</dt><dd>{{ shanghaiTime(data.updatedAt) }}</dd></dl></section><section class="iot-data-card"><h2>在线信息</h2><dl><dt>设备表状态</dt><dd><IotValue kind="online" :value="data.online" /></dd><dt>实时状态</dt><dd><IotValue kind="online" :value="data.onlineRealtime" /></dd><dt>最近上线</dt><dd>{{ shanghaiTime(data.lastOnlineAt) }}</dd><dt>状态更新时间</dt><dd>{{ shanghaiTime(data.onlineUpdatedAt) }}</dd></dl></section></div>
      <section class="iot-data-card"><div class="iot-section-heading"><h2>设备影子</h2><small>完整保留已上报字段</small></div><IotShadow :shadow="data.shadow || {}" /></section>
      <section class="iot-data-card"><div class="iot-section-heading"><h2>最近活动 <span>{{ recent.length }}</span></h2><small>最多20条 · 时间倒序</small></div><IotLogsTable :rows="recent" compact /></section>
    </template>
  </IotPage>
</template>
