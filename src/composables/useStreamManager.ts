/**
 * Composable for managing the real-time data stream
 * Provides reactive stream state and control methods
 * Phase 4: Enhanced with resilience, validation, and proper cleanup
 */

import { ref, onUnmounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { createStreamSimulator, type StreamSimulator } from '@/services/streamSimulator'
import { validateThreatEvent, validateActivityFeedItem } from '@/services/payloadValidator'

export function useStreamManager() {
  const dashboardStore = useDashboardStore()
  const streamSimulator = ref<StreamSimulator | null>(null)
  const isInitialized = ref(false)
  
  // Phase 4: Track unsubscribe functions for cleanup
  const unsubscribeFunctions = ref<Array<() => void>>([])

  /**
   * Initialize the stream simulator
   */
  function initializeStream() {
    if (isInitialized.value) return

    streamSimulator.value = createStreamSimulator({
      updateInterval: dashboardStore.config.refreshRate,
      threatEventFrequency: 0.3,
      activityFeedFrequency: 0.4,
      metricsUpdateFrequency: 0.8,
      // Phase 4: Resilience configuration
      simulateDisconnect: true,
      disconnectChance: 0.005,
      disconnectDuration: 3000,
      reconnectDelay: 1000,
      maxReconnectAttempts: 5,
      reconnectBackoffMultiplier: 1.5,
      maxDataPoints: 100,
    })

    // Start the stream
    streamSimulator.value.start(dashboardStore.metrics)

    // Subscribe to threat events
    const unsubThreatEvent = streamSimulator.value.onThreatEvent((event) => {
      // Phase 4: Validate before adding
      const validation = validateThreatEvent(event)
      if (validation.isValid) {
        dashboardStore.addThreatEvent(event)
        dashboardStore.updateStreamState({
          messageCount: dashboardStore.streamState.messageCount + 1,
          lastUpdate: Date.now(),
        })
      } else {
        console.warn('[StreamManager] Invalid threat event:', validation.errors)
        dashboardStore.streamResilience.reconnectAttempts += 1
      }
    })
    unsubscribeFunctions.value.push(unsubThreatEvent)

    // Subscribe to activity feed updates
    const unsubActivityFeed = streamSimulator.value.onActivityFeed((item) => {
      // Phase 4: Validate before adding
      const validation = validateActivityFeedItem(item)
      if (validation.isValid) {
        dashboardStore.addActivityFeedItem(item)
      } else {
        console.warn('[StreamManager] Invalid activity feed item:', validation.errors)
      }
    })
    unsubscribeFunctions.value.push(unsubActivityFeed)

    // Subscribe to metrics updates
    const unsubMetricsUpdate = streamSimulator.value.onMetricsUpdate((metrics) => {
      dashboardStore.updateMetrics(metrics)
    })
    unsubscribeFunctions.value.push(unsubMetricsUpdate)

    // Subscribe to connection status
    const unsubConnectionStatus = streamSimulator.value.onConnectionStatus((isConnected) => {
      // Phase 4: Update resilience state
      dashboardStore.updateSystemStatus({
        isConnected,
        lastSync: Date.now(),
      })
      
      if (!isConnected) {
        dashboardStore.setReconnecting(true)
        dashboardStore.setError('Stream disconnected. Attempting to reconnect...')
      } else {
        dashboardStore.setReconnecting(false)
        dashboardStore.resetReconnectAttempts()
        dashboardStore.setError(null)
      }
    })
    unsubscribeFunctions.value.push(unsubConnectionStatus)

    isInitialized.value = true
    console.log('[StreamManager] Initialized with Phase 4 resilience')
  }

  /**
   * Pause the stream
   */
  function pauseStream() {
    dashboardStore.pauseStream()
    if (streamSimulator.value) {
      streamSimulator.value.stop()
    }
  }

  /**
   * Resume the stream
   */
  function resumeStream() {
    dashboardStore.resumeStream()
    if (streamSimulator.value) {
      streamSimulator.value.start(dashboardStore.metrics)
    }
  }

  /**
   * Toggle stream pause/resume
   */
  function toggleStream() {
    if (dashboardStore.streamState.isPaused) {
      resumeStream()
    } else {
      pauseStream()
    }
  }

  /**
   * Phase 4: Get stream connection status
   */
  const isConnected = computed(() => dashboardStore.systemStatus.isConnected)

  /**
   * Phase 4: Get reconnection state
   */
  const isReconnecting = computed(() => dashboardStore.streamResilience.isReconnecting)

  /**
   * Phase 4: Get reconnect attempts
   */
  const reconnectAttempts = computed(() => dashboardStore.streamResilience.reconnectAttempts)

  /**
   * Phase 4: Proper cleanup on component unmount
   */
  function cleanup() {
    // Unsubscribe all listeners
    unsubscribeFunctions.value.forEach((unsub) => {
      try {
        unsub()
      } catch (error) {
        console.error('[StreamManager] Error during cleanup:', error)
      }
    })
    unsubscribeFunctions.value = []

    // Stop and destroy stream simulator
    if (streamSimulator.value) {
      streamSimulator.value.stop()
      streamSimulator.value.destroy()
      streamSimulator.value = null
    }

    isInitialized.value = false
    console.log('[StreamManager] Cleanup complete')
  }

  /**
   * Stop stream
   */
  function stopStream() {
    if (streamSimulator.value) {
      streamSimulator.value.stop()
    }
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    isInitialized,
    initializeStream,
    pauseStream,
    resumeStream,
    toggleStream,
    stopStream,
    cleanup,
    // Phase 4: Computed properties
    isConnected,
    isReconnecting,
    reconnectAttempts,
  }
}
