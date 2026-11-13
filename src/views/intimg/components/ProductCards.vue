<script setup name="IntimgProductCards">
// WiFi 产品卡片：尺寸、方向、渲染模式、已配置数 x/6（槽位汇总接口）
import { productRenderParams, SLOT_TOTAL } from '../model'

defineProps({
  products: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({}) }, // productId → { configured, total, ready }
  extra: { type: Function, default: null } // 卡片附加说明，如「4/6（SET 缺失）」
})
const model = defineModel({ type: [String, Number], default: '' })

function meta(product) {
  const params = productRenderParams(product)
  const size = params.canvasWidth > 0 ? `${params.canvasWidth} × ${params.canvasHeight}` : '尺寸未配置'
  return [size, params.orientationText, params.renderMode || '渲染模式未配置'].join(' · ')
}
</script>

<template>
  <div class="intimg-products">
    <button
      v-for="product in products"
      :key="product.productId"
      type="button"
      class="intimg-product"
      :class="{ 'is-active': String(model) === String(product.productId) }"
      @click="model = product.productId"
    >
      <h3>{{ product.productName }}<span v-if="product.sizeModel" class="intimg-muted"> · {{ product.sizeModel }}</span></h3>
      <p>{{ meta(product) }}</p>
      <p>
        已配置 {{ summary[String(product.productId)]?.configured ?? '—' }}/{{ summary[String(product.productId)]?.total ?? SLOT_TOTAL }}
        <template v-if="extra && extra(product)">　{{ extra(product) }}</template>
      </p>
    </button>
    <el-empty v-if="!products.length" description="没有 WiFi 版产品（老后台「产品列表」版本类型 = wifi）" :image-size="56" />
  </div>
</template>
