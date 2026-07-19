<script setup name="productFaqList">
import { shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { usePagedList, cleanQuery } from '@/composables/usePagedList'
import { formatDate } from '@/utils/date'
import { getProductFaqList, setProductFaqVerify } from '@/api/productList'

const router = useRouter()

const languageOptions = [

  { value: 1, label: '英语' },
  { value: 2, label: '简中' },
  { value: 3, label: '繁中' },
  { value: 4, label: '日文' },
 
]

const verifyOptions = [
  { value: 1, label: '有效' },
  { value: 0, label: '无效' }
]

const defaultListQuery = () => ({
  pageIndex: 1,
  pageSize: 10,
  keyword: null,
  language: null,
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
  fetchList: getProductFaqList,
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

function handleStatusChange(row) {
  ElMessageBox.confirm('该操作将删除此常见问题的所有相关语种数据，确认删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setProductFaqVerify({ verify: 0, id: row.faqId }).then((response) => {
        if (response.retCode === 200) {
          ElMessage.success('删除成功!')
          getList()
        } else {
          ElMessage.info('修改失败')
        }
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
    })
}

function handleSearchList() {
  applyDateRange()
  searchList()
}

function handleResetSearch() {
  dateList.value = []
  resetSearch()
}

function handleAdd() {
  router.push({ name: 'productFaqListAdd' })
}

function handleEdit(row) {
  router.push({ name: 'productFaqListEdit', query: { id: row.pflId } })
}

function handleDetail(row) {
  router.push({ name: 'productFaqListDetail', query: { id: row.pflId } })
}
</script>

<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="问题关键词">
        <el-input
          v-model="listQuery.keyword"
          placeholder="请输入常见问题关键词"
          clearable
          maxlength="40"
          class="input-width"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="语种">
        <el-select v-model="listQuery.language" clearable placeholder="请选择语种" style="width: 160px">
          <el-option
            v-for="item in languageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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

      <el-form-item label="创建时间">
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

    <ListToolbar title="常见问题列表">
      <el-button
        v-permission="['Post_Product_AddProductFaq']"
        size="small"
        type="primary"
        icon="Document"
        @click="handleAdd"
      >
        新增常见问题
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
        <vxe-column field="faqId" title="业务ID" width="100" align="center" />
        <vxe-column field="productName" title="所属产品" min-width="140" align="center" show-overflow />
        <vxe-column field="languageMsg" title="语种" width="110" align="center" show-overflow />
        <vxe-column field="faqTitle" title="标题" min-width="180" align="center" show-overflow />
        <vxe-column field="grade" title="排序值" width="90" align="center" />
        <vxe-column title="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verifyMsg || (row.verify ? '有效' : '无效') }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="创建时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
        </vxe-column>
        <vxe-column title="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_Product_EditProductFaq']"
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Get_Product_GetProductFaqDetail']"
                size="small"
                type="primary"
                @click="handleDetail(row)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.verify !== 0"
                v-permission="['Post_Product_SetProductFaqVerify']"
                size="small"
                type="danger"
                @click="handleStatusChange(row)"
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

<style lang="scss" scoped>
.enable_txt {
  color: var(--app-success);
}

.disable_txt {
  color: var(--app-danger);
}
</style>
