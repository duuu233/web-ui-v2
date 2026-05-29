<template>
  <el-card class="app-container" shadow="never">
    <template #header>
      <span>绑定权限</span>
    </template>
    <el-tree
      ref="treeRef"
      :data="menuTreeList"
      show-checkbox
      default-expand-all
      node-key="id"
      highlight-current
      :default-checked-keys="checkedIds"
      :props="defaultProps"
    >
      <template #default="{ node }">
        <span class="custom-tree-node">
          <span>{{ node.data.appName }} ({{ node.data.appCode }})</span>
        </span>
      </template>
    </el-tree>
    <div style="margin-top: 20px; text-align: center">
      <el-button type="primary" @click="handleSave">保 存</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
  </el-card>
</template>

<script setup name="allocMenu">
import { ref, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminAppliByRole, setAdminAppliByRole } from '@/api/role'
import { isArr, getUrlKey } from '@/utils/index'

const route = useRoute()
const router = useRouter()

const treeRef = ref(null)
const menuTreeList = ref([])
const checkedIds = ref([])
const defaultProps = { children: 'childs', label: 'appName' }

// 遍历找出所有已选中的叶子节点
function findAllCheckedChildren(data, arr) {
  data.forEach((item) => {
    if (item.childs && item.childs.length !== 0) {
      findAllCheckedChildren(item.childs, arr)
    } else if (item.isChecked === 1) {
      arr.push(item.id)
    }
  })
}

function treeList() {
  const id = route.query.roleId || getUrlKey('roleId', window.location.href)
  getAdminAppliByRole({ id }).then((response) => {
    if (response.retCode === 200) {
      checkedIds.value = []
      menuTreeList.value = response.retData || []
      const arr = []
      findAllCheckedChildren(menuTreeList.value, arr)
      checkedIds.value = arr
    }
  })
}

function handleSave() {
  const id = route.query.roleId || getUrlKey('roleId', window.location.href)
  const submitIds = treeRef.value
    .getCheckedKeys()
    .concat(treeRef.value.getHalfCheckedKeys())
  const index = submitIds.indexOf(0)
  if (index !== -1) submitIds.splice(index, 1)
  if (isArr(submitIds, checkedIds.value)) {
    ElMessage.warning('您还没做任何修改呢')
    return
  }
  ElMessageBox.confirm('是否修改绑定权限？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setAdminAppliByRole({ appIds: submitIds.join(), id }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('修改成功')
      }
    })
  })
}
function goBack() {
  router.back()
}

onMounted(treeList)
onActivated(treeList)
</script>

<style scoped lang="scss">
:deep(.el-tree) {
  max-height: 70vh;
  overflow: auto;
}
</style>
