<script setup name="PaginationBar">
const currentPage = defineModel('currentPage', { type: Number, required: true })
const pageSize = defineModel('pageSize', { type: Number, required: true })

defineProps({
  total: { type: Number, default: 0 },
  pageSizes: { type: Array, default: () => [10, 20, 30] },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['size-change', 'current-change'])
</script>

<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      background
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      @size-change="emit('size-change', $event)"
      @current-change="emit('current-change', $event)"
    />
  </div>
</template>
