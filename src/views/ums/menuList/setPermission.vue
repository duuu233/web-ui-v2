<template>
  <el-card class="app-container" shadow="never">
    <template #header>
      <span>设置权限</span>
    </template>
    <el-tree
      ref="treeRef"
      :data="menuTreeList"
      default-expand-all
      node-key="id"
      highlight-current
      :props="defaultProps"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span class="tree-node-label">
            {{ node.data.appName }} ({{ node.data.appCode }})
          </span>
          <span class="handle-btns">
            <el-tooltip effect="dark" content="新增" placement="top">
              <el-button
                class="tree-action-btn"
                type="primary"
                link
                :icon="Plus"
                aria-label="新增"
                @click.stop="add(data)"
              />
            </el-tooltip>
            <el-tooltip
              v-if="data.id !== 0"
              effect="dark"
              content="编辑"
              placement="top"
            >
              <el-button
                class="tree-action-btn"
                type="primary"
                link
                :icon="Edit"
                aria-label="编辑"
                @click.stop="edit(data)"
              />
            </el-tooltip>
            <el-tooltip
              v-if="data.id !== 0"
              effect="dark"
              content="删除"
              placement="top"
            >
              <el-button
                class="tree-action-btn"
                type="danger"
                link
                :icon="Delete"
                aria-label="删除"
                @click.stop="remove(data)"
              />
            </el-tooltip>
          </span>
        </span>
      </template>
    </el-tree>
    <div style="margin-top: 20px; text-align: center">
      <el-button @click="goBack">返回</el-button>
    </div>

    <!-- 新增/编辑 权限模块 -->
    <el-dialog
      :title="isEdit ? '编辑' : '新增'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        label-width="150px"
        :rules="rules"
        size="small"
      >
        <el-form-item label="模块名称" prop="appName">
          <el-input v-model="form.appName" class="input-width" />
        </el-form-item>
        <el-form-item label="模块编码" prop="appCode">
          <el-input v-model="form.appCode" style="width: 350px" />
        </el-form-item>
        <el-form-item label="URL路径" prop="appUrl">
          <el-input v-model="form.appUrl" class="input-width" />
        </el-form-item>
        <el-form-item label="是否导航" prop="isNav">
          <el-radio-group v-model="form.isNav">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否刷新" prop="isRefresh">
          <el-radio-group v-model="form.isRefresh">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权重" prop="grade">
          <el-input v-model="form.grade" class="input-width" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleDialogConfirm"
          >确 定</el-button
        >
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup name="setPermission">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import {
  getAdminAppliBySys,
  setAdminAppli,
  setDelAdminAppli,
  getAdminAppliDetails
} from '@/api/menu'

const route = useRoute()
const router = useRouter()

const treeRef = ref(null)
const menuTreeList = ref([])
const defaultProps = { children: 'childs', label: 'appName' }
const id = ref(null)

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: 0,
  parentId: null,
  isNav: 1,
  isRefresh: 1,
  systemId: null
})
const formRef = ref(null)
const rules = {
  appName: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
  ],
  appCode: [
    { required: true, message: '请输入编码', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

function resetForm(extra = {}) {
  Object.keys(form).forEach(k => delete form[k])
  Object.assign(
    form,
    { id: 0, parentId: null, isNav: 1, isRefresh: 1, systemId: 0 },
    extra
  )
}

function treeList() {
  getAdminAppliBySys({ id: id.value }).then(response => {
    if (response.retCode === 200) {
      menuTreeList.value = response.retData || []
    }
  })
}

function add(data) {
  isEdit.value = false
  resetForm({ parentId: data.id, systemId: id.value * 1 })
  dialogVisible.value = true
}
function edit(data) {
  isEdit.value = true
  getAdminAppliDetails({ id: data.id }).then(res => {
    if (res.retCode === 200) {
      Object.keys(form).forEach(k => delete form[k])
      Object.assign(form, res.retData)
    }
  })
  dialogVisible.value = true
}
function remove(data) {
  ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setDelAdminAppli({ id: data.id }).then(response => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功！')
        treeList()
      }
    })
  })
}
function handleDialogConfirm() {
  formRef.value.validate(valid => {
    if (!valid) return false
    setAdminAppli(form).then(response => {
      if (response.retCode === 200) {
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！')
        treeList()
      }
    })
  })
}
function goBack() {
  router.back()
}

onMounted(() => {
  id.value = route.query.id
  treeList()
})
onActivated(() => {
  id.value = route.query.id
  treeList()
})
</script>

<style scoped lang="scss">
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
}
.tree-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.handle-btns {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}
.tree-action-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 16px;
}
</style>
