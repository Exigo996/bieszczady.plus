<script setup lang="ts">
import type { Poi, Video } from '~/types'

interface Props {
  poi: Poi | null
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const { t } = useI18n()
const { togglePoi, isPoiFavorite } = useFavorites()
const { track } = useAnalytics()
const eventsStore = useEventsStore()

const isFavorite = computed(() =>
  props.poi ? isPoiFavorite(props.poi.id) : false
)

const thumbnail = computed(() => {
  return props.poi?.media.images[0] || null
})

const videos = ref<Video[]>([])
const videosLoading = ref(false)
const videosError = ref<string | null>(null)

// Generate slug from POI name
const poiSlug = computed(() => {
  if (!props.poi) return ''
  return props.poi.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
})

// Navigate to POI page
function goToPoiPage() {
  if (!props.poi) return

  track('poi_see_more', {
    id: props.poi.id,
    name: props.poi.name,
    category: props.poi.category,
  })

  // Close modal and navigate to /poi/{id}/{slug}
  emit('update:modelValue', false)
  router.push(`/poi/${props.poi.id}/${poiSlug.value}`)
}

// Fetch videos when modal opens with a POI
watch(() => [props.modelValue, props.poi], async ([isOpen, poi]) => {
  if (isOpen && poi) {
    // Fetch videos for this POI
    await fetchPoiVideos(poi.id)

    track('poi_view', {
      id: poi.id,
      name: poi.name,
      category: poi.category,
    })
  }
})

async function fetchPoiVideos(poiId: string) {
  videosLoading.value = true
  videosError.value = null

  try {
    videos.value = await eventsStore.fetchVideos({ poiId })
  } catch (e) {
    videosError.value = e instanceof Error ? e.message : 'Failed to fetch videos'
    videos.value = []
  } finally {
    videosLoading.value = false
  }
}

function handleToggleFavorite() {
  if (props.poi) {
    togglePoi(props.poi)
    track(isFavorite.value ? 'favorite_remove' : 'favorite_add', {
      type: 'poi',
      id: props.poi.id,
      name: props.poi.name,
    })
  }
}

// Format video duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `0:${seconds.toString().padStart(2, '0')}`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Get video embed URL (for YouTube)
function getVideoEmbedUrl(video: Video): string {
  if (video.source.type === 'youtube') {
    // Extract video ID from YouTube URL
    const match = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }
  return video.videoUrl
}

// Close modal when poi is cleared
watch(() => props.poi, (newPoi) => {
  if (!newPoi && props.modelValue) {
    emit('update:modelValue', false)
  }
})
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="poi?.name"
    size="lg"
  >
    <template v-if="poi">
      <!-- Media -->
      <div v-if="thumbnail" class="poi-detail-modal__media">
        <img
          :src="thumbnail"
          :alt="poi.name"
          class="poi-detail-modal__image"
        >
        <div class="poi-detail-modal__category">
          {{ t(`categories.${poi.category}`) }}
        </div>
      </div>

      <!-- Location -->
      <div class="poi-detail-modal__info">
        <div class="poi-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{{ poi.location.address }}</span>
        </div>

        <div v-if="poi.contact?.phone" class="poi-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <a
            :href="`tel:${poi.contact.phone}`"
            class="poi-detail-modal__link"
          >
            {{ poi.contact.phone }}
          </a>
        </div>

        <div v-if="poi.contact?.email" class="poi-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <a
            :href="`mailto:${poi.contact.email}`"
            class="poi-detail-modal__link"
          >
            {{ poi.contact.email }}
          </a>
        </div>

        <div v-if="poi.contact?.website" class="poi-detail-modal__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <a
            :href="poi.contact.website"
            target="_blank"
            rel="noopener noreferrer"
            class="poi-detail-modal__link"
          >
            {{ t('modal.visitWebsite') }}
          </a>
        </div>
      </div>

      <!-- Description -->
      <div class="poi-detail-modal__description">
        <h3 class="poi-detail-modal__section-title">
          {{ t('modal.about') }}
        </h3>
        <p>{{ poi.description }}</p>
      </div>

      <!-- Videos Section -->
      <div v-if="!videosLoading && videos.length > 0" class="poi-detail-modal__videos">
        <h3 class="poi-detail-modal__section-title">
          {{ t('poi.videos') }} ({{ videos.length }})
        </h3>
        <div class="poi-detail-modal__video-list">
          <a
            v-for="video in videos"
            :key="video.id"
            :href="video.videoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="poi-detail-modal__video-item"
          >
            <div class="poi-detail-modal__video-thumbnail">
              <img
                v-if="video.thumbnailUrl"
                :src="video.thumbnailUrl"
                :alt="video.title"
                loading="lazy"
              />
              <div v-else class="poi-detail-modal__video-thumbnail-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div class="poi-detail-modal__video-duration">
                {{ formatDuration(video.duration) }}
              </div>
            </div>
            <div class="poi-detail-modal__video-info">
              <h4 class="poi-detail-modal__video-title">{{ video.title }}</h4>
              <p v-if="video.description" class="poi-detail-modal__video-description">
                {{ video.description.slice(0, 100) }}{{ video.description.length > 100 ? '...' : '' }}
              </p>
            </div>
          </a>
        </div>
      </div>

