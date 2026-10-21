<script setup name="FpgaVersionTable">
import { formatDate } from '@/utils/date'
import { compulsoryText, permission, safeDownloadUrl } from '../model'
defineProps({ rows: { type: Array, default: () => [] }, loading: Boolean, busyId: { type: [Number, String], default: null }, productName: { type: Function, required: true } })
const emit = defineEmits(['detail', 'edit', 'toggle', 'delete'])
function date(value) { return value ? formatDate(new Date(value), 'yyyy-MM-dd hh:mm:ss') : '—' }
</script>

<template>
  <div class="table-container">
    <vxe-table :data="rows" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'id' }" :column-config="{ resizable: true }" max-height="560">
      <vxe-column field="id" title="ID" width="80" align="center" />
      <vxe-column title="产品" min-width="150" show-overflow><template #default="{ row }">{{ productName(row.productId) }}</template></vxe-column>
      <vxe-column field="versionNumber" title="FPGA 版本号" min-width="150" show-overflow />
      <vxe-column field="grade" title="权重" width="85" align="center" />
      <vxe-column title="升级类型" width="130" align="center"><template #default="{ row }">{{ row.compulsoryMsg || compulsoryText(row.compulsory) }}</template></vxe-column>
      <vxe-column title="下载地址" min-width="220" show-overflow><template #default="{ row }"><el-link v-if="safeDownloadUrl(row.downloadPath)" :href="safeDownloadUrl(row.downloadPath)" target="_blank" rel="noopener noreferrer" type="primary">{{ row.downloadPath }}</el-link><span v-else>{{ row.downloadPath || '—' }}</span></template></vxe-column>
      <vxe-column title="状态" width="100" align="center"><template #default="{ row }"><el-tag :type="Number(row.verify) === 1 ? 'success' : 'info'" size="small">{{ row.verifyMsg || (Number(row.verify) === 1 ? '启用' : Number(row.verify) === 0 ? '禁用' : '未知状态') }}</el-tag></template></vxe-column>
      <vxe-column title="创建时间" width="175"><template #default="{ row }">{{ date(row.joinTime) }}</template></vxe-column>
      <vxe-column title="更新时间" width="175"><template #default="{ row }">{{ date(row.upTime) }}</template></vxe-column>
      <vxe-column title="操作" width="245" fixed="right" align="center"><template #default="{ row }"><div class="row-actions">
        <el-button v-permission="[permission.detail]" type="primary" link size="small" @click="emit('detail', row)">详情</el-button>
        <el-button v-permission="[permission.edit]" type="primary" link size="small" :disabled="busyId !== null" @click="emit('edit', row)">编辑</el-button>
        <el-button v-permission="[permission.verify]" type="primary" link size="small" :disabled="busyId !== null" @click="emit('toggle', row)">{{ Number(row.verify) === 1 ? '禁用' : '启用' }}</el-button>
        <el-button v-permission="[permission.remove]" type="danger" link size="small" :disabled="busyId !== null" @click="emit('delete', row)">删除</el-button>
      </div></template></vxe-column>
    </vxe-table>
  </div>
</template>

<style scoped>
.row-actions { display: flex; align-items: center; justify-content: center; gap: 2px; white-space: nowrap; }
</style>
