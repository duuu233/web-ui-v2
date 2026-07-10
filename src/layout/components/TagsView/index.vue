<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :class="['tags-view-item', isActive(tag) ? 'active' : '']"
        :to="{ path: tag.path, query: tag.query }"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <el-icon
          v-if="!isAffix(tag)"
          class="close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </div>

    <ul
      v-show="menuVisible"
      :style="{ left: menuLeft + 'px', top: menuTop + 'px' }"
      class="contextmenu"
    >
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        关闭
      </li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup name="TagsView">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const { visitedViews } = storeToRefs(tagsViewStore)

const menuVisible = ref(false)
const menuLeft = ref(0)
const menuTop = ref(0)
const selectedTag = ref({})
const affixTags = ref([])

function isActive(tag) {
  return tag.path === route.path
}
function isAffix(tag) {
  return tag.meta && tag.meta.affix
}

function filterAffixTags(routes) {
  let tags = []
  routes.forEach((r) => {
    if (r.meta && r.meta.affix && r.name) {
      tags.push({
        name: r.name,
        path: r.path,
        meta: { ...r.meta }
      })
    }
  })
  return tags
}

function initTags() {
  affixTags.value = filterAffixTags(router.getRoutes())
  for (const tag of affixTags.value) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

function addTags() {
  if (route.name) {
    tagsViewStore.addView(route)
  }
}

function closeSelectedTag(view) {
  tagsViewStore.delView(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
  closeMenu()
}

function closeOthersTags() {
  router.push(selectedTag.value).catch(() => {})
  tagsViewStore.delOthersViews(selectedTag.value)
  closeMenu()
}

function closeAllTags(view) {
  tagsViewStore.delAllViews().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === view.path)) return
    toLastView(visitedViews, view)
  })
  closeMenu()
}

function refreshSelectedTag(view) {
  tagsViewStore.delCachedView(view)
  nextTick(() => {
    router.replace({ path: '/redirect' + view.path, query: view.query })
  })
  closeMenu()
}

function toLastView(visitedViews, view) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    router.push('/')
  }
}

function openMenu(tag, e) {
  menuLeft.value = e.clientX
  menuTop.value = e.clientY
  menuVisible.value = true
  selectedTag.value = tag
}
function closeMenu() {
  menuVisible.value = false
}

watch(menuVisible, (val) => {
  if (val) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

watch(
  () => route.path,
  () => addTags()
)

onMounted(() => {
  initTags()
  addTags()
})
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 42px;
  width: 100%;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid var(--app-border);
  backdrop-filter: blur(10px);
}
.tags-view-wrapper {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 18px;
  overflow-x: auto;
  &::-webkit-scrollbar {
    height: 0;
  }
  .tags-view-item {
    display: inline-flex;
    align-items: center;
    height: 28px;
    line-height: 28px;
    border: 1px solid transparent;
    color: var(--app-text);
    background: transparent;
    padding: 0 10px;
    font-size: 12px;
    margin-right: 5px;
    border-radius: 7px;
    white-space: nowrap;
    &.active {
      background-color: var(--brand-500);
      color: #fff;
      border-color: var(--brand-500);
      .close-icon {
        color: #fff;
      }
    }
    .close-icon {
      margin-left: 4px;
      font-size: 12px;
      border-radius: 50%;
      &:hover {
        background: rgba(0, 0, 0, 0.15);
      }
    }
  }
}
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 400;
  color: var(--app-ink);
  box-shadow: 0 12px 28px rgba(37, 43, 50, 0.12);
  li {
    margin: 0;
    padding: 7px 16px;
    cursor: pointer;
    &:hover {
      background: var(--brand-50);
      color: var(--brand-600);
    }
  }
}
</style>
