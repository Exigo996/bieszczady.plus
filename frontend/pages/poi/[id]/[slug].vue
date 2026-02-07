<script setup lang="ts">
import type { Poi, Video } from '~/types'
import type { Event } from '~/types/event'
import type { GeoJSONPolygon } from '~/types/api'
import type { TransportMode } from '~/stores/filters'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Stores
const poiStore = usePoiStore()
const userStore = useUserStore()
const eventsStore = useEventsStore()

// Event modal state
const selectedEvent = ref<Event | null>(null)
const eventModalOpen = ref(false)

// Get POI ID from route
const poiId = computed(() => route.params.id as string)

// Section open/close state (all collapsed by default)
const videosOpen = ref(false)
const eventsOpen = ref(false)
const nearbyPoisOpen = ref(false)

// Data
const videos = ref<Video[]>([])
const events = ref<Event[]>([])
const nearbyPois = ref<Poi[]>([])
const polygon = ref<GeoJSONPolygon | null>(null)

// Loading states
const videosLoading = ref(false)
const eventsLoading = ref(false)
const loadingNearby = ref(false)

// Transport filter (local to this page, not global)
const transport = ref<TransportMode>('car')
const timeMinutes = ref(30)

// Get category from query if present
const categoryParam = computed(() => route.query.category as string | undefined)

// Current POI
const currentPoi = computed(() => poiStore.currentPoi)

// POI location for map center
const poiLocation = computed(() => ({
  lat: currentPoi.value?.location.lat || 49.5,
  lng: currentPoi.value?.location.lng || 22.5,
}))

// Description text for nearby section
const nearbyDescription = computed(() => {
  return t('explorer.time.minutes', { n: timeMinutes.value })
})

// Fetch POI on mount or when ID changes
watch(
  () => poiId.value,
  async (id) => {
    if (id) {
      try {
        await poiStore.fetchPoi(id)
        userStore.setCurrentPoiId(id)

        // If category is in query and no slug (or mismatch), redirect to proper URL
        const poi = poiStore.currentPoi
        if (poi && !route.params.slug) {
          const slug = generateSlug(poi.name)
          const query = categoryParam.value ? { category: categoryParam.value } : undefined
          router.replace({ params: { slug }, query })
        }
      } catch (e) {
        console.error('Failed to fetch POI:', e)
        // Redirect to home if POI not found
        router.push('/')
      }
    }
  },
  { immediate: true },
)

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes
}

// Navigate back to explore
function goBack() {
  router.push('/explore')
}

// Fetch videos for this POI
async function fetchPoiVideos() {
  if (!currentPoi.value) return

  videosLoading.value = true
  try {
    videos.value = await eventsStore.fetchVideos({ poiId: currentPoi.value.id })
  } catch (e) {
    console.error('Failed to fetch videos:', e)
    videos.value = []
  } finally {
    videosLoading.value = false
  }
}

// Fetch events for this POI
async function fetchPoiEvents() {
  if (!currentPoi.value) return

  eventsLoading.value = true
  try {
    events.value = await eventsStore.fetchEvents({ poiId: currentPoi.value.id })
  } catch (e) {
    console.error('Failed to fetch events:', e)
    events.value = []
  } finally {
    eventsLoading.value = false
  }
}

// Fetch nearby POIs with polygon
async function fetchNearbyPois() {
  if (!currentPoi.value) return

  loadingNearby.value = true
  try {
    nearbyPois.value = await eventsStore.fetchPois({
      lat: currentPoi.value.location.lat,
      lng: currentPoi.value.location.lng,
      minutes: timeMinutes.value,
      transport: transport.value,
    })
    polygon.value = eventsStore.polygon
  } catch (e) {
    console.error('Failed to fetch nearby POIs:', e)
    nearbyPois.value = []
    polygon.value = null
  } finally {
    loadingNearby.value = false
  }
}

// Watch for accordion opening to fetch data
watch(videosOpen, (isOpen) => {
  if (isOpen && videos.value.length === 0 && !videosLoading.value) {
    fetchPoiVideos()
  }
})

watch(eventsOpen, (isOpen) => {
  if (isOpen && events.value.length === 0 && !eventsLoading.value) {
    fetchPoiEvents()
  }
})

watch(nearbyPoisOpen, (isOpen) => {
  if (isOpen && nearbyPois.value.length === 0 && !loadingNearby.value) {
    fetchNearbyPois()
  }
})

