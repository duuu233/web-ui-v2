export const versionTypeOptions = [
  { value: 1, label: '蓝牙版' },
  { value: 2, label: 'wifi版' }
]

export function normalizeVersionType(value) {
  return versionTypeOptions.find(item => item.value === value || String(item.value) === value)?.value ?? null
}

export function versionTypeText(value) {
  return versionTypeOptions.find(item => item.value === normalizeVersionType(value))?.label || '未设置'
}
