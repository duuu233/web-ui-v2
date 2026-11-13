<script setup name="intimgTaskDetail">
// 任务详情：计数、按明细状态分 Tab；批量「移除所选设备」（取消并释放锁）与「重发失败设备」（生成新任务，沿用原目标槽位）
import { computed, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import IntimgPage from './components/IntimgPage.vue'
import IotError from '@/views/iot/components/IotError.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotResource } from '@/views/iot/useIotResource'
import { intimgApi, errorText, productMap } from './service'
import { CANCELABLE, ITEM_TABS, PAGE_SIZES, RETRYABLE, itemStatusInfo, permission, productLabel, targetSlotsText, taskStatusInfo, textOr } from './model'

const props = defineProps({ taskNo: { type: String, required: true } })
const router = useRouter()

const { data: task, loading: taskLoading, error: taskError, load: loadTask } = useIotResource(signal => intimgApi.task(props.taskNo, signal), () => props.taskNo, () => !!props.taskNo)

const status = shallowRef('')
const page = shallowRef({ page: 1, size: 20 })
const itemQuery = computed(() => ({ ...(status.value ? { status: status.value } : {}), page: page.value.page, size: page.value.size }))
const { data: items, loading, error, load: loadItems } = useIotResource(signal => intimgApi.taskItems(props.taskNo, itemQuery.value, signal), () => [props.taskNo, itemQuery.value], () => !!props.taskNo)
watch(() => props.taskNo, () => { status.value = ''; page.value = { ...page.value, page: 1 }; selected.value = [] })
watch(status, () => { page.value = { ...page.value, page: 1 } })

const products = shallowRef(new Map())
productMap().then(map => { products.value = map })
const productText = computed(() => {
  const product = products.value.get(String(task.value?.productId))
  return product ? productLabel(product) : textOr(task.value?.productId)
})

const counts = computed(() => [
  ['total', '总数'], ['success', '成功'], ['sent', '已下发'], ['failed', '失败'], ['pending', '待补发'], ['canceled', '已取消']
].map(([key, label]) => ({ key, label, value: textOr(task.value?.[key]) })))

const tableRef = shallowRef(null)
const selected = shallowRef([])
function onSelect() {
  selected.value = tableRef.value?.getCheckboxRecords() || []
}
watch(items, () => { selected.value = [] })
const cancelTargets = computed(() => selected.value.filter(row => CANCELABLE.includes(row.status)))
const retryTargets = computed(() => selected.value.filter(row => RETRYABLE.includes(row.status)))

function refresh() {
  loadTask()
  loadItems()
}

const busy = shallowRef(false)
async function cancel(rows) {
  const list = rows.filter(row => CANCELABLE.includes(row.status))
  if (!list.length) return ElMessage.warning('所选设备里没有「待补发 / 已下发」的，无需取消')
  const sent = list.some(row => row.status === 'SENT')
  try {
    await ElMessageBox.confirm(
      `取消 ${list.length} 台设备的推送并释放锁，取消后这些设备可立即参与新任务。${sent ? '对「已下发」的设备取消只是不再等待结果，设备仍可能生效。' : ''}`,
      '移除所选设备', { type: 'warning', confirmButtonText: '确认取消' }
    )
  } catch {
    return
  }
  busy.value = true
  try {
    const result = await intimgApi.cancelItems(props.taskNo, list.map(row => row.deviceNo))
    ElMessage.success(`已取消 ${textOr(result?.affected, 0)} 台`)
    refresh()
  } catch (cause) {
    ElMessage.error(errorText(cause))
  } finally {
    busy.value = false
  }
}

async function retry(rows) {
  const list = (rows || []).filter(row => RETRYABLE.includes(row.status))
  if (rows && rows.length && !list.length) return ElMessage.warning('所选设备里没有失败的，无需重发')
  const text = list.length ? `重发所选 ${list.length} 台失败设备` : '重发该任务全部「失败」设备'
  try {
    await ElMessageBox.confirm(`${text}：生成新任务，沿用原任务的目标槽位（${targetSlotsText(task.value)}，仍按 FACTORY 连续前缀下发）。`, '重发失败设备', { type: 'warning', confirmButtonText: '确认重发' })
  } catch {
    return
  }
  busy.value = true
  try {
    const result = await intimgApi.retryItems(props.taskNo, list.map(row => row.deviceNo))
    ElMessage.success(`已生成新任务 ${textOr(result?.taskNo)}，共 ${textOr(result?.total)} 台`)
    if (result?.taskNo) router.push({ name: 'intimgTaskDetail', params: { taskNo: result.taskNo } })
    else refresh()
  } catch (cause) {
    ElMessage.error(errorText(cause))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <IntimgPage :title="`任务详情 ${taskNo}`" subtitle="每台设备的推送状态、失败原因与锁到期时间" :loading="taskLoading || loading" @refresh="refresh">
    <template #actions>
      <el-button @click="router.push({ name: 'intimgTasks' })">返回任务列表</el-button>
    </template>
    <el-alert v-if="taskError" :title="Number(taskError.code) === 4044 ? '任务不存在（任务列表只列最近 500 条，请核对任务号）' : '任务查询失败'" type="error" show-icon :closable="false" class="iot-error">
      <p class="iot-error-message">code: {{ taskError.code }} · {{ taskError.msg }}</p>
      <el-button size="small" @click="loadTask">重试</el-button>
    </el-alert>
    <section v-if="task" class="iot-data-card">
      <div class="iot-section-heading">
        <h2>{{ productText }} <el-tag size="small" :type="taskStatusInfo(task.status).tone">{{ taskStatusInfo(task.status).text }}</el-tag></h2>
        <small>创建于 {{ textOr(task.createdAt) }} · {{ textOr(task.createdBy) }}<template v-if="task.finishedAt"> · 完成于 {{ task.finishedAt }}</template></small>
      </div>
      <p>目标：<b>{{ targetSlotsText(task) }}</b>　·　实际清单：<b class="iot-mono">{{ textOr(task.slotVersionText) }}</b></p>
      <div class="intimg-counts">
        <div v-for="item in counts" :key="item.key" class="intimg-count"><b>{{ item.value }}</b><span>{{ item.label }}</span></div>
      </div>
    </section>

    <section class="iot-data-card">
      <el-tabs v-model="status">
        <el-tab-pane v-for="tab in ITEM_TABS" :key="tab.value" :name="tab.value" :label="tab.text" />
      </el-tabs>
      <div class="intimg-toolbar">
        <el-button v-permission="[permission.cancel]" :disabled="!cancelTargets.length" :loading="busy" @click="cancel(selected)">移除所选设备（释放锁）</el-button>
        <el-button v-permission="[permission.retry]" :loading="busy" @click="retry(selected)">{{ retryTargets.length ? `重发所选失败设备（${retryTargets.length}）` : '重发全部失败设备' }}</el-button>
        <span class="intimg-muted">取消后该设备可立即参与新任务；对「已下发」的设备取消只是不再等待结果，设备仍可能生效</span>
      </div>
      <IotError :error="error" @retry="loadItems" />
      <vxe-table ref="tableRef" :data="items?.list || []" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'deviceNo' }" max-height="520" empty-text="暂无明细" @checkbox-change="onSelect" @checkbox-all="onSelect">
        <vxe-column type="checkbox" width="50" />
        <vxe-column title="设备号" min-width="150"><template #default="{ row }"><span class="iot-mono">{{ row.deviceNo }}</span></template></vxe-column>
        <vxe-column title="在线" width="80"><template #default="{ row }"><el-tag size="small" :type="row.online ? 'success' : 'info'">{{ row.online ? '在线' : '离线' }}</el-tag></template></vxe-column>
        <vxe-column title="推送状态" width="100"><template #default="{ row }"><el-tag size="small" :type="itemStatusInfo(row.status).tone">{{ itemStatusInfo(row.status).text }}</el-tag></template></vxe-column>
        <vxe-column title="失败原因" min-width="200" show-overflow><template #default="{ row }">{{ textOr(row.errorMessage) }}<span v-if="row.errorCode" class="intimg-muted">（{{ row.errorCode }}）</span></template></vxe-column>
        <vxe-column title="锁到期" min-width="160"><template #default="{ row }">{{ textOr(row.lockExpireAt, '已释放') }}</template></vxe-column>
        <vxe-column title="更新时间" min-width="160"><template #default="{ row }">{{ textOr(row.updatedAt) }}</template></vxe-column>
        <vxe-column title="操作" width="100" fixed="right"><template #default="{ row }">
          <el-button v-if="CANCELABLE.includes(row.status)" v-permission="[permission.cancel]" type="primary" link @click="cancel([row])">取消推送</el-button>
          <el-button v-else-if="RETRYABLE.includes(row.status)" v-permission="[permission.retry]" type="primary" link @click="retry([row])">重发</el-button>
          <span v-else>—</span>
        </template></vxe-column>
      </vxe-table>
      <PaginationBar :current-page="page.page" :page-size="page.size" :total="items?.total || 0" :page-sizes="PAGE_SIZES" @size-change="size => (page = { page: 1, size })" @current-change="value => (page = { ...page, page: value })" />
    </section>
  </IntimgPage>
</template>
