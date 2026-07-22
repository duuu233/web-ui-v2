<script setup name="productVersion">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useListRefreshOnActivated } from '@/composables/useListRefresh'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { formatDate } from '@/utils/date'
import { getProductList } from '@/api/productList'
import {
  deleteProductVersion,
  getProductVersionList,
  setProductVersionVerify
} from '@/api/productVersion'

const router = useRouter()

const compulsoryOptions = [
  { value: 1, label: '强制升级' },
  { value: 2, label: '强提示升级' },
  { value: 3, label: '弱提示升级' },
  { value: 4, label: '不提示升级' }
]

const verifyOptions = [
  { value: 1, label: '启用' },
  { value: 0, label: '禁用' }
]

const defaultListQuery = () => ({
  pageIndex: 1,
  pageSize: 10,
  keyword: null,
  productId: null,
  compulsory: null,
  verify: null
})

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = shallowRef(0)
const listLoading = shallowRef(false)
const dateList = shallowRef([])
const productOptions = ref([])

const productNameMap = computed(() => {
  const map = new Map()
  productOptions.value.forEach((item) => {
    map.set(item.productId || item.id, item.productName)
  })
  return map
})

function cleanParams(params) {
  const result = {}
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== '' && value !== null && value !== undefined) result[key] = value
  })
  return result
}

function getCompulsoryText(value) {
  return compulsoryOptions.find((item) => item.value === value)?.label || value || '-'
}

function getProductName(productId) {
  return productNameMap.value.get(productId) || productId || '-'
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

function getList() {
  applyDateRange()
  listLoading.value = true
  getProductVersionList(cleanParams(listQuery))
    .then((response) => {
      list.value = response.retData?.pageData || []
      total.value = response.retData?.recordCount || 0
    })
    .finally(() => {
      listLoading.value = false
    })
}

function loadProductOptions() {
  getProductList({ pageIndex: 1, pageSize: 1000 })
    .then((response) => {
      productOptions.value = response.retData?.pageData || []
    })
    .catch(() => {
      productOptions.value = []
    })
}

function handleSearchList() {
  listQuery.pageIndex = 1
  getList()
}

function handleResetSearch() {
  Object.assign(listQuery, defaultListQuery())
  dateList.value = []
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

function handleAdd() {
  router.push({ name: 'productVersionDetail', query: { type: 'add' } })
}

function handleEdit(row) {
  router.push({ name: 'productVersionDetail', query: { type: 'edit', id: row.id } })
}

function handleDelete(row) {
  ElMessageBox.confirm('是否删除该产品版本?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteProductVersion({ id: row.id }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功')
        getList()
      }
    })
  })
}

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否修改该产品版本状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setProductVersionVerify({ id: row.id, verify: status }).then((response) => {
        if (response.retCode === 200) {
          ElMessage.success('修改成功')
          row.verify = status
        }
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
    })
}

function init() {
  loadProductOptions()
  getList()
}

onMounted(init)
useListRefreshOnActivated('productVersion', init)
</script>

<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="版本号">
        <el-input
          v-model="listQuery.keyword"
          class="input-width"
          placeholder="请输入版本号"
          clearable
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="产品">
        <el-select v-model="listQuery.productId" clearable filterable placeholder="请选择产品" style="width: 180px">
          <el-option
            v-for="item in productOptions"
            :key="item.productId || item.id"
            :label="item.productName"
            :value="item.productId || item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="升级类型">
        <el-select v-model="listQuery.compulsory" clearable placeholder="请选择升级类型" style="width: 150px">
          <el-option
            v-for="item in compulsoryOptions"
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

    <ListToolbar title="产品版本列表">
      <el-button
        v-permission="['Post_ProductVersion_AddProductVersion']"
        size="small"
        icon="Plus"
        type="primary"
        @click="handleAdd"
      >
        新增产品版本
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
        <vxe-column field="id" title="编号" width="90" align="center" />
        <vxe-column title="产品" min-width="150" align="center" show-overflow>
          <template #default="{ row }">{{ getProductName(row.productId) }}</template>
        </vxe-column>
        <vxe-column field="versionNumber" title="版本号" min-width="140" align="center" show-overflow />
        <vxe-column field="grade" title="权重" width="90" align="center" />
        <vxe-column title="升级类型" width="120" align="center">
          <template #default="{ row }">{{ getCompulsoryText(row.compulsory) }}</template>
        </vxe-column>
        <vxe-column title="下载地址" min-width="220" align="center" show-overflow>
          <template #default="{ row }">
            <el-link v-if="row.downloadPath" :href="row.downloadPath" target="_blank" type="primary">
              {{ row.downloadPath }}
            </el-link>
            <span v-else>-</span>
          </template>
        </vxe-column>
        <vxe-column title="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column
          v-permission="['Post_ProductVersion_SetProductVersionVerify']"
          title="是否启用"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="创建时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
        </vxe-column>
        <vxe-column title="更新时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.upTime) }}</template>
        </vxe-column>
        <vxe-column title="操作" width="170" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_ProductVersion_EditProductVersion']"
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_ProductVersion_DeleteProductVersion']"
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

<style lang="scss" scoped>
.enable_txt {
  color: var(--app-success);
}
.disable_txt {
  color: var(--app-danger);
}
</style>
