<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-icon><EditPen /></el-icon>
      <span v-if="pageType === 1">添加产品</span>
      <span v-else-if="pageType === 2">编辑产品</span>
      <span v-else-if="pageType === 3">查看产品</span>
    </el-card>
    <el-card class="box-card">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="180px" size="small">
        <el-form-item label="产品名称" prop="productName">
          <el-input
            v-model="formData.productName"
            placeholder="请输入产品名称"
            clearable
            class="input-width"
            :disabled="pageType === 3"
          />
        </el-form-item>
        <el-form-item label="产品图片" prop="productImg">
          <multi-upload v-model="formData.productImg" :max-count="1" :disabled="pageType === 3" />
        </el-form-item>
        <el-form-item label="产品说明书下载文件" prop="productFile">
          <file-upload v-model="formData.productFile" :max-count="1" :disabled="pageType === 3" />
        </el-form-item>
        <el-form-item>
          <el-button v-if="pageType !== 3" type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="productListHandleDetail">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { addProduct, editProduct, getProductDetail } from '@/api/productList'
import MultiUpload from '@/components/Upload/multiUpload.vue'
import FileUpload from '@/components/Upload/fileUpload.vue'

const props = defineProps({
  pageType: {
    type: Number,
    default: 3
  }
})

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const formData = reactive({
  productName: '',
  productImg: [],
  productFile: []
})
let isInitialized = false

const rules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  productImg: [{ required: true, type: 'array', message: '请上传产品图片', trigger: 'change' }],
  productFile: [
    { required: true, type: 'array', message: '请上传产品说明书下载文件', trigger: 'change' }
  ]
}

async function getData() {
  const res = await getProductDetail({ id: route.query.id })
  const d = res.retData || {}
  Object.assign(formData, d)
  formData.productImg = d.productImg ? [{ url: d.productImg, name: '图片' }] : []
  formData.productFile = d.productFile
    ? [{ url: d.productFile, name: d.productFileName }]
    : []
}

function initializeData() {
  if (props.pageType !== 1) getData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return false
    const submitData = cloneDeep(formData)
    submitData.productImg = formData.productImg[0].url
    submitData.productFile = formData.productFile[0].url
    submitData.productFileName = formData.productFile[0].name
    if (props.pageType === 1) {
      await addProduct(submitData)
    } else if (props.pageType === 2) {
      await editProduct(submitData)
    }
    ElMessage.success(props.pageType === 1 ? '新增成功' : '编辑成功')
    setTimeout(() => {
      router.push({ name: 'productList' })
    }, 1000)
  })
}

onMounted(() => {
  isInitialized = true
  initializeData()
})
onActivated(() => {
  if (!isInitialized) initializeData()
  isInitialized = false
})
</script>

<style lang="scss" scoped>
.box-card {
  margin-top: 10px;
}
.filter-container {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
