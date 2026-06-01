<template>
  <log-list title="无权限日志列表" :fetch="getJurisdictionLogs" :columns="columns" />
</template>

<script setup name="notJurisdictionLogs">
import LogList from '../components/LogList.vue'
import { getJurisdictionLogs } from '@/api/log'

const columns = [
  { prop: 'note', label: 'note', minWidth: 200 },
  { prop: 'adminName', label: 'adminName' },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
