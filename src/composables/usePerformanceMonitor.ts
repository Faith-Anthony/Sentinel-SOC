/**
 * Performance monitoring composable
 * Phase 4: Tracks render times, update times, and memory usage
 * Helps identify performance bottlenecks in production
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

interface PerformanceMetric {
  timestamp: number
  renderTime: number
  updateTime: number
  fps: number
  dataPoints: number
}

export function usePerformanceMonitor() {
  const dashboardStore = useDashboardStore()
  const metrics = ref<PerformanceMetric[]>([])
  const monitoringIntervalId = ref<number | null>(null)
  
  // Track frame times for FPS calculation
  let lastFrameTime = performance.now()
  let frameCount = 0
  let fps = 60

  /**
   * Calculate FPS using requestAnimationFrame
   */
  function updateFPS() {
    const now = performance.now()
    const deltaTime = now - lastFrameTime
    lastFrameTime = now
    frameCount++

    // Calculate FPS every 1 second
    if (frameCount >= 60) {
      fps = Math.round((frameCount / deltaTime) * 1000)
      frameCount = 0
    }

    requestAnimationFrame(updateFPS)
  }

  /**
   * Start performance monitoring
   */
  function startMonitoring() {
    // Start FPS monitoring
    updateFPS()

    // Collect metrics every 5 seconds
    monitoringIntervalId.value = window.setInterval(() => {
      const metric: PerformanceMetric = {
        timestamp: Date.now(),
        renderTime: dashboardStore.performanceMetrics.renderTime,
        updateTime: dashboardStore.performanceMetrics.updateTime,
        fps,
        dataPoints: dashboardStore.performanceMetrics.dataPoints,
      }

      metrics.value.push(metric)

      // Keep only last 120 metrics (10 minutes at 5-second intervals)
      if (metrics.value.length > 120) {
        metrics.value.shift()
      }

      // Log if performance is degrading
      if (fps < 30) {
        console.warn(
          `[PerformanceMonitor] Low FPS detected: ${fps} (target: 60). Data points: ${metric.dataPoints}`
        )
      }

      if (metric.renderTime > 16.67) {
        // 16.67ms is ~60fps
        console.warn(
          `[PerformanceMonitor] Slow render detected: ${metric.renderTime.toFixed(2)}ms`
        )
      }
    }, 5000)

    console.log('[PerformanceMonitor] Monitoring started')
  }

  /**
   * Stop performance monitoring
   */
  function stopMonitoring() {
    if (monitoringIntervalId.value) {
      clearInterval(monitoringIntervalId.value)
      monitoringIntervalId.value = null
    }
    console.log('[PerformanceMonitor] Monitoring stopped')
  }

  /**
   * Get average metrics
   */
  const averageMetrics = computed(() => {
    if (metrics.value.length === 0) {
      return {
        avgRenderTime: 0,
        avgUpdateTime: 0,
        avgFps: 60,
        avgDataPoints: 0,
      }
    }

    const sum = metrics.value.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        updateTime: acc.updateTime + metric.updateTime,
        fps: acc.fps + metric.fps,
        dataPoints: acc.dataPoints + metric.dataPoints,
      }),
      { renderTime: 0, updateTime: 0, fps: 0, dataPoints: 0 }
    )

    return {
      avgRenderTime: sum.renderTime / metrics.value.length,
      avgUpdateTime: sum.updateTime / metrics.value.length,
      avgFps: Math.round(sum.fps / metrics.value.length),
      avgDataPoints: Math.round(sum.dataPoints / metrics.value.length),
    }
  })

  /**
   * Get current status
   */
  const currentStatus = computed(() => {
    const current = dashboardStore.performanceMetrics
    const avg = averageMetrics.value

    return {
      current,
      average: avg,
      isHealthy: avg.avgFps >= 50 && current.renderTime <= 33.33,
    }
  })

  /**
   * Record render cycle time
   */
  function recordRenderCycle(renderTime: number, updateTime: number) {
    dashboardStore.recordRenderTime(renderTime)
    dashboardStore.recordUpdateTime(updateTime)
  }

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    metrics,
    averageMetrics,
    currentStatus,
    startMonitoring,
    stopMonitoring,
    recordRenderCycle,
  }
}
