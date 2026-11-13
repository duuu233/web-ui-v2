<script setup name="intimgTaskCreate">
// 新建推送任务：① 选产品 → ② 选目标槽位（服务端自动补齐 FACTORY 起的前缀，这里实时展示实际下发清单）
// → ③ 选设备（逐台勾选，或「全选当前筛选结果」= selectAll + filter，不翻页收集）→ ④ 确认（写明清单与在线 / 离线台数）。
// 提交后立即返回 taskNo，跳任务列表，不等待。
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IntimgPage from './components/IntimgPage.vue'
import ProductCards from './components/ProductCards.vue'
import DeviceFilters from './components/DeviceFilters.vue'
import IotError from '@/views/iot/components/IotError.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotResource } from '@/views/iot/useIotResource'
import { intimgApi, loadWifiProducts, errorText } from './service'
import {
  PAGE_SIZES, SLOTS, SLOT_TOTAL, buildDeviceQuery, buildTaskPayload, manifestOf, manifestText, orderedTargets, permission,
  readyPrefixLimit, selectAllKeywordWarning, slotBlockReason, textOr, versionStateInfo
} from './model'

const route = useRoute()
const router = useRouter()

// ① 产品
const products = shallowRef([])
const productError = shallowRef('')
const summary = shallowRef({})
const productId = shallowRef('')
const slotsByProduct = shallowRef({}) // productId → 槽位列表（产品卡片的「SET 缺失」提示与链路判断用）

// ② 目标槽位
const targets = shallowRef([])
const slots = computed(() => slotsByProduct.value[String(productId.value)] || [])
const limit = computed(() => readyPrefixLimit(slots.value))
const manifest = computed(() => manifestOf(targets.value))
const slotOf = key => slots.value.find(slot => slot.slotKey === key) || { slotKey: key, status: 'RENDERING_DISABLED', version: 0 }

function toggleTarget(key) {
  if (slotBlockReason(slots.value, key)) return
  const set = new Set(targets.value)
  set.has(key) ? set.delete(key) : set.add(key)
  targets.value = orderedTargets([...set])
}
function nodeClass(key, index) {
  if (index > limit.value) return 'is-blocked'
  if (targets.value.includes(key)) return 'is-target'
  if (manifest.value.includes(key)) return 'is-auto'
  return ''
}
function nodeNote(key, index) {
  if (index > limit.value) return slotOf(key).status === 'READY' ? '不可更新' : '未配置'
  if (targets.value.includes(key)) return '目标'
  if (manifest.value.includes(key)) return '自动带上'
  return '可选'
}
function missingText(product) {
  const list = slotsByProduct.value[String(product.productId)]
  if (!list) return ''
  const missing = SLOTS.filter(slot => !list.some(item => item.slotKey === slot.key && item.status === 'READY')).map(slot => slot.key)
  return missing.length && missing.length < SLOT_TOTAL ? `（${missing.join('、')} 缺失）` : ''
}

// ③ 设备
const fromQuery = () => ({
  versionState: String(route.query.versionState || ''),
  online: route.query.online === 'true' ? true : route.query.online === 'false' ? false : null,
  registered: route.query.registered === 'true' ? true : route.query.registered === 'false' ? false : null,
  keyword: ''
})
const draft = shallowRef(fromQuery())
const applied = shallowRef(fromQuery())
const page = shallowRef({ page: 1, size: 20 })
const selectAll = shallowRef(false)
const selected = shallowRef(new Map()) // deviceNo → row（跨页保留）
const tableRef = shallowRef(null)

const query = computed(() => (productId.value ? buildDeviceQuery(productId.value, applied.value, page.value.page, page.value.size) : null))
const { data, loading, error, load } = useIotResource(signal => intimgApi.devices(query.value, signal), () => query.value, () => !!query.value)
const rows = computed(() => data.value?.list || [])
const busyOnPage = computed(() => rows.value.filter(row => row.selectable === false).length)
const keywordWarning = computed(() => (selectAll.value ? selectAllKeywordWarning(applied.value) : ''))

