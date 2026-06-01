<template>
  <log-list
    title="骑手派单日志列表"
    :fetch="getWaybillDispatchLogs"
    :export-fn="getWaybillDispatchExcel"
    :columns="columns"
  >
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

<script setup name="sendOrdersLogs">
import LogList from '../components/LogList.vue'
import { getWaybillDispatchLogs, getWaybillDispatchExcel } from '@/api/log'

const columns = [
  { prop: 'guyName', label: '配送员名称' },
  { prop: 'ip', label: 'IP地址' },
  { prop: 'note', label: '配送信息', minWidth: 400 },
  { prop: 'waybillno', label: '运单号' },
  { prop: 'operator', label: '操作员' },
  { prop: 'joinTime', label: '操作时间', width: 160, time: true }
]
</script>
