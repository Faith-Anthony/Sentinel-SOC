/**
 * Error resilience composable
 * Phase 4: Comprehensive error handling and recovery
 * Prevents UI crashes and provides user feedback
 */

import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

export interface DashboardError {
  id: string
  message: string
  severity: 'error' | 'warning' | 'info'
  timestamp: number
  resolved: boolean
  suggestion?: string
}

export function useErrorResilience() {
  const dashboardStore = useDashboardStore()
  const errors = ref<DashboardError[]>([])

  /**
   * Log an error with automatic recovery suggestion
   */
  function logError(message: string, severity: 'error' | 'warning' | 'info' = 'error') {
    const error: DashboardError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      severity,
      timestamp: Date.now(),
      resolved: false,
      suggestion: getSuggestion(message),
    }

    errors.value.push(error)

    // Keep only last 50 errors
    if (errors.value.length > 50) {
      errors.value.shift()
    }

    // Auto-log to console
    if (severity === 'error') {
      console.error('[DashboardError]', message)
    } else if (severity === 'warning') {
      console.warn('[DashboardWarning]', message)
    } else {
      console.info('[DashboardInfo]', message)
    }

    // Update store error if it's critical
    if (severity === 'error') {
      dashboardStore.setError(message)
    }

    return error.id
  }

  /**
   * Get recovery suggestion based on error type
   */
  function getSuggestion(message: string): string {
    if (message.includes('disconnect')) {
      return 'The connection was lost. The system is attempting to reconnect automatically.'
    }
    if (message.includes('validation')) {
      return 'Invalid data was received. Check the data format and try again.'
    }
    if (message.includes('timeout')) {
      return 'The request timed out. Check your network connection and try again.'
    }
    if (message.includes('memory')) {
      return 'Memory usage is high. Try clearing your browser cache or reloading the page.'
    }
    return 'An unexpected error occurred. Please try refreshing the page.'
  }

  /**
   * Resolve an error
   */
  function resolveError(errorId: string) {
    const error = errors.value.find((e) => e.id === errorId)
    if (error) {
      error.resolved = true

      // Clear store error if it matches
      if (dashboardStore.error === error.message) {
        dashboardStore.setError(null)
      }
    }
  }

  /**
   * Clear all resolved errors
   */
  function clearResolvedErrors() {
    errors.value = errors.value.filter((e) => !e.resolved)
  }

  /**
   * Clear all errors
   */
  function clearAllErrors() {
    errors.value = []
    dashboardStore.setError(null)
  }

  /**
   * Handle validation errors gracefully
   */
  function handleValidationError(fieldName: string, errors: string[]): string {
    const message = `Validation error in ${fieldName}: ${errors.join(', ')}`
    return logError(message, 'warning')
  }

  /**
   * Handle connection errors with automatic retry
   */
  function handleConnectionError(errorMessage: string, retryable = true): string {
    const suggestion = retryable ? 'Attempting automatic reconnection...' : 'Please check your connection.'
    const message = `Connection error: ${errorMessage}. ${suggestion}`
    return logError(message, 'error')
  }

  /**
   * Safe wrapper for async operations
   */
  async function safeAsync<T>(
    operation: () => Promise<T>,
    operationName = 'Operation'
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logError(`${operationName} failed: ${message}`, 'error')
      return null
    }
  }

  /**
   * Safe wrapper for sync operations
   */
  function safeSync<T>(
    operation: () => T,
    operationName = 'Operation'
  ): T | null {
    try {
      return operation()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logError(`${operationName} failed: ${message}`, 'error')
      return null
    }
  }

  /**
   * Get active (unresolved) errors
   */
  const activeErrors = computed(() => errors.value.filter((e) => !e.resolved))

  /**
   * Get critical errors
   */
  const criticalErrors = computed(() =>
    activeErrors.value.filter((e) => e.severity === 'error')
  )

  /**
   * Get warnings
   */
  const warnings = computed(() =>
    activeErrors.value.filter((e) => e.severity === 'warning')
  )

  /**
   * Has critical errors
   */
  const hasCriticalErrors = computed(() => criticalErrors.value.length > 0)

  return {
    errors,
    activeErrors,
    criticalErrors,
    warnings,
    hasCriticalErrors,
    logError,
    resolveError,
    clearResolvedErrors,
    clearAllErrors,
    handleValidationError,
    handleConnectionError,
    safeAsync,
    safeSync,
  }
}