function search() {
  applied.value = { ...draft.value }
  page.value = { ...page.value, page: 1 }
}
function reset() {
  draft.value = { versionState: '', online: null, registered: null, keyword: '' }
  search()
}
const checkMethod = ({ row }) => !selectAll.value && row.selectable !== false
function onCheck({ row, checked }) {
  const next = new Map(selected.value)
  checked ? next.set(row.deviceNo, row) : next.delete(row.deviceNo)
  selected.value = next
}
function onCheckAll({ checked }) {
  const next = new Map(selected.value)
  for (const row of rows.value) if (row.selectable !== false) checked ? next.set(row.deviceNo, row) : next.delete(row.deviceNo)
  selected.value = next
}
// 翻页回来恢复勾选
watch(rows, async list => {
  await nextTick()
  const table = tableRef.value
  if (!table) return
  table.clearCheckboxRow()
  const checked = list.filter(row => selected.value.has(row.deviceNo) && row.selectable !== false)
  if (checked.length) table.setCheckboxRow(checked, true)
})
watch(selectAll, value => {
  if (value) tableRef.value?.clearCheckboxRow()
  else watchRestore()
})
function watchRestore() {
  const checked = rows.value.filter(row => selected.value.has(row.deviceNo))
  if (checked.length) tableRef.value?.setCheckboxRow(checked, true)
}
function clearSelection() {
  selected.value = new Map()
  tableRef.value?.clearCheckboxRow()
}

// 换产品：目标槽位、勾选设备都清空
watch(productId, async id => {
  targets.value = []
  clearSelection()
  page.value = { ...page.value, page: 1 }
  if (id && !slotsByProduct.value[String(id)]) await loadSlots(id)
})

async function loadSlots(id) {
  try {
    const list = await intimgApi.slots(id)
    slotsByProduct.value = { ...slotsByProduct.value, [String(id)]: Array.isArray(list) ? list : [] }
  } catch (cause) {
    ElMessage.error(`槽位查询失败：${errorText(cause)}`)
  }
}

async function init(force = false) {
  try {
    products.value = await loadWifiProducts(force)
    productError.value = ''
  } catch (cause) {
    productError.value = cause?.message || '产品列表加载失败'
    return
  }
  try {
    const list = await intimgApi.slotSummary(products.value.map(item => item.productId))
    summary.value = Object.fromEntries((list || []).map(row => [String(row.productId), row]))
  } catch {
    // 汇总只影响 x/6 展示
  }
  // 各产品槽位并行拉一次：卡片上标出缺哪个槽位
  await Promise.all(products.value.map(item => loadSlots(item.productId)))
  const wanted = String(route.query.productId || '')
  if (!productId.value) productId.value = products.value.some(item => String(item.productId) === wanted) ? wanted : products.value[0]?.productId ?? ''
}
onMounted(() => init())

function refresh() {
  slotsByProduct.value = {}
  init(true).then(() => productId.value && loadSlots(productId.value))
  load()
}

// ④ 确认
const confirmVisible = shallowRef(false)
const counting = shallowRef(false)
const counts = shallowRef({ total: 0, online: 0, offline: 0, exact: true })
const submitting = shallowRef(false)
const selectedCount = computed(() => (selectAll.value ? data.value?.total ?? 0 : selected.value.size))

async function openConfirm() {
  if (!targets.value.length) return ElMessage.warning('请至少选择一个目标槽位')
  if (keywordWarning.value) return ElMessage.warning(keywordWarning.value)
  if (!selectedCount.value) return ElMessage.warning(selectAll.value ? '当前筛选结果没有设备' : '请至少选择一台设备')
  if (!selectAll.value) {
    const list = [...selected.value.values()]
    const online = list.filter(row => row.online).length
    counts.value = { total: list.length, online, offline: list.length - online, exact: true }
    confirmVisible.value = true
    return
  }
  // 全选：按同一筛选分别查在线 / 离线总数
  counting.value = true
  try {
    const base = { ...applied.value, keyword: '' }
    const totalOf = async online => (applied.value.online !== null && applied.value.online !== online ? 0 : Number((await intimgApi.devices(buildDeviceQuery(productId.value, { ...base, online }, 1, 20)))?.total) || 0)
    const [online, offline] = await Promise.all([totalOf(true), totalOf(false)])
    counts.value = { total: data.value?.total ?? online + offline, online, offline, exact: true }
  } catch {
    counts.value = { total: data.value?.total ?? 0, online: 0, offline: 0, exact: false }
  } finally {
    counting.value = false
  }
  confirmVisible.value = true
}

