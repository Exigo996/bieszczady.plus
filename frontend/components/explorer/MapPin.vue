<script setup lang="ts">
import type { Category } from '~/types'

interface Props {
  category?: Category
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  category: 'culture',
  isActive: false,
})

// Category colors
const categoryColors: Record<Category, { bg: string; border: string }> = {
  culture: { bg: '#8b5cf6', border: '#7c3aed' },
  nature: { bg: '#10b981', border: '#059669' },
  sport: { bg: '#f59e0b', border: '#d97706' },
  history: { bg: '#ef4444', border: '#dc2626' },
}

const colors = computed(() => categoryColors[props.category])
</script>

<template>
  <div class="map-pin" :class="{ 'map-pin--active': isActive }">
    <svg
      :style="{
        '--pin-bg': colors.bg,
        '--pin-border': colors.border
      }"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" :fill="colors.bg" />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>
    <div
      v-if="isActive"
      class="map-pin__pulse"
      :style="{ '--pin-bg': colors.bg }"
    />
  </div>
</template>

<style scoped>
.map-pin {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-pin svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
}

.map-pin--active svg {
  transform: scale(1.2);
}

.map-pin__pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 50% 0;
  background: var(--pin-bg);
  opacity: 0.4;
  transform: rotate(-45deg) scale(1);
  animation: pulse 2s ease-out infinite;
  transform-origin: center center;
}

@keyframes pulse {
  0% {
    transform: rotate(-45deg) scale(1);
    opacity: 0.4;
  }
  100% {
    transform: rotate(-45deg) scale(2);
    opacity: 0;
  }
}
</style>
