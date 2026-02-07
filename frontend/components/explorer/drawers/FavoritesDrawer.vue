<script setup lang="ts">
import type { Event, Poi } from '~/types'

interface Props {
  events: Event[]
  pois: Poi[]
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  pois: () => [],
})

const emit = defineEmits<{
  eventClick: [event: Event]
  poiClick: [poi: Poi]
}>()

const { t } = useI18n()
const favoritesStore = useFavoritesStore()

// Get favorite items
const favoriteEvents = computed(() => {
  return props.events.filter((e: Event) => favoritesStore.isEventFavorite(e.id))
})

const favoritePois = computed(() => {
  return props.pois.filter((p: Poi) => favoritesStore.isPoiFavorite(p.id))
})

const favoritesCount = computed(() => favoriteEvents.value.length + favoritePois.value.length)

const hasFavorites = computed(() => favoritesCount.value > 0)

// Newsletter form
const newsletterEmail = ref('')
const newsletterSubmitting = ref(false)
const newsletterSuccess = ref(false)

async function submitNewsletter() {
  if (!newsletterEmail.value) return

  newsletterSubmitting.value = true

  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBase}/newsletter/subscribe`, {
      method: 'POST',
      body: { email: newsletterEmail.value },
    })
    newsletterSuccess.value = true
    newsletterEmail.value = ''

    // Reset success message after 3 seconds
    setTimeout(() => {
      newsletterSuccess.value = false
    }, 3000)
  } catch (e) {
    // Show error or ignore
    console.error('Newsletter subscription failed', e)
  } finally {
    newsletterSubmitting.value = false
  }
}

function removeEventFavorite(event: Event) {
  favoritesStore.toggleEvent(event.id)
}

function removePoiFavorite(poi: Poi) {
  favoritesStore.togglePoi(poi.id)
}

const drawerRef = ref<HTMLElement | null>(null)

// Expose drawer ref for parent to access
defineExpose({
  drawerRef,
})
</script>

<template>
  <div ref="drawerRef" class="favorites-drawer">
    <div class="favorites-drawer__content">
      <!-- Empty State -->
      <div v-if="!hasFavorites" class="favorites-drawer__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <h3>{{ t('favorites.title') }}</h3>
        <p>{{ t('favorites.empty') }}</p>
      </div>

      <template v-else>
        <!-- Events Section -->
        <div v-if="favoriteEvents.length > 0" class="favorites-drawer__section">
          <h2 class="favorites-drawer__section-title">
            {{ t('favorites.events') }} ({{ favoriteEvents.length }})
          </h2>
          <div class="favorites-drawer__items">
            <div
              v-for="event in favoriteEvents"
              :key="`fav-event-${event.id}`"
              class="favorites-drawer__item"
              @click="emit('eventClick', event)"
            >
              <img
                :src="event.media.thumbnail"
                :alt="event.title"
                class="favorites-drawer__item-image"
              >
              <div class="favorites-drawer__item-content">
                <span class="favorites-drawer__item-title">{{ event.title }}</span>
                <span class="favorites-drawer__item-date">
                  {{ new Date(event.datetime.start).toLocaleDateString() }}
                </span>
              </div>
              <button
                class="favorites-drawer__item-remove"
                @click.stop="removeEventFavorite(event)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- POIs Section -->
        <div v-if="favoritePois.length > 0" class="favorites-drawer__section">
          <h2 class="favorites-drawer__section-title">
            {{ t('favorites.pois') }} ({{ favoritePois.length }})
          </h2>
          <div class="favorites-drawer__items">
            <div
              v-for="poi in favoritePois"
              :key="`fav-poi-${poi.id}`"
              class="favorites-drawer__item"
              @click="emit('poiClick', poi)"
            >
              <img
                v-if="poi.media.images[0]"
                :src="poi.media.images[0]"
                :alt="poi.name"
                class="favorites-drawer__item-image"
              >
              <div v-else class="favorites-drawer__item-image favorites-drawer__item-image--placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div class="favorites-drawer__item-content">
                <span class="favorites-drawer__item-title">{{ poi.name }}</span>
                <span class="favorites-drawer__item-address">{{ poi.location.address }}</span>
              </div>
              <button
                class="favorites-drawer__item-remove"
                @click.stop="removePoiFavorite(poi)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Newsletter Section -->
        <div class="favorites-drawer__newsletter">
          <h3 class="favorites-drawer__newsletter-title">
            {{ t('newsletter.title') }}
          </h3>
          <form
            class="favorites-drawer__newsletter-form"
            @submit.prevent="submitNewsletter"
          >
            <input
              v-model="newsletterEmail"
              type="email"
              :placeholder="t('newsletter.placeholder')"
              class="favorites-drawer__newsletter-input"
              required
            >
            <button
              type="submit"
              class="favorites-drawer__newsletter-submit"
              :disabled="newsletterSubmitting"
            >
              <span v-if="newsletterSuccess">✓</span>
              <template v-else>{{ t('newsletter.submit') }}</template>
            </button>
          </form>
          <p v-if="newsletterSuccess" class="favorites-drawer__newsletter-success">
            {{ t('newsletter.success') }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.favorites-drawer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  position: absolute;
  inset: 0;
}

.favorites-drawer__content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem;
  padding-bottom: 6rem;
}

.favorites-drawer__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #9ca3af;
  min-height: 50vh;
}

.favorites-drawer__empty svg {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.favorites-drawer__empty h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.favorites-drawer__empty p {
  font-size: 0.875rem;
  margin: 0;
}

.favorites-drawer__section {
  margin-bottom: 2rem;
}

.favorites-drawer__section:last-of-type {
  margin-bottom: 0;
}

.favorites-drawer__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.favorites-drawer__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.favorites-drawer__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.favorites-drawer__item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.favorites-drawer__item-image {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
}

.favorites-drawer__item-image--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
}

.favorites-drawer__item-image--placeholder svg {
  width: 1.5rem;
  height: 1.5rem;
}

.favorites-drawer__item-content {
  flex: 1;
  min-width: 0;
}

.favorites-drawer__item-title {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.favorites-drawer__item-date,
.favorites-drawer__item-address {
  display: block;
  font-size: 0.8125rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorites-drawer__item-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.favorites-drawer__item-remove:hover {
  background: #fee2e2;
  color: #ef4444;
}

.favorites-drawer__item-remove svg {
  width: 1.125rem;
  height: 1.125rem;
}

.favorites-drawer__newsletter {
  margin-top: 2rem;
  padding: 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.favorites-drawer__newsletter-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.favorites-drawer__newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.favorites-drawer__newsletter-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.favorites-drawer__newsletter-input:focus {
  border-color: #10b981;
}

.favorites-drawer__newsletter-submit {
  padding: 0.625rem 1rem;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.favorites-drawer__newsletter-submit:hover:not(:disabled) {
  background: #059669;
}

.favorites-drawer__newsletter-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.favorites-drawer__newsletter-success {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #10b981;
}
</style>
