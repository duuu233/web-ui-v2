<template>
  <div class="app-container">
    <div ref="bodyBoxRef" class="title-box">
      <div class="left">
        <span>订单编号：{{ orderDetailObj.orderNo }}</span>
        <span>
          下单渠道：{{
            orderDetailObj.terminalMsg === '安卓客户端' ? 'Android' : orderDetailObj.terminalMsg
          }}
        </span>
      </div>
    </div>

    <div class="status-box">
      <div class="status" :style="'color:' + orderStateStyle(orderDetailObj.billStateMsg)">
        {{ formatBillState(orderDetailObj.billState) }}
      </div>
      <div class="step-box">
        <el-steps
          v-if="[4, 5].indexOf(orderDetailObj.billState) === -1"
          :active="refundStatus(orderDetailObj.billState)"
          align-center
        >
          <el-step title="待调度" :description="orderDetailObj.toBeDispatchedTime" />
          <el-step title="待取货" :description="orderDetailObj.dispatchTime" />
          <el-step title="配送中" :description="orderDetailObj.deliveryTime" />
          <el-step title="已送达" :description="orderDetailObj.arriveTime" />
        </el-steps>
        <el-steps v-if="orderDetailObj.billState === 4" :active="3" align-center>
          <el-step title="待调度" :description="orderDetailObj.toBeDispatchedTime" />
          <el-step title="待取货" :description="orderDetailObj.dispatchTime" />
          <el-step title="已转出" :description="orderDetailObj.transferoutTime" />
        </el-steps>
        <el-steps v-if="orderDetailObj.billState === 5" :active="2" align-center>
          <el-step title="待调度" :description="orderDetailObj.toBeDispatchedTime" />
          <el-step title="已取消" :description="orderDetailObj.cancelTime" />
        </el-steps>
      </div>
    </div>

    <el-card class="box-card" shadow="never">
      <template #header>
        <span>运单信息</span>
      </template>
      <div class="order-box">
        <div class="item">
          <span>订单编号：{{ orderDetailObj.orderNo }}</span>
          <span>运单编号：{{ orderDetailObj.waybillNo }}</span>
          <span>收货人名称：{{ orderDetailObj.receiveName }}</span>
          <span>收货地址：{{ orderDetailObj.receiveAddress }}</span>
          <span>收货人联系电话：{{ orderDetailObj.receiveMobile }}</span>
        </div>
        <div class="item">
          <span>骑手名称：{{ orderDetailObj.deliveryName }}</span>
          <span>骑手联系方式：{{ orderDetailObj.deliveryPhone }}</span>
          <span>运单状态：{{ orderDetailObj.billStateMsg }}</span>
          <span>建议送达时间：{{ orderDetailObj.pDeliveryTime }}</span>
          <span>所属区域：{{ orderDetailObj.regionalName }}</span>
          <span>运单来源：{{ orderDetailObj.terminalMsg }}</span>
          <span>取货地联系方式：{{ orderDetailObj.contactPhone }}</span>
          <span>取货地址：{{ orderDetailObj.daddress }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="box-card" shadow="never">
      <template #header>
        <span>商品信息</span>
      </template>
      <vxe-table :data="orderDetailObj.waybillDetailList || []" border round :row-config="{ isHover: true }">
        <vxe-column title="商品图片" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.productImage"
              :src="row.productImage"
              :preview-src-list="[row.productImage]"
              preview-teleported
              fit="cover"
              style="width: 60px; height: 60px"
            />
          </template>
        </vxe-column>
        <vxe-column field="productName" title="商品名称" width="150" align="center" show-overflow />
        <vxe-column field="productAttribute" title="规格" width="150" align="center" show-overflow />
        <vxe-column title="单价(¥)" align="center">
          <template #default="{ row }">{{ filterPrice(row.unitPrice) }}</template>
        </vxe-column>
        <vxe-column field="number" title="数量" align="center" />
        <vxe-column title="原价(¥)" align="center">
          <template #default="{ row }">{{ filterPrice(row.oldMoney) }}</template>
        </vxe-column>
        <vxe-column title="实付款(¥)" align="center">
          <template #default="{ row }">{{ filterPrice(row.realMoney) }}</template>
        </vxe-column>
        <vxe-column v-if="orderDetailObj.refundMoney" title="应退金额(¥)" align="center">
          <template #default="{ row }">{{ filterPrice(row.refundMoney) }}</template>
        </vxe-column>
      </vxe-table>
      <div class="summary-box">
        <div class="summary">
          <div class="item">
            <span class="label">商品小计：</span>
            <span class="content">¥ {{ filterPrice(orderDetailObj.productMoney) }}</span>
          </div>
          <template v-if="!orderDetailObj.refundMoney">
            <div class="item">
              <span class="label">运费：</span>
              <span class="content">¥ {{ filterPrice(orderDetailObj.freight) }}</span>
            </div>
            <div class="item">
              <span class="label">秒杀优惠：</span>
              <span class="content">¥ {{ filterPrice(orderDetailObj.sumdiscount) }}</span>
            </div>
            <div class="item">
              <span class="label">实付款：</span>
              <span class="content">¥ {{ filterPrice(orderDetailObj.realMoney) }}</span>
            </div>
          </template>
          <div v-else class="item">
            <span class="label">应退金额：</span>
            <span class="content">¥ {{ filterPrice(orderDetailObj.refundMoney) }}</span>
          </div>
          <div v-if="orderDetailObj.remarks" class="item">
            <span class="label">备注：</span>
            <span class="content">{{ orderDetailObj.remarks }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <div
      v-if="orderDetailObj.billState === 2"
      v-permission="['post_Waybill_setUpdateDeliveryStatus']"
      class="submit-box"
    >
      <el-button size="small" type="primary" @click="receiving">确认送达</el-button>
    </div>
    <div
      v-if="orderDetailObj.billState === 1"
      v-permission="['post_Waybill_setUpdateDeliveryStatus']"
      class="submit-box"
    >
      <el-button size="small" type="primary" @click="shipmentsVisible = true">发起送货</el-button>
    </div>

    <el-dialog title="确认要发起送货吗？" v-model="shipmentsVisible" width="30%" :close-on-click-modal="false">
      <div class="order-box">
        <div class="item">
          <div class="title">收货人信息</div>
          <span>收货人：{{ orderDetailObj.receiveName }}</span>
          <span>收货地址：{{ orderDetailObj.receiveAddress }}</span>
          <span>手机号码：{{ orderDetailObj.receiveMobile }}</span>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="shipmentsVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleShipments">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="waybillDetail">
import { ref, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWayBillRecordList, setUpdateDeliveryStatus } from '@/api/waybill'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderDetailObj = ref({})
const shipmentsVisible = ref(false)
const bodyBoxRef = ref(null)

function formatBillState(v) {
  return { 1: '待取货', 2: '配送中', 3: '已送达', 4: '已转出', 5: '已取消' }[v] || ''
}
function filterPrice(v) {
  return v ? Number(v).toFixed(2) : '0.00'
}
function refundStatus(v) {
  if (v === 3) return 4
  if (v === 2) return 3
  return v
}
function orderStateStyle(v) {
  if (v === '已送达') return '#67C23A'
  if (['已取消', '已无效', '已转出'].indexOf(v) !== -1) return '#909399'
  if (['待调度', '待取货', '配送中'].indexOf(v) !== -1) return '#E6A23C'
  return ''
}

function getData() {
  const id = route.query.id
  if (id || id == 0) {
    getWayBillRecordList({ waybillId: id }).then((response) => {
      if (response.retCode === 200) {
        orderDetailObj.value = response.retData
      }
    })
  }
}

// 操作完成后回退到运单列表
function backToList() {
  router.push('/oms/waybill')
}

function receiving() {
  ElMessageBox.confirm('确认商品已送达吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setUpdateDeliveryStatus({ waybillId: route.query.id, billState: 3 }).then((response) => {
      if (response.retCode === 200) {
        ElMessage.success('您已确定收货')
        backToList()
      }
    })
  })
}
function handleShipments() {
  setUpdateDeliveryStatus({ waybillId: route.query.id, billState: 2 }).then((response) => {
    if (response.retCode === 200) {
      ElMessage.success('已发起送货!')
      shipmentsVisible.value = false
      backToList()
    } else {
      ElMessage.info('操作失败')
    }
  })
}

