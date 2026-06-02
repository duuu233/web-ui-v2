<script setup name="SearchPanel">
import PageSection from '@/components/PageSection/index.vue'

defineProps({
  model: { type: Object, required: true },
  title: { type: String, default: '筛选搜索' },
  inline: { type: Boolean, default: true },
  size: { type: String, default: 'small' }
})

const emit = defineEmits(['search', 'reset'])
</script>

<template>
  <PageSection class="filter-container" :title="title" icon="Search">
    <el-form :inline="inline" :model="model" :size="size">
      <slot />
      <el-form-item class="fr">
        <el-button type="primary" icon="Search" @click="emit('search')">
          查询
        </el-button>
        <el-button icon="Refresh" @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
  </PageSection>
</template>
