<script setup lang="ts">
import type { Event, Poi, Category } from '~/types'
import type { LatLngBoundsExpression } from 'leaflet'
import type { GeoJSONPolygon } from '~/types/api'
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'

interface Props {
  events: Event[]
  pois: Poi[]
  center: { lat: number; lng: number }
  zoom?: number
  loading?: boolean
  polygon?: GeoJSONPolygon | null
  selectedCategory?: Category | 'all'
  showMarkers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 11,
  loading: false,
  polygon: null,
  selectedCategory: 'all',
  showMarkers: true,
})

const emit = defineEmits<{
  pinClick: [item: Event | Poi, type: 'event' | 'poi']
  mapClick: [lat: number, lng: number]
  clusterEventClick: [event: Event]
}>()

// Handle map click to set new search location
function handleMapClick(event: any) {
  // Close cluster modal if open
  if (clusterModalOpen.value) {
    closeCluster()
    return
  }
  const { lat, lng } = event.latlng
  emit('mapClick', lat, lng)
}

const { $leaflet } = useNuxtApp()
const config = useRuntimeConfig()
const { t } = useI18n()

// Use shallowRef for Leaflet map instance to avoid deep reactivity
const mapRef = shallowRef<{ leafletInstance: L.Map } | null>(null)
const activePinId = ref<string | null>(null)
const polygonLayer = shallowRef<L.Polygon | null>(null)
const userLocationMarker = shallowRef<L.Marker | null>(null)

// Track existing marker layers to avoid unnecessary re-creation
const markerLayers = shallowRef<Map<string, L.Marker>>(new Map())

// Track if map has been initialized with markers (for initial fitBounds)
const mapInitialized = ref(false)

// Helper function to check if a point is inside the GeoJSON polygon
// Note: GeoJSON uses [lng, lat] coordinate order
function isPointInPolygon(lat: number, lng: number, polygon: GeoJSONPolygon | null): boolean {
  if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) return true // No polygon = include all

  // Ray casting algorithm to check if point is in polygon
  const coords = polygon.coordinates[0] // Outer ring - [lng, lat]
  let inside = false

  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0] // lng
    const yi = coords[i][1] // lat
    const xj = coords[j][0] // lng
    const yj = coords[j][1] // lat

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}

// Cluster state
const clusterModalOpen = ref(false)
const clusterData = ref<{ poiName: string; events: Event[]; category: Category; poiId?: string | number } | null>(null)

// Close cluster modal
function closeCluster() {
  clusterModalOpen.value = false
}

// Handle cluster event click - emit to parent to open event detail modal
function handleClusterEventClick(event: Event) {
  emit('clusterEventClick', event)
  // Don't close the cluster modal - let user navigate back
}

// Group events by POI location (using poiId or lat/lng proximity)
interface EventCluster {
  key: string
  events: Event[]
  position: [number, number]
  category: Category
  hasPoiId: boolean
}

