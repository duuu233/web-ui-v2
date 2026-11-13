<script setup name="intimgDevices">
// 设备内置图状态：按产品看每台设备 6 个槽位的整体状态；新设备天然「未推送」，可直接筛出来去新建推送任务
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IntimgPage from './components/IntimgPage.vue'
import DeviceFilters from './components/DeviceFilters.vue'
import IotError from '@/views/iot/components/IotError.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotResource } from '@/views/iot/useIotResource'
import { intimgApi, loadWifiProducts } from './service'
import { PAGE_SIZES, SLOT_TOTAL, buildDeviceQuery, outdatedSlotText, permission, productLabel, textOr, versionStateInfo } from './model'

const route = useRoute()
const router = useRouter()
const products = shallowRef([])
const productError = shallowRef('')
const productId = shallowRef('')
const emptyDraft = () => ({ versionState: '', online: null, registered: null, keyword: '' })
const draft = shallowRef(emptyDraft())
const applied = shallowRef(emptyDraft())
const page = shallowRef({ page: 1, size: 20 })

const query = computed(() => (productId.value ? buildDeviceQuery(productId.value, applied.value, page.value.page, page.value.size) : null))
const { data, loading, error, load } = useIotResource(signal => intimgApi.devices(query.value, signal), () => query.value, () => !!query.value)

function search() {
  applied.value = { ...draft.value }
  page.value = { ...page.value, page: 1 }
}
function reset() {
  draft.value = emptyDraft()
  search()
}
function changeProduct() {
  page.value = { ...page.value, page: 1 }
}

onMounted(async () => {
  try {
    products.value = await loadWifiProducts()
  } catch (cause) {
    productError.value = cause?.message || '产品列表加载失败'
    return
  }
  const wanted = String(route.query.productId || '')
  productId.value = products.value.some(item => String(item.productId) === wanted) ? wanted : products.value[0]?.productId ?? ''
})

function createTask() {
  const q = { productId: productId.value }
  for (const key of ['versionState', 'online', 'registered']) if (applied.value[key] !== '' && applied.value[key] !== null) q[key] = String(applied.value[key])
  router.push({ name: 'intimgTaskCreate', query: q })
}
</script>

<template>
  <IntimgPage title="设备内置图状态" subtitle="6 个槽位一起看：全部最新为「最新」，一个都没推送过为「未推送」，其余为「落后」" :loading="loading" @refresh="load">
    <template #actions>
      <el-button v-permission="[permission.createTask]" type="primary" :disabled="!productId" @click="createTask">按当前筛选新建推送任务</el-button>
    </template>
    <el-alert v-if="productError" :title="productError" type="error" show-icon :closable="false" class="iot-error" />
    <div class="intimg-toolbar">
      <span>产品</span>
      <el-select v-model="productId" style="width: 260px" placeholder="选择 WiFi 产品" @change="changeProduct">
        <el-option v-for="item in products" :key="item.productId" :value="item.productId" :label="productLabel(item)" />
      </el-select>
    </div>
    <DeviceFilters v-model="draft" @search="search" @reset="reset" />
    <IotError :error="error" @retry="load" />
    <section class="iot-data-card">
      <div class="iot-section-heading"><h2>设备 <span>{{ data?.total ?? '—' }}</span></h2><small>被推送任务占用的设备不可选，锁到期或任务结束后释放</small></div>
      <vxe-table :data="data?.list || []" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'deviceNo' }" :column-config="{ resizable: true }" max-height="560" empty-text="暂无设备">
        <vxe-column title="设备号" min-width="150"><template #default="{ row }"><span class="iot-mono">{{ row.deviceNo }}</span></template></vxe-column>
        <vxe-column title="备注" min-width="110" show-overflow><template #default="{ row }">{{ textOr(row.remark) }}</template></vxe-column>
        <vxe-column title="登记状态" width="100"><template #default="{ row }">{{ row.registered === false ? '已登记未激活' : '已激活' }}</template></vxe-column>
        <vxe-column title="在线" width="80"><template #default="{ row }"><el-tag size="small" :type="row.online ? 'success' : 'info'">{{ row.online ? '在线' : '离线' }}</el-tag></template></vxe-column>
        <vxe-column title="整体状态" width="100"><template #default="{ row }"><el-tag size="small" :type="versionStateInfo(row.state).tone">{{ versionStateInfo(row.state).text }}</el-tag></template></vxe-column>
        <vxe-column title="已推送" width="90"><template #default="{ row }">{{ textOr(row.pushedSlots) }}/{{ SLOT_TOTAL }}</template></vxe-column>
        <vxe-column title="落后槽位" min-width="180" show-overflow><template #default="{ row }"><span v-if="row.outdatedSlots">{{ row.outdatedSlots }} 个：{{ outdatedSlotText(row) }}</span><span v-else>—</span></template></vxe-column>
        <vxe-column title="可选" min-width="200"><template #default="{ row }">
          <span v-if="row.selectable !== false">可推送</span>
          <span v-else class="intimg-muted">推送中：{{ textOr(row.lockTaskNo) }}，到期 {{ textOr(row.lockExpireAt) }}</span>
        </template></vxe-column>
        <template #empty><el-empty description="暂无设备" :image-size="64"><el-button @click="reset">清空筛选</el-button></el-empty></template>
      </vxe-table>
      <PaginationBar :current-page="page.page" :page-size="page.size" :total="data?.total || 0" :page-sizes="PAGE_SIZES" @size-change="size => (page = { page: 1, size })" @current-change="value => (page = { ...page, page: value })" />
    </section>
  </IntimgPage>
</template>
