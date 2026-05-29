<template>
  <div>
    <el-card class="app-container" shadow="never">
      <template #header>
        <span>地区配置</span>
      </template>
      <el-tree
        ref="treeRef"
        v-loading="isLoading"
        :data="treeData"
        node-key="id"
        highlight-current
        :props="defaultProps"
        :default-expanded-keys="[-1]"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node show-hide" style="width: 100%">
            <span class="handle-btns-label">
              <el-icon v-if="data.childs && data.childs.length"><Location /></el-icon>
              <el-icon v-else><LocationInformation /></el-icon>
              {{ node.data.areaName }}
            </span>
            <span class="handle-btns">
              <el-icon
                v-permission="['Post_Common_SetAreaDataEdit']"
                style="padding-left: 10px"
                @click.stop="append(data)"
              >
                <Plus />
              </el-icon>
              <el-icon
                v-if="node.data.areaName !== '中国'"
                v-permission="['Post_Common_SetAreaDataUpdateName']"
                style="padding-left: 10px"
                @click.stop="edit(data)"
              >
                <Edit />
              </el-icon>
              <el-icon
                v-if="node.data.areaName !== '中国'"
                v-permission="['Post_Common_SetAreaDataDelete']"
                style="padding-left: 10px"
                @click.stop="remove(data)"
              >
                <Delete />
              </el-icon>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <el-dialog
      :title="isEdit ? '编辑' : '新增'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="rules" size="small">
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="form.name" style="width: 250px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="areaSettings">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAreaDataList,
  setAreaDataDelete,
  setAreaDataEdit,
  setAreaDataUpdateName,
  getAreaDataDetail
} from '@/api/areaSettings'

const treeRef = ref(null)
const treeData = ref([])
const isLoading = ref(true)
const defaultProps = { children: 'childs', label: 'areaName' }

const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({ id: null, parentId: null })
const formRef = ref(null)
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
  ]
}

function resetForm() {
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, { id: null, parentId: null })
}

function treeList() {
  isLoading.value = true
  getAreaDataList().then((response) => {
    if (response.retCode === 200) {
      const data = [{ areaId: 0, areaName: '中国', childs: [], id: -1 }]
      data[0].childs = response.retData || []
      treeData.value = data
      isLoading.value = false
    }
  })
}

function edit(data) {
  isEdit.value = true
  getAreaDataDetail({ id: data.areaId }).then((response) => {
    if (response.retCode === 200) {
      resetForm()
      Object.assign(form, response.retData)
      dialogVisible.value = true
    } else {
      ElMessage.error('获取详情失败')
    }
  })
}
function append(data) {
  isEdit.value = false
  resetForm()
  form.parentId = data.areaId
  dialogVisible.value = true
}
function remove(data) {
  ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setAreaDataDelete({ commonIds: data.areaId }).then((response) => {
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
    const api = isEdit.value ? setAreaDataUpdateName : setAreaDataEdit
    api(form).then((response) => {
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
