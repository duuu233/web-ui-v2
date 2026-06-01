<template>
  <div class="file-upload">
    <el-upload
      v-if="!disabled && fileList.length < maxCount"
      :action="''"
      :http-request="handleUpload"
      :show-file-list="false"
      :before-upload="beforeUpload"
    >
      <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>
    <div v-if="fileList && fileList.length" class="file-list">
      <div v-for="(item, index) in fileList" :key="index" class="file-item">
        <a :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
        <el-icon v-if="!disabled" class="del" @click="handleRemove(index)"><Delete /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup name="FileUpload">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { client, getFileNameUUID } from '@/utils/ali-oss'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])

const fileList = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function beforeUpload() {
  return true
}

async function handleUpload(option) {
  try {
    const ossClient = await client()
    const file = option.file
    const fileName = `web/${getFileNameUUID()}_${file.name}`
    const res = await ossClient.put(fileName, file)
    fileList.value = [{ name: file.name, url: res.url }]
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

function handleRemove() {
  fileList.value = []
}
</script>

<style lang="scss" scoped>
.file-upload {
  display: inline-block;
}
.file-list {
  margin-top: 6px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-item .del {
  cursor: pointer;
  color: #f56c6c;
}
</style>
