/**
 * Pinia store for centralized dashboard state management
 * Handles streaming state, metrics, threat events, and system status
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DashboardState,
  MetricCard,
  ThreatEvent,
  ActivityFeedItem,
  SystemStatus,
  StreamState,
  TimeRange,
  DashboardConfig,
  TimeSeriesPoint,
  DashboardControls,
  DashboardFilters,
  DatasetConfig,
  ChartType,
  StreamResilience,
  PerformanceMetrics,
} from '@/types/dashboard'
import { sanitizeThreatEvent, sanitizeActivityFeedItem } from '@/services/payloadValidator'

// Default configuration
const defaultConfig: DashboardConfig = {
  refreshRate: 1000, // 1 second
  maxDataPoints: 100,
  enableAnimations: true,
  colorScheme: 'dark',
  timeRange: {
    label: 'Real-time',
    start: Date.now() - 3600000,
    end: Date.now(),
    value: 'realtime',
  },
}

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const config = ref<DashboardConfig>(defaultConfig)
  const systemStatus = ref<SystemStatus>({
    isConnected: true,
    connectionQuality: 'excellent',
    uptime: 0,
    lastSync: Date.now(),
    nodeId: 'NODE_ALPHA_01',
    region: 'us-east-1',
  })

  const streamState = ref<StreamState>({
    isActive: true,
    isPaused: false,
    updateInterval: 1000,
    lastUpdate: Date.now(),
    messageCount: 0,
    errorCount: 0,
  })

  const metrics = ref<MetricCard[]>([
    {
      id: 'active-threats',
      title: 'ACTIVE THREATS',
      value: 1248,
      unit: 'threats',
      trend: 'up',
      trendPercentage: 12,
      color: 'red',
      description: 'Real-time threat count',
    },
    {
      id: 'firewall-events',
      title: 'FIREWALL EVENTS',
      value: 892,
      unit: 'events',
      trend: 'up',
      trendPercentage: 8,
      color: 'orange',
      description: 'Blocked by firewall',
    },
    {
      id: 'cpu-usage',
      title: 'CPU USAGE',
      value: 45,
      unit: '%',
      trend: 'stable',
      trendPercentage: 0,
      color: 'blue',
      description: 'System CPU utilization',
    },
    {
      id: 'memory-usage',
      title: 'MEMORY USAGE',
      value: 62,
      unit: '%',
      trend: 'up',
      trendPercentage: 3,
      color: 'purple',
      description: 'System memory usage',
    },
    {
      id: 'network-latency',
      title: 'NETWORK LATENCY',
      value: 24,
      unit: 'ms',
      trend: 'stable',
      trendPercentage: 0,
      color: 'cyan',
      description: 'Average response time',
    },
  ])

  const threatEvents = ref<ThreatEvent[]>([
    {
      id: 'threat-001',
      timestamp: Date.now() - 300000,
      severity: 'CRITICAL',
      type: 'SQL Injection Attempt',
      source: '192.168.1.105',
      description: 'Detected SQL injection attempt on authentication endpoint',
      status: 'MITIGATED',
      affectedSystems: ['WEB_SERVER_01', 'API_GATEWAY'],
      actionTaken: 'Blocked source IP, rate limited endpoint',
    },
    {
      id: 'threat-002',
      timestamp: Date.now() - 600000,
      severity: 'HIGH',
      type: 'Brute Force Login',
      source: '10.2.0.42',
      description: 'Multiple failed authentication attempts detected',
      status: 'ACTIVE',
      affectedSystems: ['AUTH_SERVICE'],
      actionTaken: 'Account locked temporarily',
    },
    {
      id: 'threat-003',
      timestamp: Date.now() - 900000,
      severity: 'MEDIUM',
      type: 'Anomalous Traffic',
      source: '172.16.0.50',
      description: 'Unusual data exfiltration pattern detected',
      status: 'RESOLVED',
      affectedSystems: ['DATA_WAREHOUSE'],
      actionTaken: 'Connection terminated, logs preserved',
    },
  ])

  const activityFeed = ref<ActivityFeedItem[]>([
    {
      id: 'activity-001',
      timestamp: Date.now() - 120000,
      type: 'alert',
      title: 'Multiple failed logon detected',
      description: 'User account: admin@corp.local',
      severity: 'critical',
      read: false,
    },
    {
      id: 'activity-002',
      timestamp: Date.now() - 300000,
      type: 'event',
      title: 'Unusual outbound traffic',
      description: 'Traffic spike from internal network',
      severity: 'high',
      read: false,
    },
    {
      id: 'activity-003',
      timestamp: Date.now() - 600000,
      type: 'metric',
      title: 'Firewall rule updated',
      description: 'New ruleset applied to all gateway nodes',
      severity: 'info',
      read: true,
    },
  ])

  const selectedTimeRange = ref<TimeRange>(defaultConfig.timeRange)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Chart datasets (time-series data for each chart)
  const chartDatasets = ref<Record<string, TimeSeriesPoint[]>>({
    'threat-timeline': [],
    'firewall-timeline': [],
    'cpu-timeline': [],
    'memory-timeline': [],
    'latency-timeline': [],
  })

  // Phase 3: Dashboard Controls
  const controls = ref<DashboardControls>({
    isPaused: false,
    selectedTimeRange: defaultConfig.timeRange,
    selectedChartType: 'line',
    datasets: [
      { id: 'active-threats', label: 'Active Threats', visible: true },
      { id: 'firewall-events', label: 'Firewall Events', visible: true },
      { id: 'cpu-usage', label: 'CPU Usage', visible: true },
      { id: 'memory-usage', label: 'Memory Usage', visible: true },
      { id: 'network-latency', label: 'Network Latency', visible: true },
    ],
    filters: {
      severityLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      threatTypes: [],
      activityTypes: ['alert', 'event', 'metric', 'system'],
      metricCategories: [],
      searchQuery: '',
    },
  })

  // Phase 4: Stream Resilience State
  const streamResilience = ref<StreamResilience>({
    reconnectAttempts: 0,
    reconnectMaxAttempts: 5,
    reconnectDelay: 1000,
    reconnectBackoffMultiplier: 1.5,
    isReconnecting: false,
  })

  // Phase 4: Performance Metrics
  const performanceMetrics = ref<PerformanceMetrics>({
    renderTime: 0,
    updateTime: 0,
    memoryUsage: 0,
    dataPoints: 0,
    fps: 60,
  })

  // Computed properties
  const state = computed<DashboardState>(() => ({
    config: config.value,
    systemStatus: systemStatus.value,
    streamState: streamState.value,
    metrics: metrics.value,
    threatEvents: threatEvents.value,
    activityFeed: activityFeed.value,
    selectedTimeRange: selectedTimeRange.value,
    isLoading: isLoading.value,
    error: error.value,
    // Phase 3 additions
    controls: controls.value,
    // Phase 4 additions
    streamResilience: streamResilience.value,
    performanceMetrics: performanceMetrics.value,
  }))

  const activeThreatsCount = computed(() =>
    threatEvents.value.filter((t) => t.status === 'ACTIVE').length
  )

  const criticalThreatsCount = computed(() =>
    threatEvents.value.filter((t) => t.severity === 'CRITICAL').length
  )

  const unreadActivityCount = computed(() =>
    activityFeed.value.filter((a) => !a.read).length
  )

  const connectionStatus = computed(() => systemStatus.value.isConnected)

  // Phase 3: Computed properties for filtered data
  const filteredThreatEvents = computed(() => {
    let filtered = threatEvents.value

    // Filter by severity
    if (controls.value.filters.severityLevels.length > 0) {
      filtered = filtered.filter((t) =>
        controls.value.filters.severityLevels.includes(t.severity)
      )
    }

    // Filter by threat type
    if (controls.value.filters.threatTypes.length > 0) {
      filtered = filtered.filter((t) =>
        controls.value.filters.threatTypes.includes(t.type)
      )
    }

    // Filter by search query
    if (controls.value.filters.searchQuery) {
      const query = controls.value.filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.type.toLowerCase().includes(query) ||
          t.source.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const filteredActivityFeed = computed(() => {
    let filtered = activityFeed.value

    // Filter by activity type
    if (controls.value.filters.activityTypes.length > 0) {
      filtered = filtered.filter((a) =>
        controls.value.filters.activityTypes.includes(a.type)
      )
    }

    // Filter by search query
    if (controls.value.filters.searchQuery) {
      const query = controls.value.filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  })

  const visibleDatasets = computed(() =>
    controls.value.datasets.filter((d) => d.visible)
  )

  // Actions
  function setLoading(value: boolean) {
    isLoading.value = value
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  function updateSystemStatus(status: Partial<SystemStatus>) {
    systemStatus.value = { ...systemStatus.value, ...status }
  }

  function updateStreamState(state: Partial<StreamState>) {
    streamState.value = { ...streamState.value, ...state }
  }

  function toggleStreamPause() {
    streamState.value.isPaused = !streamState.value.isPaused
  }

  function resumeStream() {
    streamState.value.isPaused = false
  }

  function pauseStream() {
    streamState.value.isPaused = true
  }

  function updateMetrics(newMetrics: MetricCard[]) {
    metrics.value = newMetrics
  }

  function updateMetricCard(id: string, updates: Partial<MetricCard>) {
    const index = metrics.value.findIndex((m) => m.id === id)
    if (index !== -1) {
      metrics.value[index] = { ...metrics.value[index], ...updates }
    }
  }

  function addThreatEvent(event: ThreatEvent) {
    // Phase 4: Validate and sanitize incoming threat event
    const sanitized = sanitizeThreatEvent(event)
    if (!sanitized) {
      console.warn('[Dashboard] Invalid threat event received, skipping:', event)
      streamResilience.value.reconnectAttempts += 1
      return
    }

    threatEvents.value.unshift(sanitized)
    
    // Phase 4: Data windowing - keep only last 100 events
    const maxThreatEvents = 100
    if (threatEvents.value.length > maxThreatEvents) {
      threatEvents.value = threatEvents.value.slice(0, maxThreatEvents)
    }
  }

  function updateThreatEventStatus(id: string, status: ThreatEvent['status']) {
    const event = threatEvents.value.find((e) => e.id === id)
    if (event) {
      event.status = status
    }
  }

  function addActivityFeedItem(item: ActivityFeedItem) {
    // Phase 4: Validate and sanitize incoming activity feed item
    const sanitized = sanitizeActivityFeedItem(item)
    if (!sanitized) {
      console.warn('[Dashboard] Invalid activity feed item received, skipping:', item)
      return
    }

    activityFeed.value.unshift(sanitized)
    
    // Phase 4: Data windowing - keep only last 100 items (increased from 50 for resilience)
    const maxActivityItems = 100
    if (activityFeed.value.length > maxActivityItems) {
      activityFeed.value = activityFeed.value.slice(0, maxActivityItems)
    }
  }

  function markActivityAsRead(id: string) {
    const item = activityFeed.value.find((a) => a.id === id)
    if (item) {
      item.read = true
    }
  }

  function markAllActivityAsRead() {
    activityFeed.value.forEach((a) => {
      a.read = true
    })
  }

  function setTimeRange(range: TimeRange) {
    selectedTimeRange.value = range
    config.value.timeRange = range
  }

  function clearThreatEvents() {
    threatEvents.value = []
  }

  function clearActivityFeed() {
    activityFeed.value = []
  }

  function resetDashboard() {
    isLoading.value = false
    error.value = null
    systemStatus.value.isConnected = true
    streamState.value.isPaused = false
  }

  function updateChartDataset(chartId: string, points: TimeSeriesPoint[]) {
    chartDatasets.value[chartId] = points
  }

  function getChartDataset(chartId: string): TimeSeriesPoint[] {
    return chartDatasets.value[chartId] || []
  }

  // Phase 3: Control and Filter Actions
  function updateChartType(chartType: ChartType) {
    controls.value.selectedChartType = chartType
  }

  function toggleDataset(datasetId: string) {
    const dataset = controls.value.datasets.find((d) => d.id === datasetId)
    if (dataset) {
      dataset.visible = !dataset.visible
    }
  }

  function setDatasetVisibility(datasetId: string, visible: boolean) {
    const dataset = controls.value.datasets.find((d) => d.id === datasetId)
    if (dataset) {
      dataset.visible = visible
    }
  }

  function updateFilters(newFilters: Partial<DashboardFilters>) {
    controls.value.filters = { ...controls.value.filters, ...newFilters }
  }

  function setSeverityFilter(severities: string[]) {
    controls.value.filters.severityLevels = severities as (
      | 'CRITICAL'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW'
    )[]
  }

  function setThreatTypeFilter(types: string[]) {
    controls.value.filters.threatTypes = types
  }

  function setActivityTypeFilter(types: string[]) {
    controls.value.filters.activityTypes = types as (
      | 'alert'
      | 'event'
      | 'metric'
      | 'system'
    )[]
  }

  function setSearchQuery(query: string) {
    controls.value.filters.searchQuery = query
  }

  function clearAllFilters() {
    controls.value.filters = {
      severityLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      threatTypes: [],
      activityTypes: ['alert', 'event', 'metric', 'system'],
      metricCategories: [],
      searchQuery: '',
    }
  }

  // Phase 4: Stream Resilience Actions
  function updateStreamResilience(updates: Partial<StreamResilience>) {
    streamResilience.value = { ...streamResilience.value, ...updates }
  }

  function resetReconnectAttempts() {
    streamResilience.value.reconnectAttempts = 0
  }

  function incrementReconnectAttempts() {
    streamResilience.value.reconnectAttempts = Math.min(
      streamResilience.value.reconnectAttempts + 1,
      streamResilience.value.reconnectMaxAttempts
    )
  }

  function setReconnecting(isReconnecting: boolean) {
    streamResilience.value.isReconnecting = isReconnecting
  }

  // Phase 4: Performance Metrics Actions
  function updatePerformanceMetrics(updates: Partial<PerformanceMetrics>) {
    performanceMetrics.value = { ...performanceMetrics.value, ...updates }
  }

  function recordRenderTime(time: number) {
    performanceMetrics.value.renderTime = time
  }

  function recordUpdateTime(time: number) {
    performanceMetrics.value.updateTime = time
  }

  function updateDataPointCount(count: number) {
    performanceMetrics.value.dataPoints = count
  }

  return {
    // State
    config,
    systemStatus,
    streamState,
    metrics,
    threatEvents,
    activityFeed,
    selectedTimeRange,
    isLoading,
    error,
    chartDatasets,
    controls,
    // Phase 4 state
    streamResilience,
    performanceMetrics,

    // Computed
    state,
    activeThreatsCount,
    criticalThreatsCount,
    unreadActivityCount,
    connectionStatus,
    filteredThreatEvents,
    filteredActivityFeed,
    visibleDatasets,

    // Actions
    setLoading,
    setError,
    updateSystemStatus,
    updateStreamState,
    toggleStreamPause,
    resumeStream,
    pauseStream,
    updateMetrics,
    updateMetricCard,
    addThreatEvent,
    updateThreatEventStatus,
    addActivityFeedItem,
    markActivityAsRead,
    markAllActivityAsRead,
    setTimeRange,
    clearThreatEvents,
    clearActivityFeed,
    resetDashboard,
    updateChartDataset,
    getChartDataset,
    // Phase 3 actions
    updateChartType,
    toggleDataset,
    setDatasetVisibility,
    updateFilters,
    setSeverityFilter,
    setThreatTypeFilter,
    setActivityTypeFilter,
    setSearchQuery,
    clearAllFilters,
    // Phase 4 actions
    updateStreamResilience,
    resetReconnectAttempts,
    incrementReconnectAttempts,
    setReconnecting,
    updatePerformanceMetrics,
    recordRenderTime,
    recordUpdateTime,
    updateDataPointCount,
  }
})
