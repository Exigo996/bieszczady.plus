<script setup lang="ts">
import type { Event, Poi, Category } from '~/types'

interface Props {
  events: Event[]
  pois: Poi[]
  selectedCategory?: Category | 'all'
  transport?: string
  timeOrDistance?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: 'all',
})

const emit = defineEmits<{
  eventClick: [event: Event]
  poiClick: [poi: Poi]
}>()

const { t } = useI18n()

// All categories
const categories = computed(() => {
  const cats: Array<{ id: Category | 'all'; label: string; events: Event[]; pois: Poi[] }> = []

  // All items
  cats.push({
    id: 'all',
    label: t('explorer.all'),
    events: props.events,
    pois: props.pois,
  })

  // By category
  for (const cat of ['culture', 'nature', 'sport', 'history'] as Category[]) {
    cats.push({
      id: cat,
      label: t(`categories.${cat}`),
      events: props.events.filter(e => e.category === cat),
      pois: props.pois.filter(p => p.category === cat),
    })
  }

  return cats
})

// Track which accordions are open
const openCategories = ref<Set<string>>(new Set([props.selectedCategory]))

// Auto-open the selected category
watch(() => props.selectedCategory, (newVal) => {
  if (newVal) {
    openCategories.value.add(newVal)
  }
}, { immediate: true })

function toggleCategory(id: string) {
  if (openCategories.value.has(id)) {
    openCategories.value.delete(id)
  } else {
    openCategories.value.add(id)
  }
}

function isOpen(id: string) {
  return openCategories.value.has(id)
}
</script>

<template>
  <div class="category-accordion">
    <div
      v-for="category in categories"
      :key="category.id"
      class="category-accordion__item"
    >
      <BaseAccordion
        :model-value="isOpen(category.id)"
        @update:model-value="toggleCategory(category.id)"
      >
        <template #title>
          <span class="category-accordion__title">
            {{ category.label }}
            <span class="category-accordion__count">
              {{ category.events.length + category.pois.length }}
            </span>
          </span>
        </template>

        <div class="category-accordion__content">
          <!-- Events -->
          <div v-if="category.events.length > 0" class="category-accordion__section">
            <h4 class="category-accordion__section-title">
              {{ t('favorites.events') }}
            </h4>
            <div class="category-accordion__cards">
              <EventCard
                v-for="event in category.events"
                :key="event.id"
                :event="event"
                @click="emit('eventClick', event)"
              />
            </div>
          </div>

          <!-- POIs -->
          <div v-if="category.pois.length > 0" class="category-accordion__section">
            <h4 class="category-accordion__section-title">
              {{ t('favorites.pois') }}
            </h4>
            <div class="category-accordion__cards">
              <PoiCard
                v-for="poi in category.pois"
                :key="poi.id"
                :poi="poi"
                @click="emit('poiClick', poi)"
              />
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="category.events.length === 0 && category.pois.length === 0"
            class="category-accordion__empty"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>{{ t('explorer.noResults') }}</p>
          </div>
        </div>
      </BaseAccordion>
    </div>
  </div>
</template>

<style scoped>
.category-accordion {
  padding: 1rem;
  background: #f9fafb;
}

.category-accordion__item {
  margin-bottom: 0.75rem;
}

.category-accordion__item:last-child {
  margin-bottom: 0;
}

.category-accordion__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-accordion__count {
  padding: 0.125rem 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.category-accordion__content {
  padding: 0;
}

.category-accordion__section {
  margin-bottom: 1rem;
}

.category-accordion__section:last-child {
  margin-bottom: 0;
}

.category-accordion__section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.category-accordion__cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-accordion__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #9ca3af;
  text-align: center;
}

.category-accordion__empty svg {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.category-accordion__empty p {
  font-size: 0.875rem;
  margin: 0;
}
</style>
