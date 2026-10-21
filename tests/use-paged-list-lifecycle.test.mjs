import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'
import { createRenderer, defineComponent, h, KeepAlive, nextTick, shallowRef } from 'vue'

function createHost() {
  const node = (type, text = '') => ({ type, text, children: [], parent: null })
  return createRenderer({
    createElement: type => node(type), createText: text => node('text', text), createComment: text => node('comment', text),
    setText: (target, text) => { target.text = text }, setElementText: (target, text) => { target.text = text }, patchProp() {},
    parentNode: target => target.parent,
    nextSibling: target => target.parent?.children[target.parent.children.indexOf(target) + 1] || null,
    remove(target) { if (target.parent) { const siblings = target.parent.children; siblings.splice(siblings.indexOf(target), 1); target.parent = null } },
    insert(target, parent, anchor = null) {
      if (target.parent) { const siblings = target.parent.children; siblings.splice(siblings.indexOf(target), 1) }
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(target); else parent.children.splice(index, 0, target)
      target.parent = parent
    }
  })
}

test('list refresh follows actual KeepAlive activation without losing saves or duplicating mount fetches', async t => {
  const vite = await createServer({ server: { middlewareMode: true }, logLevel: 'silent' })
  try {
    const { usePagedList } = await vite.ssrLoadModule('/src/composables/usePagedList.js')
    const { invalidateList } = await vite.ssrLoadModule('/src/composables/useListRefresh.js')
    for (const scenario of [
      { name: 'already cached mount consumes an old marker once', initialCache: true, markBefore: true, saved: false, expected: 1 },
      { name: 'caching enabled after mount refreshes the first return after save', initialCache: false, markBefore: false, saved: true, expected: 2 },
      { name: 'caching enabled after mount does not reload an unchanged return', initialCache: false, markBefore: false, saved: false, expected: 1 }
    ]) await t.test(scenario.name, async () => {
      const key = scenario.name, active = shallowRef(true), include = shallowRef(scenario.initialCache ? ['TestList'] : [])
      let calls = 0
      if (scenario.markBefore) invalidateList(key)
      const List = defineComponent({ name: 'TestList', setup() {
        usePagedList({ refreshKey: key, reloadOnActivated: false, fetchList: async () => { calls++; return { retData: { pageData: [], recordCount: 0 } } } })
        return () => h('div', 'list')
      } })
      const Other = defineComponent({ name: 'OtherPage', setup: () => () => h('div', 'edit') })
      const app = createHost().createApp({ setup: () => () => h(KeepAlive, { include: include.value }, { default: () => active.value ? h(List) : h(Other) }) })
      const root = { children: [], parent: null }
      app.mount(root)
      try {
        await nextTick(); await Promise.resolve()
        assert.equal(calls, 1, 'initial mount should request only once')
        include.value = ['TestList']; await nextTick()
        active.value = false; await nextTick()
        if (scenario.saved) invalidateList(key)
        active.value = true; await nextTick(); await Promise.resolve()
        assert.equal(calls, scenario.expected)
      } finally { app.unmount() }
    })
  } finally { await vite.close() }
})
