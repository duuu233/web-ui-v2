// Exercise the actual form composable with API/router adapters, without writing backend data.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { computed, reactive, ref, shallowRef } from 'vue'

const fields = ['marketAmount', 'marketAmountEnglish', 'marketAmountFan', 'marketAmountJapanese']
const source = fs.readFileSync(new URL('../src/views/commerce/goods/useGoodsForm.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\s*\r?\n/gm, '')
  .replace('export function useGoodsForm', 'function useGoodsForm')

async function setup(mode, detail = {}) {
  const calls = []
  const context = {
    computed, reactive, ref, shallowRef,
    useRoute: () => ({ name: { add: 'goodsListAdd', edit: 'goodsListEdit', detail: 'goodsListDetail' }[mode], query: { id: '7' } }),
    useRouter: () => ({ push() {} }),
    ElMessage: { error() {}, success() {} },
    invalidateList() {},
    watch: (getValue, callback) => callback(getValue()),
    getGoodsDetail: async () => ({ retData: detail }),
    addGoods: async data => calls.push({ operation: 'add', data }),
    editGoods: async data => calls.push({ operation: 'edit', data })
  }
  const useGoodsForm = vm.runInNewContext(source + '\nuseGoodsForm', context)
  const form = useGoodsForm(mode)
  await new Promise(resolve => setImmediate(resolve))
  form.formRef.value = { validate: async () => {}, clearValidate() {} }
  return { form, calls }
}

const add = await setup('add')
for (const field of fields) assert.equal(add.form.formData[field], null)
Object.assign(add.form.formData, {
  goodsName: '中文', goodsNameEnglish: 'English', goodsNameFan: '繁中', goodsNameJapanese: '日本語',
  amount: 1, amountEnglish: 2, amountFan: 3, amountJapanese: 4,
  marketAmount: '12.30', marketAmountEnglish: 0, marketAmountFan: 999999.99, marketAmountJapanese: null
})
await add.form.submitForm()
assert.equal(add.calls[0].operation, 'add')
for (const [field, expected] of Object.entries({ marketAmount: 12.3, marketAmountEnglish: 0, marketAmountFan: 999999.99, marketAmountJapanese: null })) {
  assert.equal(add.calls[0].data[field], expected)
}
assert.equal(add.calls[0].data.amount, 1)

const values = { marketAmount: 10, marketAmountEnglish: 20, marketAmountFan: 30, marketAmountJapanese: 40 }
const edit = await setup('edit', { goodsId: 7, ...values })
for (const field of fields) assert.equal(edit.form.formData[field], values[field])
edit.form.formData.marketAmountJapanese = 1000.25
await edit.form.submitForm()
assert.equal(edit.calls[0].operation, 'edit')
assert.equal(edit.calls[0].data.goodsId, 7)
assert.equal(edit.calls[0].data.marketAmountJapanese, 1000.25)

const detail = await setup('detail', values)
for (const field of fields) assert.equal(detail.form.formData[field], values[field])
assert.equal(detail.form.isReadOnly.value, true)
await detail.form.submitForm()
assert.equal(detail.calls.length, 0)

const legacy = await setup('edit', { goodsId: 8 })
for (const field of fields) assert.equal(legacy.form.formData[field], null)
const validate = value => new Promise(resolve => add.form.rules.marketAmount[0].validator({}, value, resolve))
for (const value of [null, undefined, '', 0, '0', 999999.99]) assert.equal(await validate(value), undefined)
for (const value of [-1, 'invalid', Infinity, 100000000]) assert.ok(await validate(value))
console.log('Goods market amounts: add/edit payloads, detail, legacy values, zero, precision and validation passed.')
