<script setup name="MultiUpload">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { setFileUpload } from '@/api/oss'
import { isValidUploadSize, normalizeUploadedFiles } from './utils'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 5
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])

const fileList = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

function beforeUpload(file) {
  const isImage = file.type.indexOf('image') !== -1
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isValidUploadSize(file)) {
    ElMessage.error('文件大小不能超过 15M')
    return false
  }
  return true
}

async function handleUpload(option) {
  try {
    const remainingCount = props.maxCount - fileList.value.length
    if (remainingCount <= 0) return

    const response = await setFileUpload(option.file)
    const uploadedFiles = normalizeUploadedFiles(response.retData, option.file).slice(0, remainingCount)
    if (!uploadedFiles.length) throw new Error('Upload response does not include a file URL')

    fileList.value = fileList.value.concat(uploadedFiles)
    option.onSuccess?.(response)
  } catch (error) {
    option.onError?.(error)
    ElMessage.error('上传失败')
  }
}

function handleRemove(index) {
  const newList = fileList.value.slice()
  newList.splice(index, 1)
  fileList.value = newList
}
</script>

<template>
  <div class="upload-container">
    <el-upload
      v-if="!disabled && fileList.length < maxCount"
      :action="''"
      :http-request="handleUpload"
      :show-file-list="false"
      :before-upload="beforeUpload"
      list-type="picture-card"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
    <div v-if="fileList.length" class="upload-list">
      <div v-for="(item, index) in fileList" :key="item.url || index" class="upload-list-item">
        <img :src="item.url" alt="" />
        <div v-if="!disabled" class="upload-list-item-actions">
          <span @click="handleRemove(index)"><el-icon><Delete /></el-icon></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-container {
  display: inline-block;
}

.upload-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-list-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.upload-list-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-list-item-actions {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 2px 6px;
  cursor: pointer;
}
</style>