const eventClusters = computed(() => {
  const groups = new Map<string, Event[]>()

  // Filter events by category, polygon, and valid coordinates
  const filteredEvents = props.events.filter(
    event => {
      // Check category
      const categoryMatch = props.selectedCategory === 'all' || event.category === props.selectedCategory
      // Check valid coordinates (not 0,0)
      const hasValidLocation = event.location.lat !== 0 && event.location.lng !== 0
      // Check if inside polygon (if available)
      const insidePolygon = isPointInPolygon(event.location.lat, event.location.lng, props.polygon)
      return categoryMatch && hasValidLocation && insidePolygon
    }
  )

  // Group events by POI ID or coordinates
  for (const event of filteredEvents) {
    // Use poiId if available, otherwise group by coordinates (with small tolerance)
    const key = event.poiId || `${event.location.lat.toFixed(4)},${event.location.lng.toFixed(4)}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(event)
  }

  // Convert to array of clusters
  const clusters: EventCluster[] = []
  for (const [key, events] of groups) {
    const firstEvent = events[0]
    clusters.push({
      key,
      events,
      position: [firstEvent.location.lat, firstEvent.location.lng] as [number, number],
      category: firstEvent.category,
      hasPoiId: !!firstEvent.poiId,
    })
  }

  return clusters
})

// Combine event clusters and POIs for markers
const markers = computed(() => {
  // Return empty array if markers should be hidden
  if (!props.showMarkers) return []

  const result: Array<{
    item: EventCluster | Poi
    type: 'cluster' | 'poi'
    position: [number, number]
    category: Category
  }> = []

  // Add event clusters
  for (const cluster of eventClusters.value) {
    result.push({
      item: cluster,
      type: 'cluster',
      position: cluster.position,
      category: cluster.category,
    })
  }

  // Filter and add POIs by category (exclude those that are already represented by event clusters)
  for (const poi of props.pois) {
    // Skip POIs with invalid coordinates
    if (poi.location.lat === 0 && poi.location.lng === 0) continue

    // Check category
    if (props.selectedCategory !== 'all' && poi.category !== props.selectedCategory) continue

    // Check if inside polygon (if available)
    const insidePolygon = isPointInPolygon(poi.location.lat, poi.location.lng, props.polygon)
    if (!insidePolygon) continue

    // Check if this POI location already has events (compare as strings since poiId is string)
    const hasEventsAtLocation = eventClusters.value.some(
      cluster => cluster.hasPoiId && String(cluster.events[0].poiId) === String(poi.id)
    )
    if (!hasEventsAtLocation) {
      result.push({
        item: poi,
        type: 'poi',
        position: [poi.location.lat, poi.location.lng] as [number, number],
        category: poi.category,
      })
    }
  }

  return result
})

// Initialize map and markers
watch(() => [props.events, props.pois, props.selectedCategory, props.showMarkers], () => {
  const map = leafletMap.value || mapRef.value?.leafletInstance || (mapRef.value as any)?._leafletMap
  if (map) {
    updateMarkers()
  }
}, { deep: true })

// Update map center and user location marker when it changes
watch(() => props.center, (newCenter, oldCenter) => {
  const map = leafletMap.value
  if (map && $leaflet) {
    // Only update user location marker if the center actually changed
    if (!oldCenter || newCenter.lat !== oldCenter.lat || newCenter.lng !== oldCenter.lng) {
      updateUserLocationMarker(newCenter)
    }
  }
}, { deep: true })

function updateUserLocationMarker(center: { lat: number; lng: number }) {
  const map = leafletMap.value
  if (!map || !$leaflet) return

  // Update existing marker position instead of recreating
  if (userLocationMarker.value) {
    userLocationMarker.value.setLatLng([center.lat, center.lng])
    return
  }

  // Create custom home icon
  const homeIcon = $leaflet.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-location-marker__inner">
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  // Add new user location marker
  userLocationMarker.value = $leaflet.marker([center.lat, center.lng], { icon: homeIcon }).addTo(map)
}

function updateMarkers() {
  const map = leafletMap.value || mapRef.value?.leafletInstance || (mapRef.value as any)?._leafletMap
  if (!map || !$leaflet) return

  // Get current marker keys to identify which ones to remove
  const currentKeys = new Set(markers.value.map(m => {
    if (m.type === 'cluster') return `cluster-${(m.item as EventCluster).key}`
    return `poi-${(m.item as Poi).id}`
  }))

  // Remove markers that no longer exist
  const layersToRemove: string[] = []
  markerLayers.value.forEach((layer, key) => {
    if (!currentKeys.has(key)) {
      map.removeLayer(layer)
      layersToRemove.push(key)
    }
  })
  layersToRemove.forEach(key => markerLayers.value.delete(key))

  // Add or update markers
  for (const marker of markers.value) {
    const key = marker.type === 'cluster'
      ? `cluster-${(marker.item as EventCluster).key}`
      : `poi-${(marker.item as Poi).id}`

    // Skip if marker already exists
    if (markerLayers.value.has(key)) continue

    let iconHtml: string
    let iconSize: [number, number] = [32, 42]

    if (marker.type === 'cluster') {
      const cluster = marker.item as EventCluster
      const eventCount = cluster.events.length
      const displayCount = eventCount > 99 ? '99+' : String(eventCount)

      if (eventCount > 1) {
        // Cluster pin with number
        iconHtml = `
          <div class="marker-pin marker-pin--cluster marker-pin--${marker.category}" data-id="${cluster.key}">
            <span class="marker-pin__number">${displayCount}</span>
          </div>
        `
        iconSize = [38, 48]
      } else {
        // Single event - regular pin
        iconHtml = `<div class="marker-pin marker-pin--${marker.category}" data-id="${cluster.key}"></div>`
      }
    } else {
      // POI marker
      const poi = marker.item as Poi
      iconHtml = `<div class="marker-pin marker-pin--poi marker-pin--${marker.category}" data-id="${poi.id}"></div>`
    }

    const icon = $leaflet.divIcon({
      className: 'custom-marker',
      html: iconHtml,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1]],
      popupAnchor: [0, -iconSize[1]],
    })

    const leafletMarker = $leaflet.marker(marker.position, { icon })

    // Handle marker click
    leafletMarker.on('click', () => {
      if (marker.type === 'cluster') {
        const cluster = marker.item as EventCluster
        if (cluster.events.length > 1) {
          // Open modal for multi-event clusters
          clusterData.value = {
            poiName: cluster.events[0].venue_name || '',
            events: cluster.events,
            category: cluster.category,
            poiId: cluster.events[0].poiId,
          }
          clusterModalOpen.value = true
        } else {
          // Single event - emit pinClick as before
          emit('pinClick', cluster.events[0], 'event')
        }
      } else {
        // POI marker
        emit('pinClick', marker.item as Poi, 'poi')
      }

      activePinId.value = marker.type === 'cluster'
        ? (marker.item as EventCluster).key
        : (marker.item as Poi).id
    })

    // @ts-ignore - Leaflet types are complex
    leafletMarker.addTo(map)
    markerLayers.value.set(key, leafletMarker)
  }

  // Fit bounds only on initial load when we have no polygon
  // Polygon handles its own fit bounds via updatePolygon
  if (!mapInitialized.value && !polygonLayer.value && markers.value.length > 0) {
    if (markers.value.length > 1) {
      const bounds: LatLngBoundsExpression = markers.value.map(m => m.position)
      // @ts-ignore - Leaflet types are complex
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
    } else if (markers.value.length === 1) {
      // Single marker - center on it
      map.setView(markers.value[0].position, props.zoom)
    }
    mapInitialized.value = true
  }
}

// Track the actual Leaflet map instance
const leafletMap = shallowRef<L.Map | null>(null)

// Update polygon on the map
function updatePolygon(fitBounds: boolean = false) {
  const map = leafletMap.value
  if (!map || !$leaflet) return

  // Remove existing polygon
  if (polygonLayer.value) {
    map.removeLayer(polygonLayer.value)
    polygonLayer.value = null
  }

  // Add new polygon if available
  if (props.polygon?.coordinates && props.polygon.coordinates[0]) {
    // GeoJSON coordinates are [lng, lat], Leaflet expects [lat, lng]
    // Also, GeoJSON polygon coordinates are nested: [[[lng, lat], ...]]
    const latLngs: [number, number][] = props.polygon.coordinates[0].map(
      (coord) => [coord[1] ?? 0, coord[0] ?? 0] as [number, number]
    )

    polygonLayer.value = $leaflet.polygon(latLngs, {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(map)

    // Fit map to polygon bounds only when requested
    if (fitBounds) {
      map.fitBounds(polygonLayer.value.getBounds(), { padding: [20, 20] })
    }
  }
}

// Track if map is ready
const mapReady = ref(false)
const didInitialFit = ref(false)
const prevPolygonHash = ref<string | null>(null)

// Simple hash function for polygon
function getPolygonHash(polygon: GeoJSONPolygon | null): string | null {
  if (!polygon?.coordinates?.[0]) return null
  return JSON.stringify(polygon.coordinates[0].slice(0, 6))
}

// Watch for polygon changes - only if map is ready
watch(() => props.polygon, (newPolygon, oldPolygon) => {
  if (mapReady.value) {
    const newHash = getPolygonHash(newPolygon)

    // Handle polygon removal
    if (!newPolygon && polygonLayer.value && leafletMap.value) {
      leafletMap.value.removeLayer(polygonLayer.value)
      polygonLayer.value = null
      prevPolygonHash.value = null
      // Reset fit flags so next time we have data, we'll fit
      didInitialFit.value = false
      mapInitialized.value = false
    }
    // Handle polygon update - always fit when polygon changes (for smooth filter transitions)
    else if (newPolygon && newHash !== prevPolygonHash.value) {
      updatePolygon(true)
      prevPolygonHash.value = newHash
      didInitialFit.value = true
      mapInitialized.value = true
    }
  }
}, { deep: true })

// Also watch for map to become ready with polygon
watch([leafletMap, () => props.polygon], () => {
  if (leafletMap.value && props.polygon && !polygonLayer.value) {
    mapReady.value = true
    updatePolygon(true)
    didInitialFit.value = true
    mapInitialized.value = true
    prevPolygonHash.value = getPolygonHash(props.polygon)
  }
})

// Expose invalidateSize method for parent components
function invalidateSize() {
  const map = leafletMap.value || mapRef.value?.leafletInstance
  if (map) {
    nextTick(() => {
      map.invalidateSize()
    })
  }
}

// Call invalidateSize when component is mounted
onMounted(() => {
  invalidateSize()
})

function onMapReady() {
  // The LMap component might use different property names
  const mapInstance = (mapRef.value as any)?._leafletMap ||
                      (mapRef.value as any)?.leafletObject ||
                      (mapRef.value as any)?.mapObject ||
                      (mapRef.value as any)?.$leaflet ||
                      (mapRef.value as any)?.leafletInstance ||
                      (mapRef.value as any)?.$map

  if (mapInstance) {
    leafletMap.value = mapInstance
    mapReady.value = true

    // Add click handler directly to the Leaflet map
    mapInstance.on('click', (event: any) => {
      handleMapClick(event)
    })

    // Map and tile layer are now handled by LMap and LTileLayer components
    nextTick(() => {
      updateMarkers()
      if (props.polygon) {
        updatePolygon(true)
        didInitialFit.value = true
        prevPolygonHash.value = getPolygonHash(props.polygon)
      }
      updateUserLocationMarker(props.center)
    })
  }
}

// Expose methods for parent component
defineExpose({
  invalidateSize,
  leafletMap,
})
</script>

<template>
  <div class="map-view">
    <div v-if="loading" class="map-view__loading">
      <div class="map-view__spinner" />
    </div>

    <client-only>
      <LMap
        ref="mapRef"
        :zoom="zoom"
        :center="[center.lat, center.lng]"
        :use-global-leaflet="true"
        class="map-view__map"
        @ready="onMapReady"
        @leaflet:map="onMapReady"
      >
        <LTileLayer
          :url="config.public.mapsTileUrl"
          :attribution=" '&copy; OpenStreetMap contributors'"
          :max-zoom="19"
        />
      </LMap>
    </client-only>

    <!-- Event Cluster Modal -->
    <EventClusterModal
      v-if="clusterData"
      v-model="clusterModalOpen"
      :events="clusterData.events"
      :poi-name="clusterData.poiName"
      :category="clusterData.category"
      :poi-id="clusterData.poiId"
      @event-click="handleClusterEventClick"
    />

    <div v-if="!markers.length && !polygon && !loading" class="map-view__empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <p>{{ t('explorer.map.noResults') }}</p>
    </div>
  </div>
</template>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: #e5e7eb;
  overflow: hidden;
  z-index: 1;
}

.map-view__map {
  width: 100%;
  height: 100%;
  touch-action: pan-y pan-x;
}

.map-view__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  pointer-events: none;
}

.map-view__spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-view__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  gap: 0.5rem;
  pointer-events: none;
}

.map-view__empty svg {
  width: 2.5rem;
  height: 2.5rem;
  opacity: 0.5;
}

.map-view__empty p {
  font-size: 0.875rem;
}
</style>

<style>
/* Ensure Leaflet map panes stay below the UI elements */
.leaflet-pane,
.leaflet-tile-pane,
.leaflet-overlay-pane,
.leaflet-marker-pane,
.leaflet-popup-pane {
  z-index: 1 !important;
}

.leaflet-control-container {
  z-index: 2 !important;
}

/* Global styles for Leaflet markers and popups */
.custom-marker {
  background: transparent;
  border: none;
}

.marker-pin {
  width: 32px;
  height: 42px;
  position: relative;
}

.marker-pin::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: currentColor;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3C/svg%3E");
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

/* Cluster pin styling */
.marker-pin--cluster {
  transform: scale(1.15);
}

.marker-pin__number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

/* POI marker distinction */
.marker-pin--poi {
  filter: brightness(0.9);
}

.marker-pin--poi::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  border: 2px solid currentColor;
}

.marker-pin--culture { color: #8b5cf6; }
.marker-pin--nature { color: #10b981; }
.marker-pin--sport { color: #f59e0b; }
.marker-pin--history { color: #ef4444; }

.custom-popup .leaflet-popup-content-wrapper {
  border-radius: 0.75rem;
  padding: 0;
}

.custom-popup .leaflet-popup-content {
  margin: 0;
}

.map-popup-content {
  min-width: 200px;
  max-width: 280px;
  cursor: pointer;
}

.popup-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.75rem 0.75rem 0 0;
  background: #f3f4f6;
}

.popup-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-details {
  padding: 0.75rem;
}

.popup-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.popup-date,
.popup-address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.375rem;
}

.popup-click-hint {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.7rem;
  color: #9ca3af;
  font-style: italic;
}

/* User location marker (home icon) */
.user-location-marker {
  background: transparent;
  border: none;
}

.user-location-marker__inner {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.user-location-marker__inner svg {
  display: block;
}
</style>
