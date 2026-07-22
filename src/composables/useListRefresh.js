import { onActivated } from 'vue'

const invalidatedLists = new Set()

export function invalidateList(listKey) {
  if (listKey) invalidatedLists.add(listKey)
}

export function consumeListInvalidation(listKey) {
  if (!listKey || !invalidatedLists.has(listKey)) return false
  invalidatedLists.delete(listKey)
  return true
}

export function useListRefreshOnActivated(listKey, refresh) {
  let isInitialActivation = true

  onActivated(() => {
    if (isInitialActivation) {
      isInitialActivation = false
      // The initial mount already loads fresh data, so discard an old marker.
      consumeListInvalidation(listKey)
      return
    }

    if (consumeListInvalidation(listKey)) refresh()
  })
}
