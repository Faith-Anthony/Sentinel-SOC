<template>
  <div
    ref="chartContainer"
    :class="['rounded-lg border border-dark-border bg-dark-surface p-6', containerClass]"
  >
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-dark-primary">{{ title }}</h2>
      <slot name="header-actions"></slot>
    </div>

    <!-- Chart Container -->
    <div ref="echartsContainer" :style="{ height: height + 'px', width: '100%' }"></div>

    <!-- Footer -->
    <div v-if="$slots['footer']" class="mt-4 border-t border-dark-border pt-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface Props {
  title: string
  chartOption: EChartsOption
  height?: number
  containerClass?: string
  resizeDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  containerClass: '',
  resizeDelay: 300,
})

const chartContainer = ref<HTMLDivElement>()
const echartsContainer = ref<HTMLDivElement>()
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimeout: number | null = null

onMounted(() => {
  initChart()
  setupResizeObserver()
})

onUnmounted(() => {
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value)
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  if (chart) {
    chart.dispose()
  }
})

function initChart() {
  if (!echartsContainer.value) return

  chart = echarts.init(echartsContainer.value, 'dark')
  chart.setOption(props.chartOption)
}

function setupResizeObserver() {
  if (!chartContainer.value || !window.ResizeObserver) return

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
      if (chart) {
        chart.resize()
      }
    }, props.resizeDelay)
  })

  resizeObserver.observe(chartContainer.value)
}

watch(
  () => props.chartOption,
  (newOption) => {
    if (chart) {
      // Use setOption with merge strategy for smooth updates
      chart.setOption(newOption, { replaceMerge: ['series'] })
    }
  },
  { deep: true }
)

// Expose chart instance for external control if needed
defineExpose({
  getChart: () => chart,
})
</script>
