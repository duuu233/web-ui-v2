<script setup name="PageSection">
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' }
})
</script>

<template>
  <el-card class="page-section" shadow="never">
    <div class="page-section__header">
      <el-icon v-if="icon">
        <component :is="icon" />
      </el-icon>
      <span>{{ title }}</span>
      <div v-if="$slots.extra" class="page-section__extra">
        <slot name="extra" />
      </div>
    </div>
    <div v-if="$slots.default" class="page-section__body">
      <slot />
    </div>
  </el-card>
</template>

<style scoped>
.page-section__header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-section__extra {
  margin-left: auto;
}

.page-section__body {
  margin-top: 15px;
}
</style>
