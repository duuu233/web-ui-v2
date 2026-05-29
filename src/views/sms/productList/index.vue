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
          <el-form-item label="产品关键词">
            <el-input
              v-model="listQuery.keyword"
              placeholder="请输入产品名称"
              clearable
              maxlength="20"
              class="input-width"
              show-word-limit
            />
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
          <el-form-item class="fr">
            <el-button type="primary" icon="Search" @click="handleSearchList">
              查询
            </el-button>
            <el-button icon="Refresh" @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作 -->
    <el-card class="operate-container" shadow="never">
      <div>
        <el-icon><Tickets /></el-icon>
        <span>产品列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_Product_AddProduct']"
          size="small"
          icon="Plus"
          type="primary"
          @click="handleAdd"
        >
          新增产品
        </el-button>
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
        <vxe-column field="productName" title="产品名称" align="center" show-overflow />
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
        <vxe-column title="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_Product_EditProduct']"
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Get_Product_ProductDetail']"
                size="small"
                type="primary"
                @click="handleDetail(row)"
              >
                详情
              </el-button>
              <el-button
                v-permission="['post_Product_setProductVerify']"
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

<script setup name="productList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList, setProductVerify } from '@/api/productList'

const defaultListQuery = () => ({
  pageIndex: 1,
  pageSize: 10,
  keyword: null
})

const listQuery = reactive(defaultListQuery())
const dateList = ref([])
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

function getList() {
  listLoading.value = true
  getProductList(listQuery)
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
  if (dateList.value && dateList.value.length) {
    listQuery.startDate = dateList.value[0]
    listQuery.endDate = dateList.value[1]
  } else {
    delete listQuery.startDate
    delete listQuery.endDate
  }
  getList()
}
function handleResetSearch() {
  Object.assign(listQuery, defaultListQuery())
  dateList.value = []
  delete listQuery.startDate
  delete listQuery.endDate
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

function handleDelete(row) {
  const status = row.verify === 1 ? 0 : 1
  ElMessageBox.confirm(
    '删除后对应产品的帮助文档将不再显示,是否确认操作?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      setProductVerify({ verify: status, id: row.productId }).then((response) => {
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

// 新增/编辑/详情页尚未迁移，先给出提示（迁移后改为路由跳转）
function handleAdd() {
  ElMessage.info('「产品新增」页待迁移')
}
function handleEdit() {
  ElMessage.info('「产品编辑」页待迁移')
}
function handleDetail() {
  ElMessage.info('「产品详情」页待迁移')
}

onMounted(getList)
</script>

<style lang="scss" scoped>
.filter-container > div:first-child,
.operate-container > div:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