async function submit() {
  if (submitting.value) return
  let payload
  try {
    payload = buildTaskPayload({ productId: productId.value, targets: targets.value, selectAll: selectAll.value, deviceNos: [...selected.value.keys()], draft: applied.value })
  } catch (cause) {
    return ElMessage.warning(cause.message)
  }
  submitting.value = true
  try {
    const result = await intimgApi.createTask(payload)
    ElMessage.success(`推送任务 ${textOr(result?.taskNo)} 已创建，共 ${textOr(result?.total)} 台；推送在后台执行，可离开页面`)
    confirmVisible.value = false
    clearSelection()
    router.push({ name: 'intimgTasks', query: { productId: String(productId.value) } })
  } catch (cause) {
    ElMessage.error(errorText(cause))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <IntimgPage title="新建推送任务" subtitle="选产品 → 选目标槽位 → 选设备 → 确认；提交后异步执行，可离开页面" :loading="loading" @refresh="refresh">
    <el-alert v-if="productError" :title="productError" type="error" show-icon :closable="false" class="iot-error" />

    <section class="iot-data-card intimg-step">
      <h2>① 选择产品</h2>
      <ProductCards v-model="productId" :products="products" :summary="summary" :extra="missingText" />
    </section>

    <section v-if="productId" class="iot-data-card intimg-step">
      <h2>② 选择目标槽位 <span class="intimg-muted">可更新上限：{{ limit >= 0 ? SLOTS[limit].key : '无' }}</span></h2>
      <p class="intimg-muted">勾选本次要更新的槽位；服务端会自动把它前面的槽位一起下发。超过「连续已配置前缀」的槽位不可选。</p>
      <div class="intimg-chain">
        <template v-for="(slot, index) in SLOTS" :key="slot.key">
          <el-tooltip :disabled="!slotBlockReason(slots, slot.key)" :content="slotBlockReason(slots, slot.key)" placement="top">
            <div class="intimg-chain-node" :class="nodeClass(slot.key, index)">
              <el-checkbox :model-value="targets.includes(slot.key)" :disabled="!!slotBlockReason(slots, slot.key)" @change="toggleTarget(slot.key)">
                <span class="iot-mono">{{ slot.key }}</span>
              </el-checkbox>
              <small>{{ slot.name }} · {{ slotOf(slot.key).status === 'READY' ? `v${slotOf(slot.key).version}` : '未配置' }}</small>
              <small>{{ nodeNote(slot.key, index) }}</small>
            </div>
          </el-tooltip>
          <span v-if="index < SLOTS.length - 1" class="intimg-chain-arrow">→</span>
        </template>
      </div>
      <el-alert v-if="limit < 0" title="FACTORY（出厂图）未配置，这个产品还不能推送，请先到「槽位管理」上传" type="warning" show-icon :closable="false" />
      <el-alert v-else-if="limit < SLOTS.length - 1" :title="slotBlockReason(slots, SLOTS[limit + 1].key) + `；配置完成前只能更新到 ${SLOTS[limit].key}`" type="info" show-icon :closable="false" />
      <div class="intimg-manifest" style="margin-top: 10px">
        实际下发清单：
        <template v-if="manifest.length">
          <b>{{ manifestText(manifest, slots) }}</b>
          （共 {{ manifest.length }} 个槽位<template v-if="manifest.length > targets.length">；{{ manifest.filter(key => !targets.includes(key)).join('、') }} 未勾选，按链路规则自动带上</template>）
        </template>
        <span v-else class="intimg-muted">尚未选择</span>
      </div>
    </section>

    <section v-if="productId" class="iot-data-card intimg-step">
      <h2>③ 选择设备</h2>
      <DeviceFilters v-model="draft" @search="search" @reset="reset" />
      <div class="intimg-toolbar">
        <el-checkbox v-model="selectAll">全选当前筛选结果（{{ data?.total ?? 0 }} 台）</el-checkbox>
        <span class="intimg-muted">
          已选 <b>{{ selectedCount }}</b> 台<template v-if="busyOnPage"> · 本页推送中 {{ busyOnPage }} 台已置灰</template>
          <template v-if="selectAll"> · 全选按筛选条件提交，被占用的设备会跳过</template>
        </span>
        <el-button v-if="!selectAll && selected.size" link type="primary" @click="clearSelection">清空已选</el-button>
      </div>
      <el-alert v-if="keywordWarning" :title="keywordWarning" type="warning" show-icon :closable="false" class="iot-error" />
      <IotError :error="error" @retry="load" />
      <vxe-table
        ref="tableRef"
        :data="rows"
        :loading="loading"
        border
        round
        stripe
        :row-config="{ isHover: true, keyField: 'deviceNo' }"
        :checkbox-config="{ checkMethod }"
        max-height="480"
        empty-text="暂无设备"
        @checkbox-change="onCheck"
        @checkbox-all="onCheckAll"
      >
        <vxe-column type="checkbox" width="50" />
        <vxe-column title="设备号" min-width="150"><template #default="{ row }"><span class="iot-mono">{{ row.deviceNo }}</span></template></vxe-column>
        <vxe-column title="备注" min-width="100" show-overflow><template #default="{ row }">{{ textOr(row.remark) }}</template></vxe-column>
        <vxe-column title="在线" width="80"><template #default="{ row }"><el-tag size="small" :type="row.online ? 'success' : 'info'">{{ row.online ? '在线' : '离线' }}</el-tag></template></vxe-column>
        <vxe-column title="已推送" width="140"><template #default="{ row }">{{ textOr(row.pushedSlots) }}/{{ SLOT_TOTAL }} <el-tag size="small" :type="versionStateInfo(row.state).tone">{{ versionStateInfo(row.state).text }}</el-tag></template></vxe-column>
        <vxe-column title="可选性" min-width="200"><template #default="{ row }">
          <span v-if="row.selectable !== false">{{ row.state === 'LATEST' ? '可推送（重复推）' : '可推送' }}</span>
          <span v-else class="intimg-muted">推送中：{{ textOr(row.lockTaskNo) }}，到期 {{ textOr(row.lockExpireAt) }}</span>
        </template></vxe-column>
      </vxe-table>
      <PaginationBar :current-page="page.page" :page-size="page.size" :total="data?.total || 0" :page-sizes="PAGE_SIZES" @size-change="size => (page = { page: 1, size })" @current-change="value => (page = { ...page, page: value })" />
    </section>

    <section v-if="productId" class="iot-data-card intimg-step">
      <h2>④ 确认提交</h2>
      <el-button v-permission="[permission.createTask]" type="primary" :loading="counting" @click="openConfirm">确认推送…</el-button>
    </section>

    <el-dialog v-model="confirmVisible" title="确认推送" width="520px" :close-on-click-modal="false">
      <p>将覆盖 <b>{{ counts.total }}</b> 台设备的 <b>{{ manifest.join(' / ') }}</b> 共 {{ manifest.length }} 个槽位
        <template v-if="counts.exact">（在线 {{ counts.online }} 台，离线 {{ counts.offline }} 台）</template><template v-else>（在线 / 离线台数查询失败）</template>。</p>
      <p>实际下发清单：<b>{{ manifestText(manifest, slots) }}</b></p>
      <p style="color: var(--el-color-warning-dark-2)">离线设备进入待补发，7 天内上线自动补，超期失效。覆盖后无法自动恢复。</p>
      <p v-if="selectAll" style="color: var(--el-text-color-secondary); font-size: 12px">按当前筛选条件全选提交；创建时被其它任务占用的设备记为「设备忙」。</p>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">确认推送</el-button>
      </template>
    </el-dialog>
  </IntimgPage>
</template>
