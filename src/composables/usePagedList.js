import { reactive, shallowRef, onMounted, onActivated } from 'vue'
import { consumeListInvalidation } from './useListRefresh'

export function cleanQuery(query) {
  const params = { ...query }
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value === null || value === undefined || value === '') {
      delete params[key]
    }
  })
  return params
}

export function usePagedList(options) {
  const {
    fetchList,
    defaultQuery = () => ({ pageIndex: 1, pageSize: 10 }),
    mapResponse = (response) => ({
      list: response.retData?.pageData || [],
      total: response.retData?.recordCount || 0
    }),
    buildParams = cleanQuery,
    onError = () => {},
    immediate = true,
    reloadOnActivated = true,
    refreshKey = '',
    latestRequestOnly = false
  } = options

  const listQuery = reactive(defaultQuery())
  const list = shallowRef([])
  const total = shallowRef(0)
  const listLoading = shallowRef(false)
  let requestSequence = 0

  function resetQuery(extra = {}) {
    Object.keys(listQuery).forEach((key) => delete listQuery[key])
    Object.assign(listQuery, defaultQuery(), extra)
  }

  function getList() {
    const sequence = ++requestSequence
    listLoading.value = true
    return fetchList(buildParams(listQuery))
      .then((response) => {
        if (latestRequestOnly && sequence !== requestSequence) return response
        const result = mapResponse(response)
        list.value = result.list
        total.value = result.total
        return response
      })
      .catch((error) => {
        if (!latestRequestOnly || sequence === requestSequence) onError(error)
      })
      .finally(() => {
        if (!latestRequestOnly || sequence === requestSequence) listLoading.value = false
      })
  }

  function handleSearchList() {
    listQuery.pageIndex = 1
    return getList()
  }

  function handleResetSearch(extra = {}) {
    resetQuery(extra)
    return getList()
  }

  function handleSizeChange(value) {
    listQuery.pageIndex = 1
    listQuery.pageSize = value
    return getList()
  }

  function handleCurrentChange(value) {
    listQuery.pageIndex = value
    return getList()
  }

  if (immediate) onMounted(() => {
    // The mount fetch already includes changes made before this instance existed.
    consumeListInvalidation(refreshKey)
    getList()
  })

  if (reloadOnActivated || refreshKey) {
    let isInitialActivation = true

    onActivated(() => {
      if (isInitialActivation) {
        isInitialActivation = false
        // KeepAlive may start caching after mount, delaying the first activation until a return visit.
        const isInvalidated = consumeListInvalidation(refreshKey)
        if (isInvalidated || (!immediate && reloadOnActivated)) getList()
        return
      }

      const isInvalidated = consumeListInvalidation(refreshKey)
      if (reloadOnActivated || isInvalidated) getList()
    })
  }

  return {
    listQuery,
    list,
    total,
    listLoading,
    getList,
    resetQuery,
    handleSearchList,
    handleResetSearch,
    handleSizeChange,
    handleCurrentChange
  }
}
