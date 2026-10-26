<script setup name="ProductDeviceTable">
import { formatDate } from '@/utils/date'
import { permission } from '../model'
defineProps({ rows: { type: Array, default: () => [] }, loading: Boolean, busyId: { type: [Number, String], default: null }, productName: { type: Function, required: true } })
const emit = defineEmits(['detail', 'edit', 'toggle'])
function date(value) { return value ? formatDate(new Date(value), 'yyyy-MM-dd hh:mm:ss') : '—' }
</script>

<template>
  <div class="table-container">
    <vxe-table :data="rows" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'pDeviceId' }" :column-config="{ resizable: true }" max-height="560">
      <vxe-column field="pDeviceId" title="记录ID" width="90" align="center" />
      <vxe-column title="产品" min-width="150" show-overflow><template #default="{ row }">{{ productName(row.productId) }}</template></vxe-column>
      <vxe-column field="deviceId" title="设备ID" min-width="150" show-overflow />
      <vxe-column title="状态" width="100" align="center"><template #default="{ row }"><el-tag :type="Number(row.verify) === 1 ? 'success' : 'info'" size="small">{{ row.verifyMsg || (Number(row.verify) === 1 ? '启用' : Number(row.verify) === 0 ? '禁用' : '未知状态') }}</el-tag></template></vxe-column>
      <vxe-column title="创建时间" width="175"><template #default="{ row }">{{ date(row.joinTime) }}</template></vxe-column>
      <vxe-column title="更新时间" width="175"><template #default="{ row }">{{ date(row.upTime) }}</template></vxe-column>
      <vxe-column title="操作" width="195" fixed="right" align="center"><template #default="{ row }"><div class="row-actions">
        <el-button v-permission="[permission.detail]" type="primary" link size="small" @click="emit('detail', row)">详情</el-button>
        <el-button v-permission="[permission.edit]" type="primary" link size="small" :disabled="busyId !== null" @click="emit('edit', row)">编辑</el-button>
        <el-button v-permission="[permission.verify]" type="primary" link size="small" :disabled="busyId !== null" @click="emit('toggle', row)">{{ Number(row.verify) === 1 ? '禁用' : '启用' }}</el-button>
      </div></template></vxe-column>
    </vxe-table>
  </div>
</template>

<style scoped>
.row-actions { display: flex; align-items: center; justify-content: center; gap: 2px; white-space: nowrap; }
</style>
