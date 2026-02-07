<script setup lang="ts">
import type { Event } from '~/types'

interface Props {
  event: Event
  showDistance?: boolean
  distance?: number
  distanceUnit?: 'km' | 'min'
}

const props = withDefaults(defineProps<Props>(), {
  showDistance: false,
})

const emit = defineEmits<{
  click: []
}>()

const { t, locale } = useI18n()

const formattedDate = computed(() => {
  const date = new Date(props.event.datetime.start)
  const endDate = props.event.datetime.end ? new Date(props.event.datetime.end) : null

  const formatter = new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })

  const timeFormatter = new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  })

  let result = formatter.format(date)
  result += ', ' + timeFormatter.format(date)

  if (endDate) {
    result += ' - ' + timeFormatter.format(endDate)
  }

  return result
})

const formattedPrice = computed(() => {
  if (!props.event.price) return t('explorer.event.free')
  const { amount, currency } = props.event.price
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
  }).format(amount)
})

const { isEventFavorite, toggleEvent } = useFavorites()
const isFavorite = computed(() => isEventFavorite(props.event.id))

const distanceDisplay = computed(() => {
  if (props.distance === undefined) return null
  if (props.distanceUnit === 'min') {
    return t('explorer.time.minutes', { n: Math.round(props.distance) })
  }
  return t('explorer.distance.kilometers', { n: props.distance.toFixed(1) })
})
</script>

<template>
  <article
    class="event-card"
    @click="emit('click')"
  >
    <!-- Thumbnail -->
    <div class="event-card__image">
      <img
        :src="event.media.thumbnail"
        :alt="event.title"
        loading="lazy"
      >
      <div class="event-card__category">
        {{ t(`categories.${event.category}`) }}
      </div>
      <FavoriteButton
        :item="event"
        type="event"
        size="sm"
        class="event-card__favorite"
        @click.stop
      />
    </div>

    <!-- Content -->
    <div class="event-card__content">
      <h3 class="event-card__title">
        {{ event.title }}
      </h3>

      <div class="event-card__meta">
        <div class="event-card__date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{{ formattedDate }}</span>
        </div>

        <div v-if="showDistance && distanceDisplay" class="event-card__distance">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ distanceDisplay }}</span>
        </div>

        <div class="event-card__price">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span>{{ formattedPrice }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="event.tags?.length" class="event-card__tags">
        <span
          v-for="tag in event.tags.slice(0, 3)"
          :key="tag"
          class="event-card__tag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.event-card__image {
  position: relative;
  aspect-ratio: 3 / 1;
  overflow: hidden;
}

.event-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.event-card:hover .event-card__image img {
  transform: scale(1.05);
}

.event-card__category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.event-card__favorite {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.event-card__content {
  padding: 1rem;
}

.event-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.event-card__date,
.event-card__distance,
.event-card__price {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.event-card__date svg,
.event-card__distance svg,
.event-card__price svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.event-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.event-card__tag {
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
