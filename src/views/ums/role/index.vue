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
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="角色名称" clearable />
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
        <span>角色列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_Jurisdiction_setRole']"
          size="small"
          icon="Plus"
          type="primary"
          @click="handleAdd"
        >
          添加
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
        <vxe-column type="seq" title="编号" width="60" align="center" />
        <vxe-column field="roleName" title="角色名称" align="center" show-overflow />
        <vxe-column field="remark" title="备注" align="center" show-overflow />
        <vxe-column title="状态" width="120" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="添加时间" width="160" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
        </vxe-column>
        <vxe-column title="是否启用" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['Post_Jurisdiction_setRoleVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Get_Jurisdiction_getAdminStaffByRole']"
                size="small"
                type="primary"
                @click="handleStaff(row.id)"
              >
                查看员工
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setAdminAppliByRole']"
                size="small"
                type="primary"
                @click="handleSelectMenu(row)"
              >
                绑定权限
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setRole']"
                size="small"
                type="primary"
                @click="handleUpdate(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setDelRole']"
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

    <!-- 添加/编辑 角色 -->
    <el-dialog
      :title="isEdit ? '编辑角色' : '添加角色'"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="roleFormRef" :model="role" :rules="rules" label-width="80px" size="small">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="role.roleName" class="input-width" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="role.remark" type="textarea" :rows="5" class="input-width" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 查看员工 -->
    <el-dialog
      title="员工列表"
      v-model="staffDialogVisible"
      width="90%"
      :close-on-click-modal="false"
      @close="staffClose"
    >
      <el-card class="filter-container" shadow="never">
        <div style="margin-top: 15px">
          <el-form :inline="true" :model="staffListQuery" size="small">
            <el-form-item label="输入搜索">
              <el-input
                v-model="staffListQuery.keyword"
                class="input-width"
                placeholder="搜索关键词"
                clearable
              />
            </el-form-item>
            <el-form-item class="fr">
              <el-button type="primary" size="small" @click="getStaffList">查询</el-button>
              <el-button size="small" @click="staffHandleResetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      <vxe-table :data="staffList" :loading="listLoading" border round :row-config="{ isHover: true }">
        <vxe-column field="id" title="编号" width="100" align="center" />
        <vxe-column field="name" title="姓名(账号)" align="center" show-overflow />
        <vxe-column field="dpName" title="所属部门" align="center" show-overflow />
        <vxe-column field="joinTime" title="创建时间" width="160" align="center" />
        <vxe-column title="状态" width="160" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">{{ row.verifyMsg }}</span>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="staffListQuery.pageIndex"
          v-model:page-size="staffListQuery.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 30]"
          :total="staffTotal"
          @size-change="staffHandleSizeChange"
          @current-change="staffHandleCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="roleList">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRoles,
  fetchStaffList,
  setRole,
  getRoleDetails,
  setRoleVerify,
  setDelRole
} from '@/api/role'
import { formatDate } from '@/utils/date'

const router = useRouter()

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, keyword: null })
const staffDefaultListQuery = () => ({ pageIndex: 1, pageSize: 10, id: null, keyword: null })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const role = reactive({})
const roleFormRef = ref(null)

const staffDialogVisible = ref(false)
const staffListQuery = reactive(staffDefaultListQuery())
const staffList = ref([])
const staffTotal = ref(0)
const currentRoleId = ref(null)

const rules = {
  remark: [{ max: 50, message: '最多50字符', trigger: 'blur' }],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个中英文数字', trigger: 'blur' }
  ]
}

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function getList() {
  listLoading.value = true
  getRoles(listQuery)
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

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否要修改该状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setRoleVerify({ verify: status, commonIds: row.id }).then((response) => {
        if (response.retCode === 200) {
          ElMessage.success('修改成功!')
          row.verify = status
        }
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
    })
}

function handleAdd() {
  isEdit.value = false
  Object.keys(role).forEach((k) => delete role[k])
  dialogVisible.value = true
}
function handleUpdate(row) {
  isEdit.value = true
  dialogVisible.value = true
  getRoleDetails({ id: row.id }).then((response) => {
    if (response.retCode === 200) {
      Object.assign(role, response.retData)
    }
  })
}
function handleDelete(row) {
  ElMessageBox.confirm('是否要删除该角色?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setDelRole({ id: row.id }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功!')
        getList()
      }
    })
  })
}
function handleDialogConfirm() {
  roleFormRef.value.validate((valid) => {
    if (!valid) return false
    const data = { ...role }
    if (!isEdit.value) {
      data.id = 0
      data.roleCode = '000'
    }
    setRole(data).then((response) => {
      if (response.retCode === 200) {
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！')
        getList()
      }
    })
  })
}
function handleSelectMenu(row) {
  router.push({ name: 'allocMenu', query: { roleId: row.id } })
}

// 查看员工
function handleStaff(id) {
  staffListQuery.id = id
  currentRoleId.value = id
  getStaffList()
}
function getStaffList() {
  listLoading.value = true
  fetchStaffList(staffListQuery).then((response) => {
    listLoading.value = false
    staffDialogVisible.value = true
    staffList.value = response.retData.pageData || []
    staffTotal.value = response.retData.recordCount || 0
  })
}
function staffHandleResetSearch() {
  Object.assign(staffListQuery, staffDefaultListQuery(), { id: currentRoleId.value })
  getStaffList()
}
function staffHandleSizeChange(val) {
  staffListQuery.pageIndex = 1
  staffListQuery.pageSize = val
  getStaffList()
}
function staffHandleCurrentChange(val) {
  staffListQuery.pageIndex = val
  getStaffList()
}
function staffClose() {
  Object.assign(staffListQuery, staffDefaultListQuery())
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
