<template>
  <log-list title="响应日志列表" :fetch="getResLogs" :columns="columns" />
</template>

<script setup name="resLogs">
import LogList from '../components/LogList.vue'
import { getResLogs } from '@/api/log'

const columns = [
  { prop: 'result', label: '响应报文', minWidth: 400 },
  { prop: 'controllerName', label: 'controllerName', minWidth: 200 },
  { prop: 'actionName', label: 'actionName' },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
