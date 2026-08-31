const axisLabelColor = '#6b6560'
const axisLineColor = '#cbc6c0'
const splitLineColor = '#eeeae6'
const brandColor = '#b25a1e'
const brandDarkColor = '#78390f'
const brandMutedColor = '#f4e5d8'
const successColor = '#2e7d4f'

const numberFormatter = new Intl.NumberFormat('zh-CN')

function normalizeChartData(list, valueKey) {
  if (!Array.isArray(list)) return { dates: [], values: [] }

  return list.reduce(
    (result, item) => {
      result.dates.push(item?.queryDate || '-')
      result.values.push(Math.max(Number(item?.[valueKey]) || 0, 0))
      return result
    },
    { dates: [], values: [] }
  )
}

function createCategoryAxis(dates) {
  return {
    type: 'category',
    data: dates,
    boundaryGap: true,
    axisLine: {
      lineStyle: { color: axisLineColor }
    },
    axisTick: { show: false },
    axisLabel: {
      color: axisLabelColor,
      fontSize: 11,
      hideOverlap: true,
      margin: 12
    }
  }
}

function createValueAxis(formatter) {
  return {
    type: 'value',
    min: 0,
    minInterval: 1,
    splitNumber: 4,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: axisLabelColor,
      fontSize: 11,
      formatter
    },
    splitLine: {
      lineStyle: {
        color: splitLineColor,
        type: 'dashed'
      }
    }
  }
}

export function createRegistrationBarOption(list) {
  const { dates, values } = normalizeChartData(list, 'userCount')

  return {
    animationDuration: 520,
    animationEasing: 'cubicOut',
    grid: {
      top: 34,
      right: 16,
      bottom: 8,
      left: 12,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => `${numberFormatter.format(Number(value) || 0)} 人`
    },
    xAxis: createCategoryAxis(dates),
    yAxis: createValueAxis(value => numberFormatter.format(value)),
    series: [
      {
        name: '注册用户',
        type: 'bar',
        data: values,
        barMaxWidth: 34,
        showBackground: true,
        backgroundStyle: {
          color: brandMutedColor,
          borderRadius: [7, 7, 2, 2]
        },
        itemStyle: {
          color: brandColor,
          borderRadius: [7, 7, 2, 2]
        },
        emphasis: {
          itemStyle: { color: brandDarkColor }
        },
        label: {
          show: values.length > 0 && values.length <= 14,
          position: 'top',
          color: brandDarkColor,
          fontSize: 11,
          fontWeight: 600,
          formatter: ({ value }) => numberFormatter.format(value)
        }
      }
    ]
  }
}

export function createOrderCountOption(list) {
  const { dates, values } = normalizeChartData(list, 'orderCount')

  return {
    animationDuration: 560,
    animationEasing: 'cubicOut',
    grid: {
      top: 32,
      right: 18,
      bottom: 8,
      left: 12,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      valueFormatter: value => `${numberFormatter.format(Number(value) || 0)} 笔`
    },
    xAxis: {
      ...createCategoryAxis(dates),
      boundaryGap: false
    },
    yAxis: createValueAxis(value => numberFormatter.format(value)),
    series: [
      {
        name: '订单数量',
        type: 'line',
        data: values,
        smooth: 0.35,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: values.length <= 31,
        lineStyle: {
          width: 3,
          color: successColor
        },
        itemStyle: {
          color: successColor,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        areaStyle: {
          color: 'rgba(46, 125, 79, 0.12)'
        }
      }
    ]
  }
}
