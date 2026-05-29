<template>
  <div class="app-container">
    <el-card v-loading="loading" class="box-card" shadow="never">
      <template #header>
        <span>系统设置</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="160px" size="small">
        <template v-for="(item, index) in form.configList" :key="index">
          <el-form-item
            v-if="[1, 2].indexOf(item.configType) !== -1"
            :label="item.configKey"
            :prop="'configList.' + index + '.configValue'"
            :rules="rules.configValue"
          >
            <el-input
              v-if="item.configType === 2"
              v-model="item.configValue"
              placeholder="请输入平台邮箱"
              style="width: 311px"
              maxlength="40"
              show-word-limit
            />
            <el-input
              v-if="item.configType === 1"
              v-model="item.configValue"
              placeholder="请输入平台设备id"
              type="textarea"
              :rows="2"
              style="width: 311px"
              maxlength="500"
              show-word-limit
            />
            <i
              v-if="item.configType === 1"
              style="padding-left: 6px; font-size: 12px"
            >
              (多个之间请使用英文逗号分隔)
            </i>
          </el-form-item>
        </template>
      </el-form>
      <div class="btn-box">
        <el-button
          v-permission="['Post_Common_SetConfigDataEdit']"
          type="primary"
          size="small"
          @click="handleDialogConfirm"
        >
          保 存
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="config">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfigDataList, setConfigDataEdit } from '@/api/config'

const form = reactive({ configList: [] })
const loading = ref(true)
const formRef = ref(null)

const emailReg = /^[A-Za-z0-9一-龥]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
const validateConfigValue = (rule, value, callback) => {
  // rule.field 形如 configList.0.configValue, index 为页面从上到下顺序
  const index = rule.field.split('.')[1]
  if (index === '0') {
    if (!value) return callback(new Error('平台邮箱不能为空'))
    if (!emailReg.test(value)) return callback(new Error('请输入正确的邮箱'))
    return callback()
  }
  if (index === '1') {
    if (!value) return callback(new Error('平台设备id不能为空'))
    return callback()
  }
  callback()
}
const rules = {
  configValue: [{ required: true, validator: validateConfigValue, trigger: 'blur' }]
}

function getData() {
  getConfigDataList().then((response) => {
    if (response.retCode === 200) {
      form.configList = response.retData || []
      loading.value = false
    }
  })
}

function handleDialogConfirm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    setConfigDataEdit({ listConfigTypeValue: [...form.configList] }).then((res) => {
      if (res.retCode === 200) {
        ElMessage.success('保存成功！')
      }
      getData()
    })
  })
}

onMounted(getData)
onActivated(getData)
</script>

<style lang="scss" scoped>
.btn-box {
  text-align: center;
}
</style>
