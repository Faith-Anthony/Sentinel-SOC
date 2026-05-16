/**
 * Mock streaming service for simulating real-time cybersecurity data
 * Provides foundation for future real-time WebSocket/SSE integration
 * Generates realistic metrics, threat events, activity feed updates, and time-series data
 */

import type { ThreatEvent, ActivityFeedItem, MetricCard, TimeSeriesPoint, NetworkTrafficPoint } from '@/types/dashboard'

/**
 * Configuration for the stream simulator
 */
interface StreamSimulatorConfig {
  updateInterval: number
  threatEventFrequency: number
  activityFeedFrequency: number
  metricsUpdateFrequency: number
  timeSeriesUpdateFrequency: number
  // Phase 4: Resilience configuration
  simulateDisconnect?: boolean // Enable disconnect/reconnect simulation
  disconnectChance?: number // Probability of disconnect per cycle (0-1)
  disconnectDuration?: number // Duration of simulated disconnect (ms)
  reconnectDelay?: number // Initial delay before reconnect attempt (ms)
  maxReconnectAttempts?: number // Max reconnect attempts
  reconnectBackoffMultiplier?: number // Exponential backoff multiplier
  maxDataPoints?: number // Maximum data points to keep per chart (windowing)
}

/**
 * Default configuration
 */
const defaultConfig: StreamSimulatorConfig = {
  updateInterval: 1000, // 1 second
  threatEventFrequency: 0.25, // 25% chance per cycle
  activityFeedFrequency: 0.35, // 35% chance per cycle
  metricsUpdateFrequency: 1.0, // 100% chance per cycle (always update)
  timeSeriesUpdateFrequency: 1.0, // 100% chance per cycle
  // Phase 4: Resilience defaults
  simulateDisconnect: true,
  disconnectChance: 0.005, // ~0.5% chance per cycle (about every 3-4 minutes at 1s updates)
  disconnectDuration: 3000, // 3 second simulated disconnect
  reconnectDelay: 1000, // Start with 1 second delay
  maxReconnectAttempts: 5,
  reconnectBackoffMultiplier: 1.5,
  maxDataPoints: 100, // Keep last 100 data points per chart
}

/**
 * Generates random threat events for simulation
 */
function generateThreatEvent(): ThreatEvent {
  const threatTypes = [
    { type: 'SQL Injection Attempt', severity: 'CRITICAL' as const },
    { type: 'Brute Force Login', severity: 'HIGH' as const },
    { type: 'Anomalous Traffic', severity: 'MEDIUM' as const },
    { type: 'DDoS Detection', severity: 'CRITICAL' as const },
    { type: 'Credential Stuffing', severity: 'HIGH' as const },
    { type: 'XSS Attempt', severity: 'MEDIUM' as const },
    { type: 'Zero-day Exploit', severity: 'CRITICAL' as const },
    { type: 'Unauthorized Access', severity: 'HIGH' as const },
  ]

  const sourceIPs = [
    '192.168.1.105',
    '10.2.0.42',
    '172.16.0.50',
    '203.0.113.45',
    '198.51.100.89',
    '192.0.2.156',
  ]

  const systems = [
    'WEB_SERVER_01',
    'API_GATEWAY',
    'AUTH_SERVICE',
    'DATA_WAREHOUSE',
    'FIREWALL_NODE',
    'DNS_SERVER',
  ]

  const selected = threatTypes[Math.floor(Math.random() * threatTypes.length)]

  return {
    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    severity: selected.severity,
    type: selected.type,
    source: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
    description: `${selected.type} detected on system`,
    status: Math.random() > 0.5 ? 'ACTIVE' : 'MITIGATED',
    affectedSystems: [
      systems[Math.floor(Math.random() * systems.length)],
      systems[Math.floor(Math.random() * systems.length)],
    ],
    actionTaken: Math.random() > 0.3 ? 'Automatic mitigation activated' : undefined,
  }
}

/**
 * Generates random activity feed items
 */
function generateActivityFeedItem(): ActivityFeedItem {
  const activityTypes = [
    {
      type: 'alert',
      title: 'Security alert triggered',
      description: 'Suspicious activity detected',
      severity: 'critical',
    },
    {
      type: 'event',
      title: 'System configuration changed',
      description: 'Firewall rule update applied',
      severity: 'info',
    },
    {
      type: 'metric',
      title: 'Performance threshold exceeded',
      description: 'High network latency detected',
      severity: 'high',
    },
    {
      type: 'system',
      title: 'Database backup completed',
      description: 'Backup size: 125 GB',
      severity: 'info',
    },
  ]

  const selected = activityTypes[Math.floor(Math.random() * activityTypes.length)]

  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type: selected.type as 'alert' | 'event' | 'metric' | 'system',
    title: selected.title,
    description: selected.description,
    severity: selected.severity as 'critical' | 'high' | 'medium' | 'low' | 'info',
    read: false,
  }
}

