<template>
  <div class="app-container">
    <PageHeader>
      <span v-if="pageType === 1">添加常见问题</span>
      <span v-else-if="pageType === 2">编辑常见问题</span>
      <span v-else-if="pageType === 3">查看常见问题</span>
    </PageHeader>
    <el-card class="box-card">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="180px" size="small">
        <el-form-item label="所属产品" prop="productId">
          <el-select
            v-model="formData.productId"
            clearable
            :disabled="pageType === 3"
            placeholder="请选择所属产品"
          >
            <el-option label="全部" :value="0" />
            <el-option
              v-for="item in productList"
              :key="item.productId"
              :label="item.productName"
              :value="item.productId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择语种" prop="language">
          <el-radio-group v-model="formData.language" :disabled="pageType !== 1">
            <el-radio v-for="item in languageOptions" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序值(数值越大排名越前)" prop="grade">
          <el-input-number
            v-model="formData.grade"
            :disabled="pageType === 3"
            style="width: 103px"
            :min="0"
            :max="999"
            placeholder="请输入排序值"
          />
        </el-form-item>
        <el-form-item label="常见问题标题" prop="faqTitle">
          <el-input
            v-model="formData.faqTitle"
            clearable
            :disabled="pageType === 3"
            maxlength="299"
            show-word-limit
            style="width: 60vw"
            placeholder="请输入常见问题标题"
          />
        </el-form-item>
        <el-form-item label="常见问题内容" prop="faqContent">
          <el-input
            v-model="formData.faqContent"
            type="textarea"
            :rows="10"
            :disabled="pageType === 3"
            style="width: 60vw"
            placeholder="请输入常见问题内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button v-if="pageType !== 3" type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="productFaqHandleDetail">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getProductFaqDetail,
  addProductFaq,
  editProductFaq,
  getProductList
} from '@/api/productList'
import PageHeader from '@/components/PageHeader/index.vue'

const props = defineProps({
  pageType: {
    type: Number,
    default: 3
  }
})

const route = useRoute()
const router = useRouter()

const languageOptions = [
  { value: 1, label: '英语' },
  { value: 2, label: '简中' },
  { value: 3, label: '繁中' },
  { value: 4, label: '日文' }
]

const formRef = ref(null)
const formData = reactive({
  productId: 0,
  language: 1,
  grade: 0,
  faqTitle: '',
  faqContent: '',
  productName: ''
})
const productList = ref([])
let isInitialized = false

const rules = {
  language: [{ required: true, message: '请选择语种', trigger: 'change' }],
  grade: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  faqTitle: [{ required: true, message: '请输入常见问题标题', trigger: 'blur' }],
  faqContent: [{ required: true, message: '请输入常见问题内容', trigger: 'blur' }]
}

async function getEnumData() {
  const res = await getProductList({ pageIndex: 1, pageSize: 500 })
  productList.value = res.retData.pageData || []
}

async function getData() {
  const res = await getProductFaqDetail({ id: route.query.id })
  const d = res.retData || {}
  Object.assign(formData, {
    productId: d.productId ?? 0,
    language: d.language || 1,
    grade: d.grade || 0,
    faqTitle: d.faqTitle || '',
    faqContent: d.faqContent || '',
    productName: d.productName || '',
    faqId: d.faqId || '',
    pflId: d.pflId || ''
  })
  // 根据产品名称匹配产品ID
  const productItem = productList.value.find((item) => item.productName === formData.productName)
  if (productItem) formData.productId = productItem.productId
}

async function initializeData() {
  try {
    if (!productList.value.length) await getEnumData()
    if (props.pageType !== 1) await getData()
  } catch (e) {
    ElMessage.error('数据加载失败，请刷新重试')
  }
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return false
    // 未选择所属产品时默认按「全部」提交
    if (formData.productId === '' || formData.productId === null || formData.productId === undefined) {
      formData.productId = 0
    }
    const productItem = productList.value.find((item) => item.productId === formData.productId)
    formData.productName = productItem ? productItem.productName : '全部'
    if (props.pageType === 1) {
      await addProductFaq(formData)
    } else if (props.pageType === 2) {
      await editProductFaq(formData)
    }
    ElMessage.success(props.pageType === 1 ? '新增成功' : '编辑成功')
    setTimeout(() => {
      router.push({ path: '/sms/productFaqList' })
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
</style>
