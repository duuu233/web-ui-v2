<script setup name="userProductImage">
import { shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { usePagedList, cleanQuery } from '@/composables/usePagedList'
import { formatDate } from '@/utils/date'
import {
  deleteUserProductImg,
  getUserProductImgList,
  setUserProductImgVerify
} from '@/api/userProductImage'

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
  getList,
  handleSearchList: searchList,
  handleResetSearch: resetSearch,
  handleSizeChange,
  handleCurrentChange
} = usePagedList({
  fetchList: getUserProductImgList,
  defaultQuery: defaultListQuery,
  buildParams: cleanQuery
})

function getRowId(row) {
  return row.uProductImgId || row.uproductImgId || row.id
}

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

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除该用户产品图片?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteUserProductImg({ id: getRowId(row) }).then(() => {
        ElMessage.success('删除成功')
        getList()
      })
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否修改该图片状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setUserProductImgVerify({ id: getRowId(row), verify: status }).then(() => {
        ElMessage.success('修改成功')
        row.verify = status
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
    })
}
</script>

<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="设备ID">
        <el-input
          v-model="listQuery.keyword"
          class="input-width"
          placeholder="请输入设备ID"
          clearable
          maxlength="20"
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
          style="width: 300px"
          type="daterange"
          unlink-panels
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
    </SearchPanel>

    <ListToolbar title="用户产品图片列表" />

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
        <vxe-column field="uProductImgId" title="编号" width="90" align="center">
          <template #default="{ row }">{{ getRowId(row) || '-' }}</template>
        </vxe-column>
        <vxe-column field="nickName" title="用户昵称" min-width="120" align="center" show-overflow />
        <vxe-column field="userId" title="用户ID" width="90" align="center" />
        <vxe-column field="userMobile" title="手机号" min-width="120" align="center" show-overflow />
        <vxe-column field="userEmail" title="邮箱" min-width="160" align="center" show-overflow />
        <vxe-column field="deviceId" title="设备ID" min-width="150" align="center" show-overflow />
        <vxe-column field="productName" title="产品名称" min-width="140" align="center" show-overflow />
        <vxe-column title="产品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.img"
              :src="row.img"
              :preview-src-list="[row.img]"
              preview-teleported
              fit="cover"
              style="width: 60px; height: 60px"
            />
            <span v-else>-</span>
          </template>
        </vxe-column>
        <vxe-column title="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['Post_UserProductImg_SetUserProductImgVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="添加时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
        </vxe-column>
        <vxe-column title="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_UserProductImg_DeleteUserProductImg']"
                size="small"
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
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
