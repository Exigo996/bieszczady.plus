<script setup lang="ts">
import type { Event, Poi, Category } from '~/types'
import type { GeoJSONPolygon } from '~/types/api'

interface Props {
  events: Event[]
  pois: Poi[]
  center: { lat: number; lng: number }
  loading?: boolean
  polygon?: GeoJSONPolygon | null
  selectedCategory?: Category | 'all'
}

withDefaults(defineProps<Props>(), {
  loading: false,
  polygon: null,
  selectedCategory: 'all',
})

const emit = defineEmits<{
  pinClick: [item: Event | Poi, type: 'event' | 'poi']
  mapClick: [lat: number, lng: number]
  clusterEventClick: [event: Event]
}>()

// Handle cluster event click from MapView
function handleClusterEventClick(event: Event) {
  emit('clusterEventClick', event)
}

// Handle pin click from MapView
function handlePinClick(item: Event | Poi, type: 'event' | 'poi') {
  emit('pinClick', item, type)
}

// Handle map click from MapView
function handleMapClick(lat: number, lng: number) {
  emit('mapClick', lat, lng)
}

const drawerRef = ref<HTMLElement | null>(null)
const mapViewRef = ref<{ invalidateSize: () => void } | null>(null)

// Invalidate map size when drawer becomes visible
function invalidateSize() {
  nextTick(() => {
    mapViewRef.value?.invalidateSize()
  })
}

// Expose methods for parent component
defineExpose({
  drawerRef,
  invalidateSize,
})
</script>

<template>
  <div ref="drawerRef" class="map-drawer">
    <MapView
      ref="mapViewRef"
      :events="events"
      :pois="pois"
      :center="center"
      :loading="loading"
      :polygon="polygon"
      :selected-category="selectedCategory"
      @pin-click="handlePinClick"
      @map-click="handleMapClick"
      @cluster-event-click="handleClusterEventClick"
    />
  </div>
</template>

<style scoped>
.map-drawer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: absolute;
  inset: 0;
}

.map-drawer :deep(.map-view) {
  position: relative;
  bottom: auto;
  left: auto;
  right: auto;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
  transform: none !important;
}

.map-drawer :deep(.map-view__toggle) {
  display: none;
}

.map-drawer :deep(.map-view__map) {
  border-radius: 0;
}
</style>
