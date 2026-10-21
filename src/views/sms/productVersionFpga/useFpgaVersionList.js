import { computed, onMounted, ref, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList } from '@/api/productList'
import { cleanQuery, usePagedList } from '@/composables/usePagedList'
import { getProductVersionFpgaList, deleteProductVersionFpga, setProductVersionFpgaVerify } from '@/api/productVersionFpga'

export function useFpgaVersionList() {
  const dateRange = ref([])
  const products = shallowRef([])
  const productError = ref(false)
  const listError = ref(false)
  const busyId = ref(null)
  const paged = usePagedList({
    defaultQuery: () => ({ pageIndex: 1, pageSize: 10, keyword: '', productId: null, compulsory: null, verify: null }),
    fetchList: getProductVersionFpgaList,
    mapResponse: response => {
      listError.value = false
      return { list: response.retData?.pageData || [], total: response.retData?.recordCount || 0 }
    },
    buildParams: query => cleanQuery({ ...query, startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] }),
    onError: () => { listError.value = true },
    refreshKey: 'productVersionFpga', reloadOnActivated: false, latestRequestOnly: true
  })
  async function loadProducts() {
    try { const response = await getProductList({ pageIndex: 1, pageSize: 1000 }); products.value = response.retData?.pageData || []; productError.value = false }
    catch { productError.value = true }
  }
  const productNames = computed(() => new Map(products.value.map(item => [String(item.productId ?? item.id), item.productName])))
  function productName(id) { return productNames.value.get(String(id)) || '产品 #' + id }
  function reset() { dateRange.value = []; return paged.handleResetSearch() }
  async function mutate(row, remove = false) {
    if (busyId.value !== null) return
    busyId.value = row.id
    const verify = Number(row.verify) === 1 ? 0 : 1
    const action = remove ? '删除' : verify === 1 ? '启用' : '禁用'
    try {
      await ElMessageBox.confirm('确认' + action + ' FPGA 固件版本“' + row.versionNumber + '”吗？' + (remove ? '删除后该版本将不再出现在列表中。' : ''), action + '确认', { type: 'warning', confirmButtonText: action, cancelButtonText: '取消' })
      const response = remove ? await deleteProductVersionFpga({ id: row.id }) : await setProductVersionFpgaVerify({ id: row.id, verify })
      if (response.retData === false) throw new Error(action + '未成功')
      ElMessage.success(action + '成功')
      if (remove && paged.list.value.length === 1 && paged.listQuery.pageIndex > 1) paged.listQuery.pageIndex -= 1
      await paged.getList()
    } catch (error) { if (error?.message && error.message.endsWith('未成功')) ElMessage.error(error.message) }
    finally { busyId.value = null }
  }
  onMounted(loadProducts)
  return { ...paged, dateRange, products, productError, listError, busyId, productName, loadProducts, reset, mutate }
}
