<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="常见问题关键词">
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
          <el-option label="英语" :value="1" />
          <el-option label="德语" :value="2" />
          <el-option label="西班牙语" :value="3" />
          <el-option label="法语" :value="4" />
          <el-option label="意大利语" :value="5" />
          <el-option label="葡萄牙语" :value="6" />
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
          :shortcuts="dateShortcuts"
        />
      </el-form-item>
    </SearchPanel>

    <!-- 操作 -->
    <el-card class="operate-container" shadow="never">
      <div>
        <el-icon><Tickets /></el-icon>
        <span>常见问题列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_Product_AddProductFaq']"
          size="small"
          type="primary"
          icon="Document"
          @click="handleAdd"
        >
          新增常见问题
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
        <vxe-column field="faqId" title="业务ID" width="100" align="center" />
        <vxe-column field="productName" title="所属产品" align="center" show-overflow />
        <vxe-column field="languageMsg" title="语种" align="center" show-overflow />
        <vxe-column field="faqTitle" title="标题" align="center" show-overflow />
        <vxe-column field="grade" title="排序值(数值越大排名越前)" align="center" show-overflow />
        <vxe-column title="是否自动翻译多语种" align="center">
          <template #default="{ row }">{{ row.isAutoTranslate == 0 ? '否' : '是' }}</template>
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
                v-permission="['Get_Product_ProductDetailFaq']"
                size="small"
                type="primary"
                @click="handleDetail(row)"
              >
                详情
              </el-button>
              <el-button
                v-permission="['post_Product_setProductFaqVerify']"
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

<script setup name="productFaqList">
import { ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import { getProductFaqList, setProductFaqVerify } from '@/api/productList'

const router = useRouter()

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, keyword: null })

const listQuery = reactive(defaultListQuery())
const dateList = ref([])
const list = ref([])
const total = ref(0)
const listLoading = ref(false)
let isCreated = false

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

function getList() {
  listLoading.value = true
  getProductFaqList(listQuery)
    .then((response) => {
      listLoading.value = false
      list.value = response.retData.pageData || []
      total.value = response.retData.recordCount || 0
    })
    .catch(() => {
      listLoading.value = false
    })
}

function handleStatusChange(row) {
  const status = row.verify === 1 ? 0 : 1
  ElMessageBox.confirm('该操作将删除此常见问题的所有相关语种数据，确认删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setProductFaqVerify({ verify: status, id: row.faqId }).then((response) => {
        if (response.retCode === 200) {
          ElMessage.success('修改成功!')
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

function handleAdd() {
  router.push({ name: 'productFaqListAdd' })
}
function handleEdit(row) {
  router.push({ name: 'productFaqListEdit', query: { id: row.pflId } })
}
function handleDetail(row) {
  router.push({ name: 'productFaqListDetail', query: { id: row.pflId } })
}

function eventFn(e) {
  if (e.code === 'Enter') {
    e.preventDefault()
    handleSearchList()
  }
}

onMounted(() => {
  isCreated = true
  getList()
  document.addEventListener('keyup', eventFn)
})
onActivated(() => {
  document.addEventListener('keyup', eventFn)
  if (!isCreated) getList()
  isCreated = false
})
onDeactivated(() => {
  isCreated = false
  document.removeEventListener('keyup', eventFn)
})
</script>

<style lang="scss" scoped>
.operate-container > div:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
