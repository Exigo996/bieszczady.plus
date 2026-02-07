<script setup lang="ts">
import type { Event, Category, Poi } from '~/types'

interface Props {
  events: Event[]
  poiName: string
  category: Category
  modelValue: boolean
  poiId?: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'eventClick': [event: Event]
}>()

const { t, locale } = useI18n()
const router = useRouter()

function handleClose() {
  emit('update:modelValue', false)
}

function handleEventClick(event: Event) {
  emit('eventClick', event)
}

// Navigate to POI page
function goToPoiPage() {
  if (!props.poiId) return

  // Generate URL-friendly slug
  const slug = props.poiName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes

  // Close modal and navigate
  emit('update:modelValue', false)
  nextTick(() => {
    router.push(`/poi/${props.poiId}/${slug}`)
  })
}

// Format event date for display
function formatEventDate(event: Event): string {
  const date = new Date(event.datetime.start)
  const endDate = event.datetime.end ? new Date(event.datetime.end) : null

  const dateFormatter = new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const timeFormatter = new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  })

  let result = dateFormatter.format(date)
  result += ', ' + timeFormatter.format(date)

  if (endDate) {
    const endTime = timeFormatter.format(endDate)
    if (endTime !== timeFormatter.format(date)) {
      result += ' - ' + endTime
    }
  }

  return result
}

// Format price
function formatPrice(event: Event): string {
  if (!event.price) return t('explorer.event.free')
  const { amount, currency } = event.price
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Get thumbnail or fallback
function getThumbnail(event: Event): string {
  return event.media.thumbnail || ''
}

// Category colors
const categoryColors: Record<Category, string> = {
  culture: '#8b5cf6',
  nature: '#10b981',
  sport: '#f59e0b',
  history: '#ef4444',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="event-cluster-modal"
        @click.self="handleClose"
      >
        <div class="event-cluster-modal__content">
          <!-- Header -->
          <div class="event-cluster-modal__header">
            <div class="event-cluster-modal__header-info">
              <h2 class="event-cluster-modal__title">{{ poiName }}</h2>
              <p class="event-cluster-modal__subtitle">
                <span
                  class="event-cluster-modal__category"
                  :style="{ color: categoryColors[category] }"
                >
                  {{ t(`categories.${category}`) }}
                </span>
                <span class="event-cluster-modal__count">• {{ events.length }} {{ events.length === 1 ? t('explorer.modal.event') : t('explorer.modal.events') }}</span>
              </p>
            </div>
            <button
              class="event-cluster-modal__close"
              @click="handleClose"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Events list - scrollable -->
          <div class="event-cluster-modal__list">
            <button
              v-for="event in events"
              :key="event.id"
              class="event-cluster-modal__item"
              @click="handleEventClick(event)"
            >
              <div
                v-if="getThumbnail(event)"
                class="event-cluster-modal__item-image"
              >
                <img :src="getThumbnail(event)" :alt="event.title" />
              </div>
              <div v-else class="event-cluster-modal__item-image event-cluster-modal__item-image--placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>

              <div class="event-cluster-modal__item-info">
                <h3 class="event-cluster-modal__item-title">{{ event.title }}</h3>
                <div class="event-cluster-modal__item-meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{{ formatEventDate(event) }}</span>
                </div>
                <div class="event-cluster-modal__item-price">
                  {{ formatPrice(event) }}
                </div>
              </div>

              <svg class="event-cluster-modal__item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <!-- Footer with See more button - always visible -->
          <div class="event-cluster-modal__footer">
            <button
              v-if="poiId"
              class="event-cluster-modal__see-more"
              @click="goToPoiPage"
            >
              <span>{{ t('actions.seeMore') }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.event-cluster-modal {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
}

.event-cluster-modal__content {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  background: #fff;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.event-cluster-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.event-cluster-modal__header-info {
  flex: 1;
  min-width: 0;
}

.event-cluster-modal__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-cluster-modal__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-cluster-modal__category {
  font-weight: 600;
  text-transform: capitalize;
}

.event-cluster-modal__count {
  font-weight: 500;
}

.event-cluster-modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  flex-shrink: 0;
}

.event-cluster-modal__close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.event-cluster-modal__close svg {
  width: 18px;
  height: 18px;
}

.event-cluster-modal__list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  /* Ensure scrollbar doesn't overlap content */
  padding-bottom: 0;
}

/* Custom scrollbar for webkit browsers */
.event-cluster-modal__list::-webkit-scrollbar {
  width: 4px;
}

.event-cluster-modal__list::-webkit-scrollbar-track {
  background: transparent;
}

.event-cluster-modal__list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.event-cluster-modal__list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.event-cluster-modal__item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.event-cluster-modal__item:hover {
  background: #f9fafb;
}

.event-cluster-modal__item:active {
  background: #f3f4f6;
}

.event-cluster-modal__item-image {
  width: 64px;
  height: 64px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.event-cluster-modal__item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-cluster-modal__item-image--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.event-cluster-modal__item-image--placeholder svg {
  width: 28px;
  height: 28px;
}

.event-cluster-modal__item-info {
  flex: 1;
  min-width: 0;
}

.event-cluster-modal__item-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-cluster-modal__item-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.event-cluster-modal__item-meta svg {
  width: 14px;
  height: 14px;
}

.event-cluster-modal__item-price {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #10b981;
}

.event-cluster-modal__item-arrow {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  flex-shrink: 0;
}

/* Footer with See more button */
.event-cluster-modal__footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: #fff;
}

.event-cluster-modal__see-more {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.event-cluster-modal__see-more:hover {
  background: #059669;
}

.event-cluster-modal__see-more svg {
  width: 18px;
  height: 18px;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .event-cluster-modal__content,
.modal-leave-to .event-cluster-modal__content {
  transform: translateY(100%);
}

/* Desktop adjustment */
@media (min-width: 640px) {
  .event-cluster-modal {
    align-items: center;
    padding: 2rem;
  }

  .event-cluster-modal__content {
    border-radius: 1rem;
    max-height: 70vh;
  }
}
</style>
