<script setup lang="ts">
import type { Event, Poi } from '~/types'

interface Props {
  item: Event | Poi
  type: 'event' | 'poi'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const { t } = useI18n()

const isEvent = computed(() => props.type === 'event')

const title = computed(() => {
  return isEvent.value ? (props.item as Event).title : (props.item as Poi).name
})

const datetime = computed(() => {
  if (isEvent.value) {
    const event = props.item as Event
    return new Date(event.datetime.start)
  }
  return null
})

const formattedDate = computed(() => {
  if (!datetime.value) return null
  const { locale } = useI18n()
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(datetime.value)
})

const address = computed(() => props.item.location.address)

const thumbnail = computed(() => {
  if (isEvent.value) {
    return (props.item as Event).media.thumbnail
  }
  return (props.item as Poi).media.images[0] || null
})
</script>

<template>
  <div class="map-popup" @click="emit('click')">
    <div v-if="thumbnail" class="map-popup__image">
      <img :src="thumbnail" :alt="title" loading="lazy">
    </div>

    <div class="map-popup__content">
      <h3 class="map-popup__title">{{ title }}</h3>

      <div v-if="formattedDate" class="map-popup__date">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{{ formattedDate }}</span>
      </div>

      <div class="map-popup__address">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{{ address }}</span>
      </div>

      <div class="map-popup__footer">
        <FavoriteButton
          :item="item"
          :type="type"
          size="sm"
        />
        <span class="map-popup__hint">{{ t('explorer.map.clickForDetails') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-popup {
  min-width: 200px;
  max-width: 280px;
  cursor: pointer;
}

.map-popup__image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.5rem 0.5rem 0 0;
  background: #f3f4f6;
}

.map-popup__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-popup__content {
  padding: 0.75rem;
}

.map-popup__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.map-popup__date,
.map-popup__address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.375rem;
}

.map-popup__date svg,
.map-popup__address svg {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.map-popup__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.map-popup__hint {
  font-size: 0.7rem;
  color: #9ca3af;
  font-style: italic;
}
</style>
