<script setup name="productVersionFpga">
import { useRouter } from 'vue-router'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import FpgaVersionFilters from './components/FpgaVersionFilters.vue'
import FpgaVersionTable from './components/FpgaVersionTable.vue'
import { useFpgaVersionList } from './useFpgaVersionList'
import { permission } from './model'
const router = useRouter()
const { listQuery, list, total, listLoading, dateRange, products, productError, listError, busyId, productName, loadProducts, getList, handleSearchList, reset, handleSizeChange, handleCurrentChange, mutate } = useFpgaVersionList()
function open(mode, row) { router.push({ name: 'productVersionFpga' + mode, query: row ? { id: row.id } : {} }) }
</script>

<template>
  <div class="app-container">
    <FpgaVersionFilters v-model:keyword="listQuery.keyword" v-model:product-id="listQuery.productId" v-model:compulsory="listQuery.compulsory" v-model:verify="listQuery.verify" v-model:date-range="dateRange" :products="products" @search="handleSearchList" @reset="reset" />
    <el-alert v-if="productError" title="产品选项加载失败" type="warning" :closable="false" class="load-alert"><el-button link type="primary" @click="loadProducts">重新加载产品</el-button></el-alert>
    <ListToolbar title="FPGA 固件版本"><el-button v-permission="[permission.add]" type="primary" size="small" icon="Plus" @click="open('Add')">新增 FPGA 固件</el-button></ListToolbar>
    <el-alert v-if="listError" title="固件列表加载失败，请重试" type="error" :closable="false" class="load-alert"><el-button link type="primary" @click="getList">重新加载</el-button></el-alert>
    <FpgaVersionTable :rows="list" :loading="listLoading" :busy-id="busyId" :product-name="productName" @detail="open('Detail', $event)" @edit="open('Edit', $event)" @toggle="mutate($event)" @delete="mutate($event, true)" />
    <PaginationBar v-model:current-page="listQuery.pageIndex" v-model:page-size="listQuery.pageSize" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<style scoped>.load-alert { margin: 12px 0; }</style>