      <!-- Videos Loading -->
      <div v-if="videosLoading" class="poi-detail-modal__videos-loading">
        <div class="poi-detail-modal__spinner"></div>
        <span>{{ t('poi.loadingVideos') }}</span>
      </div>

      <!-- Tags -->
      <div v-if="poi.tags?.length" class="poi-detail-modal__tags">
        <span
          v-for="tag in poi.tags"
          :key="tag"
          class="poi-detail-modal__tag"
        >
          #{{ tag }}
        </span>
      </div>
    </template>

    <!-- Actions -->
    <template #footer>
      <div v-if="poi" class="poi-detail-modal__actions">
        <button
          class="poi-detail-modal__action poi-detail-modal__action--favorite"
          :class="{ 'poi-detail-modal__action--active': isFavorite }"
          @click="handleToggleFavorite"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{{ isFavorite ? t('actions.removeFavorite') : t('actions.addFavorite') }}</span>
        </button>

        <button
          class="poi-detail-modal__action poi-detail-modal__action--more"
          @click="goToPoiPage"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>{{ t('actions.seeMore') }}</span>
        </button>

        <a
          v-if="poi.contact?.website"
          :href="poi.contact.website"
          target="_blank"
          rel="noopener noreferrer"
          class="poi-detail-modal__action poi-detail-modal__action--website"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{{ t('modal.visitWebsite') }}</span>
        </a>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.poi-detail-modal__media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.poi-detail-modal__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poi-detail-modal__category {
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

.poi-detail-modal__info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.poi-detail-modal__info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: #4b5563;
}

.poi-detail-modal__info-item svg {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  color: #10b981;
}

.poi-detail-modal__link {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}

.poi-detail-modal__link:hover {
  text-decoration: underline;
}

.poi-detail-modal__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.poi-detail-modal__description {
  margin-bottom: 1.5rem;
}

.poi-detail-modal__description p {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
}

/* Videos Section */
.poi-detail-modal__videos {
  margin-bottom: 1.5rem;
}

.poi-detail-modal__video-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.poi-detail-modal__video-item {
  display: flex;
  gap: 0.875rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: background 0.2s;
}

.poi-detail-modal__video-item:hover {
  background: #f3f4f6;
}

.poi-detail-modal__video-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #e5e7eb;
  flex-shrink: 0;
}

.poi-detail-modal__video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poi-detail-modal__video-thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.poi-detail-modal__video-thumbnail-placeholder svg {
  width: 24px;
  height: 24px;
}

.poi-detail-modal__video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 4px;
}

.poi-detail-modal__video-info {
  flex: 1;
  min-width: 0;
}

.poi-detail-modal__video-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poi-detail-modal__video-description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.poi-detail-modal__videos-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.poi-detail-modal__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.poi-detail-modal__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.poi-detail-modal__tag {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #6b7280;
}

.poi-detail-modal__actions {
  display: flex;
  gap: 0.5rem;
}

.poi-detail-modal__action {
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

.poi-detail-modal__action:hover {
  background: #e5e7eb;
}

.poi-detail-modal__action svg {
  width: 1.25rem;
  height: 1.25rem;
}

.poi-detail-modal__action--favorite:hover {
  background: #fee2e2;
  color: #dc2626;
}

.poi-detail-modal__action--favorite.poi-detail-modal__action--active {
  background: #fee2e2;
  color: #dc2626;
}

.poi-detail-modal__action--more {
  background: #3b82f6;
  color: #fff;
}

.poi-detail-modal__action--more:hover {
  background: #2563eb;
}

.poi-detail-modal__action--website {
  background: #10b981;
  color: #fff;
}

.poi-detail-modal__action--website:hover {
  background: #059669;
}

@media (max-width: 640px) {
  .poi-detail-modal__actions {
    flex-wrap: wrap;
  }

  .poi-detail-modal__action {
    min-width: calc(50% - 0.25rem);
  }

  .poi-detail-modal__video-item {
    flex-direction: column;
  }

  .poi-detail-modal__video-thumbnail {
    width: 100%;
    height: 140px;
  }
}
</style>
