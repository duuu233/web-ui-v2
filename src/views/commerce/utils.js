import { formatDate } from '@/utils/date'

export const languageOptions = [
  { value: 0, label: '英语' },
  { value: 1, label: '英语' },
  { value: 2, label: '简中' },
  { value: 3, label: '繁中' },
  { value: 4, label: '日文' }
]

export const orderStateOptions = [
  { value: 0, label: '未完成' },
  { value: 1, label: '已完成' },
  { value: 2, label: '已失效' }
]

export const payStateOptions = [
  { value: 0, label: '未支付' },
  { value: 1, label: '已支付' }
]

export const payTypeOptions = [
  { value: 1, label: '微信支付' },
  { value: 2, label: 'iOS 内购' },
  { value: 3, label: 'PayPal' }
]

export const terminalOptions = [
  { value: 1, label: 'Android' },
  { value: 2, label: 'iOS' },
  { value: 3, label: '小程序' }
]

export const aiModelOptions = [
  { value: 1, label: '普通模型' },
  { value: 2, label: '专家模型' }
]

export function getOptionLabel(options, value, fallback = '-') {
  return options.find(item => item.value === Number(value))?.label || fallback
}

export function formatDateTime(value) {
  if (value === null || value === undefined || value === '') return '-'
  return formatDate(new Date(value), 'yyyy-MM-dd hh:mm:ss')
}

export function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '-'
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : String(value)
}

export function getVerifyTagType(value) {
  return Number(value) === 1 ? 'success' : 'info'
}

export function getOrderStateTagType(value) {
  return { 0: 'warning', 1: 'success', 2: 'info' }[Number(value)] || 'info'
}

export function getPayStateTagType(value) {
  return Number(value) === 1 ? 'success' : 'warning'
}

export function getAiModelTagType(value) {
  return Number(value) === 2 ? 'warning' : 'primary'
}
