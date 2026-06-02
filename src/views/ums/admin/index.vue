<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="输入搜索">
        <el-input
          v-model="listQuery.keyword"
          class="input-width"
          placeholder="帐号/姓名"
          clearable
        />
      </el-form-item>
    </SearchPanel>

    <!-- 操作 -->
    <el-card class="operate-container" shadow="never">
      <div>
        <el-icon><Tickets /></el-icon>
        <span>员工列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_Jurisdiction_setAdminStaff']"
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
        <vxe-column field="id" title="编号" width="100" align="center" />
        <vxe-column field="name" title="姓名(账号)" align="center" show-overflow />
        <vxe-column field="dpName" title="所属部门" align="center" show-overflow />
        <vxe-column field="roleNames" title="角色" align="center" show-overflow />
        <vxe-column title="添加时间" width="160" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
        </vxe-column>
        <vxe-column title="状态" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="是否启用" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['Post_Jurisdiction_setAdminStaffVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.isSysAdmin === 1"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row.isSysAdmin === 0" class="handle-table-box">
              <el-button
                v-permission="['Post_Jurisdiction_setAdminStaffBindRoles']"
                size="small"
                type="primary"
                @click="handleSelectRole(row)"
              >
                绑定角色
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setAdminStaff']"
                size="small"
                type="primary"
                @click="handleUpdate(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_Jurisdiction_setDelAdminStaff']"
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

    <!-- 添加/编辑 员工 -->
    <el-dialog
      :title="isEdit ? '编辑员工' : '添加员工'"
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form ref="adminFormRef" :rules="rules" :model="admin" label-width="150px" size="small">
        <el-form-item label="登录帐号" prop="adminName">
          <el-input v-model="admin.adminName" style="width: 250px" placeholder="请输入登录帐号" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="admin.password"
            :type="pwdType"
            style="width: 250px"
            placeholder="请输入登录密码"
          />
        </el-form-item>
        <el-form-item v-else label="密码" prop="passwordEdit">
          <el-input
            v-model="admin.passwordEdit"
            :type="pwdType"
            style="width: 250px"
            placeholder="请输入登录密码"
          />
          <i style="font-size: 12px; padding-left: 6px">输入密码则更新密码</i>
        </el-form-item>
        <el-form-item label="姓名" prop="trueName">
          <el-input v-model="admin.trueName" style="width: 250px" />
        </el-form-item>
        <el-form-item label="所属部门" prop="departmentId">
          <el-select v-model="admin.departmentId" placeholder="选择部门" clearable style="width: 250px">
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.dpName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 绑定角色 -->
    <el-dialog
      :title="roleTitle"
      v-model="roleDialogVisible"
      width="60%"
      :close-on-click-modal="false"
      @close="roleClose"
    >
      <el-card class="filter-container" shadow="never" style="margin-bottom: 10px">
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
      <div style="padding: 10px 10px 0 0; text-align: right">
        <el-button type="primary" size="small" @click="saveBindRoles">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="adminList">
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import md5 from 'js-md5'
import SearchPanel from '@/components/SearchPanel/index.vue'
import {
  getAdminStaffs,
  setAdminStaffBindRoles,
  setAdminStaffVerify,
  setDelAdminStaff,
  setAdminStaff,
  getAdminStaffDetails,
  getRoleByAdminStaff
} from '@/api/login'
import { getDepartments } from '@/api/menu'
import { isArr } from '@/utils/index'
import { formatDate } from '@/utils/date'
import { validateC_E_N, validateE_N } from '@/utils/validate'

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, keyword: null })
const defaultAdmin = () => ({
  id: null,
  adminName: null,
  trueName: null,
  password: null,
  passwordEdit: null,
  nickName: null,
  departmentId: null,
  countyId: 3005
})
const roleDefaultListQuery = () => ({ pageIndex: 1, pageSize: 10, id: null, keyword: null })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const admin = reactive(defaultAdmin())
const adminFormRef = ref(null)
const pwdType = ref('password')
const departmentList = ref([])

const roleDialogVisible = ref(false)
const roleTitle = ref('')
const roleList = ref([])
const roleTotal = ref(0)
const roleListQuery = reactive(roleDefaultListQuery())
const roleTableRef = ref(null)
const oldBindRoleIds = ref([])
const checkedBindRoleIds = ref([])

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

