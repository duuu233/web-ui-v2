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
          <el-form-item label="客户端">
            <el-select v-model="listQuery.terminal" clearable placeholder="请选择客户端" style="width: 160px">
              <el-option :value="1" label="Android" />
              <el-option :value="2" label="IOS" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="listQuery.keyword" clearable placeholder="请输入关键词" />
          </el-form-item>
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
        <span>版本管理列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_Content_SetAppVersionEdit']"
          size="small"
          type="primary"
          icon="Plus"
          @click="addVersion('add')"
        >
          新增版本
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
        <vxe-column field="terminalMsg" title="客户端" align="center" show-overflow />
        <vxe-column field="versionNumber" title="版本号" align="center" show-overflow />
        <vxe-column field="grade" title="版本编号" align="center" show-overflow />
        <vxe-column title="升级类型" align="center">
          <template #default="{ row }">
            {{ row.compulsoryMsg === '弱提示升级' ? '普通升级' : row.compulsoryMsg }}
          </template>
        </vxe-column>
        <vxe-column title="状态" width="120" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column
          v-permission="['Post_Content_SetAppVersionVerify']"
          title="是否显示"
          width="120"
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
        <vxe-column title="发布时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.releaseTime) }}</template>
        </vxe-column>
        <vxe-column title="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="['Post_Content_SetAppVersionEdit']"
              size="small"
              type="primary"
              @click="addVersion('edit', row)"
            >
              编辑
            </el-button>
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

<script setup name="appVersion">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppVersionList, setAppVersionVerify } from '@/api/appVersion'
import { formatDate } from '@/utils/date'

const router = useRouter()

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, appTypeId: null, terminal: null, keyword: '' })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function getList() {
  listLoading.value = true
  getAppVersionList(listQuery)
    .then((response) => {
      listLoading.value = false
      list.value = response.retData.pageData || []
      total.value = response.retData.recordCount || 0
    })
    .catch(() => {
      listLoading.value = false
    })
}

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否要修改该状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setAppVersionVerify({ verify: status, commonIds: `${row.id}` }).then((response) => {
        if (response.retCode === 200) {
          ElMessage.success('修改成功!')
          row.verify = status
        } else {
          ElMessage.error('修改失败!')
        }
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
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

function addVersion(type, data) {
  const query = data ? { applicationId: data.id, type } : { type }
  router.push({ name: 'versionDetail', query })
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
.enable_txt {
  color: #67c23a;
}
.disable_txt {
  color: #f56c6c;
}
</style>
