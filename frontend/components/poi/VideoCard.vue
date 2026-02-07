<script setup lang="ts">
import type { Video } from '~/types'

interface Props {
  video: Video
}

const props = defineProps<Props>()

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
</script>

<template>
  <a
    :href="video.videoUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="video-card"
  >
    <div class="video-card__thumbnail">
      <img
        v-if="video.thumbnailUrl"
        :src="video.thumbnailUrl"
        :alt="video.title"
        loading="lazy"
      />
      <div v-else class="video-card__thumbnail-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <div class="video-card__duration">
        {{ formatDuration(video.duration) }}
      </div>
    </div>
    <div class="video-card__info">
      <h4 class="video-card__title">{{ video.title }}</h4>
      <p v-if="video.description" class="video-card__description">
        {{ video.description.slice(0, 100) }}{{ video.description.length > 100 ? '...' : '' }}
      </p>
    </div>
  </a>
</template>

<style scoped>
.video-card {
  display: flex;
  gap: 0.875rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: background 0.2s;
}

.video-card:hover {
  background: #f3f4f6;
}

.video-card__thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #e5e7eb;
  flex-shrink: 0;
}

.video-card__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-card__thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.video-card__thumbnail-placeholder svg {
  width: 24px;
  height: 24px;
}

.video-card__duration {
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

.video-card__info {
  flex: 1;
  min-width: 0;
}

.video-card__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-card__description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .video-card {
    flex-direction: column;
  }

  .video-card__thumbnail {
    width: 100%;
    height: 140px;
  }
}
</style>
