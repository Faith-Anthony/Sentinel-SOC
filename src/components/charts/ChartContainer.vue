<template>
  <div class="rounded-lg border border-dark-border bg-dark-surface p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-lg font-bold text-dark-primary">{{ title }}</h2>
      <slot name="header-actions"></slot>
    </div>

    <!-- Chart Placeholder -->
    <div class="rounded-lg border border-dark-border bg-dark-bg p-12 text-center">
      <svg
        class="mx-auto mb-4 h-16 w-16 text-dark-tertiary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        ></path>
      </svg>
      <p class="text-sm text-dark-tertiary">Chart Visualization Placeholder</p>
      <p class="text-xs text-dark-tertiary/60 mt-2">Integration in Phase 2</p>
    </div>

    <!-- Footer -->
    <div v-if="$slots['footer']" class="mt-4 border-t border-dark-border pt-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>
