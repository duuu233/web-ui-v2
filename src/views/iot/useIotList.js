import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fromRoute, buildListQuery } from './model'
import { iotGet } from './service'
import { useIotResource } from './useIotResource'

export function useIotList(kind, routeName) {
  const route = useRoute()
  const draft = shallowRef(fromRoute(kind, {}, kind === 'logs'))
  const params = shallowRef({ page: 1, size: 20 })
  const validationError = shallowRef('')
  function search() {
    try { const next = buildListQuery(kind, draft.value, 1, params.value.size); validationError.value = ''; params.value = next }
    catch (error) { validationError.value = error.message }
  }
  function reset() { draft.value = fromRoute(kind, {}); search() }
  function setPage(page) { if (page !== params.value.page) params.value = { ...params.value, page } }
  function setSize(size) { if (size !== params.value.size) params.value = { ...params.value, page: 1, size } }
  watch(() => [route.name, route.query], () => {
    if (route.name !== routeName) return
    draft.value = fromRoute(kind, route.query, kind === 'logs' && Object.keys(route.query).length === 0)
    search()
  }, { immediate: true })
  const resource = useIotResource(signal => iotGet(kind === 'devices' ? '/admin/device/list' : '/admin/log/list', params.value, signal), () => params.value, () => route.name === routeName && !validationError.value, () => kind)
  return { ...resource, draft, params, validationError, search, reset, setPage, setSize }
}
