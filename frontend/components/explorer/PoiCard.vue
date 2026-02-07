<script setup lang="ts">
import type { Poi } from '~/types'

interface Props {
  poi: Poi
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

const { t } = useI18n()

const thumbnail = computed(() => {
  return props.poi.media.images[0] || null
})

const { isPoiFavorite } = useFavorites()
const isFavorite = computed(() => isPoiFavorite(props.poi.id))

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
    class="poi-card"
    @click="emit('click')"
  >
    <!-- Thumbnail -->
    <div v-if="thumbnail" class="poi-card__image">
      <img
        :src="thumbnail"
        :alt="poi.name"
        loading="lazy"
      >
      <div class="poi-card__category">
        {{ t(`categories.${poi.category}`) }}
      </div>
      <FavoriteButton
        :item="poi"
        type="poi"
        size="sm"
        class="poi-card__favorite"
        @click.stop
      />
    </div>

    <!-- Content -->
    <div class="poi-card__content">
      <h3 class="poi-card__title">
        {{ poi.name }}
      </h3>

      <div v-if="poi.location.address" class="poi-card__address">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{{ poi.location.address }}</span>
      </div>

      <div class="poi-card__meta">
        <div v-if="showDistance && distanceDisplay" class="poi-card__distance">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ distanceDisplay }}</span>
        </div>

        <div v-if="poi.contact?.phone" class="poi-card__phone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <a
            :href="`tel:${poi.contact.phone}`"
            class="poi-card__phone-link"
            @click.stop
          >
            {{ poi.contact.phone }}
          </a>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="poi.tags?.length" class="poi-card__tags">
        <span
          v-for="tag in poi.tags.slice(0, 3)"
          :key="tag"
          class="poi-card__tag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.poi-card {
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.poi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.poi-card__image {
  position: relative;
  aspect-ratio: 3 / 1;
  overflow: hidden;
}

.poi-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.poi-card:hover .poi-card__image img {
  transform: scale(1.05);
}

.poi-card__category {
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

.poi-card__favorite {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.poi-card__content {
  padding: 1rem;
}

.poi-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.poi-card__address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.poi-card__address svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.poi-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.poi-card__distance,
.poi-card__phone {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.poi-card__distance svg,
.poi-card__phone svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.poi-card__phone-link {
  color: inherit;
  text-decoration: none;
}

.poi-card__phone-link:hover {
  color: #10b981;
}

.poi-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.poi-card__tag {
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
