<template>
  <div class="rounded-lg border border-dark-border bg-dark-surface p-4">
    <div class="space-y-4">
      <!-- Search -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          SEARCH
        </label>
        <input
          type="text"
          :value="dashboardStore.controls.filters.searchQuery"
          @input="updateSearchQuery"
          placeholder="Search threats, events, activities..."
          class="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-sm text-dark-primary placeholder:text-dark-tertiary focus:border-cyber-cyan focus:outline-none transition"
        />
      </div>

      <!-- Severity Filter -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          SEVERITY LEVELS
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']"
            :key="severity"
            @click="toggleSeverity(severity)"
            :class="[
              'px-3 py-1.5 text-xs font-semibold rounded transition',
              dashboardStore.controls.filters.severityLevels.includes(
                severity as any
              )
                ? getSeverityBgColor(severity)
                : 'border border-dark-border bg-dark-bg text-dark-tertiary hover:border-dark-secondary',
            ]"
          >
            {{ severity }}
          </button>
        </div>
      </div>

      <!-- Activity Type Filter -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          ACTIVITY TYPES
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in ['alert', 'event', 'metric', 'system']"
            :key="type"
            @click="toggleActivityType(type)"
            :class="[
              'px-3 py-1.5 text-xs font-semibold rounded capitalize transition',
              dashboardStore.controls.filters.activityTypes.includes(type as any)
                ? 'bg-cyber-cyan text-dark-bg'
                : 'border border-dark-border bg-dark-bg text-dark-tertiary hover:border-dark-secondary',
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Active Filters Count -->
      <div v-if="hasActiveFilters" class="flex items-center justify-between rounded-lg border border-dark-border bg-dark-bg px-3 py-2">
        <span class="text-xs text-dark-tertiary">
          {{ activeFilterCount }} active filter{{ activeFilterCount !== 1 ? 's' : '' }}
        </span>
        <button
          @click="clearFilters"
          class="text-xs font-semibold text-danger-red hover:text-danger-red/80 transition"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

function updateSearchQuery(event: Event) {
  const query = (event.target as HTMLInputElement).value
  dashboardStore.setSearchQuery(query)
}

function toggleSeverity(severity: string) {
  const severities = [...dashboardStore.controls.filters.severityLevels]
  const index = severities.indexOf(severity as any)
  if (index > -1) {
    severities.splice(index, 1)
  } else {
    severities.push(severity as any)
  }
  dashboardStore.setSeverityFilter(severities)
}

function toggleActivityType(type: string) {
  const types = [...dashboardStore.controls.filters.activityTypes]
  const index = types.indexOf(type as any)
  if (index > -1) {
    types.splice(index, 1)
  } else {
    types.push(type as any)
  }
  dashboardStore.setActivityTypeFilter(types)
}

function getSeverityBgColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-danger-red text-dark-bg',
    HIGH: 'bg-warning-orange text-dark-bg',
    MEDIUM: 'bg-cyber-purple text-dark-bg',
    LOW: 'bg-cyber-cyan text-dark-bg',
  }
  return colors[severity] || 'bg-dark-bg text-dark-tertiary'
}

function clearFilters() {
  dashboardStore.clearAllFilters()
}

const hasActiveFilters = computed(() => {
  const filters = dashboardStore.controls.filters
  return (
    filters.severityLevels.length < 4 ||
    filters.activityTypes.length < 4 ||
    filters.searchQuery.length > 0
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  const filters = dashboardStore.controls.filters
  if (filters.severityLevels.length < 4) count++
  if (filters.activityTypes.length < 4) count++
  if (filters.searchQuery.length > 0) count++
  return count
})
</script>
