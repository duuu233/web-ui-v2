<script setup name="IotLogsTable">
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IotValue from './IotValue.vue'
import { categories, displayDeviceNo, normalizeDeviceNo, shanghaiTime } from '../model'
defineProps({ rows: { type: Array, default: () => [] }, loading: Boolean, compact: Boolean, allowReset: Boolean })
defineEmits(['reset'])
const router = useRouter(), expanded = shallowRef(null)
const names = new Map(categories.map(item => [item.value, item.label]))
const dialogOpen = computed({ get: () => !!expanded.value, set: value => { if (!value) expanded.value = null } })
async function copy(text) { try { await navigator.clipboard.writeText(String(text)); ElMessage.success('msgid 已复制') } catch { ElMessage.warning('复制失败，请手动选择 msgid 复制') } }
function openDevice(deviceNo) { try { router.push({ name: 'iotDeviceDetail', params: { deviceNo: normalizeDeviceNo(deviceNo, true) } }) } catch (error) { ElMessage.warning(error.message) } }
</script>
<template>
  <vxe-table :data="rows" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'id' }" :column-config="{ resizable: true }" max-height="560" empty-text="没有符合条件的日志">
    <vxe-column v-if="!compact" field="id" title="ID" width="80" />
    <vxe-column title="时间" width="175"><template #default="{ row }">{{ shanghaiTime(row.createdAt) }}</template></vxe-column>
    <vxe-column v-if="!compact" title="设备号" width="190"><template #default="{ row }"><el-button link type="primary" class="iot-mono" @click="openDevice(row.deviceNo)">{{ displayDeviceNo(row.deviceNo) }}</el-button></template></vxe-column>
    <vxe-column title="分类" width="90"><template #default="{ row }">{{ names.get(row.category) || row.category || '—' }}</template></vxe-column>
    <vxe-column field="action" title="动作" min-width="140" show-overflow />
    <vxe-column title="结果" width="145"><template #default="{ row }"><IotValue kind="result" :value="row.result" /></template></vxe-column>
    <vxe-column title="msgid" width="140"><template #default="{ row }"><el-button v-if="row.msgid" type="primary" link class="iot-mono" title="点击复制msgid" @click="copy(row.msgid)">{{ row.msgid }}</el-button><span v-else>—</span></template></vxe-column>
    <vxe-column title="详情" min-width="240"><template #default="{ row }"><div class="iot-log-detail"><span :title="row.detail">{{ row.detail || '—' }}</span><el-button v-if="row.detail" link type="primary" @click="expanded = row">展开</el-button></div></template></vxe-column>
    <template #empty><el-empty description="没有符合条件的日志" :image-size="64"><el-button v-if="allowReset" @click="$emit('reset')">重置筛选</el-button></el-empty></template>
  </vxe-table>
  <el-dialog v-model="dialogOpen" title="日志详情" width="min(760px, 92vw)" append-to-body><template v-if="expanded"><p><strong>{{ names.get(expanded.category) || expanded.category }} / {{ expanded.action }}</strong> · {{ shanghaiTime(expanded.createdAt) }}</p><pre class="iot-log-full">{{ expanded.detail }}</pre></template></el-dialog>
</template>
