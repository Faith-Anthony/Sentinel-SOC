<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition',
      active
        ? 'bg-dark-bg text-cyber-cyan border-l-2 border-cyber-cyan'
        : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-bg'
    ]"
  >
    <span class="text-lg">{{ getIcon(item.icon) }}</span>
    <span class="flex-1 text-left font-medium">{{ item.label }}</span>
    <span
      v-if="item.badge"
      class="rounded-full bg-danger-red px-2 py-0.5 text-xs font-bold text-white"
    >
      {{ item.badge }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface NavigationItem {
  id: string
  label: string
  icon: string
  badge?: number
}

interface Props {
  item: NavigationItem
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})

defineEmits<{
  click: []
}>()

function getIcon(iconName: string): string {
  const icons: Record<string, string> = {
    dashboard: '📊',
    network: '🌐',
    shield: '🛡️',
    cloud: '☁️',
    check: '✓',
  }
  return icons[iconName] || '•'
}
</script>
