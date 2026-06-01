<template>
  <log-list title="骑手打卡日志列表" :fetch="getDeliveryGuyStatusLogs" :columns="columns">
    <template #filters="{ query }">
      <el-form-item label="操作人员">
        <el-select v-model="query.operator" class="input-width" clearable placeholder="请选择操作人员类型">
          <el-option label="系统" value="0" />
          <el-option label="人工" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
        <el-select v-model="query.sortOrder" class="input-width" clearable placeholder="请选择操作时间类型">
          <el-option label="由近到远" value="0" />
          <el-option label="由远到近" value="1" />
        </el-select>
      </el-form-item>
    </template>
  </log-list>
</template>

<script setup name="clockLogs">
import LogList from '../components/LogList.vue'
import { getDeliveryGuyStatusLogs } from '@/api/log'

const columns = [
  { prop: 'deliveryGuyId', label: '配送员ID' },
  { prop: 'deliveryName', label: '配送员名称' },
  { prop: 'statusMsg', label: '状态' },
  { prop: 'terminalMsg', label: '操作类型' },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
