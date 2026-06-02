<template>
  <log-list title="异常日志列表" :fetch="getErrorLogs" :columns="columns" />
</template>

<script setup name="errLogs">
import LogList from '../components/LogList.vue'
import { getErrorLogs } from '@/api/log'

const columns = [
  { prop: 'exTypeMsg', label: '错误说明' },
  { prop: 'errorRes', label: '响应报文', minWidth: 400 },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
