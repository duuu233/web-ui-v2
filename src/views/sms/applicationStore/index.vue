<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="客户端">
        <el-select v-model="listQuery.terminal" clearable placeholder="请选择客户端" style="width: 160px">
          <el-option
            v-for="item in clientList"
            v-show="item.value < 3 && item.value > 0"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="APP">
        <el-select v-model="listQuery.appTypeId" clearable placeholder="请选择APP" style="width: 160px">
          <el-option
            v-for="item in appTypeList"
            v-show="item.text !== '全部'"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </SearchPanel>

    <!-- 操作 -->
    <el-card class="operate-container" shadow="never">
      <div>
        <el-icon><Tickets /></el-icon>
        <span>应用商店列表</span>
      </div>
      <div>
        <el-button
          v-permission="['Post_AppVersion_SetAppMarketEdit']"
          size="small"
          type="primary"
          icon="Plus"
          @click="addFreight('add')"
        >
          新增应用商店
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
        <vxe-column field="appTypeName" title="APP名称" align="center" show-overflow />
        <vxe-column field="terminalMsg" title="客户端" align="center" show-overflow />
        <vxe-column field="marketTypeMsg" title="应用商店" align="center" show-overflow />
        <vxe-column field="marketUrl" title="应用商店地址" align="center" show-overflow />
        <vxe-column title="状态" width="120" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column
          v-permission="['Post_AppVersion_SetAppMarketVerify']"
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
        <vxe-column title="操作" width="170" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_AppVersion_SetAppMarketEdit']"
                size="small"
                type="primary"
                @click="addFreight('edit', row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_AppVersion_SetAppMarketDelete']"
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

    <!-- 添加/编辑 弹窗 -->
    <el-dialog
      :title="applicationType === 'edit' ? '编辑应用商店' : '新增应用商店'"
      v-model="freightDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="applicationFormRef" :model="applicationForm" :rules="rules" label-width="100px" size="small">
        <el-form-item label="APP名称" prop="appTypeId">
          <el-select v-model="applicationForm.appTypeId" class="input-width" clearable placeholder="请选择App名称">
            <el-option
              v-for="item in appTypeList"
              v-show="item.value > 0"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户端" prop="terminal">
          <el-select v-model="applicationForm.terminal" class="input-width" clearable placeholder="请选择客户端">
            <el-option
              v-for="item in clientList"
              v-show="item.value > 0 && item.value < 3"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="应用商店" prop="marketTypeId">
          <el-select v-model="applicationForm.marketTypeId" class="input-width" clearable placeholder="请选择应用商店">
            <el-option
              v-for="item in marketList"
              v-show="item.value > 0"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="应用商店地址" prop="marketUrl">
          <el-input v-model="applicationForm.marketUrl" placeholder="请输入应用商店地址" class="input-width" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="freightDialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submitFreightForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="applicationStore">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import {
  getAppMarketList,
  setAppMarketEdit,
  setAppMarketVerify,
  setAppMarketDelete
} from '@/api/applicationStore'

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, appTypeId: null, terminal: null, keyword: null })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)

const clientList = ref([])
const appTypeList = ref([])
const marketList = ref([])

const freightDialogVisible = ref(false)
const applicationType = ref(null)
const applicationForm = reactive({})
const applicationFormRef = ref(null)
const rules = {
  appTypeId: [{ required: true, message: '请选择APP名称', trigger: 'change' }],
  marketTypeId: [{ required: true, message: '请选择应用商店', trigger: 'change' }],
  terminal: [{ required: true, message: '请选择客户端', trigger: 'change' }],
  marketUrl: [{ required: true, message: '请输入应用商店地址', trigger: 'blur' }]
}

function loadDict() {
  // 沿用原项目：字典来自登录后写入 sessionStorage 的 allKeyValues
  try {
    const allKeyValues = JSON.parse(sessionStorage.getItem('allKeyValues'))
    if (allKeyValues) {
      clientList.value = allKeyValues[0].childs
      appTypeList.value = allKeyValues[2].childs
      marketList.value = allKeyValues[3].childs
    }
  } catch (e) {
    clientList.value = []
    appTypeList.value = []
    marketList.value = []
  }
}

function getList() {
  listLoading.value = true
  getAppMarketList(listQuery)
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
      setAppMarketVerify({ verify: status, commonIds: `${row.id}` }).then((response) => {
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
  if (!listQuery.terminal) delete listQuery.terminal
  if (!listQuery.appTypeId) delete listQuery.appTypeId
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

function addFreight(type, data) {
  applicationType.value = type
  Object.keys(applicationForm).forEach((k) => delete applicationForm[k])
  Object.assign(applicationForm, data || {})
  freightDialogVisible.value = true
}
function handleDelete(row) {
  ElMessageBox.confirm('是否要删除该应用商店?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setAppMarketDelete({ commonIds: row.id }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功!')
        getList()
      }
    })
  })
}
function submitFreightForm() {
  applicationFormRef.value.validate((valid) => {
    if (!valid) return false
    setAppMarketEdit({ ...applicationForm }).then((response) => {
      if (response.retCode === 200) {
        freightDialogVisible.value = false
        ElMessage.success(applicationType.value === 'edit' ? '编辑成功' : '新增成功')
        getList()
      }
    })
  })
}

onMounted(() => {
  loadDict()
  getList()
})
onActivated(getList)
</script>

<style lang="scss" scoped>
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
