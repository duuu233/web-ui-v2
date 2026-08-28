<script setup name="EChartCanvas">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch
} from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer
])

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  empty: {
    type: Boolean,
    default: false
  },
  emptyDescription: {
    type: String,
    default: '暂无数据'
  },
  ariaLabel: {
    type: String,
    default: '数据图表'
  },
  height: {
    type: String,
    default: '320px'
  }
})

const chartRoot = useTemplateRef('chartRoot')
const chartInstance = shallowRef(null)
let resizeObserver

async function renderChart() {
  await nextTick()

  if (props.empty) {
    chartInstance.value?.clear()
    return
  }

  if (!chartRoot.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRoot.value, null, {
      renderer: 'canvas'
    })
  }

  chartInstance.value.setOption(props.option, {
    notMerge: true,
    lazyUpdate: true
  })
}

function resizeChart() {
  chartInstance.value?.resize()
}

watch(
  () => [props.option, props.empty],
  renderChart
)

onMounted(() => {
  renderChart()

  if (typeof ResizeObserver !== 'undefined' && chartRoot.value) {
    resizeObserver = new ResizeObserver(resizeChart)
    resizeObserver.observe(chartRoot.value)
  } else {
    window.addEventListener('resize', resizeChart)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
  chartInstance.value = null
})
</script>

<template>
  <div class="chart-stage" :style="{ height: props.height }">
    <div
      ref="chartRoot"
      v-show="!props.empty"
      class="chart-canvas"
      role="img"
      :aria-label="props.ariaLabel"
    />
    <el-empty
      v-if="props.empty"
      class="chart-empty"
      :description="props.emptyDescription"
      :image-size="88"
    />
  </div>
</template>

<style scoped>
.chart-stage {
  position: relative;
  width: 100%;
  min-height: 260px;
}

.chart-canvas,
.chart-empty {
  width: 100%;
  height: 100%;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
