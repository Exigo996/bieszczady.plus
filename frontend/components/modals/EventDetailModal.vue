<script setup lang="ts">
import type { Event } from '~/types'

interface Props {
  event: Event | null
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t, locale } = useI18n()
const { toggleEvent, isEventFavorite } = useFavorites()
const { downloadICS } = useCalendar()
const { track } = useAnalytics()

const isFavorite = computed(() =>
  props.event ? isEventFavorite(props.event.id) : false
)

const formattedDate = computed(() => {
  if (!props.event) return ''
  const date = new Date(props.event.datetime.start)
  const endDate = props.event.datetime.end ? new Date(props.event.datetime.end) : null

  const dateFormatter = new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
})

const formattedPrice = computed(() => {
  if (!props.event?.price) return t('explorer.event.free')
  const { amount, currency } = props.event.price
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
  }).format(amount)
})

function handleToggleFavorite() {
  if (props.event) {
    toggleEvent(props.event)
    track(isFavorite.value ? 'favorite_remove' : 'favorite_add', {
      type: 'event',
      id: props.event.id,
      title: props.event.title,
    })
  }
}

function handleAddToCalendar() {
  if (props.event) {
    downloadICS(props.event)
    track('calendar_add', {
      type: 'event',
      id: props.event.id,
      title: props.event.title,
    })
  }
}

function handleBuyTicket() {
  if (props.event?.price?.ticket_url) {
    track('ticket_click', {
      type: 'event',
      id: props.event.id,
      title: props.event.title,
    })
    window.open(props.event.price.ticket_url, '_blank')
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

// Track modal view
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.event) {
    track('event_view', {
      id: props.event.id,
      title: props.event.title,
      category: props.event.category,
    })
  }
})

// Close modal when event is cleared
watch(() => props.event, (newEvent) => {
  if (!newEvent && props.modelValue) {
    emit('update:modelValue', false)
  }
})
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="event?.title"
    size="lg"
  >
    <template v-if="event">
      <!-- Media -->
      <div class="event-detail-modal__media">
        <img
          :src="event.media.thumbnail"
          :alt="event.title"
          class="event-detail-modal__image"
        >
        <div class="event-detail-modal__category">
          {{ t(`categories.${event.category}`) }}
        </div>
      </div>

      <!-- Date & Time -->
      <div class="event-detail-modal__info">
        <div class="event-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{{ formattedDate }}</span>
        </div>

        <div class="event-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{{ event.location.address }}</span>
        </div>

        <div class="event-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span>{{ formattedPrice }}</span>
        </div>
      </div>

      <!-- Description -->
      <div class="event-detail-modal__description">
        <h3 class="event-detail-modal__section-title">
          {{ t('modal.about') }}
        </h3>
        <p>{{ event.description }}</p>
      </div>

      <!-- Tags -->
      <div v-if="event.tags?.length" class="event-detail-modal__tags">
        <span
          v-for="tag in event.tags"
          :key="tag"
          class="event-detail-modal__tag"
        >
          #{{ tag }}
        </span>
      </div>
    </template>

    <!-- Actions -->
    <template #footer>
      <div v-if="event" class="event-detail-modal__actions">
        <button
          class="event-detail-modal__action event-detail-modal__action--favorite"
          :class="{ 'event-detail-modal__action--active': isFavorite }"
          @click="handleToggleFavorite"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{{ isFavorite ? t('actions.removeFavorite') : t('actions.addFavorite') }}</span>
        </button>

        <button
          class="event-detail-modal__action event-detail-modal__action--calendar"
          @click="handleAddToCalendar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{{ t('actions.addCalendar') }}</span>
        </button>

        <a
          v-if="event.price?.ticket_url"
          class="event-detail-modal__action event-detail-modal__action--ticket"
          @click="handleBuyTicket"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{{ t('actions.buyTicket') }}</span>
        </a>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.event-detail-modal__media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.event-detail-modal__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-detail-modal__category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.375rem 0.875rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.event-detail-modal__info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.event-detail-modal__info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: #4b5563;
}

.event-detail-modal__info-item svg {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  color: #10b981;
}

.event-detail-modal__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.event-detail-modal__description {
  margin-bottom: 1rem;
}

.event-detail-modal__description p {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
}

.event-detail-modal__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.event-detail-modal__tag {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #6b7280;
}

.event-detail-modal__actions {
  display: flex;
  gap: 0.5rem;
}

.event-detail-modal__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  flex: 1;
  padding: 0.75rem 0.5rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.event-detail-modal__action:hover {
  background: #e5e7eb;
}

.event-detail-modal__action svg {
  width: 1.25rem;
  height: 1.25rem;
}

.event-detail-modal__action--favorite:hover {
  background: #fee2e2;
  color: #dc2626;
}

.event-detail-modal__action--favorite.event-detail-modal__action--active {
  background: #fee2e2;
  color: #dc2626;
}

.event-detail-modal__action--calendar:hover {
  background: #dbeafe;
  color: #2563eb;
}

.event-detail-modal__action--ticket {
  background: #10b981;
  color: #fff;
}

.event-detail-modal__action--ticket:hover {
  background: #059669;
}

@media (max-width: 640px) {
  .event-detail-modal__actions {
    flex-wrap: wrap;
  }

  .event-detail-modal__action {
    min-width: calc(50% - 0.25rem);
  }
}
</style>
