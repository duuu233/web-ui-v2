<script setup name="userProductImage">
import { reactive, ref, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import ListToolbar from '@/components/ListToolbar/index.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import MultiUpload from '@/components/Upload/MultiUpload.vue'
import { usePagedList, cleanQuery } from '@/composables/usePagedList'
import { formatDate } from '@/utils/date'
import { getProductList } from '@/api/productList'
import {
  addUserProductImg,
  deleteUserProductImg,
  editUserProductImg,
  getUserProductImgDetail,
  getUserProductImgList,
  setUserProductImgVerify
} from '@/api/userProductImage'

const languageOptions = [
  { value: 0, label: '英语' },
  { value: 1, label: '英语' },
  { value: 2, label: '德语' },
  { value: 3, label: '西班牙语' },
  { value: 4, label: '法语' },
  { value: 5, label: '意大利语' },
  { value: 6, label: '葡萄牙语' }
]

const verifyOptions = [
  { value: 1, label: '有效' },
  { value: 0, label: '无效' }
]

const defaultListQuery = () => ({
  pageIndex: 1,
  pageSize: 10,
  keyword: null,
  language: null,
  userId: null,
  productId: null,
  verify: null
})

const defaultForm = () => ({
  uProductImgId: null,
  userId: null,
  productId: null,
  deviceId: '',
  imgList: []
})

const dateList = shallowRef([])
const dialogVisible = shallowRef(false)
const dialogMode = shallowRef('add')
const submitting = shallowRef(false)
const productOptions = ref([])
const formRef = ref(null)
const formData = reactive(defaultForm())

const {
  listQuery,
  list,
  total,
  listLoading,
  getList,
  handleSearchList: searchList,
  handleResetSearch: resetSearch,
  handleSizeChange,
  handleCurrentChange
} = usePagedList({
  fetchList: getUserProductImgList,
  defaultQuery: defaultListQuery,
  buildParams: cleanQuery
})

const rules = {
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  deviceId: [
    { required: true, message: '请输入设备ID', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  imgList: [{ required: true, type: 'array', message: '请上传产品图片', trigger: 'change' }]
}

function getRowId(row) {
  return row.uProductImgId || row.uproductImgId || row.id
}

function resetForm() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate?.()
}

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function applyDateRange() {
  if (dateList.value?.length) {
    listQuery.startDate = dateList.value[0]
    listQuery.endDate = dateList.value[1]
    return
  }
  delete listQuery.startDate
  delete listQuery.endDate
}

function loadProductOptions() {
  getProductList({ pageIndex: 1, pageSize: 1000 })
    .then((response) => {
      productOptions.value = response.retData?.pageData || []
    })
    .catch(() => {
      productOptions.value = []
    })
}

function handleSearchList() {
  applyDateRange()
  searchList()
}

function handleResetSearch() {
  dateList.value = []
  resetSearch()
}

function handleAdd() {
  dialogMode.value = 'add'
  resetForm()
  loadProductOptions()
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogMode.value = 'edit'
  resetForm()
  loadProductOptions()
  getUserProductImgDetail({ id: getRowId(row) }).then((response) => {
    const detail = response.retData || {}
    Object.assign(formData, defaultForm(), detail, {
      uProductImgId: detail.uProductImgId || detail.uproductImgId || getRowId(row),
      imgList: detail.img ? [{ name: '用户产品图片', url: detail.img }] : []
    })
    dialogVisible.value = true
  })
}

function buildSubmitData() {
  const submitData = {
    userId: formData.userId,
    productId: formData.productId,
    deviceId: formData.deviceId,
    img: formData.imgList[0]?.url || ''
  }
  if (dialogMode.value === 'edit') {
    submitData.uProductImgId = formData.uProductImgId
  }
  return submitData
}

function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) return false
    submitting.value = true
    const request = dialogMode.value === 'edit'
      ? editUserProductImg(buildSubmitData())
      : addUserProductImg(buildSubmitData())

    request
      .then(() => {
        ElMessage.success(dialogMode.value === 'edit' ? '编辑成功' : '新增成功')
        dialogVisible.value = false
        getList()
      })
      .finally(() => {
        submitting.value = false
      })
  })
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除该用户产品图片?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteUserProductImg({ id: getRowId(row) }).then(() => {
        ElMessage.success('删除成功')
        getList()
      })
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}

