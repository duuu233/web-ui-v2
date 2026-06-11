<script setup name="FileUpload">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { setFileUpload } from '@/api/oss'
import {
  getUploadPreviewUrl,
  isValidUploadSize,
  normalizeUploadFileList,
  normalizeUploadedFiles
} from './utils'

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
  get: () => normalizeUploadFileList(props.modelValue),
  set: (val) => emit('update:modelValue', normalizeUploadFileList(val))
})

function beforeUpload(file) {
  if (!isValidUploadSize(file)) {
    ElMessage.error('文件大小不能超过 15M')
    return false
  }
  return true
}

async function handleUpload(option) {
  try {
    const response = await setFileUpload(option.file)
    const uploadedFiles = normalizeUploadedFiles(response.retData, option.file)
    if (!uploadedFiles.length) throw new Error('Upload response does not include a file URL')

    fileList.value = uploadedFiles.slice(0, props.maxCount)
    option.onSuccess?.(response)
  } catch (error) {
    option.onError?.(error)
    ElMessage.error('上传失败')
  }
}

function handleRemove() {
  fileList.value = []
}
</script>

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
    <div v-if="fileList.length" class="file-list">
      <div v-for="(item, index) in fileList" :key="item.url || index" class="file-item">
        <a :href="item.url || getUploadPreviewUrl(item)" target="_blank" rel="noopener">{{ item.name }}</a>
        <el-icon v-if="!disabled" class="del" @click="handleRemove(index)"><Delete /></el-icon>
      </div>
    </div>
  </div>
</template>

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
