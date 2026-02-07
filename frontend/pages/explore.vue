<script setup lang="ts">
import type { Event, Poi } from "~/types";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// Stores
const poiStore = usePoiStore();
const eventsStore = useEventsStore();
const filtersStore = useFiltersStore();
const userStore = useUserStore();
const { track, pageView } = useAnalytics();

// Query params
const poiId = computed(() => route.query.poi as string | undefined);
const categoryParam = computed(
  () => route.query.category as string | undefined,
);

// UI State
const selectedEvent = ref<Event | null>(null);
const selectedPoi = ref<Poi | null>(null);
const gpsLoading = ref(false);
const eventModalOpen = ref(false);
const poiModalOpen = ref(false);
const activeTab = ref<'map' | 'events' | 'pois' | 'favorites'>('map');
const exploreTabsRef = ref<{ activeTab: Ref<'map' | 'events' | 'pois' | 'favorites'> } | null>(null);
const mapDrawerRef = ref<{ invalidateSize: () => void } | null>(null);

// Open event modal
function openEventModal(event: Event) {
  selectedEvent.value = event;
  eventModalOpen.value = true;
}

// Open POI modal
function openPoiModal(poi: Poi) {
  selectedPoi.value = poi;
  poiModalOpen.value = true;
}

// Close modals
function closeEventModal() {
  eventModalOpen.value = false;
  nextTick(() => {
    selectedEvent.value = null;
  });
}

function closePoiModal() {
  poiModalOpen.value = false;
  nextTick(() => {
    selectedPoi.value = null;
  });
}

// Computed from stores
const currentPoi = computed(() => poiStore.currentPoi);
const events = computed(() => eventsStore.events);
const pois = computed(() => eventsStore.pois);
const loading = computed(() => poiStore.loading || eventsStore.loading);

// Default location (Bieszczady center)
const DEFAULT_LOCATION = { lat: 49.430283, lng: 22.5370482 };

// Search center (POI location or user GPS)
const searchCenter = computed(() => {
  if (filtersStore.location) {
    return {
      lat: filtersStore.location.lat,
      lng: filtersStore.location.lng,
    };
  }
  if (currentPoi.value) {
    return {
      lat: currentPoi.value.location.lat,
      lng: currentPoi.value.location.lng,
    };
  }
  return DEFAULT_LOCATION;
});

// Fetch POI on mount (if POI ID is in query - for backward compatibility)
watch(
  () => poiId.value,
  async (id) => {
    if (id) {
      try {
        await poiStore.fetchPoi(id);
        userStore.setCurrentPoiId(id);

        // Set category from query param if provided
        if (categoryParam.value) {
          filtersStore.setCategory(categoryParam.value as any);
        }

        // Fetch events with initial filters
        await fetchResults();
      } catch (e) {
        console.error("Failed to fetch POI:", e);
        // Redirect to home if POI not found
        router.push("/");
      }
    } else if (userStore.currentPoiId) {
      // Try to load from user store
      try {
        await poiStore.fetchPoi(userStore.currentPoiId);

        // Set category from query param if provided
        if (categoryParam.value) {
          filtersStore.setCategory(categoryParam.value as any);
        }

        // Fetch events with initial filters
        await fetchResults();
      } catch (e) {
        console.error("Failed to fetch POI from store:", e);
        // Use default center
        await fetchResults();
      }
    } else {
      // No POI, fetch results with default center
      // Set category from query param if provided
      if (categoryParam.value) {
        filtersStore.setCategory(categoryParam.value as any);
      }
      await fetchResults();
    }
  },
  { immediate: true },
);

// Fetch results when filters change
watch(
  () => [
    filtersStore.category,
    filtersStore.transport,
    filtersStore.timeMinutes,
    filtersStore.radiusKm,
    filtersStore.searchMode,
    filtersStore.location,
    userStore.withChildren,
  ],
  async (values) => {
    // Fetch results if we have a POI OR if we have a manual location set
    if (currentPoi.value || filtersStore.location) {
      await fetchResults();
    }
  },
  { deep: true },
);

