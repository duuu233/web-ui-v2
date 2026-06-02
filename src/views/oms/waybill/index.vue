<template>
  <div class="app-container">
    <SearchPanel :model="listQuery" @search="handleSearchList" @reset="handleResetSearch">
      <el-form-item label="收货人信息">
        <el-input
          v-model="listQuery.receive"
          style="width: 311px"
          placeholder="请输入收货人信息"
          maxlength="20"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item label="流水号">
        <el-input
          v-model="listQuery.shopSequence"
          class="input-width"
          placeholder="请输入流水号"
          maxlength="10"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item label="运单来源">
        <el-select v-model="listQuery.terminal" clearable placeholder="请选择运单来源">
          <el-option
            v-for="(item, index) in terminalList"
            v-show="item !== 'IOS' && item !== '支付宝'"
            :key="index"
            :label="item"
            :value="index + 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型">
        <el-select v-model="listQuery.orderType" clearable placeholder="请选择订单类型">
          <el-option
            v-for="(item, index) in orderTypeList"
            :key="index"
            :label="item"
            :value="index + 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属区域">
        <el-select v-model="listQuery.regionalId" clearable placeholder="请选择所属区域">
          <el-option
            v-for="(item, index) in regionalIdList"
            :key="index"
            :label="item.keyText"
            :value="item.keyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序方式">
        <el-select v-model="listQuery.orderByType" clearable placeholder="请选择排序方式">
          <el-option
            v-for="(item, index) in sortOrderList"
            :key="index"
            :label="item"
            :value="index + 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="运单建议送达时间">
        <el-date-picker
          v-model="dateList"
          style="width: 311px"
          type="daterange"
          unlink-panels
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
        />
      </el-form-item>
    </SearchPanel>

    <div class="table-container">
      <div class="table-btns-box">
        <el-tabs v-model="activeName" style="width: 40vw" stretch @tab-change="handleClick">
          <el-tab-pane :label="`待取货(${listObj.wayBillNum1 || 0})`" name="1" />
          <el-tab-pane :label="`配送中(${listObj.wayBillNum2 || 0})`" name="2" />
          <el-tab-pane :label="`已送达(${listObj.wayBillNum3 || 0})`" name="3" />
          <el-tab-pane :label="`已转出(${listObj.wayBillNum4 || 0})`" name="4" />
          <el-tab-pane :label="`已取消(${listObj.wayBillNum5 || 0})`" name="5" />
        </el-tabs>
        <div>
          <el-button
            v-permission="['get_Waybill_getWayBillListExcel']"
            type="primary"
            size="small"
            icon="Document"
            @click="handleExport"
          >
            导出运单
          </el-button>
        </div>
      </div>

      <vxe-table
        :data="list"
        :loading="listLoading"
        border
        round
        stripe
        :row-config="{ isHover: true }"
        :column-config="{ resizable: true }"
        max-height="560"
      >
        <vxe-column field="orderNo" title="订单编号" width="130" align="center" show-overflow />
        <vxe-column field="shopSequence" title="订单流水号" align="center" show-overflow />
        <vxe-column field="orderTypeMsg" title="订单类型" align="center" show-overflow />
        <vxe-column field="waybillNo" title="运单编号" width="130" align="center" show-overflow />
        <vxe-column field="billStateMsg" title="运单状态" align="center" show-overflow />
        <vxe-column field="dispatchTypeMsg" title="运单类型" align="center" show-overflow />
        <vxe-column field="regionalName" title="所属区域" align="center" show-overflow />
        <vxe-column field="dname" title="取货点名称" width="120" align="center" show-overflow />
        <vxe-column field="daddress" title="取货地址" width="120" align="center" show-overflow />
        <vxe-column title="收货人信息" width="150" align="center" show-overflow>
          <template #default="{ row }">{{ row.receiveName }}, {{ row.receiveMobile }}</template>
        </vxe-column>
        <vxe-column field="receiveAddress" title="收货地址" width="200" align="center" show-overflow />
        <vxe-column field="guyName" title="骑手名称" align="center" show-overflow />
        <vxe-column field="guyPhone" title="骑手联系方式" align="center" show-overflow />
        <vxe-column title="建议送达时间" width="140" align="center">
          <template #default="{ row }">{{ formatDateTime(row.deliveryTime) }}</template>
        </vxe-column>
        <vxe-column title="操作" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="['get_Waybill_getWayBillRecordList']"
              size="small"
              type="primary"
              @click="handleDetails(row)"
            >
              查看
            </el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.pageIndex"
        v-model:page-size="listQuery.pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup name="waybill">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SearchPanel from '@/components/SearchPanel/index.vue'
