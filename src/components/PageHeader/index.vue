<script setup name="PageHeader">
defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'EditPen'
  }
})
</script>

<template>
  <el-card class="page-header" shadow="never">
    <div class="page-header__inner">
      <el-icon v-if="icon" class="page-header__icon">
        <component :is="icon" />
      </el-icon>
      <div class="page-header__title">
        <slot>
          <span>{{ title }}</span>
        </slot>
      </div>
      <div v-if="$slots.extra" class="page-header__extra">
        <slot name="extra" />
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.page-header {
  display: block;
  width: 100%;
  background: var(--app-surface);
  border-radius: var(--app-radius);
}

.page-header :deep(.el-card__body) {
  padding: 10px 18px;
}

.page-header__inner {
  display: flex;
  align-items: center;
  min-height: 22px;
  gap: 8px;
  color: var(--app-ink);
  line-height: 24px;
  white-space: nowrap;
}

.page-header__icon {
  flex: 0 0 auto;
  color: var(--brand-600);
  font-size: 16px;
}

.page-header__title,
.page-header__title :slotted(span) {
  font-size: 14px;
  font-weight: 650;
}

.page-header__extra {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}
</style>