async function fetchResults() {
  const center = searchCenter.value;

  try {
    // Build params based on search mode
    const params: {
      lat: number;
      lng: number;
      radius?: number;
      minutes?: number;
      transport?: typeof filtersStore.transport;
    } = {
      lat: center.lat,
      lng: center.lng,
    };

    if (filtersStore.searchMode === "time") {
      params.minutes = filtersStore.timeMinutes;
      params.transport = filtersStore.transport;
    } else {
      params.radius = filtersStore.radiusKm;
    }

    // Fetch events
    await eventsStore.fetchEvents(params);

    // Also fetch POIs with the same search parameters
    await eventsStore.fetchPois(params);

    // Track filter change
    track("filter_change", {
      category: filtersStore.category,
      transport: filtersStore.transport,
      timeMinutes: filtersStore.timeMinutes,
      searchMode: filtersStore.searchMode,
      withChildren: userStore.withChildren,
    });
  } catch (e) {
    console.error("Failed to fetch results:", e);
  }
}

// GPS location
const { getCurrentPosition, clearPosition } = useGeolocation();

async function toggleGps() {
  if (filtersStore.location) {
    // Turn off GPS
    filtersStore.resetLocation();
    clearPosition();
  } else {
    // Turn on GPS
    gpsLoading.value = true;
    try {
      const position = await getCurrentPosition();
      if (position) {
        filtersStore.setLocation({
          lat: position.lat,
          lng: position.lng,
          source: "gps",
        });
        track("location_gps_enable");
      }
    } catch (e) {
      console.error("Failed to get GPS location:", e);
    } finally {
      gpsLoading.value = false;
    }
  }
}

function resetLocation() {
  filtersStore.resetLocation();
  clearPosition();
  track("location_reset");
}

// Event handlers
function handleMapPinClick(item: Event | Poi, type: "event" | "poi") {
  if (type === "event") {
    openEventModal(item as Event);
  } else {
    openPoiModal(item as Poi);
  }
}

// Handle cluster event click - switch to Events tab and open modal
function handleClusterEventClick(event: Event) {
  // Switch to Events tab
  activeTab.value = "events";
  // Open the event modal
  openEventModal(event);
}

function handleEventCardClick(event: Event) {
  openEventModal(event);
}

function handlePoiCardClick(poi: Poi) {
  // Generate URL-friendly slug
  const slug = poi.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes

  // Navigate to POI detail page with id and slug
  router.push(`/poi/${poi.id}/${slug}`);
}

function handleMapClick(lat: number, lng: number) {
  // Set the clicked location as the new search center
  filtersStore.setLocation({
    lat,
    lng,
    source: "manual",
  });
  track("location_map_click", { lat, lng });
}

// Favorites count
const favoritesCount = computed(() => {
  return useFavoritesStore().events.length + useFavoritesStore().pois.length;
});

// Track page view and initialize GPS location
onMounted(() => {
  pageView("explore");
  initializeUserLocation();
});

// Initialize user location on page load
async function initializeUserLocation() {
  // Only initialize if we don't have a POI set and no manual location
  if (!currentPoi.value && !filtersStore.location) {
    try {
      const position = await getCurrentPosition();
      if (position) {
        filtersStore.setLocation({
          lat: position.lat,
          lng: position.lng,
          source: "gps",
        });
        track("location_gps_enable");
      } else {
        // User denied or timeout - set default location
        filtersStore.setLocation({
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          source: "gps",
        });
      }
    } catch (e) {
      // Error getting location - set default location
      filtersStore.setLocation({
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng,
        source: "gps",
      });
    }
  }
}

// Description text
const descriptionText = computed(() => {
  const transport = t(`explorer.transport.${filtersStore.transport}`);
  let value: string;

  if (filtersStore.searchMode === "time") {
    value = t("explorer.time.minutes", { n: filtersStore.timeMinutes });
  } else {
    value = t("explorer.distance.kilometers", { n: filtersStore.radiusKm });
  }

  return t("explorer.description", { transport, time: value });
});

// Results count
const resultsCount = computed(() => {
  return events.value.length + pois.value.length;
});

// Watch for tab changes to invalidate map size
watch(activeTab, (newTab) => {
  if (newTab === 'map') {
    nextTick(() => {
      mapDrawerRef.value?.invalidateSize();
    });
  }
});
</script>

