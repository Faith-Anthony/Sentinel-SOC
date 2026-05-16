<template>
  <div class="min-h-screen bg-dark-bg flex flex-col">
    <!-- Top Navigation -->
    <TopNavigation />

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-4 sm:p-6">
          <!-- Loading State -->
          <LoadingState
            v-if="dashboardStore.isLoading"
            message="Initializing real-time dashboard..."
          />

          <!-- Disconnected State -->
          <DisconnectedState
            v-else-if="!dashboardStore.connectionStatus"
            @retry="handleRetry"
          />

          <!-- Dashboard Content -->
          <div v-else class="space-y-6">
            <!-- Header with Semantic HTML -->
            <section aria-label="Dashboard header" class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-dark-primary">
                  Threat Intelligence Dashboard
                </h1>
                <p class="text-sm text-dark-tertiary mt-1">
                  Real-time monitoring •
                  <span aria-live="polite" aria-atomic="true">{{ filteredThreatsCount }} visible threats</span>
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'text-xs font-semibold px-3 py-2 rounded-full inline-flex items-center gap-2 transition-all duration-200',
                    dashboardStore.controls.isPaused
                      ? 'bg-warning-orange/20 text-warning-orange border border-warning-orange/50'
                      : 'bg-success-green/20 text-success-green border border-success-green/50',
                  ]"
                  role="status"
                  aria-live="polite"
                >
                  <span class="h-2 w-2 rounded-full" :class="dashboardStore.controls.isPaused ? 'bg-warning-orange' : 'bg-success-green animate-pulse'" aria-hidden="true"></span>
                  {{ dashboardStore.controls.isPaused ? 'PAUSED' : 'LIVE' }}
                </span>
              </div>
            </section>

            <!-- Phase 3: Control Panel & Filter Bar -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <!-- Left Sidebar: Controls (responsive) -->
              <aside class="space-y-6 lg:col-span-1" aria-label="Dashboard controls">
                <ControlPanel />
                <DatasetToggle />
              </aside>

              <!-- Main Content Area -->
              <div class="space-y-6 lg:col-span-2">
                <!-- Filter Bar -->
                <FilterBar />

                <!-- Live Metrics Grid -->
                <section aria-label="Key metrics" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricCard
                    v-for="metric in dashboardStore.metrics"
                    :key="metric.id"
                    :metric="metric"
                  />
                </section>

                <!-- Charts Grid -->
                <section aria-label="Performance charts" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <!-- Threat Timeline Chart -->
                  <LineChart
                    title="Active Threats Timeline"
                    :data="threatChartData"
                  />

                  <!-- Firewall Events Chart -->
                  <BarChart
                    title="Firewall Events"
                    :data="firewallChartData"
                  />

                  <!-- CPU Usage Chart -->
                  <AreaChart
                    title="CPU Usage Trend"
                    :data="cpuChartData"
                    color="#0099ff"
                  />

                  <!-- Network Latency Chart -->
                  <AreaChart
                    title="Network Latency"
                    :data="latencyChartData"
                    color="#00d9ff"
                  />
                </section>

                <!-- Memory Chart -->
                <section aria-label="Memory usage">
                  <LineChart
                    title="Memory Usage"
                    :data="memoryChartData"
                  />
                </section>

                <!-- Activity & Threats Section -->
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <!-- Recent Threats Widget -->
                  <section aria-label="Recent threats" class="card-base p-6 flex flex-col">
                    <h2 class="mb-4 text-lg font-bold text-dark-primary">
                      Recent Threats
                      <span class="text-cyber-cyan text-base">({{ filteredThreatsCount }})</span>
                    </h2>
                    <div class="space-y-2 max-h-96 overflow-y-auto flex-1">
                      <div
                        v-for="threat in filteredThreatsPreview"
                        :key="threat.id"
                        class="flex items-center justify-between rounded-lg border border-dark-border bg-dark-bg p-3 hover:border-cyber-cyan/50 transition-all duration-200 focus-within:ring-2 focus-within:ring-cyber-cyan"
                        role="listitem"
                      >
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-dark-primary truncate">
                            {{ threat.type }}
                          </p>
                          <p class="text-xs text-dark-tertiary truncate">{{ threat.source }}</p>
                        </div>
                        <span :class="['text-xs font-bold ml-2 px-2 py-1 rounded', getSeverityColor(threat.severity)]">
                          {{ threat.severity }}
                        </span>
                      </div>
                      <div
                        v-if="filteredThreatsPreview.length === 0"
                        class="py-8 text-center text-dark-tertiary"
                        role="status"
                        aria-live="polite"
                      >
                        <svg class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p>No threats match selected filters</p>
                      </div>
                    </div>
                  </section>

                  <!-- Activity Feed -->
                  <ActivityFeed
                    title="Activity Feed"
                    :items="dashboardStore.filteredActivityFeed.slice(0, 8)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useChartManager } from '@/composables/useChartManager'
