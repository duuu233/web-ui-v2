import { computed, onMounted, ref, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList } from '@/api/productList'
import { fetchWifiProducts, recordId } from './model'
import { cleanQuery, usePagedList } from '@/composables/usePagedList'
import { getProductDeviceList, setProductDeviceVerify } from '@/api/productDevice'

export function useProductDeviceList() {
  const dateRange = ref([])
  const products = shallowRef([])
  const productError = ref(false)
  const listError = ref(false)
  const busyId = ref(null)
  const paged = usePagedList({
    defaultQuery: () => ({ pageIndex: 1, pageSize: 10, keyword: '', productId: null, verify: null }),
    fetchList: getProductDeviceList,
    mapResponse: response => {
      listError.value = false
      return { list: (response.retData?.pageData || []).map(row => ({ ...row, pDeviceId: recordId(row) })), total: response.retData?.recordCount || 0 }
    },
    buildParams: query => cleanQuery({ ...query, startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] }),
    onError: () => { listError.value = true },
    refreshKey: 'productDevice', reloadOnActivated: false, latestRequestOnly: true
  })
  async function loadProducts() {
    try { products.value = await fetchWifiProducts(getProductList); productError.value = false }
    catch { productError.value = true }
  }
  const productNames = computed(() => new Map(products.value.map(item => [String(item.productId ?? item.id), item.productName])))
  function productName(id) { return productNames.value.get(String(id)) || '产品 #' + id }
  function reset() { dateRange.value = []; return paged.handleResetSearch() }
  async function mutate(row) {
    const id = recordId(row)
    if (busyId.value !== null || id === null) return
    busyId.value = id
    const verify = Number(row.verify) === 1 ? 0 : 1
    const action = verify === 1 ? '启用' : '禁用'
    try {
      await ElMessageBox.confirm('确认' + action + '设备“' + row.deviceId + '”吗？', action + '确认', { type: 'warning', confirmButtonText: action, cancelButtonText: '取消' })
      const response = await setProductDeviceVerify({ id, verify })
      if (response.retData === false) { ElMessage.error(action + '未成功，请重试'); return }
      ElMessage.success(action + '成功')
      await paged.getList()
    } catch { /* The request layer reports errors. Cancellation keeps the current state. */ }
    finally { busyId.value = null }
  }
  onMounted(loadProducts)
  return { ...paged, dateRange, products, productError, listError, busyId, productName, loadProducts, reset, mutate }
}