/**
 * Generates random metric updates with realistic trends
 */
function generateMetricUpdates(
  currentMetrics: MetricCard[],
  stats: MetricStats
): MetricCard[] {
  return currentMetrics.map((metric) => {
    if (typeof metric.value !== 'number') return metric

    let newValue = metric.value
    let change = 0

    // Simulate realistic metric behavior
    switch (metric.id) {
      case 'active-threats':
        change = Math.floor((Math.random() - 0.3) * 50) // More likely to increase
        newValue = Math.max(0, metric.value as number + change)
        stats.threatCount = newValue
        break

      case 'firewall-events':
        change = Math.floor((Math.random() - 0.2) * 40)
        newValue = Math.max(0, metric.value as number + change)
        stats.firewallEvents = newValue
        break

      case 'cpu-usage':
        // Trending behavior: stay within realistic range
        const cpuTrend = Math.random() - 0.5
        change = Math.floor(cpuTrend * 15)
        newValue = Math.max(0, Math.min(100, (metric.value as number) + change))
        stats.cpuUsage = newValue
        break

      case 'network-latency':
        // Latency spikes occasionally
        const spikeChance = Math.random()
        if (spikeChance > 0.9) {
          change = Math.floor(Math.random() * 30) // Spike
        } else {
          change = Math.floor((Math.random() - 0.5) * 10)
        }
        newValue = Math.max(0, Math.min(200, (metric.value as number) + change))
        stats.networkLatency = newValue
        break

      case 'memory-usage':
        const memoryTrend = Math.random() - 0.4
        change = Math.floor(memoryTrend * 12)
        newValue = Math.max(0, Math.min(100, (metric.value as number) + change))
        stats.memoryUsage = newValue
        break

      default:
        change = Math.floor((Math.random() - 0.5) * 20)
        newValue = Math.max(0, metric.value as number + change)
    }

    return {
      ...metric,
      value: newValue,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      trendPercentage: newValue > 0 ? Math.round((change / newValue) * 100) : 0,
    }
  })
}

/**
 * Generates time-series data points for charts
 */
function generateTimeSeriesPoint(metricId: string, stats: MetricStats, timestamp: number): TimeSeriesPoint {
  let value = 0

  switch (metricId) {
    case 'threat-timeline':
      value = stats.threatCount + Math.floor((Math.random() - 0.5) * 100)
      break
    case 'firewall-timeline':
      value = stats.firewallEvents + Math.floor((Math.random() - 0.3) * 80)
      break
    case 'cpu-timeline':
      value = Math.max(0, Math.min(100, stats.cpuUsage + Math.floor((Math.random() - 0.5) * 20)))
      break
    case 'memory-timeline':
      value = Math.max(0, Math.min(100, stats.memoryUsage + Math.floor((Math.random() - 0.5) * 15)))
      break
    case 'latency-timeline':
      value = Math.max(0, stats.networkLatency + Math.floor((Math.random() - 0.5) * 30))
      break
  }

  return {
    timestamp,
    value: Math.max(0, value),
    label: new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }
}

/**
 * Stream callback types
 */
type ThreatEventCallback = (event: ThreatEvent) => void
type ActivityFeedCallback = (item: ActivityFeedItem) => void
type MetricsUpdateCallback = (metrics: MetricCard[]) => void
type ConnectionStatusCallback = (isConnected: boolean) => void
type TimeSeriesUpdateCallback = (data: TimeSeriesUpdate) => void

/**
 * Time-series data update
 */
interface TimeSeriesUpdate {
  chartId: string
  points: TimeSeriesPoint[]
}

/**
 * Statistics for realistic data generation
 */
interface MetricStats {
  cpuUsage: number
  memoryUsage: number
  networkLatency: number
  threatCount: number
  firewallEvents: number
}

/**
 * Stream simulator class
 * Manages interval-based data generation and cleanup
 * Phase 4: Enhanced with resilience, disconnect/reconnect simulation, and data windowing
 */