// Handle event click
function handleEventClick(event: Event) {
  selectedEvent.value = event
  eventModalOpen.value = true
}

// Handle POI click
function handlePoiClick(poi: Poi) {
  // Navigate to the POI page
  const slug = generateSlug(poi.name)
  router.push(`/poi/${poi.id}/${slug}`)
}

// Track page view
const { pageView } = useAnalytics()
onMounted(() => {
  pageView('poi')
})
</script>

<template>
  <div class="poi-page">
    <!-- Loading state -->
    <div v-if="poiStore.loading" class="poi-page__loading">
      <div class="poi-page__spinner" />
    </div>

    <!-- Error state -->
    <div v-else-if="poiStore.error || !currentPoi" class="poi-page__error">
      <p>{{ t('explorer.noPoiSelected') }}</p>
      <button class="poi-page__back-btn" @click="router.push('/')">
        ← {{ t('actions.back') }}
      </button>
    </div>

    <!-- POI content -->
    <template v-else>
      <!-- Header with back button -->
      <header class="poi-page__header">
        <button class="poi-page__back-button" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>{{ t('poi.backToExplorer') }}</span>
        </button>
      </header>

      <!-- POI Title -->
      <section v-if="currentPoi" class="poi-page__title-section">
        <h1 class="poi-page__title">{{ currentPoi.name }}</h1>
      </section>

      <!-- POI Description -->
      <section v-if="currentPoi.description" class="poi-page__section">
        <h2 class="poi-page__section-title">{{ t('poi.about') }}</h2>
        <p class="poi-page__description">{{ currentPoi.description }}</p>
      </section>

      <!-- Contact info -->
      <section v-if="currentPoi.contact" class="poi-page__section">
        <h2 class="poi-page__section-title">{{ t('poi.contact') }}</h2>
        <div class="poi-page__contact-info">
          <a v-if="currentPoi.contact.phone" :href="`tel:${currentPoi.contact.phone}`" class="poi-page__contact-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {{ currentPoi.contact.phone }}
          </a>
          <a v-if="currentPoi.contact.email" :href="`mailto:${currentPoi.contact.email}`" class="poi-page__contact-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {{ currentPoi.contact.email }}
          </a>
          <a
            v-if="currentPoi.contact.website"
            :href="currentPoi.contact.website"
            target="_blank"
            rel="noopener"
            class="poi-page__contact-link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {{ t('modal.visitWebsite') }}
          </a>
        </div>
      </section>

      <!-- Videos Accordion Section -->
      <BaseAccordion v-model="videosOpen" class="poi-page__accordion poi-page__accordion--videos">
        <template #title>
          <span class="poi-page__accordion-title">
            <svg class="poi-page__accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>{{ t('poi.videosSection') }}</span>
            <span v-if="videos.length > 0" class="poi-page__accordion-count">({{ videos.length }})</span>
          </span>
        </template>

        <div v-if="videosLoading" class="poi-page__loading-state">
          <div class="poi-page__spinner-small" />
          <span>{{ t('poi.loadingVideos') }}</span>
        </div>
        <div v-else-if="videos.length === 0" class="poi-page__empty-state">
          <p>{{ t('poi.noVideos') }}</p>
        </div>
        <div v-else class="poi-page__video-list">
          <VideoCard
            v-for="video in videos"
            :key="video.id"
            :video="video"
          />
        </div>
      </BaseAccordion>

      <!-- Events Accordion Section -->
      <BaseAccordion v-model="eventsOpen" class="poi-page__accordion poi-page__accordion--events">
        <template #title>
          <span class="poi-page__accordion-title">
            <svg class="poi-page__accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{{ t('poi.eventsSection') }}</span>
            <span v-if="events.length > 0" class="poi-page__accordion-count">({{ events.length }})</span>
          </span>
        </template>

        <div v-if="eventsLoading" class="poi-page__loading-state">
          <div class="poi-page__spinner-small" />
          <span>{{ t('poi.loadingVideos') }}</span>
        </div>
        <div v-else-if="events.length === 0" class="poi-page__empty-state">
          <p>{{ t('poi.noEvents') }}</p>
        </div>
        <div v-else class="poi-page__event-list">
          <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
            @click="handleEventClick(event)"
          />
        </div>
      </BaseAccordion>

      <!-- Nearby POIs Accordion Section -->
      <BaseAccordion v-model="nearbyPoisOpen" class="poi-page__accordion poi-page__accordion--nearby">
        <template #title>
          <span class="poi-page__accordion-title">
            <svg class="poi-page__accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ t('poi.nearbySection') }}</span>
            <span v-if="nearbyPois.length > 0" class="poi-page__accordion-count">({{ nearbyPois.length }})</span>
          </span>
        </template>

        <!-- Transport Menu -->
        <TransportMenu
          v-model:transport="transport"
          :search-mode="'time'"
          v-model:value="timeMinutes"
          :loading="loadingNearby"
          :description-text="nearbyDescription"
          :results-count="nearbyPois.length"
          @update:transport="fetchNearbyPois"
          @update:value="fetchNearbyPois"
        />

        <!-- Map View with Polygon -->
        <div class="poi-page__map">
          <MapView
            :events="[]"
            :pois="nearbyPoisOpen ? nearbyPois : []"
            :center="poiLocation"
            :polygon="polygon"
            :loading="loadingNearby"
            :show-markers="nearbyPoisOpen"
            :zoom="12"
          />
        </div>

        <!-- Nearby POIs List -->
        <div v-if="!loadingNearby && nearbyPois.length === 0" class="poi-page__empty-state">
          <p>{{ t('poi.noNearby') }}</p>
        </div>
        <div v-else-if="nearbyPois.length > 0" class="poi-page__poi-list">
          <PoiCard
            v-for="poi in nearbyPois.filter(p => p.id !== currentPoi?.id)"
            :key="poi.id"
            :poi="poi"
            @click="handlePoiClick(poi)"
          />
        </div>
      </BaseAccordion>
    </template>

    <!-- Event Detail Modal -->
    <EventDetailModal v-model="eventModalOpen" :event="selectedEvent" />
  </div>
