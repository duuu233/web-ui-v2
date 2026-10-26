<script setup name="ProductDeviceEditor">
import { computed, nextTick, onActivated, onDeactivated, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader/index.vue'
import { getProductList } from '@/api/productList'
import { invalidateList } from '@/composables/useListRefresh'
import { getProductDeviceDetail, addProductDevice, editProductDevice } from '@/api/productDevice'
import { defaultDevice, buildDevicePayload, parseDeviceId, recordId as getRecordId, fetchWifiProducts, permission } from '../model'

const props = defineProps({ mode: { type: String, required: true }, recordId: { type: [String, Number], default: null } })
const router = useRouter()
const readonly = computed(() => props.mode === 'detail')
const title = computed(() => ({ add: '新增产品设备', edit: '编辑产品设备', detail: '产品设备详情' })[props.mode] || '产品设备')
const formRef = ref(null)
const form = reactive(defaultDevice())
const products = ref([])
const detail = ref({})
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const disabled = computed(() => loading.value || saving.value || !!loadError.value || readonly.value)
const selectedAvailable = computed(() => products.value.some(item => item.productId === form.productId))
const selectedProductName = computed(() => products.value.find(item => item.productId === form.productId)?.productName || ('产品 #' + (form.productId ?? '—')))
const rules = {
  productId: [{ required: true, message: '请选择 WiFi 产品', trigger: 'change' }],
  deviceId: [{ required: true, whitespace: true, message: '请输入设备ID', trigger: 'blur' }, { max: 50, message: '设备ID最多50个字符', trigger: 'blur' }]
}
let generation = 0
let active = true
let firstActivation = true

async function initialize() {
  const seq = ++generation
  Object.assign(form, defaultDevice())
  detail.value = {}; products.value = []; loadError.value = ''; saving.value = false; loading.value = false
  formRef.value?.clearValidate()
  if (!['add', 'edit', 'detail'].includes(props.mode)) { loadError.value = '页面模式无效'; return }
  const id = parseDeviceId(props.recordId)
  if (props.mode !== 'add' && id === null) { loadError.value = '产品设备记录ID无效，请从列表重新进入'; return }
  loading.value = true
  try {
    const [options, response] = await Promise.all([
      fetchWifiProducts(getProductList),
      props.mode === 'add' ? Promise.resolve(null) : getProductDeviceDetail({ id })
    ])
    if (seq !== generation || !active) return
    products.value = options
    if (response) {
      if (!response.retData || getRecordId(response.retData) !== id) throw new Error('设备详情缺失或与当前记录ID不一致')
      detail.value = response.retData
      form.productId = parseDeviceId(detail.value.productId)
      form.deviceId = detail.value.deviceId ?? ''
    }
    await nextTick()
    if (seq === generation && active) formRef.value?.clearValidate()
  } catch (error) { if (seq === generation && active) loadError.value = error?.message || '加载失败，请重试' }
  finally { if (seq === generation) loading.value = false }
}
async function save() {
  if (disabled.value || !formRef.value) return
  const seq = generation
  saving.value = true
  try {
    if (!await formRef.value.validate().catch(() => false) || seq !== generation || !active) return
    if (!selectedAvailable.value) { ElMessage.error('请选择当前列表中的 WiFi 产品'); return }
    const payload = buildDevicePayload(form, props.mode === 'edit' ? props.recordId : undefined)
    const response = props.mode === 'add' ? await addProductDevice(payload) : await editProductDevice(payload)
    if (seq !== generation || !active) return
    if (response.retData === false) { ElMessage.error('保存未成功，请重试'); return }
    ElMessage.success('保存成功')
    invalidateList('productDevice')
    router.push({ name: 'productDevice' })
  } catch { /* The request layer reports API errors and the draft stays editable. */ }
  finally { if (seq === generation) saving.value = false }
}
watch(() => [props.mode, props.recordId], () => { if (active) initialize() }, { immediate: true })
onActivated(() => { active = true; if (firstActivation) firstActivation = false; else initialize() })
onDeactivated(() => { active = false; generation++; loading.value = false; saving.value = false })
onBeforeUnmount(() => { active = false; generation++ })
</script>

<template>
  <div class="app-container device-editor">
    <PageHeader :title="title" />
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" class="editor-alert"><el-button type="primary" link @click="initialize">重新加载</el-button></el-alert>
    <el-card shadow="never" class="editor-card" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="readonly ? {} : rules" :disabled="disabled" label-width="110px" @submit.prevent="save">
        <el-form-item v-if="mode !== 'add'" label="记录ID">{{ recordId }}</el-form-item>
        <el-form-item label="产品" prop="productId">
          <span v-if="readonly">{{ selectedProductName }}</span>
          <div v-else class="product-field">
            <el-select v-model="form.productId" filterable placeholder="请选择 WiFi 产品" class="field"><el-option v-for="item in products" :key="item.productId" :label="item.productName" :value="item.productId" /></el-select>
            <span class="field-note">仅可选择 WiFi 版本产品</span>
            <span v-if="!loading && !loadError && products.length === 0" class="field-warning">暂无 WiFi 产品，请先在产品列表中新增</span>
            <span v-else-if="form.productId && !selectedAvailable" class="field-warning">原产品不在可选 WiFi 列表中，请重新选择</span>
          </div>
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceId"><el-input v-model="form.deviceId" maxlength="50" show-word-limit placeholder="请输入设备ID" class="field" /></el-form-item>
        <template v-if="readonly">
          <el-form-item label="状态"><el-tag :type="Number(detail.verify) === 1 ? 'success' : 'info'">{{ detail.verifyMsg || (Number(detail.verify) === 1 ? '启用' : Number(detail.verify) === 0 ? '禁用' : '—') }}</el-tag></el-form-item>
          <el-form-item label="创建时间">{{ detail.joinTime || '—' }}</el-form-item>
          <el-form-item label="更新时间">{{ detail.upTime || '—' }}</el-form-item>
        </template>
      </el-form>
      <div class="form-actions">
        <el-button v-if="!readonly" v-permission="[mode === 'add' ? permission.add : permission.edit]" type="primary" :loading="saving" :disabled="loading || !!loadError || !selectedAvailable" @click="save">保存</el-button>
        <el-button :disabled="saving" @click="router.push({ name: 'productDevice' })">{{ readonly ? '返回列表' : '取消' }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.editor-card, .editor-alert { margin-top: 16px; }
.field { width: min(100%, 560px); }
.product-field { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.field-note { color: var(--el-text-color-secondary); font-size: 12px; }
.field-warning { color: var(--el-color-warning); font-size: 12px; }
.form-actions { display: flex; gap: 8px; padding: 12px 0 4px 110px; }
@media (max-width: 700px) { .form-actions { padding-left: 0; } }
</style>
