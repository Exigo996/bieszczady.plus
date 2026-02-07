<script setup lang="ts">
import type { Event, Poi, Category } from '~/types'

interface Props {
  events: Event[]
  pois: Poi[]
  selectedCategory?: Category | 'all'
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: 'all',
})

const emit = defineEmits<{
  eventClick: [event: Event]
  poiClick: [poi: Poi]
}>()

const { t } = useI18n()

// Group events by category
const groupedEvents = computed(() => {
  const groups: Record<string, Event[]> = {}

  for (const event of props.events) {
    if (!groups[event.category]) {
      groups[event.category] = []
    }
    groups[event.category]!.push(event)
  }

  return groups
})

// Group POIs by category
const groupedPois = computed(() => {
  const groups: Record<string, Poi[]> = {}

  for (const poi of props.pois) {
    if (!groups[poi.category]) {
      groups[poi.category] = []
    }
    groups[poi.category]!.push(poi)
  }

  return groups
})

// All categories with items
const categoriesWithItems = computed(() => {
  const catSet = new Set<string>()

  for (const event of props.events) {
    catSet.add(event.category)
  }

  for (const poi of props.pois) {
    catSet.add(poi.category)
  }

  return Array.from(catSet) as Category[]
})

// Track open/close state
const openCategories = ref<Set<string>>(new Set())

// Auto-open selected category if provided
watch(() => props.selectedCategory, (newVal) => {
  if (newVal && newVal !== 'all') {
    openCategories.value.add(newVal)
  }
}, { immediate: true })

function toggleCategory(cat: string) {
  if (openCategories.value.has(cat)) {
    openCategories.value.delete(cat)
  } else {
    openCategories.value.add(cat)
  }
}
</script>

<template>
  <div class="event-list">
    <template v-if="categoriesWithItems.length === 0">
      <div class="event-list__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p>{{ t('explorer.noResults') }}</p>
        <span class="event-list__empty-hint">{{ t('explorer.tryDifferentFilters') }}</span>
      </div>
    </template>

    <template v-else>
      <!-- Events Section -->
      <div v-if="events.length > 0" class="event-list__section">
        <h2 class="event-list__section-title">
          {{ t('favorites.events') }} ({{ events.length }})
        </h2>

        <div class="event-list__items">
          <EventCard
            v-for="event in events"
            :key="`event-${event.id}`"
            :event="event"
            @click="emit('eventClick', event)"
          />
        </div>
      </div>

      <!-- POIs Section -->
      <div v-if="pois.length > 0" class="event-list__section">
        <h2 class="event-list__section-title">
          {{ t('favorites.pois') }} ({{ pois.length }})
        </h2>

        <div class="event-list__items">
          <PoiCard
            v-for="poi in pois"
            :key="`poi-${poi.id}`"
            :poi="poi"
            @click="emit('poiClick', poi)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.event-list {
  padding: 1rem;
  max-height: max(150px, calc(100vh - 370px));
  overflow-y: auto;
}

/* Scrollbar styling for better UX */
.event-list::-webkit-scrollbar {
  width: 6px;
}

.event-list::-webkit-scrollbar-track {
  background: transparent;
}

.event-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.event-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.event-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.event-list__empty svg {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.event-list__empty p {
  font-size: 1.125rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.event-list__empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
}

.event-list__section {
  margin-bottom: 2rem;
}

.event-list__section:last-child {
  margin-bottom: 0;
}

.event-list__section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.event-list__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
