<template>
  <header class="sticky top-0 z-50 border-b border-dark-border bg-dark-secondary/95 backdrop-blur">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-blue">
            <span class="text-xs font-bold text-dark-bg">S</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-dark-primary">SENTINEL SOC</h1>
            <p class="text-xs text-dark-tertiary">Real-time Threat Intelligence</p>
          </div>
        </div>

        <!-- Center: Time & Status -->
        <div class="hidden flex-1 items-center justify-center gap-8 md:flex">
          <div class="text-center">
            <p class="text-xs text-dark-tertiary">SYSTEM TIME</p>
            <p class="font-mono text-sm font-bold text-cyber-cyan">{{ currentTime }}</p>
          </div>
          <div class="h-6 w-px bg-dark-border"></div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-success-green animate-pulse" aria-hidden="true"></div>
            <p class="text-xs font-semibold text-success-green">CONNECTED</p>
          </div>
        </div>

        <!-- Right Controls -->
        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search resources..."
              aria-label="Search dashboard resources"
              class="rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-sm text-dark-primary placeholder-dark-tertiary transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan"
            />
            <svg
              class="absolute right-3 top-2.5 h-4 w-4 text-dark-tertiary pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <!-- Notifications -->
          <button
            aria-label="View notifications"
            class="relative rounded-lg p-2 hover:bg-dark-bg/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan"
          >
            <svg
              class="h-5 w-5 text-dark-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-danger-red animate-pulse" aria-hidden="true"></span>
          </button>

          <!-- Theme Toggle -->
          <button
            aria-label="Toggle dark/light theme"
            class="rounded-lg p-2 hover:bg-dark-bg/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan"
          >
            <svg
              class="h-5 w-5 text-dark-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </button>

          <!-- User Avatar -->
          <button
            aria-label="User account menu"
            class="h-8 w-8 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-blue hover:shadow-cyber-glow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan flex items-center justify-center text-xs font-bold text-dark-bg"
          >
            AC
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref<string>('')

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 1000)
  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })
})
</script>
