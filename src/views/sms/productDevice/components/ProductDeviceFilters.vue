<script setup name="ProductDeviceFilters">
import { computed } from 'vue'
import SearchPanel from '@/components/SearchPanel/index.vue'
import { verifyOptions } from '../model'
defineProps({ products: { type: Array, default: () => [] } })
const keyword = defineModel('keyword', { type: String, default: '' })
const productId = defineModel('productId', { type: [Number, String], default: null })
const verify = defineModel('verify', { type: Number, default: null })
const dateRange = defineModel('dateRange', { type: Array, default: () => [] })
const emit = defineEmits(['search', 'reset'])
const model = computed(() => ({ keyword: keyword.value, productId: productId.value, verify: verify.value }))
</script>

<template>
  <SearchPanel :model="model" @search="emit('search')" @reset="emit('reset')">
    <el-form-item label="设备ID"><el-input v-model="keyword" clearable maxlength="50" placeholder="搜索设备ID" style="width: 200px" @keyup.enter="emit('search')" /></el-form-item>
    <el-form-item label="产品"><el-select v-model="productId" clearable filterable placeholder="全部 WiFi 产品" style="width: 180px"><el-option v-for="item in products" :key="item.productId ?? item.id" :label="item.productName" :value="item.productId ?? item.id" /></el-select></el-form-item>
    <el-form-item label="状态"><el-select v-model="verify" clearable placeholder="全部状态" style="width: 120px"><el-option v-for="item in verifyOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
    <el-form-item label="创建时间"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 270px" /></el-form-item>
  </SearchPanel>
</template>
