<script setup name="userProductList">
import { shallowRef } from 'vue'
import SearchPanel from '@/components/SearchPanel/index.vue'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { usePagedList, cleanQuery } from '@/composables/usePagedList'
import { formatDate } from '@/utils/date'
import { getUserProductList } from '@/api/productList'

const verifyOptions = [
  { value: 1, label: '有效' },
  { value: 0, label: '无效' }
]

const defaultListQuery = () => ({
  pageIndex: 1,
  pageSize: 10,
  keyword: null,
  verify: null
})

const dateList = shallowRef([])
const {
  listQuery,
  list,
  total,
  listLoading,
  handleSearchList: searchList,
  handleResetSearch: resetSearch,
  handleSizeChange,
  handleCurrentChange
} = usePagedList({
  fetchList: getUserProductList,
  defaultQuery: defaultListQuery,
  buildParams: cleanQuery
})

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function applyDateRange() {
  if (dateList.value?.length) {
    listQuery.startDate = dateList.value[0]
    listQuery.endDate = dateList.value[1]
    return
  }
  delete listQuery.startDate
  delete listQuery.endDate
}

function handleSearchList() {
  applyDateRange()
  searchList()
}

function handleResetSearch() {
  dateList.value = []
  resetSearch()
}
</script>

<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="关键词">
        <el-input
          v-model="listQuery.keyword"
          class="input-width"
          placeholder="产品名称/用户信息"
          clearable
          maxlength="40"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="listQuery.verify" clearable placeholder="请选择状态" style="width: 120px">
          <el-option
            v-for="item in verifyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="添加时间">
        <el-date-picker
          v-model="dateList"
          type="daterange"
          unlink-panels
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px"
        />
      </el-form-item>
    </SearchPanel>

    <ListToolbar title="用户产品列表" />

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
        <vxe-column field="userProductId" title="编号" width="90" align="center" />
        <vxe-column field="nickName" title="用户昵称" min-width="120" align="center" show-overflow />
        <vxe-column field="userMobile" title="手机号" min-width="120" align="center" show-overflow />
        <vxe-column field="userEmail" title="邮箱" min-width="160" align="center" show-overflow />
        <vxe-column field="deviceId" title="设备ID" min-width="160" align="center" show-overflow />
        <vxe-column field="productName" title="产品名称" min-width="130" align="center" show-overflow />
        <vxe-column title="产品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.productImg"
              :src="row.productImg"
              :preview-src-list="[row.productImg]"
              preview-teleported
              fit="cover"
              style="width: 60px; height: 60px"
            />
            <span v-else>-</span>
          </template>
        </vxe-column>
        <vxe-column title="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verifyMsg || (row.verify ? '有效' : '无效') }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="添加时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
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

<style lang="scss" scoped>
.enable_txt {
  color: #67c23a;
}

.disable_txt {
  color: #f56c6c;
}
</style>
