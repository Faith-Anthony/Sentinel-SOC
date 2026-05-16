/**
 * Core TypeScript type definitions for the cybersecurity dashboard
 * Scalable and maintainable type structure for future expansion
 */

/**
 * Represents a time-series data point for charts
 */
export interface TimeSeriesPoint {
  timestamp: number
  value: number
  label?: string
}

/**
 * Represents a threat event detected in the system
 */
export interface ThreatEvent {
  id: string
  timestamp: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  type: string
  source: string
  description: string
  status: 'ACTIVE' | 'MITIGATED' | 'RESOLVED'
  affectedSystems?: string[]
  actionTaken?: string
}

/**
 * Represents a metric card on the dashboard
 */
export interface MetricCard {
  id: string
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendPercentage?: number
  icon?: string
  color?: 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red'
  description?: string
}

/**
 * Represents system status information
 */
export interface SystemStatus {
  isConnected: boolean
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  uptime: number // in milliseconds
  lastSync: number // timestamp
  nodeId: string
  region?: string
}

/**
 * Represents a network traffic data point
 */
export interface NetworkTrafficPoint {
  timestamp: number
  inbound: number
  outbound: number
}

/**
 * Represents an attack type with count
 */
export interface AttackType {
  type: string
  count: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

/**
 * Represents chart dataset with time-series data
 */
export interface ChartDataset {
  id: string
  label: string
  data: TimeSeriesPoint[]
  timestamp: number
}

/**
 * Represents real-time metric value with history
 */
export interface MetricHistory {
  id: string
  value: number
  timestamp: number
  trend: number // percentage change
}

/**
 * Represents threat statistics
 */
export interface ThreatStats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  blocked: number
}

/**
 * Represents the state of the real-time data stream
 */
export interface StreamState {
  isActive: boolean
  isPaused: boolean
  updateInterval: number // milliseconds
  lastUpdate: number // timestamp
  messageCount: number
  errorCount: number
}

/**
 * Represents the dashboard time range filter
 */
export interface TimeRange {
  label: string
  start: number // timestamp
  end: number // timestamp
  value: 'realtime' | '1h' | '6h' | '24h' | '7d' | '30d' | 'custom'
}

/**
 * Represents activity feed item
 */
export interface ActivityFeedItem {
  id: string
  timestamp: number
  type: 'alert' | 'event' | 'metric' | 'system'
  title: string
  description: string
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
  read: boolean
  actionUrl?: string
}

/**
 * Represents dashboard configuration
 */
export interface DashboardConfig {
  refreshRate: number // milliseconds
  maxDataPoints: number
  enableAnimations: boolean
  colorScheme: 'dark' | 'light'
  timeRange: TimeRange
}

/**
 * Phase 3: Dashboard filter configuration
 */
export interface DashboardFilters {
  severityLevels: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[]
  threatTypes: string[]
  activityTypes: ('alert' | 'event' | 'metric' | 'system')[]
  metricCategories: string[]
  searchQuery: string
}

/**
 * Phase 3: Dataset toggle configuration
 */
export interface DatasetConfig {
  id: string
  label: string
  visible: boolean
  color?: string
}

/**
 * Phase 3: Chart type configuration
 */
export type ChartType = 'line' | 'area' | 'bar'

/**
 * Phase 3: Dashboard controls state
 */
export interface DashboardControls {
  isPaused: boolean
  selectedTimeRange: TimeRange
  selectedChartType: ChartType
  datasets: DatasetConfig[]
  filters: DashboardFilters
}

/**
 * Phase 4: Stream resilience configuration
 */
export interface StreamResilience {
  reconnectAttempts: number
  reconnectMaxAttempts: number
  reconnectDelay: number // milliseconds
  reconnectBackoffMultiplier: number
  isReconnecting: boolean
  lastConnectionError?: string
  disconnectedAt?: number
}

/**
 * Phase 4: Payload validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Phase 4: Validation schema for incoming data
 */
export interface ValidationSchema {
  threatEvent?: {
    requiredFields: (keyof ThreatEvent)[]
    severityValues: string[]
    statusValues: string[]
  }
  activityFeedItem?: {
    requiredFields: (keyof ActivityFeedItem)[]
    typeValues: string[]
  }
  metricCard?: {
    requiredFields: (keyof MetricCard)[]
    valueRange?: { min: number; max: number }
  }
}

/**
 * Phase 4: Performance metrics tracking
 */
export interface PerformanceMetrics {
  renderTime: number
  updateTime: number
  memoryUsage: number
  dataPoints: number
  fps: number
}

/**
 * Represents the complete dashboard state
 */
export interface DashboardState {
  config: DashboardConfig
  systemStatus: SystemStatus
  streamState: StreamState
  metrics: MetricCard[]
  threatEvents: ThreatEvent[]
  activityFeed: ActivityFeedItem[]
  selectedTimeRange: TimeRange
  isLoading: boolean
  error: string | null
  // Phase 3 additions
  controls: DashboardControls
  // Phase 4 additions
  streamResilience: StreamResilience
  performanceMetrics: PerformanceMetrics
}
