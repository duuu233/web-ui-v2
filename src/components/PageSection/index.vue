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
.page-section {
  overflow: hidden;
}

.page-section :deep(.el-card__body) {
  padding: 16px 20px 18px;
}

.page-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;
  color: var(--app-ink);
  font-size: 14px;
  font-weight: 650;
}

.page-section__header :deep(.el-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: var(--brand-600);
  background: var(--brand-100);
  font-size: 14px;
}

.page-section__extra {
  margin-left: auto;
}

.page-section__body {
  margin-top: 16px;
}
</style>
