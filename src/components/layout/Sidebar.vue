<template>
  <aside class="hidden w-64 border-r border-dark-border bg-dark-secondary lg:flex lg:flex-col">
    <nav class="flex-1 overflow-y-auto px-4 py-6">
      <div class="space-y-1">
        <NavItem
          v-for="item in navigationItems"
          :key="item.id"
          :item="item"
          :active="activeItem === item.id"
          @click="activeItem = item.id"
        />
      </div>
    </nav>

    <!-- Support & Terminal -->
    <div class="border-t border-dark-border px-4 py-6 space-y-2">
      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-dark-secondary hover:bg-dark-bg hover:text-dark-primary transition"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <span>Support</span>
      </button>

      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-dark-secondary hover:bg-dark-bg hover:text-dark-primary transition"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h6m-6-4v8m-6-13a9 9 0 110 18 9 9 0 010-18z"></path>
        </svg>
        <span>Terminal</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavItem from './NavItem.vue'

interface NavigationItem {
  id: string
  label: string
  icon: string
  badge?: number
}

const activeItem = ref('overview')

const navigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'network-traffic', label: 'Network Traffic', icon: 'network' },
  { id: 'endpoint-security', label: 'Endpoint Security', icon: 'shield' },
  { id: 'cloud-guard', label: 'Cloud Guard', icon: 'cloud' },
  { id: 'compliance', label: 'Compliance', icon: 'check', badge: 3 },
]
</script>
