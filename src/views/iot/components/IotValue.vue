<script setup name="IotValue">
import { computed } from 'vue'
import { statusValue } from '../model'
const props = defineProps({ kind: String, value: { default: null } })
const status = computed(() => statusValue(props.kind, props.value))
</script>
<template><el-tag :type="status.tone" effect="light" size="small" class="iot-value" :class="{ 'iot-value--progress': status.tone === 'primary' }">{{ status.text }}</el-tag></template>

<style scoped>
.iot-value--progress { color: #245e9d; background: #edf5ff; border-color: #c9def5; }
</style>
