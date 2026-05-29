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
        <div>
          <el-button
            v-permission="['Post_Content_SetMessagePushEdit']"
            size="small"
            type="primary"
            icon="Plus"
            @click="handleAdd"
          >
            添加
          </el-button>
        </div>
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
        <vxe-column field="pushTypeMsg" title="推送类型" align="center" show-overflow />
        <vxe-column field="title" title="推送标题" align="center" show-overflow />
        <vxe-column field="content" title="推送详细内容" align="center" show-overflow />
        <vxe-column field="grade" title="权重" width="80" align="center" />
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
        <vxe-column field="urlTypeMsg" title="URL类型" align="center" show-overflow />
        <vxe-column title="状态" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.verify ? 'enable_txt' : 'disable_txt'">
              {{ row.verify ? '启用' : '禁用' }}
            </span>
          </template>
        </vxe-column>
        <vxe-column title="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['post_content_setMessagePushVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-if="row.verify"
                v-permission="['post_content_setMessagePushSend']"
                size="small"
                type="primary"
                @click="handleUpdate(row, 'send')"
              >
                推送
              </el-button>
              <el-button
                v-permission="['Post_Content_SetMessagePushEdit']"
                size="small"
                type="primary"
                @click="handleUpdate(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_Content_SetMessagePushDelete']"
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

    <!-- 添加/编辑/发送 弹窗 -->
    <el-dialog
      :title="isSend ? `发送消息推送(${sendTypeText})` : isEdit ? '编辑消息推送' : '添加消息推送'"
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      @close="dialogClose"
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="rules" size="small">
        <el-form-item label="推送标题" prop="title">
          <el-input
            v-model="form.title"
            maxlength="20"
            show-word-limit
            style="width: 350px"
            :disabled="isSend"
            placeholder="请输入推送标题"
          />
        </el-form-item>
        <el-form-item label="推送详细内容" prop="content">
          <el-input
            v-model="form.content"
            :rows="4"
            type="textarea"
            class="input-width"
            maxlength="100"
            placeholder="请输入推送详细内容"
            show-word-limit
            :disabled="isSend"
          />
        </el-form-item>
        <el-form-item label="推送图片" prop="image">
          <el-input
            v-model="form.image"
            class="input-width"
            placeholder="请输入推送图片地址"
            :disabled="isSend"
          />
        </el-form-item>
        <el-form-item label="推送类型" prop="pushType">
          <el-radio-group v-model="form.pushType" :disabled="isSend">
            <el-radio :label="2">订单通知</el-radio>
            <el-radio :label="5">服务通知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="URL类型" prop="urlType">
          <el-radio-group v-model="form.urlType" :disabled="isSend">
            <el-radio :label="0">无跳转</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权重" prop="grade">
          <el-input-number
            v-model="form.grade"
            :min="0"
            :max="10000"
            :precision="0"
            :controls="false"
            :disabled="isSend"
            class="input-width"
            placeholder="请输入权重值"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            :rows="4"
            type="textarea"
            class="input-width"
            maxlength="100"
            placeholder="请输入备注"
            show-word-limit
            :disabled="isSend"
          />
        </el-form-item>
        <el-form-item v-if="isSend" label="发送类型" prop="isPush">
          <el-radio-group v-model="form.isPush">
            <el-radio :label="1">推送+站内信</el-radio>
            <el-radio :label="0">站内信</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="isSend" label="接收对象类型" prop="receiveType">
          <el-radio-group v-model="form.receiveType">
            <el-radio :label="0">全部</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="messagePush">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMessagePushList,
  setMessagePushVerify,
  setMessagePushEdit,
  getMessagePushDetail,
  setMessagePushDelete,
  setMessagePushSend
} from '@/api/messagePush'

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, keyword: null, pushType: 2 })

const listQuery = reactive(defaultListQuery())
const list = ref([])
const total = ref(0)
const listLoading = ref(false)
const activeName = ref('2')
const sendTypeText = ref('订单通知')

const dialogVisible = ref(false)
const isEdit = ref(false)
const isSend = ref(false)
const form = reactive({})
const formRef = ref(null)
const rules = {
  title: [{ required: true, message: '请输入推送标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入推送详细内容', trigger: 'blur' }],
  image: [{ required: true, message: '请输入推送图片地址', trigger: 'change' }],
  pushType: [{ required: true, message: '请选择推送类型', trigger: 'change' }],
  isPush: [{ required: true, message: '请选择发送类型', trigger: 'change' }],
  urlType: [{ required: true, message: '请选择URL类型' }],
  receiveType: [{ required: true, message: '请选择接收对象类型', trigger: 'change' }]
}

function resetForm() {
  Object.keys(form).forEach((k) => delete form[k])
}

function getList() {
  listLoading.value = true
  getMessagePushList(listQuery)
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
  sendTypeText.value = activeName.value === '2' ? '订单通知' : '服务通知'
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

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否要修改该状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setMessagePushVerify({ verify: status, commonIds: row.id }).then((response) => {
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
function handleDelete(row) {
  ElMessageBox.confirm('是否要删除该消息推送?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setMessagePushDelete({ commonIds: row.id }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功!')
        getList()
      }
    })
  })
}

function handleAdd() {
  isEdit.value = false
  isSend.value = false
  resetForm()
  Object.assign(form, { urlType: 0, pushType: listQuery.pushType })
  dialogVisible.value = true
}
function handleUpdate(row, type) {
  if (type === 'send') {
    isSend.value = true
    isEdit.value = false
  } else {
    isSend.value = false
    isEdit.value = true
  }
  dialogVisible.value = true
  getMessagePushDetail({ id: row.id }).then((response) => {
    if (response.retCode === 200) {
      resetForm()
      Object.assign(form, response.retData)
    }
  })
}
function dialogClose() {
  resetForm()
}
function handleDialogConfirm() {
  formRef.value.validate((valid) => {
    if (!valid) return false
    if (isSend.value) {
      const sendForm = {
        pushImage: form.image,
        pushMessage: form.content,
        pushTitle: form.title,
        urlType: form.urlType,
        pushType: form.pushType,
        isPush: form.isPush,
        pushAlias: '',
        pushAudience: 'All'
      }
      setMessagePushSend(sendForm).then((response) => {
        if (response.retCode === 200) {
          dialogVisible.value = false
          ElMessage.success('发送成功！')
          getList()
        }
      })
    } else {
      const editForm = { ...form }
      if (!isEdit.value) editForm.verify = 1
      setMessagePushEdit(editForm).then((response) => {
        if (response.retCode === 200) {
          dialogVisible.value = false
          ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！')
          getList()
        }
      })
    }
  })
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
.enable_txt {
  color: #67c23a;
}
.disable_txt {
  color: #f56c6c;
}
</style>
