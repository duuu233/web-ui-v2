<template>
  <div class="app-container">
    <PageHeader>
      <span v-if="route.query.type === 'add'">添加版本信息</span>
      <span v-else-if="route.query.type === 'edit'">编辑版本信息</span>
    </PageHeader>
    <el-card class="box-card">
      <el-form ref="appFormRef" :model="appForm" :rules="rules" label-width="180px" size="small">
        <el-form-item label="版本号" prop="versionNumber">
          <el-input v-model="appForm.versionNumber" placeholder="请输入版本号" class="input-width" />
          <i style="padding-left: 6px; font-size: 12px; color: var(--app-info)">(版本号填写格式如:V2.0.0)</i>
        </el-form-item>

        <el-form-item label="发布终端" prop="terminal">
          <el-radio-group v-model="appForm.terminal">
            <el-radio :label="1">Android</el-radio>
            <el-radio :label="2">IOS</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="应用商店地址" prop="attachment">
          <el-input
            v-model="appForm.attachment"
            placeholder="请输入应用商店地址"
            style="width: 350px"
            type="textarea"
            :rows="6"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <div class="section-title">
          <span>升级任务信息</span>
        </div>

        <el-form-item label="版本编号" prop="grade">
          <el-input v-model="appForm.grade" placeholder="请输入版本编号" class="input-width" />
          <i style="margin-left: 20px; font-size: 12px">
            新增版本需填写版本编号确保新版本编号大于老版本编号即可，只支持1以上数字。
          </i>
        </el-form-item>

        <el-form-item label="升级类型" prop="compulsory">
          <el-radio-group v-model="appForm.compulsory">
            <el-radio :label="1">强制升级</el-radio>
            <el-radio :label="3">普通升级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="versionDetail">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { valiNumber } from '@/utils/validate'
import { setAppVersionEdit, getAppVersionDetail } from '@/api/appVersion'
import PageHeader from '@/components/PageHeader/index.vue'
import { invalidateList } from '@/composables/useListRefresh'

const route = useRoute()
const router = useRouter()

const defaultForm = () => ({
  appTypeId: null,
  attachment: null,
  fileList: [],
  compulsory: null,
  id: null,
  releaseTime: null,
  terminal: null,
  upgradeTips: null,
  versionNumber: null,
  lastComVersion: null,
  grade: null,
  appMarketIdList: ''
})

const appForm = reactive(defaultForm())
const appFormRef = ref(null)

const validateGrade = (rule, value, callback) => {
  if (!value) return callback(new Error('版本编号不能为空'))
  if (!valiNumber(value)) return callback(new Error('请输入数字值'))
  if (value * 1 > 2147483647) return callback(new Error('最大值为2147483647'))
  callback()
}
const rules = {
  versionNumber: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  terminal: [{ required: true, message: '请选择客户端', trigger: 'change' }],
  attachment: [{ required: true, message: '请输入apk应用商店地址', trigger: 'blur' }],
  compulsory: [{ required: true, message: '请选择升级类型', trigger: 'change' }],
  grade: [{ required: true, validator: validateGrade, trigger: 'blur' }]
}

function getApplication() {
  getAppVersionDetail({ id: route.query.applicationId }).then((res) => {
    if (res.retCode === 200) {
      Object.assign(appForm, defaultForm(), res.retData, { fileList: [] })
    }
  })
}

function submitForm() {
  appFormRef.value.validate((valid) => {
    if (!valid) return false
    const form = { ...appForm }
    form.attachmentName = appForm.attachment
    form.fileList = []
    form.upgradeTips = '默认升级提示语'
    form.lastComVersion = '1.0.0'
    setAppVersionEdit(form).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success(route.query.type === 'edit' ? '编辑成功' : '新增成功')
        invalidateList('appVersion')
        router.push({ path: '/sms/appVersion' })
      }
    })
  })
}

function init() {
  if (route.query.applicationId) getApplication()
}

onMounted(init)
onActivated(init)
</script>

<style lang="scss" scoped>
.box-card {
  margin-top: 10px;
}
.section-title {
  background-color: var(--app-surface-muted);
  padding-left: 20px;
  margin-bottom: 30px;
  line-height: 32px;
}
</style>
