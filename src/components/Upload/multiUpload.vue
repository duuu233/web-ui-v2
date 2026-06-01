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
    <div v-if="fileList && fileList.length" class="upload-list">
      <div v-for="(item, index) in fileList" :key="index" class="upload-list-item">
        <img :src="item.url" alt="" />
        <div v-if="!disabled" class="upload-list-item-actions">
          <span @click="handleRemove(index)"><el-icon><Delete /></el-icon></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="MultiUpload">
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
    default: 5
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

function beforeUpload(file) {
  const isImage = file.type.indexOf('image') !== -1
  if (!isImage) ElMessage.error('只能上传图片文件!')
  return isImage
}

async function handleUpload(option) {
  try {
    const ossClient = await client()
    const file = option.file
    const fileName = `web/${getFileNameUUID()}_${file.name}`
    const res = await ossClient.put(fileName, file)
    fileList.value = fileList.value.concat([{ name: file.name, url: res.url }])
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

function handleRemove(index) {
  const newList = fileList.value.slice()
  newList.splice(index, 1)
  fileList.value = newList
}
</script>

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
