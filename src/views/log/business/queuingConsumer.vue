<template>
  <log-list title="消息队列消费日志列表" :fetch="getQueuingConsumerLogs" :columns="columns" />
</template>

<script setup name="queuingConsumerLogs">
import LogList from '../components/LogList.vue'
import { getQueuingConsumerLogs } from '@/api/log'

const columns = [
  { prop: 'note', label: '内容', minWidth: 400 },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
