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
          <el-form-item label="菜单名称">
            <el-input
              v-model="listQuery.keyword"
              class="input-width"
              placeholder="请输入菜单名称"
              clearable
            />
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
        <span>菜单列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_Jurisdiction_setAdminSystems']"
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
        <vxe-column field="systemName" title="菜单名称" align="center" show-overflow />
        <vxe-column title="状态" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['Post_Jurisdiction_setAdminSystemsVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleHiddenChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column field="joinTime" title="添加时间" width="160" align="center" />
        <vxe-column title="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_Jurisdiction_setAdminSystemBindRoles']"
                size="small"
                type="primary"
                @click="handleBindingRole(row.id, row.systemName)"
              >
                绑定角色
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setAdminSystems']"
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setAdminAppli']"
                size="small"
                type="danger"
                @click="handlePermission(row.id)"
              >
                设置权限
              </el-button>
              <el-button
                v-permission="['Get_Jurisdiction_getAdminStaffBySys']"
                size="small"
                type="primary"
                @click="handleStaff(row.id)"
              >
                查看
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

    <!-- 添加/编辑 菜单 -->
    <el-dialog
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" size="small">
        <el-form-item label="菜单名称" prop="systemName">
          <el-input v-model="form.systemName" style="width: 250px" />
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
            <span :class="row.verify ? 'enable_txt' : ''">{{ row.verifyMsg }}</span>
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

    <!-- 绑定角色 -->
    <el-dialog
      :title="roleTitle"
      v-model="roleDialogVisible"
      width="60%"
      :close-on-click-modal="false"
      @close="roleClose"
    >
      <el-card class="filter-container" shadow="never" style="margin-bottom: 20px">
        <div style="margin-top: 15px">
          <el-form :inline="true" :model="roleListQuery" size="small">
            <el-form-item label="输入搜索">
              <el-input
                v-model="roleListQuery.keyword"
                class="input-width"
                placeholder="搜索关键词"
                clearable
              />
            </el-form-item>
            <el-form-item class="fr">
              <el-button type="primary" size="small" @click="getRoleList">查询</el-button>
              <el-button size="small" @click="roleHandleResetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      <vxe-table
        ref="roleTableRef"
        :data="roleList"
        :loading="listLoading"
        border
        round
        :row-config="{ isHover: true, keyField: 'id' }"
        :checkbox-config="{ checkRowKeys: checkedBindRoleIds }"
      >
        <vxe-column type="checkbox" width="55" align="center" />
        <vxe-column field="roleNameCode" title="角色名称" align="center" show-overflow />
        <vxe-column title="状态" width="160" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enabled' : ''">{{ row.verify ? '启用' : '禁用' }}</span>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="roleListQuery.pageIndex"
          v-model:page-size="roleListQuery.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 30]"
          :total="roleTotal"
          @size-change="roleHandleSizeChange"
          @current-change="roleHandleCurrentChange"
        />
      </div>
      <div style="padding: 10px 10px 0 0; text-align: center">
        <el-button type="primary" size="small" @click="saveBindRoles">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="menuList">
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  fetchList,
  setAdminSystemsVerify,
  getAdminStaffBySys,
  setAdminSystems,
  getRoleBySystem,
  setAdminSystemBindRoles
} from '@/api/menu'
import { isArr } from '@/utils/index'

const router = useRouter()

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, keyword: null })
const staffDefaultListQuery = () => ({ pageIndex: 1, pageSize: 10, id: null, keyword: null })
const roleDefaultListQuery = () => ({ pageIndex: 1, pageSize: 10, id: null, keyword: null })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({})
const formRef = ref(null)
const rules = {
  systemName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个中英文数字', trigger: 'blur' }
  ]
}

const currentId = ref(null)

const staffDialogVisible = ref(false)
const staffListQuery = reactive(staffDefaultListQuery())
const staffList = ref([])
const staffTotal = ref(0)

