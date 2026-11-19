import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fromRoute, buildListQuery } from './model'
import { iotGet } from './service'
import { useIotResource } from './useIotResource'

const listPaths = { devices: '/admin/device/list', logs: '/admin/log/list', notifications: '/admin/notification/list' }

export function useIotList(kind, routeName) {
  const route = useRoute()
  const draft = shallowRef(fromRoute(kind, {}, kind === 'logs'))
  const params = shallowRef({ page: 1, size: 20 })
  const validationError = shallowRef('')
  // 消息通知必须带设备号：用户点查询时提示必填；路由进入、重置时没有设备号只是不请求
  const needsDevice = kind === 'notifications'
  function search(fromUser = true) {
    try {
      const next = buildListQuery(kind, draft.value, 1, params.value.size)
      validationError.value = needsDevice && !next.deviceNo && fromUser === true ? '设备编号必填' : ''
      params.value = next
    }
    catch (error) { validationError.value = error.message }
  }
  function reset() { draft.value = fromRoute(kind, {}); search(false) }
  function setPage(page) { if (page !== params.value.page) params.value = { ...params.value, page } }
  function setSize(size) { if (size !== params.value.size) params.value = { ...params.value, page: 1, size } }
  watch(() => [route.name, route.query], () => {
    if (route.name !== routeName) return
    draft.value = fromRoute(kind, route.query, kind === 'logs' && Object.keys(route.query).length === 0)
    search(false)
  }, { immediate: true })
  const resource = useIotResource(
    signal => iotGet(listPaths[kind], params.value, signal),
    () => params.value,
    () => route.name === routeName && !validationError.value && (!needsDevice || !!params.value.deviceNo),
    // 换设备、换语言时清掉旧数据，避免短暂显示另一台设备的消息
    () => needsDevice ? [kind, params.value.deviceNo || '', params.value.lang] : kind
  )
  return { ...resource, draft, params, validationError, search, reset, setPage, setSize }
}
