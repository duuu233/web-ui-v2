import { formatDate } from '@/utils/date'

export const languageOptions = [
  { value: 0, label: '英语' },
  { value: 1, label: '英语' },
  { value: 2, label: '简中' },
  { value: 3, label: '繁中' },
  { value: 4, label: '日文' }
]

export const contentLanguageOptions = [
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

// 语种与结算币种的对应关系：简中结算人民币，英语和繁中结算美元，日文结算日元。
// 人民币与日元的符号同为 ¥，日元加 JP 前缀避免列表中两种金额无法区分。
const currencyByLanguage = {
  0: { code: 'USD', symbol: '$', label: '美元' },
  1: { code: 'USD', symbol: '$', label: '美元' },
  2: { code: 'CNY', symbol: '¥', label: '人民币' },
  3: { code: 'USD', symbol: '$', label: '美元' },
  4: { code: 'JPY', symbol: 'JP¥', label: '日元' }
}

// 缺少语种时回落到基础字段使用的人民币口径。
const defaultCurrency = currencyByLanguage[2]

export function getCurrency(language) {
  return currencyByLanguage[Number(language)] || defaultCurrency
}

export function getCurrencyLabel(language) {
  return getCurrency(language).label
}

export function getCurrencySymbol(language) {
  return getCurrency(language).symbol
}

// 金额前置币种符号；接口若直接返回 currencySymbol 则优先使用后端值。
export function formatCurrencyAmount(value, source) {
  const amount = formatAmount(value)
  if (amount === '-') return amount

  const record = source || {}
  const symbol =
    typeof record.currencySymbol === 'string' && record.currencySymbol.trim()
      ? record.currencySymbol.trim()
      : getCurrencySymbol(record.language)
  return `${symbol}${amount}`
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
