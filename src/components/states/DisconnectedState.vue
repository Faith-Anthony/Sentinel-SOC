<template>
  <div class="card-base border-2 border-danger-red/50 bg-gradient-to-br from-dark-surface to-dark-bg p-8">
    <div class="flex flex-col items-center justify-center py-16">
      <!-- Error Icon with animation -->
      <div class="relative mb-6">
        <div class="absolute inset-0 rounded-full bg-danger-red/20 blur-lg animate-pulse" aria-hidden="true"></div>
        <svg
          class="relative h-16 w-16 text-danger-red animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-danger-red mb-2 slide-down">{{ title }}</h2>

      <!-- Message -->
      <p class="text-center text-dark-tertiary max-w-sm mb-4 slide-up">{{ message }}</p>

      <!-- Status indicator -->
      <div class="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-danger-red/10 border border-danger-red/30">
        <div class="h-2 w-2 rounded-full bg-danger-red animate-pulse"></div>
        <p class="text-sm text-danger-red font-medium">Stream Disconnected</p>
      </div>

      <!-- Retry Button -->
      <button
        @click="emit('retry')"
        aria-label="Retry connection to monitoring service"
        class="btn-cyber-secondary border-danger-red text-danger-red hover:bg-danger-red/10 hover:shadow-lg hover:shadow-danger-red/20"
      >
        <span class="flex items-center gap-2">
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Retry Connection
        </span>
      </button>

      <!-- Troubleshooting info -->
      <div class="mt-8 pt-8 border-t border-dark-border max-w-sm">
        <p class="text-xs text-dark-tertiary font-semibold mb-2">Troubleshooting Tips:</p>
        <ul class="text-xs text-dark-tertiary space-y-1 list-disc list-inside">
          <li>Check your internet connection</li>
          <li>Ensure the server is running</li>
          <li>Try refreshing the page if problem persists</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Stream Disconnected',
  message: 'Unable to connect to the real-time monitoring service. Please check your connection and try again.',
})

const emit = defineEmits<{
  retry: []
}>()
</script>