<template>
  <div class="explore-page">
    <!-- Hero Section -->
    <HeroSection :poi="currentPoi" :loading="poiStore.loading" />

    <!-- Transport Menu -->
    <TransportMenu
      :transport="filtersStore.transport"
      :search-mode="filtersStore.searchMode"
      :value="
        filtersStore.searchMode === 'time'
          ? filtersStore.timeMinutes
          : filtersStore.radiusKm
      "
      :loading="loading"
      :description-text="descriptionText"
      :results-count="resultsCount"
      @update:transport="filtersStore.setTransport"
      @update:search-mode="filtersStore.setSearchMode"
      @update:value="
        (val: number) => {
          if (filtersStore.searchMode === 'time') {
            filtersStore.setTimeMinutes(val);
          } else {
            filtersStore.setRadiusKm(val);
          }
        }
      "
    >
      <!-- Advanced Settings (Location & Category) -->
      <template #advanced>
        <!-- Location Button -->
        <LocationButton
          :is-active="
            !!filtersStore.location && filtersStore.location.source === 'gps'
          "
          :is-loading="gpsLoading"
          @toggle="toggleGps"
          @reset="resetLocation"
        />

        <!-- Category Filter -->
        <CategoryFilter
          :model-value="filtersStore.category"
          @update:model-value="filtersStore.setCategory"
        />
      </template>
    </TransportMenu>

    <!-- Content Area with tab-based content -->
    <div class="explore-page__content">
      <!-- Map Drawer Content - always mounted, visibility controlled by CSS -->
      <MapDrawer
        ref="mapDrawerRef"
        class="drawer-content"
        :class="{ 'drawer-content--active': activeTab === 'map' }"
        :events="events"
        :pois="pois"
        :center="searchCenter"
        :loading="loading"
        :polygon="eventsStore.polygon"
        :selected-category="filtersStore.category"
        @pin-click="handleMapPinClick"
        @map-click="handleMapClick"
        @cluster-event-click="handleClusterEventClick"
      />

      <!-- Events Drawer Content - always mounted, visibility controlled by CSS -->
      <EventsDrawer
        class="drawer-content"
        :class="{ 'drawer-content--active': activeTab === 'events' }"
        :events="events"
        :pois="[]"
        :selected-category="filtersStore.category"
        @event-click="handleEventCardClick"
        @poi-click="handlePoiCardClick"
      />

      <!-- POIs Drawer Content - always mounted, visibility controlled by CSS -->
      <PoisDrawer
        class="drawer-content"
        :class="{ 'drawer-content--active': activeTab === 'pois' }"
        :events="[]"
        :pois="pois"
        :selected-category="filtersStore.category"
        @event-click="handleEventCardClick"
        @poi-click="handlePoiCardClick"
      />

      <!-- Favorites Drawer Content - always mounted, visibility controlled by CSS -->
      <FavoritesDrawer
        class="drawer-content"
        :class="{ 'drawer-content--active': activeTab === 'favorites' }"
        :events="events"
        :pois="pois"
        @event-click="(event: Event) => { selectedEvent = event; }"
        @poi-click="(poi: Poi) => { selectedPoi = poi; }"
      />
    </div>

    <!-- Bottom Tab Navigation -->
    <ExploreTabs
      ref="exploreTabsRef"
      :events-count="events.length"
      :pois-count="pois.length"
      :favorites-count="favoritesCount"
      @update:active-tab="(tab) => (activeTab = tab)"
    />

    <!-- Event Detail Modal -->
    <EventDetailModal v-model="eventModalOpen" :event="selectedEvent" />

    <!-- POI Detail Modal -->
    <PoiDetailModal v-model="poiModalOpen" :poi="selectedPoi" />
  </div>
</template>

<style scoped>
.explore-page {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

.explore-page__content {
  flex: 1;
  position: relative;
  overflow: hidden;
  height: calc(100vh - 180px - 60px - env(safe-area-inset-bottom, 0px));
  min-height: 300px;
  z-index: 1;
}

/* Drawer content visibility - all drawers are mounted but only active is visible */
.drawer-content {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.drawer-content--active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Mobile-specific adjustments */
@media (max-width: 640px) {
  .explore-page__content {
    height: calc(100vh - 160px - 56px - env(safe-area-inset-bottom, 0px));
  }
}
</style>
