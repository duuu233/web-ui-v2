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
          <el-form-item label="输入搜索">
            <el-input
              v-model="listQuery.keyword"
              style="width: 350px"
              placeholder="输入关键词"
              clearable
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          <el-form-item class="fr">
            <el-button type="primary" icon="Search" @click="handleSearchList">查询</el-button>
            <el-button icon="Refresh" @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <div class="table-container">
      <div class="table-btns-box">
        <el-tabs v-model="activeName" style="width: 40vw" stretch @tab-change="handleClick">
          <el-tab-pane label="订单通知" name="2" />
          <el-tab-pane label="服务通知" name="5" />
        </el-tabs>
      </div>

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
        <vxe-column type="seq" title="编号" width="60" align="center" />
        <vxe-column field="nickname" title="用户昵称" align="center" show-overflow />
        <vxe-column field="mobile" title="用户手机号" align="center" show-overflow />
        <vxe-column field="pushTypeMsg" title="推送类型" align="center" show-overflow />
        <vxe-column field="title" title="推送标题" align="center" show-overflow />
        <vxe-column field="content" title="推送详细内容" align="center" show-overflow />
        <vxe-column title="推送图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              :preview-src-list="[row.image]"
              preview-teleported
              fit="cover"
              style="width: 60px; height: 60px"
            />
            <span v-else>/</span>
          </template>
        </vxe-column>
        <vxe-column field="joinTime" title="加入时间" width="160" align="center" />
        <vxe-column field="remarks" title="备注" align="center" show-overflow />
        <vxe-column field="upTime" title="最后一次更新时间" width="160" align="center" />
        <vxe-column field="urlTypeMsg" title="url类型" align="center" show-overflow />
      </vxe-table>
    </div>

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

<script setup name="messageUser">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { getUserMessageList } from '@/api/messageUser'

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, keyword: null, pushType: 2 })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)
const activeName = ref('2')

function getList() {
  listLoading.value = true
  getUserMessageList(listQuery)
    .then((response) => {
      listLoading.value = false
      list.value = response.retData.pageData || []
      total.value = response.retData.recordCount || 0
    })
    .catch(() => {
      listLoading.value = false
    })
}

function handleClick() {
  listQuery.pageIndex = 1
  listQuery.pushType = activeName.value * 1
  getList()
}
function handleSearchList() {
  listQuery.pageIndex = 1
  getList()
}
function handleResetSearch() {
  const pushType = activeName.value * 1
  Object.assign(listQuery, defaultListQuery(), { pushType })
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

onMounted(getList)
onActivated(getList)
</script>

<style lang="scss" scoped>
.filter-container > div:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}
.table-btns-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: #fff;
  margin-bottom: 10px;
  box-shadow: 0px 4px 81px 0px rgba(241, 242, 247, 0.82);
  border-radius: 5px;
  padding-right: 20px;
}
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__item) {
  height: 60px;
  line-height: 60px;
}
</style>
