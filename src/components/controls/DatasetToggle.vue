<template>
  <div class="rounded-lg border border-dark-border bg-dark-surface p-4">
    <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-dark-primary">
      Dataset Visibility
    </h3>
    <div class="space-y-2">
      <label
        v-for="dataset in dashboardStore.controls.datasets"
        :key="dataset.id"
        class="flex items-center gap-3 cursor-pointer rounded-lg border border-dark-border bg-dark-bg px-3 py-2 transition hover:border-cyber-cyan"
      >
        <input
          type="checkbox"
          :checked="dataset.visible"
          @change="toggleDataset(dataset.id)"
          class="h-4 w-4 cursor-pointer accent-cyber-cyan"
        />
        <div class="flex-1">
          <p class="text-sm font-semibold text-dark-primary">{{ dataset.label }}</p>
        </div>
        <span
          :class="[
            'text-xs font-bold px-2 py-1 rounded',
            dataset.visible
              ? 'bg-cyber-cyan/20 text-cyber-cyan'
              : 'bg-dark-tertiary/20 text-dark-tertiary',
          ]"
        >
          {{ dataset.visible ? 'Visible' : 'Hidden' }}
        </span>
      </label>
    </div>

    <!-- Toggle All -->
    <div class="mt-4 flex gap-2 border-t border-dark-border pt-4">
      <button
        @click="showAll"
        class="flex-1 rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-xs font-semibold text-cyber-cyan transition hover:border-cyber-cyan"
      >
        Show All
      </button>
      <button
        @click="hideAll"
        class="flex-1 rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-xs font-semibold text-dark-tertiary transition hover:border-dark-tertiary"
      >
        Hide All
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

function toggleDataset(datasetId: string) {
  dashboardStore.toggleDataset(datasetId)
}

function showAll() {
  dashboardStore.controls.datasets.forEach((d) => {
    d.visible = true
  })
}

function hideAll() {
  dashboardStore.controls.datasets.forEach((d) => {
    d.visible = false
  })
}
</script>
