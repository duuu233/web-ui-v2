<script setup name="intimgTasks">
// 推送任务列表：异步任务，提交后可离开页面，稍后回来看进度。接口最多返回最近 500 条，更早的按任务号直接查详情。
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import IntimgPage from './components/IntimgPage.vue'
import IotError from '@/views/iot/components/IotError.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotResource } from '@/views/iot/useIotResource'
import { intimgApi, loadWifiProducts } from './service'
import { PAGE_SIZES, TASK_STATUSES, buildTaskQuery, productLabel, targetSlotsText, taskStatusInfo, textOr } from './model'

const route = useRoute()
const router = useRouter()
const products = shallowRef([])
const productById = computed(() => new Map(products.value.map(item => [String(item.productId), item])))
const draft = ref({ productId: String(route.query.productId || ''), status: '' })
const applied = shallowRef({ ...draft.value })
const page = shallowRef({ page: 1, size: 20 })
const taskNo = shallowRef('')

const query = computed(() => buildTaskQuery(applied.value, page.value.page, page.value.size))
const { data, loading, error, load } = useIotResource(signal => intimgApi.tasks(query.value, signal), () => query.value, () => route.name === 'intimgTasks')

onMounted(async () => {
  try {
    products.value = await loadWifiProducts()
  } catch {
    // 只影响产品名展示
  }
})
// 从新建页跳过来带 productId：按它筛
watch(() => route.query.productId, value => {
  if (route.name !== 'intimgTasks' || value === undefined) return
  draft.value = { ...draft.value, productId: String(value || '') }
  search()
})

function search() {
  applied.value = { ...draft.value }
  page.value = { ...page.value, page: 1 }
}
function reset() {
  draft.value = { productId: '', status: '' }
  search()
}
function open(no) {
  const value = String(no || '').trim()
  if (!value) return ElMessage.warning('请输入任务号')
  router.push({ name: 'intimgTaskDetail', params: { taskNo: value } })
}
const productName = id => productLabel(productById.value.get(String(id))) === '—' ? textOr(id) : productLabel(productById.value.get(String(id)))
</script>

<template>
  <IntimgPage title="推送任务列表" subtitle="异步任务，提交后可以离开页面，稍后回来查看进度；最多列出最近 500 条" :loading="loading" @refresh="load">
    <el-form inline class="intimg-toolbar" @submit.prevent="search">
      <el-form-item label="产品">
        <el-select v-model="draft.productId" clearable placeholder="全部产品" style="width: 220px">
          <el-option v-for="item in products" :key="item.productId" :value="String(item.productId)" :label="productLabel(item)" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="draft.status" clearable placeholder="全部" style="width: 120px">
          <el-option v-for="item in TASK_STATUSES" :key="item.value" :value="item.value" :label="item.text" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
      <el-form-item label="按任务号查">
        <el-input v-model="taskNo" clearable placeholder="如 P20261110-004" style="width: 190px" @keyup.enter="open(taskNo)" />
        <el-button style="margin-left: 6px" @click="open(taskNo)">查看</el-button>
      </el-form-item>
    </el-form>
    <IotError :error="error" @retry="load" />
    <section class="iot-data-card">
      <div class="iot-section-heading"><h2>任务 <span>{{ data?.total ?? '—' }}</span></h2><small>「已下发」= 设备已回 106、未拿到最终结果，不等于成功</small></div>
      <vxe-table :data="data?.list || []" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'taskNo' }" :column-config="{ resizable: true }" max-height="560" empty-text="暂无任务">
        <vxe-column title="任务号" min-width="150"><template #default="{ row }"><el-button type="primary" link class="iot-mono" @click="open(row.taskNo)">{{ row.taskNo }}</el-button></template></vxe-column>
        <vxe-column title="产品" min-width="140" show-overflow><template #default="{ row }">{{ productName(row.productId) }}</template></vxe-column>
        <vxe-column title="目标槽位" min-width="120" show-overflow><template #default="{ row }">{{ targetSlotsText(row) }}</template></vxe-column>
        <vxe-column title="实际下发清单" min-width="130" show-overflow><template #default="{ row }"><span class="iot-mono">{{ textOr(row.slotVersionText) }}</span></template></vxe-column>
        <vxe-column field="total" title="总数" width="70" />
        <vxe-column field="success" title="成功" width="70" />
        <vxe-column field="sent" title="已下发" width="75" />
        <vxe-column field="failed" title="失败" width="70" />
        <vxe-column field="pending" title="待补发" width="75" />
        <vxe-column field="canceled" title="已取消" width="75" />
        <vxe-column title="状态" width="90"><template #default="{ row }"><el-tag size="small" :type="taskStatusInfo(row.status).tone">{{ taskStatusInfo(row.status).text }}</el-tag></template></vxe-column>
        <vxe-column title="创建" min-width="170"><template #default="{ row }">{{ textOr(row.createdAt) }}<div class="intimg-muted">{{ textOr(row.createdBy, '') }}</div></template></vxe-column>
        <vxe-column title="操作" width="80" fixed="right"><template #default="{ row }"><el-button type="primary" link @click="open(row.taskNo)">查看</el-button></template></vxe-column>
      </vxe-table>
      <PaginationBar :current-page="page.page" :page-size="page.size" :total="data?.total || 0" :page-sizes="PAGE_SIZES" @size-change="size => (page = { page: 1, size })" @current-change="value => (page = { ...page, page: value })" />
    </section>
  </IntimgPage>
</template>