export class StreamSimulator {
  private intervalId: number | null = null
  private isRunning = false
  private config: StreamSimulatorConfig
  private threatEventCallbacks: Set<ThreatEventCallback> = new Set()
  private activityFeedCallbacks: Set<ActivityFeedCallback> = new Set()
  private metricsUpdateCallbacks: Set<MetricsUpdateCallback> = new Set()
  private connectionStatusCallbacks: Set<ConnectionStatusCallback> = new Set()
  private timeSeriesCallbacks: Set<TimeSeriesUpdateCallback> = new Set()
  private currentMetrics: MetricCard[] = []
  private timeSeriesData: Map<string, TimeSeriesPoint[]> = new Map()
  private stats: MetricStats = {
    cpuUsage: 45,
    memoryUsage: 62,
    networkLatency: 24,
    threatCount: 1248,
    firewallEvents: 892,
  }
  // Phase 4: Resilience properties
  private isConnected = true
  private isReconnecting = false
  private reconnectAttempts = 0
  private currentReconnectDelay = 1000
  private disconnectTimeoutId: number | null = null
  private reconnectTimeoutId: number | null = null

  constructor(config: Partial<StreamSimulatorConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Start the stream simulator
   */
  start(initialMetrics: MetricCard[]): void {
    if (this.isRunning) {
      console.warn('Stream simulator is already running')
      return
    }

    this.isRunning = true
    this.isConnected = true
    this.currentMetrics = initialMetrics
    
    // Initialize time-series data
    const chartIds = ['threat-timeline', 'firewall-timeline', 'cpu-timeline', 'memory-timeline', 'latency-timeline']
    const now = Date.now()
    chartIds.forEach((id) => {
      const points: TimeSeriesPoint[] = []
      // Generate 20 initial points (20 seconds of data at 1s intervals)
      for (let i = 20; i >= 0; i--) {
        points.push(generateTimeSeriesPoint(id, this.stats, now - i * 1000))
      }
      this.timeSeriesData.set(id, points)
    })

    this.notifyConnectionStatus(true)

    this.intervalId = window.setInterval(() => {
      // Phase 4: Check for simulated disconnect
      if (!this.isConnected || this.isReconnecting) {
        return // Skip updates while disconnected or reconnecting
      }

      // Phase 4: Simulate occasional disconnects
      if (this.config.simulateDisconnect && Math.random() < (this.config.disconnectChance || 0)) {
        this.simulateDisconnect()
        return
      }

      // Generate threat events
      if (Math.random() < this.config.threatEventFrequency) {
        const event = generateThreatEvent()
        this.notifyThreatEvent(event)
      }

      // Generate activity feed items
      if (Math.random() < this.config.activityFeedFrequency) {
        const item = generateActivityFeedItem()
        this.notifyActivityFeed(item)
      }

      // Update metrics
      if (Math.random() < this.config.metricsUpdateFrequency) {
        const updatedMetrics = generateMetricUpdates(this.currentMetrics, this.stats)
        this.currentMetrics = updatedMetrics
        this.notifyMetricsUpdate(updatedMetrics)
      }

      // Update time-series data
      if (Math.random() < this.config.timeSeriesUpdateFrequency) {
        const now = Date.now()
        const chartIds = Array.from(this.timeSeriesData.keys())
        
        chartIds.forEach((chartId) => {
          const point = generateTimeSeriesPoint(chartId, this.stats, now)
          const points = this.timeSeriesData.get(chartId) || []
          
          // Phase 4: Enforce data windowing (keep only last N points)
          const maxPoints = this.config.maxDataPoints || 100
          if (points.length >= maxPoints) {
            points.shift()
          }
          points.push(point)
          
          this.timeSeriesData.set(chartId, points)
          this.notifyTimeSeriesUpdate({ chartId, points })
        })
      }
    }, this.config.updateInterval)

    console.log('[StreamSimulator] Started with interval:', this.config.updateInterval)
  }

  /**
   * Phase 4: Simulate a network disconnect and reconnect with backoff
   */
  private simulateDisconnect(): void {
    if (this.isConnected === false) return // Already disconnected

    this.isConnected = false
    this.reconnectAttempts = 0
    this.currentReconnectDelay = this.config.reconnectDelay || 1000
    
    console.log('[StreamSimulator] Simulated disconnect')
    this.notifyConnectionStatus(false)

    // Auto-reconnect after simulated disconnect duration
    this.disconnectTimeoutId = window.setTimeout(() => {
      this.attemptReconnect()
    }, this.config.disconnectDuration || 3000)
  }

  /**
   * Phase 4: Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    const maxAttempts = this.config.maxReconnectAttempts || 5

    if (this.reconnectAttempts >= maxAttempts) {
      console.warn('[StreamSimulator] Max reconnect attempts reached')
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts += 1

    console.log(
      `[StreamSimulator] Reconnect attempt ${this.reconnectAttempts}/${maxAttempts} in ${this.currentReconnectDelay}ms`
    )

    this.reconnectTimeoutId = window.setTimeout(() => {
      // Simulate successful reconnection
      this.isConnected = true
      this.isReconnecting = false
      this.reconnectAttempts = 0

      console.log('[StreamSimulator] Reconnected successfully')
      this.notifyConnectionStatus(true)

      // Reset backoff for next time
      this.currentReconnectDelay = this.config.reconnectDelay || 1000
    }, this.currentReconnectDelay)

    // Apply exponential backoff for next attempt
    this.currentReconnectDelay = Math.min(
      this.currentReconnectDelay * (this.config.reconnectBackoffMultiplier || 1.5),
      30000 // Cap at 30 seconds
    )
  }

  /**
   * Stop the stream simulator
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('Stream simulator is not running')
      return
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Phase 4: Clean up resilience timeouts
    if (this.disconnectTimeoutId !== null) {
      clearTimeout(this.disconnectTimeoutId)
      this.disconnectTimeoutId = null
    }

    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }

    this.isRunning = false
    this.isConnected = false
    this.notifyConnectionStatus(false)
    console.log('[StreamSimulator] Stopped')
  }

  /**
   * Check if simulator is running
   */
  getIsRunning(): boolean {
    return this.isRunning
  }

  /**
   * Subscribe to threat events
   */
  onThreatEvent(callback: ThreatEventCallback): () => void {
    this.threatEventCallbacks.add(callback)
    return () => this.threatEventCallbacks.delete(callback)
  }

  /**
   * Subscribe to activity feed items
   */
  onActivityFeed(callback: ActivityFeedCallback): () => void {
    this.activityFeedCallbacks.add(callback)
    return () => this.activityFeedCallbacks.delete(callback)
  }

  /**
   * Subscribe to metrics updates
   */
  onMetricsUpdate(callback: MetricsUpdateCallback): () => void {
    this.metricsUpdateCallbacks.add(callback)
    return () => this.metricsUpdateCallbacks.delete(callback)
  }

  /**
   * Subscribe to time-series updates
   */
  onTimeSeriesUpdate(callback: TimeSeriesUpdateCallback): () => void {
    this.timeSeriesCallbacks.add(callback)
    return () => this.timeSeriesCallbacks.delete(callback)
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this.connectionStatusCallbacks.add(callback)
    return () => this.connectionStatusCallbacks.delete(callback)
  }

  /**
   * Notify threat event subscribers
   */
  private notifyThreatEvent(event: ThreatEvent): void {
    this.threatEventCallbacks.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error('[StreamSimulator] Error in threat event callback:', error)
      }
    })
  }

  /**
   * Notify activity feed subscribers
   */
  private notifyActivityFeed(item: ActivityFeedItem): void {
    this.activityFeedCallbacks.forEach((callback) => {
      try {
        callback(item)
      } catch (error) {
        console.error('[StreamSimulator] Error in activity feed callback:', error)
      }
    })
  }

  /**
   * Notify metrics update subscribers
   */
  private notifyMetricsUpdate(metrics: MetricCard[]): void {
    this.metricsUpdateCallbacks.forEach((callback) => {
      try {
        callback(metrics)
      } catch (error) {
        console.error('[StreamSimulator] Error in metrics update callback:', error)
      }
    })
  }

  /**
   * Notify time-series update subscribers
   */
  private notifyTimeSeriesUpdate(data: TimeSeriesUpdate): void {
    this.timeSeriesCallbacks.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error('[StreamSimulator] Error in time-series update callback:', error)
      }
    })
  }

  /**
   * Notify connection status subscribers
   */
  private notifyConnectionStatus(isConnected: boolean): void {
    this.connectionStatusCallbacks.forEach((callback) => {
      try {
        callback(isConnected)
      } catch (error) {
        console.error('[StreamSimulator] Error in connection status callback:', error)
      }
    })
  }

  /**
   * Cleanup and destroy the simulator
   */
  destroy(): void {
    this.stop()
    this.threatEventCallbacks.clear()
    this.activityFeedCallbacks.clear()
    this.metricsUpdateCallbacks.clear()
    this.timeSeriesCallbacks.clear()
    this.connectionStatusCallbacks.clear()
    this.timeSeriesData.clear()
    
    // Phase 4: Reset resilience state
    this.isConnected = false
    this.isReconnecting = false
    this.reconnectAttempts = 0
  }
}

/**
 * Create a singleton stream simulator instance
 */
let instance: StreamSimulator | null = null

export function createStreamSimulator(config?: Partial<StreamSimulatorConfig>): StreamSimulator {
  if (!instance) {
    instance = new StreamSimulator(config)
  }
  return instance
}

export function getStreamSimulator(): StreamSimulator | null {
  return instance
}

export function destroyStreamSimulator(): void {
  if (instance) {
    instance.destroy()
    instance = null
  }
}
