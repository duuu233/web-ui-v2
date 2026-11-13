<script setup name="intimgSlots">
// 槽位管理：每个 WiFi 产品固定 6 个槽位；上传即渲染（版本 +1），「重新渲染」按当前参数重生成
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import IntimgPage from './components/IntimgPage.vue'
import ProductCards from './components/ProductCards.vue'
import IotError from '@/views/iot/components/IotError.vue'
import { useIotResource } from '@/views/iot/useIotResource'
import { intimgApi, loadWifiProducts, errorText } from './service'
import { prepareSlotImage } from './image'
import { SLOTS, SLOT_STATUS, permission, productRenderParams, readyPrefixLimit, slotName, textOr, uploadFields } from './model'

const route = useRoute()
const products = shallowRef([])
const productError = shallowRef('')
const summary = shallowRef({})
const productId = shallowRef('')

const product = computed(() => products.value.find(item => String(item.productId) === String(productId.value)) || null)
const params = computed(() => productRenderParams(product.value))

const { data, loading, error, load } = useIotResource(
  signal => intimgApi.slots(productId.value, signal),
  () => productId.value,
  () => !!productId.value
)
// 接口固定返回 6 个；按固定顺序对齐，缺的补未配置占位
const slots = computed(() => {
  const list = Array.isArray(data.value) ? data.value : []
  return SLOTS.map(slot => list.find(item => item.slotKey === slot.key) || { slotKey: slot.key, slotName: slot.name, status: 'RENDERING_DISABLED', version: 0 })
})
const limit = computed(() => readyPrefixLimit(slots.value))

async function loadProducts(force = false) {
  try {
    products.value = await loadWifiProducts(force)
    productError.value = ''
  } catch (cause) {
    productError.value = cause?.message || '产品列表加载失败'
    return
  }
  const wanted = String(route.query.productId || '')
  if (!products.value.some(item => String(item.productId) === String(productId.value))) {
    productId.value = products.value.some(item => String(item.productId) === wanted) ? wanted : products.value[0]?.productId ?? ''
  }
  await loadSummary()
}

async function loadSummary() {
  if (!products.value.length) return
  try {
    const rows = await intimgApi.slotSummary(products.value.map(item => item.productId))
    summary.value = Object.fromEntries((rows || []).map(row => [String(row.productId), row]))
  } catch {
    // 汇总查不到只影响 x/6 展示
  }
}

function refresh() {
  loadProducts(true)
  load()
}

onMounted(() => loadProducts())
watch(() => route.query.productId, value => {
  if (value && products.value.some(item => String(item.productId) === String(value))) productId.value = value
})

// ── 上传 / 替换 ──
const fileInput = shallowRef(null)
const uploadSlotKey = shallowRef('')
const pending = shallowRef(null) // { slotKey, file, previewUrl, sourceWidth, sourceHeight, rotation }
const uploading = shallowRef(false)

function pickFile(slot) {
  if (params.value.error) {
    ElMessage.warning(params.value.error)
    return
  }
  uploadSlotKey.value = slot.slotKey
  fileInput.value.value = ''
  fileInput.value.click()
}

async function onFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const prepared = await prepareSlotImage(file, params.value)
    clearPending()
    pending.value = { slotKey: uploadSlotKey.value, ...prepared }
  } catch (cause) {
    ElMessage.error(cause.message)
  }
}

function clearPending() {
  if (pending.value?.previewUrl) URL.revokeObjectURL(pending.value.previewUrl)
  pending.value = null
}

async function confirmUpload() {
  const item = pending.value
  if (!item || uploading.value) return
  uploading.value = true
  try {
    const slot = await intimgApi.uploadSlot(productId.value, item.slotKey, item.file, uploadFields(params.value))
    ElMessage.success(`「${slotName(item.slotKey)}」已上传并渲染，版本 v${textOr(slot?.version)}`)
    clearPending()
    load()
    loadSummary()
  } catch (cause) {
    ElMessage.error(errorText(cause))
  } finally {
    uploading.value = false
  }
}

// ── 重新渲染 ──
const rendering = shallowRef('')
async function render(slot) {
  try {
    await ElMessageBox.confirm(`源图不变，按产品当前参数重新生成「${slotName(slot.slotKey)}」，版本 +1。已推送的设备需要重新推送才会更新。`, '重新渲染', { type: 'warning', confirmButtonText: '重新渲染' })
  } catch {
    return
  }
  rendering.value = slot.slotKey
  try {
    const result = await intimgApi.renderSlot(productId.value, slot.slotKey)
    ElMessage.success(`已重新渲染，版本 v${textOr(result?.version)}，产物 ${textOr(result?.binSize)} 字节`)
    load()
  } catch (cause) {
    ElMessage.error(errorText(cause))
  } finally {
    rendering.value = ''
  }
}
</script>

