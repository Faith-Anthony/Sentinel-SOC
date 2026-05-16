<template>
  <div class="rounded-lg border border-dark-border bg-dark-surface p-4">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-bold uppercase tracking-wider text-dark-primary">
        Dashboard Controls
      </h3>
      <button
        @click="toggleExpanded"
        class="text-dark-tertiary hover:text-cyber-cyan transition"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="expanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'"
          />
        </svg>
      </button>
    </div>

    <!-- Controls Grid -->
    <div v-if="expanded" class="space-y-4">
      <!-- Stream Control -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          STREAM STATUS
        </label>
        <button
          @click="toggleStreamPause"
          :class="[
            'w-full rounded-lg px-4 py-2 text-sm font-semibold transition duration-200',
            dashboardStore.controls.isPaused
              ? 'bg-cyber-blue text-dark-bg hover:bg-cyan-400'
              : 'border border-dark-border bg-dark-bg text-cyber-cyan hover:border-cyber-cyan',
          ]"
        >
          {{
            dashboardStore.controls.isPaused
              ? '▶ RESUME STREAMING'
              : '⏸ PAUSE STREAMING'
          }}
        </button>
      </div>

      <!-- Time Range Selector -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          TIME RANGE
        </label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            v-for="range in timeRangeOptions"
            :key="range.value"
            @click="setTimeRange(range)"
            :class="[
              'rounded px-3 py-1.5 text-xs font-semibold transition',
              dashboardStore.controls.selectedTimeRange.value === range.value
                ? 'bg-cyber-cyan text-dark-bg'
                : 'border border-dark-border bg-dark-bg text-dark-secondary hover:border-cyber-cyan',
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Chart Type Selector -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          CHART TYPE
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="type in chartTypes"
            :key="type"
            @click="updateChartType(type as ChartType)"
            :class="[
              'rounded px-3 py-1.5 text-xs font-semibold capitalize transition',
              dashboardStore.controls.selectedChartType === type
                ? 'bg-cyber-purple text-dark-bg'
                : 'border border-dark-border bg-dark-bg text-dark-secondary hover:border-cyber-purple',
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Dataset Toggles -->
      <div>
        <label class="mb-2 block text-xs font-semibold text-dark-secondary">
          DATASETS
        </label>
        <div class="space-y-2">
          <label
            v-for="dataset in dashboardStore.controls.datasets"
            :key="dataset.id"
            class="flex items-center gap-3 cursor-pointer rounded px-3 py-1.5 hover:bg-dark-bg transition"
          >
            <input
              type="checkbox"
              :checked="dataset.visible"
              @change="toggleDataset(dataset.id)"
              class="h-4 w-4 cursor-pointer accent-cyber-cyan"
            />
            <span class="text-xs text-dark-tertiary">{{ dataset.label }}</span>
          </label>
        </div>
      </div>

      <!-- Clear Filters Button -->
      <button
        @click="clearAllFilters"
        class="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-xs font-semibold text-dark-tertiary transition hover:border-danger-red hover:text-danger-red"
      >
        Clear All Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import type { TimeRange, ChartType } from '@/types/dashboard'

const dashboardStore = useDashboardStore()
const expanded = ref(true)

const timeRangeOptions: TimeRange[] = [
  { label: '1m', value: 'realtime', start: Date.now() - 60000, end: Date.now() },
  { label: '5m', value: 'realtime', start: Date.now() - 300000, end: Date.now() },
  { label: '15m', value: 'realtime', start: Date.now() - 900000, end: Date.now() },
  { label: '1h', value: '1h', start: Date.now() - 3600000, end: Date.now() },
  { label: 'Real-time', value: 'realtime', start: Date.now() - 3600000, end: Date.now() },
]

const chartTypes: ChartType[] = ['line', 'area', 'bar']

function toggleStreamPause() {
  dashboardStore.controls.isPaused = !dashboardStore.controls.isPaused
  dashboardStore.toggleStreamPause()
}

function setTimeRange(range: TimeRange) {
  dashboardStore.controls.selectedTimeRange = range
  dashboardStore.setTimeRange(range)
}

function updateChartType(chartType: ChartType) {
  dashboardStore.updateChartType(chartType)
}

function toggleDataset(datasetId: string) {
  dashboardStore.toggleDataset(datasetId)
}

function clearAllFilters() {
  dashboardStore.clearAllFilters()
}

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>
