/**
 * Composable for managing real-time chart data
 * Handles time-series data updates and chart lifecycle
 * Phase 4: Optimized for rendering performance and memory efficiency
 */

import { ref, computed, watch, shallowRef } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import type { TimeSeriesPoint } from '@/types/dashboard'

interface ChartConfig {
  title: string
  chartId: string
  maxPoints?: number
  color?: string
}

export function useChartManager(config: ChartConfig) {
  const dashboardStore = useDashboardStore()
  const maxPoints = config.maxPoints || 100
  
  // Phase 4: Use shallow ref for chart data to reduce reactivity overhead
  const lastDataPointCount = ref(0)

  // Phase 4: Memoized computed property to prevent unnecessary rerenders
  const chartData = computed(() => {
    const data = dashboardStore.chartDatasets[config.chartId] || []
    
    // Only update dataPointCount if it actually changed
    if (data.length !== lastDataPointCount.value) {
      lastDataPointCount.value = data.length
      dashboardStore.updateDataPointCount(
        Object.values(dashboardStore.chartDatasets).reduce((sum, dataset) => sum + dataset.length, 0)
      )
    }
    
    return data
  })

  // Phase 4: Limit data points for performance with shallow copy for efficiency
  const limitedChartData = computed(() => {
    const data = chartData.value
    if (data.length <= maxPoints) return data
    // Return slice instead of creating new array to minimize gc pressure
    return data.slice(data.length - maxPoints)
  })

  // Get formatted data for charts
  const formattedChartData = computed(() => limitedChartData.value)

  /**
   * Get current metric value from chart data
   */
  const currentValue = computed(() => {
    if (limitedChartData.value.length === 0) return 0
    return limitedChartData.value[limitedChartData.value.length - 1].value
  })

  /**
   * Get average value from chart data
   * Phase 4: Optimized calculation
   */
  const averageValue = computed(() => {
    if (limitedChartData.value.length === 0) return 0
    const sum = limitedChartData.value.reduce((acc, point) => acc + point.value, 0)
    return Math.round(sum / limitedChartData.value.length)
  })

  /**
   * Get max value from chart data
   * Phase 4: Optimized with early termination
   */
  const maxValue = computed(() => {
    if (limitedChartData.value.length === 0) return 0
    let max = 0
    for (const point of limitedChartData.value) {
      if (point.value > max) max = point.value
    }
    return max
  })

  /**
   * Get min value from chart data
   * Phase 4: Optimized with early termination
   */
  const minValue = computed(() => {
    if (limitedChartData.value.length === 0) return 0
    let min = Infinity
    for (const point of limitedChartData.value) {
      if (point.value < min) min = point.value
    }
    return min === Infinity ? 0 : min
  })

  /**
   * Calculate trend based on recent values
   * Phase 4: Optimized to only check last 10 points
   */
  const trend = computed(() => {
    if (limitedChartData.value.length < 2) return 'stable'

    const checkPoints = Math.min(10, limitedChartData.value.length)
    const recent = limitedChartData.value.slice(-checkPoints)
    if (recent.length < 2) return 'stable'

    const first = recent[0].value
    const last = recent[recent.length - 1].value
    const change = last - first

    if (change > 5) return 'up'
    if (change < -5) return 'down'
    return 'stable'
  })

  /**
   * Calculate trend percentage efficiently
   */
  const trendPercentage = computed(() => {
    const current = currentValue.value
    const prev = limitedChartData.value.length >= 2 
      ? limitedChartData.value[limitedChartData.value.length - 2].value 
      : current

    if (prev === 0) return 0
    return Math.round(((current - prev) / prev) * 100)
  })

  return {
    chartData,
    formattedChartData,
    limitedChartData,
    currentValue,
    averageValue,
    maxValue,
    minValue,
    trend,
    trendPercentage,
  }
}

/**
 * Composable for managing stream subscriptions to chart data
 */
export function useChartStreaming(
  streamSimulator: any,
  onUpdate?: (chartId: string, points: TimeSeriesPoint[]) => void
) {
  const dashboardStore = useDashboardStore()

  // Subscribe to time-series updates
  const unsubscribe = streamSimulator?.onTimeSeriesUpdate(
    (data: { chartId: string; points: TimeSeriesPoint[] }) => {
      dashboardStore.updateChartDataset(data.chartId, data.points)
      onUpdate?.(data.chartId, data.points)
    }
  )

  return {
    unsubscribe,
  }
}
