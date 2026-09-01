import { computed, reactive, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  addImgCategory,
  editImgCategory,
  getImgCategoryDetail
} from '@/api/productImage'
import { invalidateList } from '@/composables/useListRefresh'

const defaultForm = () => ({
  categoryId: null,
  categoryName: '',
  categoryNameEnglish: '',
  categoryNameeFan: '',
  categoryNameJapanese: '',
  verify: null
})

export function useImageCategoryForm(mode) {
  const route = useRoute()
  const router = useRouter()
  const routeName = {
    add: 'imageCategoryAdd',
    edit: 'imageCategoryEdit',
    detail: 'imageCategoryDetail'
  }[mode]

  const formRef = ref(null)
  const formData = reactive(defaultForm())
  const loading = shallowRef(false)
  const submitting = shallowRef(false)
  let requestSequence = 0

  const isAdd = computed(() => mode === 'add')
  const isReadOnly = computed(() => mode === 'detail')
  const pageTitle = computed(() => {
    if (isAdd.value) return '新增图库分类'
    return isReadOnly.value ? '图库分类详情' : '编辑图库分类'
  })

  const createNameRules = label => [
    { required: true, message: `请输入${label}`, trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ]

  const rules = {
    categoryName: createNameRules('简中分类名称'),
    categoryNameEnglish: createNameRules('英文分类名称'),
    categoryNameeFan: createNameRules('繁中分类名称'),
    categoryNameJapanese: createNameRules('日文分类名称')
  }

  function resetForm() {
    Object.assign(formData, defaultForm())
    formRef.value?.clearValidate?.()
  }

  async function loadDetail(id = route.query.id) {
    if (!id) {
      ElMessage.error('缺少图库分类 ID')
      return
    }

    const sequence = ++requestSequence
    loading.value = true
    try {
      const response = await getImgCategoryDetail({ id })
      if (sequence !== requestSequence) return
      const detail = response.retData || {}
      Object.assign(formData, defaultForm(), detail)
    } catch (error) {
      // 请求拦截器统一反馈接口错误。
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  async function initializeData(id = route.query.id) {
    resetForm()
    if (!isAdd.value) await loadDetail(id)
  }

  async function submitForm() {
    if (!formRef.value || isReadOnly.value) return

    try {
      await formRef.value.validate()
    } catch (error) {
      return
    }

    submitting.value = true
    try {
      const submitData = {
        categoryName: formData.categoryName.trim(),
        categoryNameEnglish: formData.categoryNameEnglish.trim(),
        categoryNameeFan: formData.categoryNameeFan.trim(),
        categoryNameJapanese: formData.categoryNameJapanese.trim()
      }
      if (!isAdd.value) submitData.categoryId = Number(formData.categoryId)

      if (isAdd.value) await addImgCategory(submitData)
      else await editImgCategory(submitData)

      ElMessage.success(isAdd.value ? '新增成功' : '编辑成功')
      invalidateList('imageCategoryList')
      router.push({ name: 'imageCategoryList' })
    } finally {
      submitting.value = false
    }
  }

  function backToList() {
    router.push({ name: 'imageCategoryList' })
  }

  watch(
    () => [route.name, route.query.id],
    ([currentRouteName, id]) => {
      if (currentRouteName === routeName) initializeData(id)
      else {
        requestSequence += 1
        loading.value = false
      }
    },
    { immediate: true }
  )

  return {
    formRef,
    formData,
    loading,
    submitting,
    rules,
    isAdd,
    isReadOnly,
    pageTitle,
    submitForm,
    backToList
  }
}
