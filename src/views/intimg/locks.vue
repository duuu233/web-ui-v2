<script setup name="intimgLocks">
// 设备锁排查：排查「这台设备为什么不能选」。锁来源：离线待补发（7 天）、已下发后 2 分钟。
// 「强制释放锁」用于脏锁：锁还在但对应任务明细已不存在时使用。
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import IntimgPage from './components/IntimgPage.vue'
import IotError from '@/views/iot/components/IotError.vue'
import PaginationBar from '@/components/PaginationBar/index.vue'
import { useIotResource } from '@/views/iot/useIotResource'
import { intimgApi, errorText, productMap } from './service'
import { PAGE_SIZES, buildLockQuery, permission, productLabel, slotName, textOr } from './model'

const router = useRouter()
const draft = shallowRef('')
const applied = shallowRef('')
const page = shallowRef({ page: 1, size: 20 })
const query = computed(() => buildLockQuery({ deviceNo: applied.value }, page.value.page, page.value.size))
const { data, loading, error, load } = useIotResource(signal => intimgApi.locks(query.value, signal), () => query.value)

const products = shallowRef(new Map())
productMap().then(map => { products.value = map })
const productText = id => (products.value.get(String(id)) ? productLabel(products.value.get(String(id))) : textOr(id))

function search() {
  applied.value = draft.value
  page.value = { ...page.value, page: 1 }
}

const releasing = shallowRef('')
async function release(row) {
  try {
    await ElMessageBox.confirm(`强制释放设备 ${row.deviceNo} 的锁（持有任务 ${textOr(row.taskNo)}）。仅用于脏锁：锁还在但对应任务明细已不存在。`, '强制释放锁', { type: 'warning', confirmButtonText: '强制释放' })
  } catch {
    return
  }
  releasing.value = row.deviceNo
  try {
    const result = await intimgApi.releaseLock(row.deviceNo)
    ElMessage.success(Number(result?.affected) ? '锁已释放' : '该设备当前没有锁')
    load()
  } catch (cause) {
    ElMessage.error(errorText(cause))
  } finally {
    releasing.value = ''
  }
}
</script>

<template>
  <IntimgPage title="设备锁排查" subtitle="排查「这台设备为什么不能选」：离线待补发锁 7 天，已下发后锁 2 分钟" :loading="loading" @refresh="load">
    <el-form inline class="intimg-toolbar" @submit.prevent="search">
      <el-form-item label="设备号">
        <el-input v-model="draft" clearable placeholder="支持部分匹配，可带冒号" style="width: 220px" @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="draft = ''; search()">重置</el-button>
      </el-form-item>
    </el-form>
    <IotError :error="error" @retry="load" />
    <section class="iot-data-card">
      <div class="iot-section-heading"><h2>设备锁 <span>{{ data?.total ?? '—' }}</span></h2><small>「强制释放锁」只用于脏锁</small></div>
      <vxe-table :data="data?.list || []" :loading="loading" border round stripe :row-config="{ isHover: true, keyField: 'deviceNo' }" max-height="560" empty-text="没有被占用的设备">
        <vxe-column title="设备号" min-width="150"><template #default="{ row }"><span class="iot-mono">{{ row.deviceNo }}</span></template></vxe-column>
        <vxe-column title="产品" min-width="150" show-overflow><template #default="{ row }">{{ productText(row.productId) }}</template></vxe-column>
        <vxe-column title="在线" width="80"><template #default="{ row }"><el-tag size="small" :type="row.online ? 'success' : 'info'">{{ row.online ? '在线' : '离线' }}</el-tag></template></vxe-column>
        <vxe-column title="锁持有者" min-width="150"><template #default="{ row }">
          <el-button v-if="row.taskNo" type="primary" link class="iot-mono" @click="router.push({ name: 'intimgTaskDetail', params: { taskNo: row.taskNo } })">{{ row.taskNo }}</el-button>
          <span v-else>无</span>
        </template></vxe-column>
        <vxe-column title="槽位" width="120"><template #default="{ row }">{{ row.slotKey ? slotName(row.slotKey) : '—' }}</template></vxe-column>
        <vxe-column title="到期时间" min-width="160"><template #default="{ row }">{{ textOr(row.expireAt) }}</template></vxe-column>
        <vxe-column title="操作" width="110" fixed="right"><template #default="{ row }">
          <el-button v-permission="[permission.release]" type="danger" link :loading="releasing === row.deviceNo" @click="release(row)">强制释放锁</el-button>
        </template></vxe-column>
      </vxe-table>
      <PaginationBar :current-page="page.page" :page-size="page.size" :total="data?.total || 0" :page-sizes="PAGE_SIZES" @size-change="size => (page = { page: 1, size })" @current-change="value => (page = { ...page, page: value })" />
    </section>
  </IntimgPage>
</template>
