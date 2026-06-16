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
  background: #fff;
  border-radius: 5px;
}

.page-header :deep(.el-card__body) {
  padding: 6px 14px;
}

.page-header__inner {
  display: flex;
  align-items: center;
  min-height: 22px;
  gap: 6px;
  color: #303133;
  line-height: 22px;
  white-space: nowrap;
}

.page-header__icon {
  flex: 0 0 auto;
  color: #409eff;
  font-size: 15px;
}

.page-header__title,
.page-header__title :slotted(span) {
  font-size: 13px;
  font-weight: 600;
}

.page-header__extra {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}
</style>
