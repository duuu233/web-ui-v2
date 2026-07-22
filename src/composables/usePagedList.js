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
    refreshKey = ''
  } = options

  const listQuery = reactive(defaultQuery())
  const list = shallowRef([])
  const total = shallowRef(0)
  const listLoading = shallowRef(false)

  function resetQuery(extra = {}) {
    Object.keys(listQuery).forEach((key) => delete listQuery[key])
    Object.assign(listQuery, defaultQuery(), extra)
  }

  function getList() {
    listLoading.value = true
    return fetchList(buildParams(listQuery))
      .then((response) => {
        const result = mapResponse(response)
        list.value = result.list
        total.value = result.total
        return response
      })
      .catch((error) => {
        onError(error)
      })
      .finally(() => {
        listLoading.value = false
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

  if (immediate) onMounted(getList)

  if (reloadOnActivated || refreshKey) {
    let isInitialActivation = true

    onActivated(() => {
      if (isInitialActivation) {
        isInitialActivation = false
        // onActivated also runs after the initial mount, which has already loaded the list.
        const isInvalidated = consumeListInvalidation(refreshKey)
        if (!immediate && (reloadOnActivated || isInvalidated)) getList()
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
