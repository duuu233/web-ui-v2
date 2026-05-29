<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup name="AppMain">
import { storeToRefs } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'

const { cachedViews } = storeToRefs(useTagsViewStore())
</script>

<style scoped>
.app-main {
  min-height: calc(100vh - 70px - 40px);
  padding-top: 6px;
}
</style>
