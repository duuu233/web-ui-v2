<script setup name="IntimgDeviceFilters">
// 设备筛选：版本状态、在线、登记状态、设备号搜索（没有槽位筛选）
import { VERSION_STATES } from '../model'

defineProps({ showKeyword: { type: Boolean, default: true } })
const model = defineModel({ type: Object, required: true })
const emit = defineEmits(['search', 'reset'])
const set = (key, value) => { model.value = { ...model.value, [key]: value } }
</script>

<template>
  <el-form inline class="intimg-toolbar" @submit.prevent="emit('search')">
    <el-form-item label="版本状态">
      <el-select :model-value="model.versionState || ''" style="width: 120px" @update:model-value="set('versionState', $event)">
        <el-option value="" label="全部" />
        <el-option v-for="item in VERSION_STATES" :key="item.value" :value="item.value" :label="item.text" />
      </el-select>
    </el-form-item>
    <el-form-item label="在线">
      <el-select :model-value="model.online ?? ''" style="width: 110px" @update:model-value="set('online', $event === '' ? null : $event)">
        <el-option value="" label="全部" />
        <el-option :value="true" label="仅在线" />
        <el-option :value="false" label="仅离线" />
      </el-select>
    </el-form-item>
    <el-form-item label="登记状态">
      <el-select :model-value="model.registered ?? ''" style="width: 120px" @update:model-value="set('registered', $event === '' ? null : $event)">
        <el-option value="" label="全部" />
        <el-option :value="true" label="已激活" />
        <el-option :value="false" label="未激活" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="showKeyword" label="设备号">
      <el-input :model-value="model.keyword || ''" clearable placeholder="支持部分匹配" style="width: 180px" @update:model-value="set('keyword', $event)" @keyup.enter="emit('search')" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="emit('search')">查询</el-button>
      <el-button @click="emit('reset')">重置</el-button>
    </el-form-item>
  </el-form>
</template>
