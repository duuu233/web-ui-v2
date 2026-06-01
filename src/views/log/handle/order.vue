<template>
  <log-list title="订单操作列表" :fetch="getOperationLogs" :base-query="{ logOperatType: 'order' }" :columns="columns" />
</template>

<script setup name="orderLogs">
import LogList from '../components/LogList.vue'
import { getOperationLogs } from '@/api/log'

const columns = [
  { prop: 'operatName', label: '操作名称' },
  { prop: 'operatContent', label: '内容', minWidth: 400 },
  { prop: 'adminName', label: 'adminName' },
  { prop: 'controllerName', label: 'controllerName' },
  { prop: 'actionName', label: 'actionName' },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
