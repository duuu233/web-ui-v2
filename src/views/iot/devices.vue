<script setup name="iotDevices">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IotPage from './components/IotPage.vue'
import IotError from './components/IotError.vue'
import IotValue from './components/IotValue.vue'
import IotFilters from './components/IotFilters.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotList } from './useIotList'
import { displayDeviceNo, normalizeDeviceNo, shanghaiTime, valueText } from './model'
const router = useRouter()
const { data, loading, error, updatedAt, load, draft, params, validationError, search, reset, setPage, setSize } = useIotList('devices', 'iotDevices')
function open(row, logs = false) { try { const deviceNo = normalizeDeviceNo(row.deviceNo, true); router.push(logs ? { name: 'iotLogs', query: { deviceNo } } : { name: 'iotDeviceDetail', params: { deviceNo } }) } catch (error) { ElMessage.warning(error.message) } }
function cellClick({ row, column }) { if (column.field !== '_actions') open(row) }
</script>
<template>
  <IotPage title="设备管理" subtitle="按设备号和在线状态定位设备，查看状态与日志" :loading="loading" :updated-at="updatedAt" @refresh="load">
    <IotFilters v-model="draft" kind="devices" @search="search" @reset="reset" />
    <el-alert v-if="validationError" :title="validationError" type="warning" :closable="false" class="iot-error" />
    <IotError :error="error" @retry="load" />
    <section class="iot-data-card"><div class="iot-section-heading"><h2>设备列表 <span>{{ data?.total ?? '—' }}</span></h2><small>点击设备行查看详情</small></div>
      <vxe-table :data="data?.list || []" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'deviceNo' }" :column-config="{ resizable: true }" max-height="560" empty-text="暂无设备" @cell-click="cellClick">
        <vxe-column field="deviceNo" title="设备号" min-width="200"><template #default="{ row }"><el-button type="primary" link class="iot-mono" @click.stop="open(row)">{{ displayDeviceNo(row.deviceNo) }}</el-button></template></vxe-column>
        <vxe-column title="状态" width="85"><template #default="{ row }"><IotValue kind="online" :value="row.online" /></template></vxe-column>
        <vxe-column title="最近上线" width="175"><template #default="{ row }">{{ shanghaiTime(row.lastOnlineAt) }}</template></vxe-column>
        <vxe-column title="固件版本" min-width="130" show-overflow><template #default="{ row }"><span class="iot-mono">{{ valueText(row.firmwareVersion) }}</span></template></vxe-column>
        <vxe-column title="电量" width="90"><template #default="{ row }"><IotValue kind="battery" :value="row.battery" /></template></vxe-column>
        <vxe-column title="信号" width="115"><template #default="{ row }"><IotValue kind="wifiRssi" :value="row.wifiRssi" /></template></vxe-column>
        <vxe-column title="TF 卡" width="90"><template #default="{ row }"><IotValue kind="tfStatus" :value="row.tfStatus" /></template></vxe-column>
        <vxe-column field="_actions" title="操作" width="120" fixed="right"><template #default="{ row }"><el-button type="primary" link @click.stop="open(row)">详情</el-button><el-button type="primary" link @click.stop="open(row, true)">日志</el-button></template></vxe-column>
        <template #empty><el-empty description="暂无设备" :image-size="64"><el-button @click="reset">清空筛选</el-button></el-empty></template>
      </vxe-table>
      <PaginationBar :current-page="params.page" :page-size="params.size" :total="data?.total || 0" :page-sizes="[20, 50, 100]" @size-change="setSize" @current-change="setPage" />
    </section>
  </IotPage>
</template>
