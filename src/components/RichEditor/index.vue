<template>
  <div class="rich-editor" :class="{ 'is-disabled': disabled }" :style="{ width }">
    <Toolbar
      v-if="!disabled"
      class="rich-editor__toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="simple"
    />
    <Editor
      v-model="innerValue"
      class="rich-editor__body"
      :style="{ height }"
      :default-config="editorConfig"
      mode="simple"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script setup name="RichEditor">
import { ref, computed, shallowRef, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { setFileUpload } from '@/api/oss'
import '@wangeditor/editor/dist/css/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  height: {
    type: String,
    default: '400px'
  },
  width: {
    type: String,
    default: '100%'
  },
  // 图片上传大小上限(MB)
  maxImageSize: {
    type: Number,
    default: 5
  }
})
const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = shallowRef(null)
const innerValue = ref(props.modelValue || '')

// 外部值变化时同步到编辑器（避免回填时光标跳动，仅在内容不一致时更新）
watch(
  () => props.modelValue,
  (val) => {
    if ((val || '') !== (innerValue.value || '')) innerValue.value = val || ''
  }
)

const toolbarConfig = {
  excludeKeys: ['group-video', 'insertVideo', 'uploadVideo', 'fullScreen', 'codeBlock']
}

const editorConfig = computed(() => ({
  placeholder: props.placeholder,
  readOnly: props.disabled,
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        if (props.maxImageSize > 0 && file.size > props.maxImageSize * 1024 * 1024) {
          ElMessage.error(`图片大小不能超过 ${props.maxImageSize}M`)
          return
        }
        try {
          const res = await setFileUpload(file)
          const data = res.retData
          const item = Array.isArray(data) ? data[0] : data
          const url = typeof item === 'string' ? item : item?.url || item?.fileUrl || item?.filePath
          if (!url) throw new Error('Upload response does not include a file URL')
          insertFn(url, file.name, url)
        } catch (e) {
          ElMessage.error('图片上传失败')
        }
      }
    }
  }
}))

function handleCreated(editor) {
  editorRef.value = editor
  if (props.disabled) editor.disable()
}

function handleChange(editor) {
  const html = editor.isEmpty() ? '' : editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

// 只读状态切换
watch(
  () => props.disabled,
  (val) => {
    if (!editorRef.value) return
    val ? editorRef.value.disable() : editorRef.value.enable()
  }
)

onBeforeUnmount(() => {
  editorRef.value?.destroy()
  editorRef.value = null
})

defineExpose({ editorRef })
</script>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  line-height: normal;

  &__toolbar {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &.is-disabled {
    background-color: var(--el-disabled-bg-color);
  }

  :deep(.w-e-text-container) {
    background-color: transparent;
  }
}
</style>
