<script setup name="userListHandleDetail">
import { onActivated, onMounted, reactive, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import md5 from 'js-md5'
import { getUserDetail, setUserInfo } from '@/api/userList'
import { formatDate } from '@/utils/date'
import PageHeader from '@/components/PageHeader/index.vue'

const props = defineProps({
  pageType: {
    type: Number,
    default: 3
  }
})

const route = useRoute()
const router = useRouter()

const defaultForm = () => ({
  userId: null,
  userNo: '',
  nickName: '',
  userEmail: '',
  passwordEdit: '',
  countryName: '',
  countryCode: '',
  terminalMsg: '',
  verifyMsg: '',
  joinTime: ''
})

const formRef = ref(null)
const formData = reactive(defaultForm())
const submitting = shallowRef(false)
let isInitialized = false

const emailReg = /^[A-Za-z0-9_+.-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

const rules = {
  nickName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 1, max: 40, message: '长度在 1 到 40 个字符', trigger: 'blur' }
  ],
  userEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailReg, message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  passwordEdit: [
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

function resetForm() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate?.()
}

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

async function getData() {
  if (!route.query.id) return
  const res = await getUserDetail({ id: route.query.id })
  Object.assign(formData, defaultForm(), res.retData || {}, { passwordEdit: '' })
}

function buildSubmitData() {
  const submitData = {
    userId: formData.userId,
    nickName: formData.nickName,
    userEmail: formData.userEmail
  }
  if (formData.passwordEdit) {
    submitData.password = md5(formData.passwordEdit)
  }
  return submitData
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return false
    submitting.value = true
    try {
      await setUserInfo(buildSubmitData())
      ElMessage.success('编辑成功')
      router.push({ name: 'userList' })
    } finally {
      submitting.value = false
    }
  })
}

async function initializeData() {
  resetForm()
  if (props.pageType !== 1) await getData()
}

onMounted(() => {
  isInitialized = true
  initializeData()
})

onActivated(() => {
  if (!isInitialized) initializeData()
  isInitialized = false
})
</script>

<template>
  <div class="app-container">
    <PageHeader>
      <span v-if="pageType === 2">编辑用户</span>
      <span v-else>查看用户</span>
    </PageHeader>

    <el-card class="box-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
        size="small"
      >
        <el-form-item label="用户编号">
          <el-input v-model="formData.userNo" class="input-width" disabled />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickName">
          <el-input
            v-model="formData.nickName"
            placeholder="请输入用户昵称"
            clearable
            class="input-width"
            maxlength="40"
            show-word-limit
            :disabled="pageType === 3"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="userEmail">
          <el-input
            v-model="formData.userEmail"
            placeholder="请输入邮箱"
            class="input-width"
            clearable
            maxlength="80"
            show-word-limit
            :disabled="pageType === 3"
          />
        </el-form-item>

        <el-form-item v-if="pageType !== 3" label="修改密码" prop="passwordEdit">
          <el-input
            v-model="formData.passwordEdit"
            placeholder="不修改请留空"
            class="input-width"
            clearable
            show-password
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="终端">
          <el-input v-model="formData.terminalMsg" class="input-width" disabled />
        </el-form-item>

        <el-form-item label="国家">
          <el-input v-model="formData.countryName" class="input-width" disabled />
        </el-form-item>

        <el-form-item label="国家编号">
          <el-input v-model="formData.countryCode" class="input-width" disabled />
        </el-form-item>

        <el-form-item label="状态">
          <el-input v-model="formData.verifyMsg" class="input-width" disabled />
        </el-form-item>

        <el-form-item label="注册时间">
          <el-input :model-value="formatDateTime(formData.joinTime)" class="input-width" disabled />
        </el-form-item>

        <el-form-item>
          <el-button
            v-if="pageType !== 3"
            type="primary"
            :loading="submitting"
            @click="submitForm"
          >
            提交
          </el-button>
          <el-button @click="router.push({ name: 'userList' })">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.box-card {
  margin-top: 10px;
}

</style>
