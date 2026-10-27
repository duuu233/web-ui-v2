<script setup name="IotFilters">
import SearchPanel from '@/components/SearchPanel/index.vue'
import { categories, results } from '../model'
const props = defineProps({ kind: String, modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue', 'search', 'reset'])
function change(key, value) { emit('update:modelValue', { ...props.modelValue, [key]: value }) }
</script>
<template>
  <SearchPanel :model="modelValue" title="查询条件" size="default" @search="emit('search')" @reset="emit('reset')">
    <el-form-item label="设备号"><el-input :model-value="kind === 'devices' ? modelValue.keyword : modelValue.deviceNo" :placeholder="kind === 'devices' ? '设备号模糊搜索，支持冒号' : '输入完整设备号，支持冒号'" clearable class="iot-filter-device" @update:model-value="change(kind === 'devices' ? 'keyword' : 'deviceNo', $event)" @keyup.enter="emit('search')" /></el-form-item>
    <el-form-item v-if="kind === 'devices'" label="在线状态"><el-select :model-value="modelValue.online" clearable placeholder="全部状态" style="width: 150px" @update:model-value="change('online', $event)"><el-option :value="true" label="在线" /><el-option :value="false" label="离线" /></el-select></el-form-item>
    <template v-else>
      <el-form-item label="分类"><el-select :model-value="modelValue.category" clearable placeholder="全部分类" style="width: 145px" @update:model-value="change('category', $event)"><el-option v-for="item in categories" :key="item.value" :value="item.value" :label="item.label" /></el-select></el-form-item>
      <el-form-item label="结果"><el-select :model-value="modelValue.result" clearable placeholder="全部结果" style="width: 175px" @update:model-value="change('result', $event)"><el-option v-for="item in results" :key="item" :value="item" :label="item" /></el-select></el-form-item>
      <el-form-item label="开始时间"><el-date-picker :model-value="modelValue.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="不限开始时间" style="width: 210px" @update:model-value="change('startTime', $event)" /></el-form-item>
      <el-form-item label="结束时间"><el-date-picker :model-value="modelValue.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="不限结束时间" style="width: 210px" @update:model-value="change('endTime', $event)" /></el-form-item>
    </template>
  </SearchPanel>
</template>
