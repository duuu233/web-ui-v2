<template>
  <log-list title="消息队列发送日志列表" :fetch="getQueuingReceiveLogs" :columns="columns" />
</template>

<script setup name="queuingReceiveLogs">
import LogList from '../components/LogList.vue'
import { getQueuingReceiveLogs } from '@/api/log'

const columns = [
  { prop: 'note', label: '内容', minWidth: 400 },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
