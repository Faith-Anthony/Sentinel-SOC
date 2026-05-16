<template>
  <div class="card-base border-2 border-cyber-cyan/30 p-8">
    <div class="flex flex-col items-center justify-center py-16">
      <!-- Animated Spinner -->
      <div class="relative mb-6">
        <div class="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-cyan to-transparent opacity-20 animate-spin" style="animation: spin 2s linear infinite;"></div>
        <svg
          class="h-16 w-16 text-cyber-cyan animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </div>

      <!-- Message -->
      <p class="text-center text-lg font-semibold text-dark-primary mb-2 slide-down">{{ message }}</p>
      <p class="text-center text-sm text-dark-tertiary fade-in" style="animation-delay: 0.1s">Initializing real-time streaming...</p>

      <!-- Loading Indicator Dots -->
      <div class="flex gap-1 mt-6">
        <div class="h-2 w-2 rounded-full bg-cyber-cyan animate-bounce" style="animation-delay: 0s;"></div>
        <div class="h-2 w-2 rounded-full bg-cyber-blue animate-bounce" style="animation-delay: 0.1s;"></div>
        <div class="h-2 w-2 rounded-full bg-cyber-cyan animate-bounce" style="animation-delay: 0.2s;"></div>
      </div>

      <!-- Status Text -->
      <p class="mt-6 text-xs text-dark-tertiary text-center max-w-xs">
        Establishing connection and preparing data streams. This typically takes a few seconds.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading Dashboard',
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