import TopNavigation from '@/components/layout/TopNavigation.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import MetricCard from '@/components/metrics/MetricCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import AreaChart from '@/components/charts/AreaChart.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import LoadingState from '@/components/states/LoadingState.vue'
import DisconnectedState from '@/components/states/DisconnectedState.vue'
// Phase 3: Import new control components
import ControlPanel from '@/components/controls/ControlPanel.vue'
import FilterBar from '@/components/controls/FilterBar.vue'
import DatasetToggle from '@/components/controls/DatasetToggle.vue'
import { createStreamSimulator } from '@/services/streamSimulator'

const dashboardStore = useDashboardStore()

// Initialize stream simulator
let streamSimulator = createStreamSimulator({
  updateInterval: 1000,
  threatEventFrequency: 0.25,
  activityFeedFrequency: 0.35,
  metricsUpdateFrequency: 1.0,
  timeSeriesUpdateFrequency: 1.0,
})

// Chart data managers
const threatChartData = useChartManager({
  title: 'Active Threats',
  chartId: 'threat-timeline',
  maxPoints: 60,
}).chartData

const firewallChartData = useChartManager({
  title: 'Firewall Events',
  chartId: 'firewall-timeline',
  maxPoints: 60,
}).chartData

const cpuChartData = useChartManager({
  title: 'CPU Usage',
  chartId: 'cpu-timeline',
  maxPoints: 60,
}).chartData

const memoryChartData = useChartManager({
  title: 'Memory Usage',
  chartId: 'memory-timeline',
  maxPoints: 60,
}).chartData

const latencyChartData = useChartManager({
  title: 'Network Latency',
  chartId: 'latency-timeline',
  maxPoints: 60,
}).chartData

// Phase 3: Computed properties for filtered data
const filteredThreatsPreview = computed(() =>
  dashboardStore.filteredThreatEvents.slice(0, 5)
)

const filteredThreatsCount = computed(() =>
  dashboardStore.filteredThreatEvents.length
)

function toggleStream() {
  dashboardStore.controls.isPaused = !dashboardStore.controls.isPaused
  dashboardStore.toggleStreamPause()
  if (dashboardStore.controls.isPaused) {
    streamSimulator?.stop()
  } else {
    streamSimulator?.start(dashboardStore.metrics)
  }
}

function handleRetry() {
  dashboardStore.resetDashboard()
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-danger-red/20 text-danger-red border border-danger-red/50',
    HIGH: 'bg-warning-orange/20 text-warning-orange border border-warning-orange/50',
    MEDIUM: 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50',
    LOW: 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50',
  }
  return colors[severity] || 'bg-dark-tertiary/20 text-dark-tertiary border border-dark-tertiary/50'
}

// Initialize streaming
onMounted(() => {
  if (!streamSimulator?.getIsRunning?.()) {
    streamSimulator?.start(dashboardStore.metrics)

    // Subscribe to threat events
    streamSimulator?.onThreatEvent((event: any) => {
      dashboardStore.addThreatEvent(event)
    })

    // Subscribe to activity feed updates
    streamSimulator?.onActivityFeed((item: any) => {
      dashboardStore.addActivityFeedItem(item)
    })

    // Subscribe to metrics updates
    streamSimulator?.onMetricsUpdate((metrics: any) => {
      dashboardStore.updateMetrics(metrics)
    })

    // Subscribe to time-series updates
    streamSimulator?.onTimeSeriesUpdate((data: any) => {
      dashboardStore.updateChartDataset(data.chartId, data.points)
    })
  }
})

onUnmounted(() => {
  // Cleanup is handled by the simulator
})
</script>
