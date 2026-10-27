import { shallowRef } from 'vue'
import { createIotAdminClient } from '@/api/iotAdminClient'
import { createIotMock } from './mock'

export const demoMode = shallowRef(import.meta.env.VITE_IOT_ADMIN_MODE === 'mock')
export const demoScenario = shallowRef('normal')
export const iotEnvironment = import.meta.env.VITE_IOT_ADMIN_ENV || '生产'
const mock = createIotMock()
function runtime() { return globalThis.window?.__IOT_ADMIN_CONFIG__ || {} }
export function iotGet(path, params = {}, signal) {
  if (demoMode.value) return mock(path, params, demoScenario.value, signal)
  const config = runtime()
  return createIotAdminClient({ baseURL: config.baseURL || import.meta.env.VITE_IOT_ADMIN_BASE_URL || 'https://iot.boltfox.cn', internalToken: () => runtime().internalToken || '' })(path, params, signal)
}
