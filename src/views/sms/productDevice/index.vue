<script setup name="productDevice">
import { useRouter } from 'vue-router'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import ProductDeviceFilters from './components/ProductDeviceFilters.vue'
import ProductDeviceTable from './components/ProductDeviceTable.vue'
import { useProductDeviceList } from './useProductDeviceList'
import { permission } from './model'
const router = useRouter()
const { listQuery, list, total, listLoading, dateRange, products, productError, listError, busyId, productName, loadProducts, getList, handleSearchList, reset, handleSizeChange, handleCurrentChange, mutate } = useProductDeviceList()
function open(mode, row) { router.push({ name: 'productDevice' + mode, query: row ? { id: row.pDeviceId } : {} }) }
</script>

<template>
  <div class="app-container">
    <ProductDeviceFilters v-model:keyword="listQuery.keyword" v-model:product-id="listQuery.productId" v-model:verify="listQuery.verify" v-model:date-range="dateRange" :products="products" @search="handleSearchList" @reset="reset" />
    <el-alert v-if="productError" title="产品选项加载失败" type="warning" :closable="false" class="load-alert"><el-button link type="primary" @click="loadProducts">重新加载产品</el-button></el-alert>
    <ListToolbar title="产品设备"><el-button v-permission="[permission.add]" type="primary" size="small" icon="Plus" @click="open('Add')">新增产品设备</el-button></ListToolbar>
    <el-alert v-if="listError" title="产品设备列表加载失败，请重试" type="error" :closable="false" class="load-alert"><el-button link type="primary" @click="getList">重新加载</el-button></el-alert>
    <ProductDeviceTable :rows="list" :loading="listLoading" :busy-id="busyId" :product-name="productName" @detail="open('Detail', $event)" @edit="open('Edit', $event)" @toggle="mutate($event)" />
    <PaginationBar v-model:current-page="listQuery.pageIndex" v-model:page-size="listQuery.pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<style scoped>.load-alert { margin: 12px 0; }</style>
