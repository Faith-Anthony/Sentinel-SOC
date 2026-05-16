<template>
  <EChart :title="title" :chart-option="chartOption" :height="height" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import type { TimeSeriesPoint } from '@/types/dashboard'
import EChart from './EChart.vue'

interface Props {
  title: string
  data: TimeSeriesPoint[]
  height?: number
  smooth?: boolean
  fillArea?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  smooth: true,
  fillArea: true,
})

const chartOption = computed<EChartsOption>(() => ({
  grid: {
    left: '3%',
    right: '3%',
    top: '5%',
    bottom: '8%',
    containLabel: true,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: '#00d9ff',
    textStyle: {
      color: '#f1f5f9',
    },
    axisPointer: {
      lineStyle: {
        color: '#00d9ff',
        width: 2,
      },
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data.map((p) => p.label || ''),
    axisLine: {
      lineStyle: {
        color: '#2d3748',
      },
    },
    axisLabel: {
      fontSize: 11,
      color: '#94a3b8',
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: '#2d3748',
        type: 'dashed',
      },
    },
    axisLine: {
      lineStyle: {
        color: '#2d3748',
      },
    },
    axisLabel: {
      fontSize: 11,
      color: '#94a3b8',
    },
  },
  series: [
    {
      name: props.title,
      type: 'line',
      data: props.data.map((p) => p.value),
      smooth: props.smooth ? 0.3 : false,
      areaStyle: props.fillArea
        ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 217, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 217, 255, 0.05)' },
              ],
            },
          }
        : undefined,
      itemStyle: {
        color: '#00d9ff',
        borderWidth: 2,
      },
      lineStyle: {
        color: '#00d9ff',
        width: 2,
      },
      symbolSize: 4,
      animationDuration: 500,
      animationEasing: 'linear',
    },
  ],
}))
</script>
