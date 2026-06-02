<script setup name="ListToolbar">
import PageSection from '@/components/PageSection/index.vue'

defineProps({
  title: { type: String, required: true }
})
</script>

<template>
  <PageSection class="operate-container" :title="title" icon="Tickets">
    <template v-if="$slots.default" #extra>
      <slot />
    </template>
  </PageSection>
</template>
