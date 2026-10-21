<script setup name="FpgaVersionEditor">
import { computed, onActivated, onDeactivated, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader/index.vue'
import { getProductList } from '@/api/productList'
import { setFileUpload } from '@/api/oss'
import { normalizeUploadedFiles } from '@/components/Upload/utils'
import { invalidateList } from '@/composables/useListRefresh'
import { getProductVersionFpgaDetail, addProductVersionFpga, editProductVersionFpga } from '@/api/productVersionFpga'
import { defaultVersion, buildVersionPayload, compulsoryOptions, parseVersionId, fileName, safeDownloadUrl, permission } from '../model'

const props = defineProps({ mode: { type: String, required: true }, recordId: { type: [String, Number], default: null } })
const router = useRouter()
const readonly = computed(() => props.mode === 'detail')
const title = computed(() => ({ add: '新增 FPGA 固件版本', edit: '编辑 FPGA 固件版本', detail: 'FPGA 固件版本详情' })[props.mode] || 'FPGA 固件版本')
const formRef = ref(null)
const form = reactive(defaultVersion())
const products = ref([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const loadError = ref('')
const detail = ref({})
let generation = 0
let active = true
let firstActivation = true
const disabled = computed(() => loading.value || saving.value || !!loadError.value || readonly.value)
const rules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  versionNumber: [{ required: true, whitespace: true, message: '请输入版本号', trigger: 'blur' }, { max: 200, message: '版本号最多200个字符', trigger: 'blur' }],
  downloadPath: [{ required: true, whitespace: true, message: '请上传固件或填写下载地址', trigger: 'change' }],
  compulsory: [{ required: true, message: '请选择升级类型', trigger: 'change' }],
  grade: [{ required: true, message: '请输入权重', trigger: 'change' }]
}
async function initialize() {
  const seq = ++generation
  loading.value = false
  saving.value = false
  uploading.value = false
  Object.assign(form, defaultVersion()); detail.value = {}; loadError.value = ''
  formRef.value?.clearValidate()
  if (!['add', 'edit', 'detail'].includes(props.mode)) { loadError.value = '页面模式无效'; return }
  const id = parseVersionId(props.recordId)
  if (props.mode !== 'add' && id === null) { loadError.value = '固件版本ID无效，请从列表重新进入'; return }
  loading.value = true
  try {
    const [productResult, versionResult] = await Promise.all([
      getProductList({ pageIndex: 1, pageSize: 1000 }),
      props.mode === 'add' ? Promise.resolve(null) : getProductVersionFpgaDetail({ id })
    ])
    if (seq !== generation || !active) return
    products.value = productResult.retData?.pageData || []
    if (versionResult) {
      const data = versionResult.retData
      if (!data || parseVersionId(data.id) !== id) throw new Error('固件详情缺失或与当前ID不一致')
      detail.value = data
      Object.keys(defaultVersion()).forEach(key => { form[key] = data[key] ?? defaultVersion()[key] })
      form.productId = Number(form.productId)
      form.compulsory = form.compulsory === null ? null : Number(form.compulsory)
      if (!products.value.some(item => Number(item.productId ?? item.id) === form.productId)) {
        products.value = [...products.value, { productId: form.productId, productName: '产品 #' + form.productId }]
      }
    }
  } catch (error) { if (seq === generation && active) loadError.value = error?.message || '数据加载失败，请重试' }
  finally { if (seq === generation) loading.value = false }
}
async function upload(option) {
  if (disabled.value || uploading.value) return
  const seq = generation
  uploading.value = true
  try {
    const response = await setFileUpload(option.file)
    if (seq !== generation || !active) return
    const files = normalizeUploadedFiles(response.retData, option.file)
    if (!files[0]?.url) throw new Error('上传未返回文件地址')
    form.downloadPath = files[0].url
    formRef.value?.clearValidate('downloadPath')
    option.onSuccess?.(response)
  } catch (error) { if (seq === generation && active) { option.onError?.(error); ElMessage.error('固件上传失败，请重试') } }
  finally { if (seq === generation) uploading.value = false }
}
async function save() {
  if (disabled.value || uploading.value || !formRef.value) return
  saving.value = true
  const seq = generation
  try {
    if (!await formRef.value.validate().catch(() => false)) return
    if (seq !== generation || !active) return
    const id = props.mode === 'edit' ? parseVersionId(props.recordId) : undefined
    if (props.mode === 'edit' && id === null) return
    const payload = buildVersionPayload(form, id)
    if (!Number.isInteger(payload.productId) || payload.productId < 1 || ![1, 2, 3, 4].includes(payload.compulsory) || !Number.isInteger(payload.grade) || payload.grade < 0 || payload.grade > 2147483647) {
      ElMessage.error('请检查产品、升级类型与整数权重'); return
    }
    const response = props.mode === 'add' ? await addProductVersionFpga(payload) : await editProductVersionFpga(payload)
    if (seq !== generation || !active) return
    if (response.retData === false) { ElMessage.error('保存未成功，请重试'); return }
    ElMessage.success('保存成功')
    invalidateList('productVersionFpga')
    router.push({ name: 'productVersionFpga' })
  } catch { /* Request layer reports server errors; keep the user's draft. */ }
  finally { if (seq === generation) saving.value = false }
}
watch(() => [props.mode, props.recordId], () => { if (active) initialize() }, { immediate: true })
onActivated(() => { active = true; if (firstActivation) firstActivation = false; else initialize() })
onDeactivated(() => { active = false; generation++; loading.value = false; saving.value = false; uploading.value = false })
onBeforeUnmount(() => { active = false; generation++ })
</script>

<template>
  <div class="app-container fpga-editor">
    <PageHeader :title="title" />
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" class="editor-error"><el-button type="primary" link @click="initialize">重新加载</el-button></el-alert>
    <el-card shadow="never" class="editor-card" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="readonly ? {} : rules" :disabled="disabled" label-width="125px" size="default" @submit.prevent="save">
        <el-form-item v-if="mode !== 'add'" label="版本ID"><span>{{ recordId }}</span></el-form-item>
        <el-form-item label="产品" prop="productId"><el-select v-model="form.productId" filterable placeholder="请选择产品" class="field"><el-option v-for="item in products" :key="item.productId ?? item.id" :label="item.productName" :value="item.productId ?? item.id" /></el-select></el-form-item>
        <el-form-item label="版本号" prop="versionNumber"><el-input v-model="form.versionNumber" maxlength="200" show-word-limit placeholder="例如 v1.0.0" class="field" /></el-form-item>
        <el-form-item label="固件下载地址" prop="downloadPath"><div class="file-field">
          <el-input v-model="form.downloadPath" :disabled="disabled || uploading" placeholder="上传固件，或填写已有的下载地址" class="field" />
          <el-upload v-if="!readonly" action="" :show-file-list="false" :http-request="upload" :disabled="disabled || uploading"><el-button :loading="uploading" :disabled="disabled">{{ uploading ? '正在上传…' : '上传固件文件' }}</el-button></el-upload>
          <el-link v-if="safeDownloadUrl(form.downloadPath)" :href="safeDownloadUrl(form.downloadPath)" target="_blank" rel="noopener noreferrer" type="primary">{{ fileName(form.downloadPath) }}</el-link>
        </div></el-form-item>
        <el-form-item label="升级类型" prop="compulsory"><el-radio-group v-model="form.compulsory" class="upgrade-options"><el-radio v-for="item in compulsoryOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio></el-radio-group></el-form-item>
        <el-form-item label="权重" prop="grade"><el-input-number v-model="form.grade" :min="0" :max="2147483647" :precision="0" controls-position="right" /><span class="field-note">数值越大，优先级越高</span></el-form-item>
        <template v-if="readonly"><el-form-item label="状态"><span>{{ detail.verifyMsg || (Number(detail.verify) === 1 ? '启用' : Number(detail.verify) === 0 ? '禁用' : '—') }}</span></el-form-item><el-form-item label="创建时间">{{ detail.joinTime || '—' }}</el-form-item><el-form-item label="更新时间">{{ detail.upTime || '—' }}</el-form-item></template>
      </el-form>
      <div class="form-actions"><el-button v-if="!readonly" v-permission="[mode === 'add' ? permission.add : permission.edit]" type="primary" :loading="saving" :disabled="loading || uploading || !!loadError" @click="save">保存</el-button><el-button :disabled="saving || uploading" @click="router.push({ name: 'productVersionFpga' })">{{ readonly ? '返回列表' : '取消' }}</el-button></div>
    </el-card>
  </div>
</template>

<style scoped>
.editor-card { margin-top: 16px; }
.editor-error { margin-top: 16px; }
.field { width: min(100%, 560px); }
.file-field { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; width: 100%; }
.field-note { margin-left: 12px; color: var(--el-text-color-secondary); font-size: 12px; }
.upgrade-options { flex-wrap: wrap; }
.form-actions { display: flex; gap: 8px; padding: 12px 0 4px 125px; }
@media (max-width: 700px) { .form-actions { padding-left: 0; } .field-note { margin-left: 0; width: 100%; } }
</style>
