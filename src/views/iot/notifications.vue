<script setup name="iotNotifications">
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import IotPage from './components/IotPage.vue'
import IotError from './components/IotError.vue'
import IotFilters from './components/IotFilters.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotList } from './useIotList'
import { displayDeviceNo, notificationCategory, notificationLangs, payloadText, shanghaiTime, valueText } from './model'
const router = useRouter()
const { data, loading, error, updatedAt, load, draft, params, validationError, search, reset, setPage, setSize } = useIotList('notifications', 'iotNotifications')
// 重置后没有设备号：不请求，也不显示上一台设备的结果
const queried = computed(() => !!params.value.deviceNo)
const rows = computed(() => queried.value ? data.value?.list || [] : [])
const total = computed(() => queried.value ? data.value?.total ?? null : null)
const pages = computed(() => Math.max(1, Math.ceil((total.value || 0) / params.value.size)))
const langLabel = computed(() => notificationLangs.find(x => x.value === params.value.lang)?.label || params.value.lang)
const current = shallowRef(null)
const drawerOpen = computed({ get: () => !!current.value, set: value => { if (!value) current.value = null } })
function refresh() { if (queried.value) load() }
function openDevice() { current.value = null; router.push({ name: 'iotDeviceDetail', params: { deviceNo: params.value.deviceNo } }) }
</script>
<template>
  <IotPage title="消息通知查询" subtitle="按设备查看服务端产生的全部消息通知，按时间倒序" :loading="loading" :updated-at="updatedAt" @refresh="refresh">
    <IotFilters v-model="draft" kind="notifications" @search="search" @reset="reset" />
    <el-alert v-if="validationError" :title="validationError" type="warning" :closable="false" class="iot-error" />
    <IotError :error="error" @retry="load" />
    <section class="iot-data-card">
      <div class="iot-section-heading">
        <h2>消息通知 <span>{{ total ?? '—' }}</span></h2>
        <small v-if="queried">设备 <span class="iot-mono">{{ displayDeviceNo(params.deviceNo) }}</span> · {{ langLabel }} · 第 {{ params.page }} / {{ pages }} 页 · 点击行查看详情</small>
        <small v-else>输入设备号后查询</small>
      </div>
      <vxe-table :data="rows" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'id' }" :column-config="{ resizable: true }" max-height="560" @cell-click="({ row }) => (current = row)">
        <vxe-column field="id" title="ID" width="80"><template #default="{ row }"><span class="iot-mono">{{ valueText(row.id) }}</span></template></vxe-column>
        <vxe-column title="时间" width="175"><template #default="{ row }">{{ shanghaiTime(row.createdAt) }}</template></vxe-column>
        <vxe-column title="类别" width="90"><template #default="{ row }"><el-tag :type="notificationCategory(row.category).tone" effect="light" size="small">{{ notificationCategory(row.category).label }}</el-tag></template></vxe-column>
        <vxe-column title="消息类型" min-width="190" show-overflow><template #default="{ row }"><span class="iot-mono">{{ valueText(row.type) }}</span></template></vxe-column>
        <vxe-column title="标题" min-width="140" show-overflow><template #default="{ row }"><strong>{{ valueText(row.title) }}</strong></template></vxe-column>
        <vxe-column title="内容" min-width="240" show-overflow><template #default="{ row }">{{ valueText(row.content) }}</template></vxe-column>
        <vxe-column title="payload" min-width="220" show-overflow><template #default="{ row }"><span class="iot-mono">{{ payloadText(row.payload) }}</span></template></vxe-column>
        <template #empty><el-empty :description="queried ? '没有查询到消息' : '请输入设备号后查询'" :image-size="64" /></template>
      </vxe-table>
      <PaginationBar :current-page="params.page" :page-size="params.size" :total="total || 0" :page-sizes="[20, 50, 100]" @size-change="setSize" @current-change="setPage" />
      <p class="iot-notification-note">返回该设备全部记录（含 App 端已隐藏的上下线抖动记录）；已读状态、未读数在后台不使用。</p>
    </section>
    <el-drawer v-model="drawerOpen" title="消息详情" size="min(460px, 92vw)" append-to-body>
      <template v-if="current">
        <dl class="iot-notification-kv">
          <dt>ID</dt><dd class="iot-mono">{{ valueText(current.id) }}</dd>
          <dt>时间</dt><dd class="iot-mono">{{ shanghaiTime(current.createdAt) }}</dd>
          <dt>设备号</dt><dd class="iot-mono"><el-button link type="primary" class="iot-mono" @click="openDevice">{{ displayDeviceNo(params.deviceNo) }}</el-button></dd>
          <dt>类别</dt><dd>{{ notificationCategory(current.category).label }}（{{ valueText(current.category) }}）</dd>
          <dt>类型</dt><dd class="iot-mono">{{ valueText(current.type) }}</dd>
          <dt>标题</dt><dd>{{ valueText(current.title) }}</dd>
          <dt>内容</dt><dd>{{ valueText(current.content) }}</dd>
        </dl>
        <p class="iot-notification-label">payload</p>
        <pre class="iot-log-full">{{ payloadText(current.payload, true) }}</pre>
      </template>
    </el-drawer>
  </IotPage>
</template>
