import { shallowRef, watch, onActivated, onDeactivated, onBeforeUnmount } from 'vue'
import { demoMode, demoScenario } from './service'

export function useIotResource(fetchData, key, enabled = () => true, identity = key) {
  const data = shallowRef(null), loading = shallowRef(false), error = shallowRef(null), updatedAt = shallowRef(null)
  let sequence = 0, controller, signature = '', active = true
  function cancel() { sequence++; controller?.abort(); loading.value = false }
  async function load() {
    if (!active || !enabled()) return
    controller?.abort()
    controller = new AbortController()
    const current = ++sequence
    loading.value = true; error.value = null
    try { const result = await fetchData(controller.signal); if (current !== sequence || !active) return; data.value = result; updatedAt.value = Date.now() }
    catch (cause) { if (current === sequence && active && cause?.name !== 'AbortError') error.value = { code: cause.code ?? 'NETWORK', msg: cause.message || '请求失败，请重试', status: cause.status } }
    finally { if (current === sequence) loading.value = false }
  }
  watch(() => [enabled(), JSON.stringify(key()), demoMode.value, demoScenario.value], ([isEnabled, currentKey, demo, scenario]) => {
    cancel()
    if (!isEnabled) return
    active = true
    const next = JSON.stringify([identity(), demo])
    if (next !== signature) { data.value = null; updatedAt.value = null; signature = next }
    load()
  }, { immediate: true })
  onActivated(() => { active = true })
  onDeactivated(() => { active = false; cancel() })
  onBeforeUnmount(() => { active = false; cancel() })
  return { data, loading, error, updatedAt, load }
}