const validateAdminName = (rule, value, callback) => {
  if (!value) return callback(new Error('请输入登录账号'))
  if (!validateC_E_N(value)) return callback(new Error('请输入中英文或数字'))
  if (`${value}`.length < 2 || `${value}`.length > 20) {
    return callback(new Error('请输入2~20个中英文数字'))
  }
  callback()
}
const validatePassword = (rule, value, callback) => {
  if (!value) return callback(new Error('请输入登录密码'))
  if (!validateE_N(value)) return callback(new Error('请输入6~20个英文数字或下划线'))
  if (`${value}`.length < 6 || `${value}`.length > 20) {
    return callback(new Error('请输入6~20个英文数字或下划线'))
  }
  callback()
}
const validatePasswordEdit = (rule, value, callback) => {
  if (value && !validateC_E_N(value)) return callback(new Error('请输入6~20个英文数字或下划线'))
  if ((value && `${value}`.length < 6) || (value && `${value}`.length > 20)) {
    return callback(new Error('请输入6~20个英文数字或下划线'))
  }
  callback()
}
const rules = {
  adminName: [{ required: true, validator: validateAdminName, trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  passwordEdit: [{ validator: validatePasswordEdit, trigger: 'blur' }],
  trueName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }]
}

function getList() {
  listLoading.value = true
  getAdminStaffs(listQuery)
    .then((response) => {
      listLoading.value = false
      if (response.retCode === 200) {
        list.value = response.retData.pageData || []
        total.value = response.retData.recordCount || 0
      }
    })
    .catch(() => {
      listLoading.value = false
    })
}

// 遍历部门树（除去顶级项），扁平为下拉选项
function findAllChildren(data, arr) {
  data.forEach((item) => {
    if (item.id !== 0) arr.push(item)
    if (item.childs && item.childs.length) findAllChildren(item.childs, arr)
  })
}
function getDepartmentList() {
  getDepartments().then((response) => {
    if (response.retCode === 200) {
      const arr = []
      findAllChildren(response.retData, arr)
      departmentList.value = arr
    }
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
      setAdminStaffVerify({ verify: status, commonIds: row.id }).then((response) => {
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

function handleAdd() {
  isEdit.value = false
  Object.assign(admin, defaultAdmin(), { id: 0 })
  dialogVisible.value = true
}
function handleUpdate(row) {
  isEdit.value = true
  dialogVisible.value = true
  getAdminStaffDetails({ id: row.id }).then((response) => {
    if (response.retCode === 200) {
      Object.assign(admin, defaultAdmin(), response.retData, { countyId: 3005 })
    }
  })
}
function handleDelete(row) {
  ElMessageBox.confirm('是否要删除该员工?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setDelAdminStaff({ id: row.id }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功!')
        getList()
      }
    })
  })
}
function handleDialogConfirm() {
  adminFormRef.value.validate((valid) => {
    if (!valid) return false
    const data = { ...admin }
    if (isEdit.value) {
      if (data.passwordEdit) data.password = md5(data.passwordEdit)
    } else {
      data.password = md5(data.password)
    }
    setAdminStaff(data).then((response) => {
      if (response.retCode === 200) {
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！')
        getList()
      }
    })
  })
}

// 绑定角色
function handleSelectRole(row) {
  roleListQuery.id = row.id
  roleTitle.value = `绑定 ${row.name} 下的角色`
  getRoleList()
}
function getRoleList() {
  listLoading.value = true
  roleDialogVisible.value = true
  getRoleByAdminStaff(roleListQuery).then((response) => {
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
  const id = roleListQuery.id
  Object.assign(roleListQuery, roleDefaultListQuery(), { id })
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
    ElMessage.warning('请先选择需要绑定的角色')
    return
  }
  setAdminStaffBindRoles({ adminStaffId: roleListQuery.id, roleIds: checkedIds.join() }).then(
    (response) => {
      if (response.retCode === 200) {
        ElMessage.success('绑定角色成功！')
        roleDialogVisible.value = false
        getList()
      }
    }
  )
}
function roleClose() {
  oldBindRoleIds.value = []
  checkedBindRoleIds.value = []
  Object.assign(roleListQuery, roleDefaultListQuery())
}

onMounted(() => {
  getList()
  getDepartmentList()
})
onActivated(() => {
  getList()
  getDepartmentList()
})
</script>

<style lang="scss" scoped>
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
