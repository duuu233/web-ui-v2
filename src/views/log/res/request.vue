<template>
  <log-list title="请求日志列表" :fetch="getRequestLogs" :columns="columns" />
</template>

<script setup name="requestLogs">
import LogList from '../components/LogList.vue'
import { getRequestLogs } from '@/api/log'

const columns = [
  { prop: 'method', label: '请求类型' },
  { prop: 'param', label: '参数', minWidth: 400 },
  { prop: 'controllerName', label: 'controllerName', minWidth: 200 },
  { prop: 'actionName', label: 'actionName' },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