</template>

<style scoped>
.poi-page {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 2rem;
}

.poi-page__loading,
.poi-page__error {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #6b7280;
}

.poi-page__spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.poi-page__spinner-small {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.poi-page__back-btn {
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.poi-page__back-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* Header */
.poi-page__header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
}

.poi-page__back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.poi-page__back-button:hover {
  background: #f3f4f6;
}

.poi-page__back-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Title Section */
.poi-page__title-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 1rem 0.5rem;
  text-align: center;
}

.poi-page__title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

@media (min-width: 640px) {
  .poi-page__title {
    font-size: 2.5rem;
  }
}

/* Sections */
.poi-page__section {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem 1.5rem;
}

.poi-page__section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.25rem;
  position: relative;
  padding-left: 1rem;
}

.poi-page__section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.15em;
  bottom: 0.15em;
  width: 4px;
  background: linear-gradient(to bottom, #10b981, #059669);
  border-radius: 2px;
}

.poi-page__description {
  line-height: 1.7;
  color: #4b5563;
  white-space: pre-wrap;
}

.poi-page__contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.poi-page__contact-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;
}

.poi-page__contact-link:hover {
  border-color: #10b981;
  background: #ecfdf5;
}

.poi-page__contact-link svg {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  color: #10b981;
}

/* Accordion */
.poi-page__accordion {
  max-width: 800px;
  margin: 0 auto 1.25rem;
  position: relative;
}

/* Add colored top border for each accordion type */
.poi-page__accordion--videos :deep(.base-accordion) {
  border-top: 3px solid #10b981;
}

.poi-page__accordion--events :deep(.base-accordion) {
  border-top: 3px solid #8b5cf6;
}

.poi-page__accordion--nearby :deep(.base-accordion) {
  border-top: 3px solid #f59e0b;
}

.poi-page__accordion :deep(.base-accordion__content.base-accordion__content--open) {
  /* Give more space for content when open */
  max-height: min(600px, 70vh) !important;
}

.poi-page__accordion-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
}

.poi-page__accordion-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #10b981;
  flex-shrink: 0;
}

.poi-page__accordion--events .poi-page__accordion-icon {
  color: #8b5cf6;
}

.poi-page__accordion--nearby .poi-page__accordion-icon {
  color: #f59e0b;
}

.poi-page__accordion-count {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.9375rem;
  background: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

/* Loading & Empty States */
.poi-page__loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: #6b7280;
  min-height: 150px;
}

.poi-page__empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poi-page__empty-state p {
  margin: 0;
}

/* Video List */
.poi-page__video-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Event List */
.poi-page__event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Map */
.poi-page__map {
  height: 350px;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-top: 1rem;
}

/* POI List */
.poi-page__poi-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .poi-page__poi-list {
    grid-template-columns: 1fr;
  }
}
</style>
