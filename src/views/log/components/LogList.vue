<template>
  <div class="app-container">
    <SearchPanel
      :model="listQuery"
      @search="handleSearchList"
      @reset="handleResetSearch"
    >
      <el-form-item :label="props.searchLabel">
        <el-input
          v-model="listQuery.keyword"
          style="width: 350px"
          maxlength="20"
          show-word-limit
          :placeholder="props.searchPlaceholder"
          clearable
        />
      </el-form-item>
      <slot name="filters" :query="listQuery" />
    </SearchPanel>

    <ListToolbar :title="props.title">
      <el-button
        v-if="props.exportFn"
        size="small"
        type="primary"
        icon="Download"
        @click="handleExport"
      >
        导出
      </el-button>
    </ListToolbar>

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
          v-for="col in props.columns"
          :key="col.prop || col.label"
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

    <PaginationBar
      v-model:current-page="listQuery.pageIndex"
      v-model:page-size="listQuery.pageSize"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup name="LogList">
import { ElMessage } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { usePagedList, cleanQuery } from '@/composables/usePagedList'
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

const {
  listQuery,
  list,
  total,
  listLoading,
  handleSearchList,
  handleResetSearch,
  handleSizeChange,
  handleCurrentChange
} = usePagedList({
  fetchList: props.fetch,
  defaultQuery: defaultListQuery,
  buildParams: cleanQuery
})

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function handleExport() {
  props.exportFn(cleanQuery(listQuery)).then((res) => {
    if (res.retCode === 200) {
      if (res.retData) window.location.href = res.retData
      else ElMessage.warning('数据为空，无法导出')
    } else {
      ElMessage.error('导出失败!')
    }
  })
}
</script>
