<script setup lang="ts">
import type { Poi } from '~/types'

interface Props {
  poi: Poi | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()
const router = useRouter()

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes
}

// Navigate to POI page
function goToPoiPage() {
  if (!props.poi) return
  const slug = generateSlug(props.poi.name)
  router.push(`/poi/${props.poi.id}/${slug}`)
}

// Extract YouTube video ID from URL
const youtubeVideoId = computed(() => {
  if (!props.poi?.media?.youtube_url) return null
  const url = props.poi.media.youtube_url
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
  return match ? match[1] : null
})

// Get first hero image
const heroImage = computed(() => {
  return props.poi?.media?.images?.[0] || null
})
</script>

<template>
  <section class="hero-section">
    <div v-if="loading" class="hero-section__skeleton">
      <div class="hero-section__skeleton-media" />
      <div class="hero-section__skeleton-text" />
    </div>

    <template v-else-if="poi">
      <!-- YouTube Embed or Hero Image -->
      <div v-if="youtubeVideoId" class="hero-section__video">
        <iframe
          :src="`https://www.youtube.com/embed/${youtubeVideoId}`"
          :title="poi.name"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
      <div v-else-if="heroImage" class="hero-section__image">
        <img :src="heroImage" :alt="poi.name" loading="lazy">
      </div>

      <!-- POI Info -->
      <div class="hero-section__content">
        <h1 class="hero-section__title" @click="goToPoiPage">
          {{ poi.name }}
        </h1>
        <p v-if="poi.description" class="hero-section__description">
          {{ poi.description }}
        </p>

        <!-- Tags -->
        <div v-if="poi.tags?.length" class="hero-section__tags">
          <span
            v-for="tag in poi.tags"
            :key="tag"
            class="hero-section__tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </template>

    <div v-else class="hero-section__placeholder">
      <div class="hero-section__welcome">
        <h1 class="hero-section__region-title">{{ t('explorer.hero.region') }}</h1>
        <div class="hero-section__categories">
          <span class="hero-section__category-item">{{ t('explorer.hero.categories.entertainment') }}</span>
          <span class="hero-section__category-item">{{ t('explorer.hero.categories.culture') }}</span>
          <span class="hero-section__category-item">{{ t('explorer.hero.categories.nature') }}</span>
          <span class="hero-section__category-item">{{ t('explorer.hero.categories.history') }}</span>
        </div>
        <p class="hero-section__welcome-text">{{ t('explorer.hero.welcomeText') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background-image: url('/bplus-bg.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: #fff;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 70%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

.hero-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(249, 250, 251, 0.3) 0%, transparent 20%, transparent 80%, rgba(249, 250, 251, 0.3) 100%);
  pointer-events: none;
}

.hero-section__skeleton {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.hero-section__skeleton-media {
  aspect-ratio: 16 / 9;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.hero-section__skeleton-text {
  height: 1.5rem;
  width: 60%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.hero-section__video {
  aspect-ratio: 16 / 9;
  background: #000;
}

.hero-section__video iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.hero-section__image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.hero-section__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-section__content {
  padding: 1.5rem;
  position: relative;
}

.hero-section__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
  cursor: pointer;
  transition: opacity 0.2s;
}

.hero-section__title:hover {
  opacity: 0.8;
}

.hero-section__description {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-section__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-section__tag {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.875rem;
  backdrop-filter: blur(4px);
}

.hero-section__placeholder {
  padding: 3rem 1.5rem;
  text-align: center;
  position: relative;
}

.hero-section__welcome {
  position: relative;
  z-index: 1;
}

.hero-section__region-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.05em;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  line-height: 1.2;
}

.hero-section__categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 1rem;
  margin-bottom: 1.5rem;
}

.hero-section__category-item {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  position: relative;
}

.hero-section__category-item:not(:last-child)::after {
  content: '•';
  margin-left: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.hero-section__welcome-text {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@media (min-width: 640px) {
  .hero-section__region-title {
    font-size: 3rem;
  }

  .hero-section__category-item {
    font-size: 1.125rem;
  }

  .hero-section__welcome-text {
    font-size: 1.125rem;
  }
}

@media (max-width: 420px) {
  .hero-section__categories {
    gap: 0.25rem 0.75rem;
  }

  .hero-section__category-item {
    font-size: 0.875rem;
  }

  .hero-section__category-item:not(:last-child)::after {
    margin-left: 0.75rem;
  }
}
</style>
