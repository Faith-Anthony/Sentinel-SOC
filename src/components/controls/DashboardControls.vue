<template>
  <div class="rounded-lg border border-dark-border bg-dark-surface p-6">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-dark-primary">{{ title }}</h2>
      <slot name="header-actions"></slot>
    </div>

    <!-- Controls -->
    <div class="space-y-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>
