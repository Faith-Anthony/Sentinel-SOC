<template>
  <div class="rounded-lg border border-dark-border bg-dark-surface p-6">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-dark-primary">{{ title }}</h2>
      <slot name="header-actions"></slot>
    </div>

    <!-- Activity List -->
    <div class="space-y-3">
      <div v-if="items.length === 0" class="py-8 text-center text-dark-tertiary">
        <p>No activity yet</p>
      </div>

      <div
        v-for="item in items"
        :key="item.id"
        :class="[
          'flex items-start gap-4 rounded-lg border p-4 transition hover:bg-dark-bg',
          'border-dark-border',
          getSeverityColor(item.severity)
        ]"
      >
        <!-- Icon -->
        <div class="mt-1">
          <div :class="['h-2 w-2 rounded-full', getSeverityBg(item.severity)]"></div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-dark-primary">{{ item.title }}</p>
          <p class="text-xs text-dark-tertiary truncate">{{ item.description }}</p>
          <p class="text-xs text-dark-tertiary/60 mt-1">{{ formatTime(item.timestamp) }}</p>
        </div>

        <!-- Badge -->
        <div class="flex-shrink-0">
          <span v-if="!item.read" class="inline-flex h-2 w-2 rounded-full bg-cyber-cyan animate-pulse"></span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="$slots['footer']" class="mt-4 border-t border-dark-border pt-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityFeedItem } from '@/types/dashboard'

interface Props {
  title: string
  items: ActivityFeedItem[]
}

defineProps<Props>()

function getSeverityColor(severity?: string): string {
  const colors: Record<string, string> = {
    critical: 'border-l-2 border-l-danger-red',
    high: 'border-l-2 border-l-warning-orange',
    medium: 'border-l-2 border-l-cyber-purple',
    low: 'border-l-2 border-l-cyber-cyan',
    info: 'border-l-2 border-l-cyber-blue',
  }
  return colors[severity || 'info'] || colors.info
}

function getSeverityBg(severity?: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-danger-red',
    high: 'bg-warning-orange',
    medium: 'bg-cyber-purple',
    low: 'bg-cyber-cyan',
    info: 'bg-cyber-blue',
  }
  return colors[severity || 'info'] || colors.info
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString()
}
</script>
