<template>
  <div>
    <el-card class="app-container" shadow="never">
      <template #header>
        <span>部门管理</span>
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
          <span class="custom-tree-node show-hide" style="width: 100%">
            <span class="handle-btns-label">
              <el-icon v-if="data.childs && data.childs.length"><HomeFilled /></el-icon>
              <el-icon v-else><Document /></el-icon>
              {{ node.data.dpName }}
            </span>
            <span class="handle-btns">
              <el-tooltip effect="dark" content="新增" placement="top">
                <el-icon
                  v-permission="['Post_Jurisdiction_setDepartment']"
                  style="padding-left: 10px"
                  @click.stop="append(data, node)"
                >
                  <Plus />
                </el-icon>
              </el-tooltip>
              <el-tooltip v-if="data.id !== 0" effect="dark" content="编辑" placement="top">
                <el-icon
                  v-permission="['Post_Jurisdiction_setDepartment']"
                  style="padding-left: 10px"
                  @click.stop="edit(data)"
                >
                  <Edit />
                </el-icon>
              </el-tooltip>
              <el-tooltip v-if="data.id !== 0" effect="dark" content="删除" placement="top">
                <el-icon
                  v-permission="['Post_Jurisdiction_setDelDepartment']"
                  style="padding-left: 10px"
                  @click.stop="remove(data)"
                >
                  <Delete />
                </el-icon>
              </el-tooltip>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <el-dialog
      :title="isEdit ? '编辑部门' : '新增部门'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" label-width="150px" :rules="rules" size="small">
        <el-form-item label="部门名称" prop="dpName">
          <el-input v-model="form.dpName" style="width: 250px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="department">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDepartments, setFetchTreeList, setDelDepartment } from '@/api/menu'
import { validateC_E_N } from '@/utils/validate'

const treeRef = ref(null)
const menuTreeList = ref([])
const defaultProps = { children: 'childs', label: 'dpName' }

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({ id: null, parentId: null })
const formRef = ref(null)

const validateDpName = (rule, value, callback) => {
  if (!value) return callback(new Error('部门名称不能为空'))
  if (!validateC_E_N(value)) return callback(new Error('请输入中英文或数字'))
  if (`${value}`.length < 2 || `${value}`.length > 8) {
    return callback(new Error('请输入2~8个中英文数字'))
  }
  callback()
}
const rules = {
  dpName: [{ required: true, validator: validateDpName, trigger: 'blur' }]
}

function resetForm() {
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, { id: null, parentId: null })
}

function treeList() {
  getDepartments().then((response) => {
    menuTreeList.value = response.retData || []
  })
}

function edit(data) {
  isEdit.value = true
  resetForm()
  Object.assign(form, data)
  dialogVisible.value = true
}
function append(data, node) {
  if (node.level >= 10) {
    ElMessage.warning('最多添加至10级子项')
    return
  }
  isEdit.value = false
  resetForm()
  form.parentId = data.id
  dialogVisible.value = true
}
function remove(data) {
  const params = { id: data.id }
  if (data.parentId || data.parentId === 0) params.parentId = data.parentId
  ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setDelDepartment(params).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('删除成功！')
        treeList()
      }
    })
  })
}
function handleDialogConfirm() {
  formRef.value.validate((valid) => {
    if (!valid) return false
    setFetchTreeList(form).then((response) => {
      if (response.retCode === 200) {
        dialogVisible.value = false
        ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！')
        treeList()
      }
    })
  })
}

onMounted(treeList)
onActivated(treeList)
</script>

<style scoped lang="scss">
.show-hide {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.show-hide .handle-btns-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.show-hide .handle-btns {
  display: none;
}
.show-hide:hover .handle-btns {
  display: inline-flex !important;
  align-items: center;
}
</style>