function handleStatusChange(status, row) {
  ElMessageBox.confirm('是否修改该图片状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      setUserProductImgVerify({ id: getRowId(row), verify: status }).then(() => {
        ElMessage.success('修改成功')
        row.verify = status
      })
    })
    .catch(() => {
      ElMessage.info('取消修改')
    })
}
</script>

<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="设备ID">
        <el-input
          v-model="listQuery.keyword"
          class="input-width"
          placeholder="请输入设备ID"
          clearable
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="用户ID">
        <el-input-number
          v-model="listQuery.userId"
          :min="1"
          :max="2147483647"
          :precision="0"
          :controls="false"
          placeholder="用户ID"
          style="width: 140px"
        />
      </el-form-item>

      <el-form-item label="产品ID">
        <el-input-number
          v-model="listQuery.productId"
          :min="1"
          :max="2147483647"
          :precision="0"
          :controls="false"
          placeholder="产品ID"
          style="width: 140px"
        />
      </el-form-item>

      <el-form-item label="语言">
        <el-select v-model="listQuery.language" clearable placeholder="请选择语言" style="width: 140px">
          <el-option
            v-for="item in languageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="listQuery.verify" clearable placeholder="请选择状态" style="width: 120px">
          <el-option
            v-for="item in verifyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="添加时间">
        <el-date-picker
          v-model="dateList"
          style="width: 300px"
          type="daterange"
          unlink-panels
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
    </SearchPanel>

    <ListToolbar title="用户产品图片列表">
      <el-button
        v-permission="['Post_UserProductImg_AddUserProductImg']"
        size="small"
        icon="Plus"
        type="primary"
        @click="handleAdd"
      >
        新增图片
      </el-button>
    </ListToolbar>

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
        <vxe-column field="uProductImgId" title="编号" width="90" align="center">
          <template #default="{ row }">{{ getRowId(row) || '-' }}</template>
        </vxe-column>
        <vxe-column field="nickName" title="用户昵称" min-width="120" align="center" show-overflow />
        <vxe-column field="userId" title="用户ID" width="90" align="center" />
        <vxe-column field="userMobile" title="手机号" min-width="120" align="center" show-overflow />
        <vxe-column field="userEmail" title="邮箱" min-width="160" align="center" show-overflow />
        <vxe-column field="deviceId" title="设备ID" min-width="150" align="center" show-overflow />
        <vxe-column field="productName" title="产品名称" min-width="140" align="center" show-overflow />
        <vxe-column title="产品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.img"
              :src="row.img"
              :preview-src-list="[row.img]"
              preview-teleported
              fit="cover"
              style="width: 60px; height: 60px"
            />
            <span v-else>-</span>
          </template>
        </vxe-column>
        <vxe-column title="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission="['Post_UserProductImg_SetUserProductImgVerify']"
              :model-value="row.verify"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="添加时间" width="170" align="center">
          <template #default="{ row }">{{ formatDateTime(row.joinTime) }}</template>
        </vxe-column>
        <vxe-column title="操作" width="170" align="center" fixed="right">
          <template #default="{ row }">
            <div class="handle-table-box">
              <el-button
                v-permission="['Post_UserProductImg_EditUserProductImg']"
                size="small"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['Post_UserProductImg_DeleteUserProductImg']"
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

    <PaginationBar
      v-model:current-page="listQuery.pageIndex"
      v-model:page-size="listQuery.pageSize"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'edit' ? '编辑用户产品图片' : '新增用户产品图片'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" size="small">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number
            v-model="formData.userId"
            :min="1"
            :max="2147483647"
            :precision="0"
            :controls="false"
            class="input-width"
            placeholder="请输入用户ID"
          />
        </el-form-item>
        <el-form-item label="产品" prop="productId">
          <el-select v-model="formData.productId" filterable clearable class="input-width" placeholder="请选择产品">
            <el-option
              v-for="item in productOptions"
              :key="item.productId || item.id"
              :label="item.productName"
              :value="item.productId || item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceId">
          <el-input
            v-model="formData.deviceId"
            class="input-width"
            placeholder="请输入设备ID"
            clearable
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="产品图片" prop="imgList">
          <MultiUpload v-model="formData.imgList" :max-count="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
