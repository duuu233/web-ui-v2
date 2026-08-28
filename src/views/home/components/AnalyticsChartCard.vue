<script setup name="AnalyticsChartCard">
import EChartCanvas from './EChartCanvas.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  option: {
    type: Object,
    required: true
  },
  hasData: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyDescription: {
    type: String,
    default: '暂无数据'
  },
  statusLabel: {
    type: String,
    default: ''
  },
  statusType: {
    type: String,
    default: 'info'
  },
  ariaLabel: {
    type: String,
    default: '数据图表'
  },
  accent: {
    type: String,
    default: 'brand',
    validator: value => ['brand', 'success'].includes(value)
  },
  rangeOptions: {
    type: Array,
    default: () => [
      { value: 0, label: '近一周' },
      { value: 1, label: '近一个月' },
      { value: 2, label: '近一年' }
    ]
  }
})

const emit = defineEmits(['rangeChange'])
const range = defineModel('range', {
  type: Number,
  default: 0
})

function handleRangeChange(value) {
  emit('rangeChange', Number(value))
}
</script>

<template>
  <el-card
    v-loading="props.loading"
    shadow="never"
    class="analytics-card"
    :class="`analytics-card--${props.accent}`"
  >
    <template #header>
      <div class="analytics-header">
        <div class="analytics-copy">
          <span v-if="props.eyebrow" class="analytics-eyebrow">
            {{ props.eyebrow }}
          </span>
          <div class="analytics-title-row">
            <h2 class="analytics-title">{{ props.title }}</h2>
            <el-tag
              v-if="props.statusLabel"
              :type="props.statusType"
              effect="plain"
              round
              size="small"
            >
              {{ props.statusLabel }}
            </el-tag>
          </div>
          <p v-if="props.description" class="analytics-description">
            {{ props.description }}
          </p>
        </div>

        <el-radio-group
          v-model="range"
          class="analytics-range"
          size="small"
          :aria-label="`${props.title}统计周期`"
          @change="handleRangeChange"
        >
          <el-radio-button
            v-for="item in props.rangeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <EChartCanvas
      :option="props.option"
      :empty="!props.hasData"
      :empty-description="props.emptyDescription"
      :aria-label="props.ariaLabel"
    />
  </el-card>
</template>

<style scoped>
.analytics-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-color: var(--app-border);
}

.analytics-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: var(--brand-logo);
  content: '';
}

.analytics-card--success::before {
  background: var(--app-success);
}

.analytics-card :deep(.el-card__header) {
  padding: 20px 22px 16px;
}

.analytics-card :deep(.el-card__body) {
  padding: 10px 18px 18px;
}

.analytics-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.analytics-copy {
  min-width: 0;
}

.analytics-eyebrow {
  display: block;
  margin-bottom: 7px;
  color: var(--brand-600);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.analytics-card--success .analytics-eyebrow {
  color: var(--app-success);
}

.analytics-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.analytics-title {
  margin: 0;
  color: var(--app-ink);
  font-size: 17px;
  font-weight: 720;
  letter-spacing: -0.01em;
}

.analytics-description {
  margin: 7px 0 0;
  color: var(--app-text);
  font-size: 12px;
  line-height: 1.6;
}

.analytics-range {
  flex: none;
}

@media (max-width: 720px) {
  .analytics-header {
    flex-direction: column;
    gap: 14px;
  }

  .analytics-range {
    align-self: stretch;
  }

  .analytics-range :deep(.el-radio-button) {
    width: 33.333%;
  }

  .analytics-range :deep(.el-radio-button__inner) {
    width: 100%;
  }
}
</style>
