<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <el-icon><Search /></el-icon>
        <span>筛选搜索</span>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small">
          <el-form-item :label="searchLabel">
            <el-input
              v-model="listQuery.keyword"
              style="width: 350px"
              maxlength="20"
              show-word-limit
              :placeholder="searchPlaceholder"
              clearable
            />
          </el-form-item>
          <slot name="filters" :query="listQuery" />
          <el-form-item class="fr">
            <el-button type="primary" icon="Search" @click="handleSearchList">查询</el-button>
            <el-button icon="Refresh" @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作 -->
    <el-card class="operate-container" shadow="never">
      <div>
        <el-icon><Tickets /></el-icon>
        <span>{{ title }}</span>
      </div>
      <div v-if="exportFn">
        <el-button size="small" type="primary" icon="Download" @click="handleExport">导出</el-button>
      </div>
    </el-card>

    <!-- 列表 -->
    <div class="table-container">
      <vxe-table
        :data="list"
        :loading="listLoading"
        border
        round
        stripe
        :row-config="{ isHover: true }"
        :column-config="{ resizable: true }"
        max-height="560"
      >
        <vxe-column type="seq" title="编号" width="70" align="center" />
        <vxe-column
          v-for="col in columns"
          :key="col.prop"
          :field="col.prop"
          :title="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          align="center"
          show-overflow
        >
          <template v-if="col.time" #default="{ row }">
            {{ formatDateTime(row[col.prop]) }}
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.pageIndex"
        v-model:page-size="listQuery.pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup name="LogList">
import { reactive, ref, onMounted, onActivated } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/date'

const props = defineProps({
  title: { type: String, default: '日志' },
  fetch: { type: Function, required: true },
  exportFn: { type: Function, default: null },
  columns: { type: Array, default: () => [] },
  baseQuery: { type: Object, default: () => ({}) },
  searchLabel: { type: String, default: '输入搜索' },
  searchPlaceholder: { type: String, default: '输入关键词' }
})

const defaultListQuery = () => ({
  pageIndex: 1,
  pageSize: 10,
  keyword: null,
  ...props.baseQuery
})
const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function buildParams() {
  const params = { ...listQuery }
  Object.keys(params).forEach((key) => {
    const val = params[key]
    if (val === null || val === undefined || val === '') delete params[key]
  })
  return params
}

function getList() {
  listLoading.value = true
  props
    .fetch(buildParams())
    .then((response) => {
      listLoading.value = false
      list.value = response.retData.pageData || []
      total.value = response.retData.recordCount || 0
    })
    .catch(() => {
      listLoading.value = false
    })
}

function handleSearchList() {
  listQuery.pageIndex = 1
  getList()
}
function handleResetSearch() {
  Object.assign(listQuery, defaultListQuery())
  getList()
}
function handleSizeChange(val) {
  listQuery.pageIndex = 1
  listQuery.pageSize = val
  getList()
}
function handleCurrentChange(val) {
  listQuery.pageIndex = val
  getList()
}
function handleExport() {
  props.exportFn(buildParams()).then((res) => {
    if (res.retCode === 200) {
      if (res.retData) window.location.href = res.retData
      else ElMessage.warning('数据为空，无法导出!')
    } else {
      ElMessage.error('导出失败!')
    }
  })
}

onMounted(getList)
onActivated(getList)
</script>

<style lang="scss" scoped>
.filter-container > div:first-child,
.operate-container > div:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