import { getWayBillList, getWayBillListExcel } from '@/api/waybill'
import { getQueryDcName } from '@/api/dispatchWork'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const defaultListQuery = () => ({ pageIndex: 1, pageSize: 10, billState: '1', keyword: null })

const terminalList = ['安卓客户端', 'IOS', '微信小程序', '支付宝']
const orderTypeList = ['配送订单', '退货订单']
const sortOrderList = ['建议送达时间近到远', '建议送达时间远到近']
const regionalIdList = ref([])

const activeName = ref('1')
const listQuery = reactive(defaultListQuery())
const list = ref([])
const listObj = ref({})
const total = ref(0)
const listLoading = ref(false)
const dateList = ref([])

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

function formatDateTime(time) {
  if (time == null || time === '') return 'N/A'
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

function getList() {
  listLoading.value = true
  delete listQuery.classifyName
  getWayBillList(listQuery)
    .then((response) => {
      listLoading.value = false
      const out = response.retData.waybillSearchApiOutList || {}
      list.value = out.pageData || []
      listObj.value = response.retData
      total.value = out.recordCount || 0
    })
    .catch(() => {
      listLoading.value = false
    })
}

function getQueryDcNameList() {
  getQueryDcName({ pageIndex: 1, pageSize: 9999 }).then((response) => {
    if (response.retCode === 200) {
      regionalIdList.value = response.retData || []
    }
  })
}

function handleClick() {
  listQuery.billState = activeName.value * 1
  listQuery.pageIndex = 1
  getList()
}
function handleExport() {
  getWayBillListExcel(listQuery).then((res) => {
    if (res.retCode === 200) {
      if (res.retData) {
        window.location.href = res.retData
      } else {
        ElMessage.warning('数据为空，无法导出!')
      }
    } else {
      ElMessage.error('导出失败!')
    }
  })
}
function handleSearchList() {
  listQuery.pageIndex = 1
  if (dateList.value && dateList.value.length) {
    listQuery.deliveryBeginTime = dateList.value[0]
    listQuery.deliveryEndTime = dateList.value[1]
  } else {
    delete listQuery.deliveryBeginTime
    delete listQuery.deliveryEndTime
  }
  getList()
}
function handleResetSearch() {
  const billState = activeName.value * 1
  Object.assign(listQuery, defaultListQuery(), { billState })
  dateList.value = []
  delete listQuery.deliveryBeginTime
  delete listQuery.deliveryEndTime
  getList()
}
function handleSizeChange(val) {
  listQuery.pageIndex = 1
  listQuery.pageSize = val
  getList()
}
function handleCurrentChange(val) {
  listQuery.pageIndex = val
  getList()
}
function handleDetails(row) {
  router.push({ name: 'waybillDetail', query: { id: row.wayBillId } })
}

function init() {
  if (route.query.orderState) {
    listQuery.billState = route.query.orderState * 1
    activeName.value = route.query.orderState
  }
  getList()
  getQueryDcNameList()
}

onMounted(init)
onActivated(init)
</script>

<style lang="scss" scoped>
.table-btns-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: #fff;
  margin-bottom: 10px;
  box-shadow: 0px 4px 81px 0px rgba(241, 242, 247, 0.82);
  border-radius: 5px;
  padding-right: 20px;
}
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__item) {
  height: 60px;
  line-height: 60px;
}
</style>
