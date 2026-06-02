<template>
  <log-list title="调度日志列表" :fetch="getBusinessLogs" :base-query="{ logBusinessType: 'waybill' }" :columns="columns" />
</template>

<script setup name="waybillLogs">
import LogList from '../components/LogList.vue'
import { getBusinessLogs } from '@/api/log'

const columns = [
  { prop: 'note', label: '内容', minWidth: 400 },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
