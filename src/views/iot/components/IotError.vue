<script setup name="IotError">
import { computed } from 'vue'
const props = defineProps({ error: Object })
defineEmits(['retry'])
const title = computed(() => Number(props.error?.code) === 401 ? '后台鉴权失败，请联系管理员配置 Token' : Number(props.error?.code) === 4044 ? '设备不存在' : Number(props.error?.code) === 5000 ? '服务异常，请稍后重试' : '请求失败，请检查后重试')
</script>
<template><el-alert v-if="error" :title="title" type="error" show-icon :closable="false" class="iot-error"><p class="iot-error-message">code: {{ error.code }} · {{ error.msg }}</p><el-button size="small" @click="$emit('retry')">重试</el-button><slot /></el-alert></template>
