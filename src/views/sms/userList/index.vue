<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <el-icon><Search /></el-icon>
        <span>筛选搜索</span>
      </div>
      <div style="margin-top: 15px">
        <el-form ref="searchFormRef" :inline="true" :model="listQuery" size="small">
          <el-form-item label="用户关键词">
            <el-input
              v-model="listQuery.keyword"
              placeholder="请输入用户昵称、邮箱"
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
              :shortcuts="dateShortcuts"
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
        <span>用户列表</span>
      </div>
      <div>
        <el-button
          v-permission="['get_User_getUserListExcel']"
          size="small"
          icon="Document"
          type="primary"
          @click="handleExport"
        >
          导出用户
        </el-button>
      </div>
    </el-card>

    <!-- 列表 -->
    <div class="table-container">
      <vxe-table
        ref="tableRef"
        :data="list"
        :loading="listLoading"
        border
        round
        stripe
        :row-config="{ isHover: true }"
        :column-config="{ resizable: true }"
        height="auto"
        max-height="560"
      >
        <vxe-column type="seq" title="编号" width="70" align="center" />
        <vxe-column field="userId" title="用户ID" align="center" show-overflow />
        <vxe-column field="userNo" title="用户编号" align="center" show-overflow />
        <vxe-column field="nickName" title="用户昵称" align="center" show-overflow />
        <vxe-column field="userEmail" title="用户邮箱" align="center" show-overflow />
        <vxe-column field="joinTime" title="注册时间" align="center" width="160" />
        <vxe-column field="terminalMsg" title="注册渠道" align="center" show-overflow />
        <vxe-column field="countryName" title="国家" align="center" show-overflow />
        <vxe-column field="countryCode" title="国家编号" align="center" show-overflow />
        <vxe-column title="是否启用" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['post_User_setUserVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="操作" width="170" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['POST_User_SetUserInfo']"
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Get_User_getUserDetails']"
                size="small"
                type="primary"
                @click="handleDetail(row)"
              >
                详情
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

<script setup name="userList">
import { ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, getUserListExcel, setUserVerify } from '@/api/userList'

const router = useRouter()

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
const tableRef = ref(null)
const searchFormRef = ref(null)
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
  getUsers(listQuery)
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

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否要修改该状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setUserVerify({ verify: status, id: row.userId }).then((response) => {
        if (response.retCode === 200) {
          ElMessage.success('修改成功!')
          row.verify = status
        } else {
          ElMessage.info('修改失败')
        }
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
    })
}

function handleExport() {
  const query = { ...listQuery, pageIndex: 1 }
  getUserListExcel(query).then((res) => {
    if (res.retCode === 200) {
      if (res.retData) {
        window.location.href = res.retData
      } else {
        ElMessage.warning('数据为空，无法导出!')
      }
    } else {
      ElMessage.error('导出失败!')
    }
  })
}

function handleEdit(row) {
  router.push({ name: 'userListEdit', query: { id: row.userId } })
}
function handleDetail(row) {
  router.push({ name: 'userListDetail', query: { id: row.userId } })
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
  if (!isCreated) {
    getList()
  }
  isCreated = false
})
onDeactivated(() => {
  isCreated = false
  document.removeEventListener('keyup', eventFn)
})
</script>

<style lang="scss" scoped>
.filter-container > div:first-child,
.operate-container > div:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
