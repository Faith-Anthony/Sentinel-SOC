<template>
  <div
    :class="[
      'metric-card card-base p-6 relative overflow-hidden',
      colorClass,
      'focus-within:ring-2 focus-within:ring-cyber-cyan'
    ]"
    role="region"
    :aria-label="`${metric.title} metric showing ${formattedValue}`"
  >
    <!-- Animated background glow on value change -->
    <div
      v-if="valueChanged"
      class="absolute inset-0 bg-gradient-to-br opacity-0 animate-pulse-glow pointer-events-none"
      :style="{
        background: `linear-gradient(135deg, ${getColorValue(metric.color)} 0%, transparent 100%)`,
      }"
      aria-hidden="true"
    ></div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-4 relative z-10">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-dark-tertiary">
          {{ metric.title }}
        </p>
      </div>
      <div v-if="metric.trend" :class="['text-xs font-bold flex items-center gap-1', trendColorClass]" :aria-label="`Trend: ${metric.trend === 'up' ? 'increasing' : metric.trend === 'down' ? 'decreasing' : 'stable'} ${Math.abs(metric.trendPercentage || 0)}%`">
        <span v-if="metric.trend === 'up'" class="animate-pulse" aria-hidden="true">↑</span>
        <span v-else-if="metric.trend === 'down'" class="animate-pulse" aria-hidden="true">↓</span>
        <span v-else aria-hidden="true">→</span>
        <span>{{ Math.abs(metric.trendPercentage || 0) }}%</span>
      </div>
    </div>

    <!-- Animated Value -->
    <div class="mb-2 relative z-10">
      <p class="text-3xl font-bold text-dark-primary transition-all duration-300 ease-out">
        {{ formattedValue }}
      </p>
      <p v-if="metric.unit" class="text-xs text-dark-tertiary">{{ metric.unit }}</p>
    </div>

    <!-- Description -->
    <p v-if="metric.description" class="text-xs text-dark-tertiary relative z-10">
      {{ metric.description }}
    </p>

    <!-- Loading Animation -->
    <div v-if="isLoading" class="absolute inset-0 rounded-lg bg-dark-surface/50 backdrop-blur flex items-center justify-center" aria-hidden="true">
      <div class="h-6 w-6 border-2 border-dark-border border-t-cyber-cyan rounded-full animate-spin"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import type { MetricCard } from '@/types/dashboard'

interface Props {
  metric: MetricCard
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const valueChanged = ref(false)
let changeTimeout: ReturnType<typeof setTimeout> | null = null

const formattedValue = computed(() => {
  if (typeof props.metric.value === 'number') {
    return props.metric.value.toLocaleString()
  }
  return props.metric.value
})

const colorClass = computed(() => {
  const colors: Record<string, string> = {
    cyan: 'border-l-4 border-l-cyber-cyan',
    blue: 'border-l-4 border-l-cyber-blue',
    purple: 'border-l-4 border-l-cyber-purple',
    green: 'border-l-4 border-l-success-green',
    orange: 'border-l-4 border-l-warning-orange',
    red: 'border-l-4 border-l-danger-red',
  }
  return colors[props.metric.color || 'cyan'] || colors.cyan
})

const trendColorClass = computed(() => {
  if (!props.metric.trendPercentage) return 'text-dark-tertiary'
  if (props.metric.trendPercentage > 0) return 'text-danger-red'
  if (props.metric.trendPercentage < 0) return 'text-success-green'
  return 'text-dark-tertiary'
})

function getColorValue(color?: string): string {
  const colors: Record<string, string> = {
    cyan: 'rgba(0, 217, 255, 0.2)',
    blue: 'rgba(0, 153, 255, 0.2)',
    purple: 'rgba(157, 78, 221, 0.2)',
    green: 'rgba(16, 185, 129, 0.2)',
    orange: 'rgba(245, 158, 11, 0.2)',
    red: 'rgba(239, 68, 68, 0.2)',
  }
  return colors[color || 'cyan'] || colors.cyan
}

// Animate on value change
watch(
  () => props.metric.value,
  () => {
    valueChanged.value = true
    if (changeTimeout) clearTimeout(changeTimeout)
    changeTimeout = window.setTimeout(() => {
      valueChanged.value = false
    }, 1000)
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (changeTimeout) clearTimeout(changeTimeout)
})
</script>
