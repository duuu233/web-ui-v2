<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-icon><EditPen /></el-icon>
      <span v-if="pageType === 1">添加用户</span>
      <span v-else-if="pageType === 2">编辑用户</span>
      <span v-else-if="pageType === 3">查看用户</span>
    </el-card>
    <el-card class="box-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="180px"
        size="small"
      >
        <el-form-item label="用户昵称" prop="nickName">
          <el-input
            v-model="formData.nickName"
            placeholder="用户昵称"
            clearable
            class="input-width"
            :disabled="pageType === 3"
          />
        </el-form-item>

        <el-form-item label="修改密码" prop="passwordEdit">
          <el-input
            v-model="formData.passwordEdit"
            placeholder="请输入修改后的账号密码"
            class="input-width"
            clearable
            show-password
            :disabled="pageType === 3"
          />
          <i style="padding-left: 10px">修改提交成功后将覆盖原有密码！</i>
        </el-form-item>

        <el-form-item label="邮箱" prop="userEmail">
          <el-input
            v-model="formData.userEmail"
            placeholder="请输入邮箱"
            class="input-width"
            clearable
            :disabled="pageType === 3"
          />
        </el-form-item>
        <el-form-item>
          <el-button v-if="pageType !== 3" type="primary" @click="submitForm">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import md5 from 'js-md5'
import { getUserDetails, setUserInfo } from '@/api/userList'

const props = defineProps({
  pageType: {
    type: Number,
    default: 3
  }
})

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const formData = ref({})
let isCreated = false

const rules = {
  nickName: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  passwordEdit: [
    { required: false, message: '请输入账号密码', trigger: 'blur' },
    { min: 6, max: 20, message: '请输入6位长度以上的密码', trigger: 'blur' }
  ]
}

async function getData() {
  const res = await getUserDetails({ id: route.query.id })
  formData.value = res.retData || {}
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return false
    if (formData.value.passwordEdit) {
      formData.value.password = md5(formData.value.passwordEdit)
      delete formData.value.passwordEdit
    }
    await setUserInfo(formData.value)
    const message = props.pageType === 1 ? '新增成功' : '编辑成功'
    ElMessage({ message, type: 'success', duration: 1000 })
    setTimeout(() => {
      router.push({ path: '/sms/userList' })
    }, 1600)
  })
}

onMounted(() => {
  if (props.pageType !== 1) {
    getData()
  }
  isCreated = true
})
onActivated(() => {
  if (!isCreated && props.pageType !== 1) {
    getData()
  }
  isCreated = false
})
onDeactivated(() => {
  isCreated = false
})
</script>

<style lang="scss" scoped>
.box-card {
  margin-top: 10px;
}
.filter-container {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