onMounted(getData)
onActivated(getData)
</script>

<style lang="scss" scoped>
.app-container {
  background-color: var(--app-canvas);
  padding: 0;
  margin-bottom: 100px;
}
.title-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 20px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  span {
    padding-right: 70px;
  }
}
.status-box {
  background-color: #fff;
  padding: 20px 10px;
  border-radius: 6px;
  width: 100%;
  display: flex;
  .status {
    font-size: 24px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #eee;
    flex-direction: column;
  }
  .step-box {
    flex: 9;
  }
}
.box-card {
  margin-top: 10px;
}
.order-box {
  display: flex;
  background-color: #fff;
  border-radius: 6px;
  span {
    display: block;
    padding-bottom: 10px;
  }
  .item {
    flex: 1;
    padding: 0 20px;
    border-right: 1px solid #eee;
    .title {
      padding-bottom: 20px;
      font-size: 18px;
    }
  }
  .item:last-of-type {
    border-right: none;
  }
}
.summary-box {
  text-align: right;
  padding-top: 20px;
  .item {
    .label {
      width: 80px;
      display: inline-block;
      text-align: left;
    }
    .content {
      width: 100px;
      display: inline-block;
      text-align: left;
    }
  }
}
.submit-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 88px;
  display: flex;
  background-color: #fff;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 33px 0px rgba(223, 224, 228, 0.6);
  border-radius: 3px;
  z-index: 998;
  .el-button {
    width: 92px;
    height: 36px;
  }
}
</style>