const roleDialogVisible = ref(false)
const roleTitle = ref('')
const roleListQuery = reactive(roleDefaultListQuery())
const roleList = ref([])
const roleTotal = ref(0)
const roleTableRef = ref(null)
const oldBindRoleIds = ref([])
const checkedBindRoleIds = ref([])

function getList() {
  listLoading.value = true
  fetchList(listQuery)
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

function handleHiddenChange(status, row) {
  setAdminSystemsVerify({ verify: status, commonIds: row.id }).then((response) => {
    if (response.retCode === 200) {
      ElMessage.success('修改成功!')
      row.verify = status
    } else {
      ElMessage.info('修改失败')
    }
  })
}

function handleAdd() {
  isEdit.value = false
  Object.keys(form).forEach((k) => delete form[k])
  dialogVisible.value = true
}
function handleEdit(row) {
  isEdit.value = true
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, row)
  dialogVisible.value = true
}
function handleDialogConfirm() {
  formRef.value.validate((valid) => {
    if (!valid) return false
    const data = { ...form }
    if (!isEdit.value) data.verify = 1
    setAdminSystems(data).then((response) => {
      if (response.retCode === 200) {
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！')
        getList()
      }
    })
  })
}
function handlePermission(id) {
  router.push({ name: 'setPermission', query: { id } })
}

// 查看员工
function handleStaff(id) {
  staffListQuery.id = id
  currentId.value = id
  getStaffList()
}
function getStaffList() {
  listLoading.value = true
  getAdminStaffBySys(staffListQuery).then((response) => {
    if (response.retCode === 200) {
      listLoading.value = false
      staffDialogVisible.value = true
      staffList.value = response.retData.pageData || []
      staffTotal.value = response.retData.recordCount || 0
    }
  })
}
function staffHandleResetSearch() {
  Object.assign(staffListQuery, staffDefaultListQuery(), { id: currentId.value })
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

// 绑定角色
function handleBindingRole(id, name) {
  roleListQuery.id = id
  currentId.value = id
  roleTitle.value = `绑定 ${name} 下的角色`
  getRoleList()
}
function getRoleList() {
  listLoading.value = true
  roleDialogVisible.value = true
  getRoleBySystem(roleListQuery).then((response) => {
    listLoading.value = false
    roleList.value = response.retData.pageData || []
    const checked = roleList.value.filter((v) => v.isChecked).map((v) => v.id)
    oldBindRoleIds.value = checked
    checkedBindRoleIds.value = JSON.parse(JSON.stringify(checked))
    roleTotal.value = response.retData.recordCount || 0
    nextTick(() => {
      if (roleTableRef.value) {
        roleList.value.forEach((v) => {
          if (v.isChecked) roleTableRef.value.setCheckboxRow(v, true)
        })
      }
    })
  })
}
function roleHandleResetSearch() {
  Object.assign(roleListQuery, roleDefaultListQuery(), { id: currentId.value })
  getRoleList()
}
function roleHandleSizeChange(val) {
  roleListQuery.pageIndex = 1
  roleListQuery.pageSize = val
  getRoleList()
}
function roleHandleCurrentChange(val) {
  roleListQuery.pageIndex = val
  getRoleList()
}
function saveBindRoles() {
  const records = roleTableRef.value ? roleTableRef.value.getCheckboxRecords() : []
  const checkedIds = records.map((v) => v.id)
  if (isArr(checkedIds, oldBindRoleIds.value)) {
    ElMessage.warning('您还没做任何修改呢')
    return
  }
  if (!checkedIds.length) {
    ElMessage.warning('请选择需要绑定的角色')
    return
  }
  setAdminSystemBindRoles({ id: currentId.value, roleIds: checkedIds.join() }).then((response) => {
    if (response.retCode === 200) {
      ElMessage.success('绑定角色成功！')
      roleDialogVisible.value = false
    }
  })
}
function roleClose() {
  oldBindRoleIds.value = []
  checkedBindRoleIds.value = []
  Object.assign(roleListQuery, roleDefaultListQuery())
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
.enabled,
.enable_txt {
  color: #67c23a;
}
.disable_txt {
  color: #f56c6c;
}
</style>
