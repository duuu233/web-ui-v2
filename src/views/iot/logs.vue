<script setup name="iotLogs">
import IotPage from './components/IotPage.vue'
import IotError from './components/IotError.vue'
import IotFilters from './components/IotFilters.vue'
import IotLogsTable from './components/IotLogsTable.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotList } from './useIotList'
const { data, loading, error, updatedAt, load, draft, params, validationError, search, reset, setPage, setSize } = useIotList('logs', 'iotLogs')
</script>
<template>
  <IotPage title="日志查询" subtitle="检索上下线、指令、升级、告警与异常，追溯完整执行过程" :loading="loading" :updated-at="updatedAt" @refresh="load">
    <IotFilters v-model="draft" kind="logs" @search="search" @reset="reset" />
    <el-alert v-if="validationError" :title="validationError" type="warning" :closable="false" class="iot-error" />
    <IotError :error="error" @retry="load" />
    <section class="iot-data-card"><div class="iot-section-heading"><h2>设备日志 <span>{{ data?.total ?? '—' }}</span></h2><small>按时间倒序 · 时间均为上海时间</small></div><IotLogsTable :rows="data?.list || []" :loading="loading" allow-reset @reset="reset" /><PaginationBar :current-page="params.page" :page-size="params.size" :total="data?.total || 0" :page-sizes="[20, 50, 100]" @size-change="setSize" @current-change="setPage" /></section>
  </IotPage>
</template>