<template>
  <IntimgPage title="槽位管理" subtitle="每个 WiFi 产品固定 6 个槽位；上传即渲染，替换即覆盖、版本 +1（没有删除槽位）" :loading="loading" @refresh="refresh">
    <el-alert v-if="productError" :title="productError" type="error" show-icon :closable="false" class="iot-error" />
    <ProductCards v-model="productId" :products="products" :summary="summary" />

    <section v-if="product" class="iot-data-card">
      <div class="iot-section-heading">
        <h2>{{ product.productName }} <span>{{ params.canvasWidth }} × {{ params.canvasHeight }} · {{ params.orientationText }} · {{ params.renderMode || '—' }}</span></h2>
        <small>可推送上限：{{ limit >= 0 ? SLOTS[limit].key : '无（FACTORY 未配置）' }}</small>
      </div>
      <el-alert v-if="params.error" :title="params.error" type="error" show-icon :closable="false" class="iot-error" />
      <p class="intimg-muted">
        上传图片宽高须等于产品尺寸 {{ params.canvasWidth }} × {{ params.canvasHeight }}（像素）；
        <template v-if="params.rotation">上传前按产品「{{ params.orientation === 'LANDSCAPE' ? '横向' : '竖向' }}旋转度数」{{ params.rotation }}° 旋转图片内容；</template>
        画布是否转 90° 由服务端按屏幕方向处理。
      </p>
      <IotError :error="error" @retry="load" />
      <div v-loading="loading" class="intimg-slots">
        <article v-for="slot in slots" :key="slot.slotKey" class="intimg-slot">
          <div class="intimg-thumb">
            <el-image v-if="slot.previewUrl || slot.sourceUrl" :src="slot.previewUrl || slot.sourceUrl" fit="contain" :preview-src-list="[slot.previewUrl || slot.sourceUrl]" preview-teleported />
            <span v-else>未配置</span>
          </div>
          <h4>
            <span class="iot-mono">{{ slot.slotKey }}</span> {{ slot.slotName || slotName(slot.slotKey) }}
            <el-tag size="small" :type="(SLOT_STATUS[slot.status] || SLOT_STATUS.RENDERING_DISABLED).tone">{{ (SLOT_STATUS[slot.status] || { text: textOr(slot.status) }).text }}</el-tag>
          </h4>
          <p>{{ slot.canvasWidth ? `${slot.canvasWidth}×${slot.canvasHeight}` : '—' }}　v{{ slot.version || 0 }}</p>
          <p>更新 {{ textOr(slot.updatedAt) }}　{{ textOr(slot.updatedBy, '') }}</p>
          <div class="intimg-slot-actions">
            <el-button v-permission="[permission.upload]" size="small" type="primary" :disabled="!!params.error" @click="pickFile(slot)">{{ slot.sourceUrl ? '替换' : '上传' }}</el-button>
            <el-button v-if="slot.sourceUrl" v-permission="[permission.render]" size="small" :loading="rendering === slot.slotKey" @click="render(slot)">重新渲染</el-button>
          </div>
        </article>
      </div>
    </section>

    <input ref="fileInput" type="file" accept="image/png,image/jpeg" hidden @change="onFile">

    <el-dialog :model-value="!!pending" title="确认上传" width="520px" :close-on-click-modal="false" @close="clearPending">
      <template v-if="pending">
        <p>槽位：<b>{{ pending.slotKey }} {{ slotName(pending.slotKey) }}</b>（替换即覆盖，版本 +1）</p>
        <p class="intimg-muted">
          原图 {{ pending.sourceWidth }} × {{ pending.sourceHeight }}<template v-if="pending.rotation">，已按产品旋转 {{ pending.rotation }}°</template>；
          渲染参数 {{ params.renderMode }} · {{ params.orientation }} · {{ params.canvasWidth }} × {{ params.canvasHeight }}
        </p>
        <div style="max-width: 240px; aspect-ratio: 3 / 4; margin: 10px auto; background: var(--el-fill-color-light); border-radius: 8px; overflow: hidden;"><el-image :src="pending.previewUrl" fit="contain" style="width: 100%; height: 100%;" /></div>
        <p class="intimg-muted">上传成功后槽位立即更新，设备要等推送任务下发后才会拿到新图。</p>
      </template>
      <template #footer>
        <el-button @click="clearPending">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="confirmUpload">上传并渲染</el-button>
      </template>
    </el-dialog>
  </IntimgPage>
</template>
