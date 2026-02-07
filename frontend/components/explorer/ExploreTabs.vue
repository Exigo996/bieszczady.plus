<script setup lang="ts">
type TabId = 'map' | 'events' | 'pois' | 'favorites'

interface Tab {
  id: TabId
  icon: string
  label: string
}

interface Props {
  eventsCount?: number
  poisCount?: number
  favoritesCount?: number
}

withDefaults(defineProps<Props>(), {
  eventsCount: 0,
  poisCount: 0,
  favoritesCount: 0,
})

const emit = defineEmits<{
  'update:activeTab': [tab: TabId]
}>()

const { t } = useI18n()

const activeTab = ref<TabId>('map')

const tabs = computed<Tab[]>(() => [
  {
    id: 'map',
    icon: 'map',
    label: t('explorer.tabs.map'),
  },
  {
    id: 'events',
    icon: 'calendar',
    label: t('explorer.tabs.events'),
  },
  {
    id: 'pois',
    icon: 'location',
    label: t('explorer.tabs.pois'),
  },
  {
    id: 'favorites',
    icon: 'heart',
    label: t('explorer.tabs.favorites'),
  },
])

function setTab(tabId: TabId) {
  activeTab.value = tabId
  emit('update:activeTab', tabId)
}

// Expose activeTab for parent component
defineExpose({
  activeTab,
})
</script>

<template>
  <div class="explore-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="explore-tabs__tab"
      :class="{ 'explore-tabs__tab--active': activeTab === tab.id }"
      @click="setTab(tab.id)"
    >
      <span class="explore-tabs__icon">
        <!-- Map icon -->
        <svg
          v-if="tab.icon === 'map'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>

        <!-- Calendar icon -->
        <svg
          v-else-if="tab.icon === 'calendar'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <!-- Location icon -->
        <svg
          v-else-if="tab.icon === 'location'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        <!-- Heart icon -->
        <svg
          v-else-if="tab.icon === 'heart'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </span>

      <span class="explore-tabs__label">{{ tab.label }}</span>

      <!-- Count badge for Events tab -->
      <span
        v-if="tab.id === 'events' && eventsCount > 0"
        class="explore-tabs__badge"
      >
        {{ eventsCount }}
      </span>

      <!-- Count badge for POIs tab -->
      <span
        v-if="tab.id === 'pois' && poisCount > 0"
        class="explore-tabs__badge"
      >
        {{ poisCount }}
      </span>

      <!-- Count badge for Favorites tab -->
      <span
        v-if="tab.id === 'favorites' && favoritesCount > 0"
        class="explore-tabs__badge"
      >
        {{ favoritesCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.explore-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.explore-tabs__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.625rem 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  position: relative;
}

.explore-tabs__tab:hover {
  background: #f9fafb;
}

.explore-tabs__tab--active {
  color: #10b981;
}

.explore-tabs__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.explore-tabs__icon svg {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.2s ease;
}

.explore-tabs__tab--active .explore-tabs__icon svg {
  transform: scale(1.1);
}

.explore-tabs__label {
  font-size: 0.75rem;
  font-weight: 500;
}

.explore-tabs__badge {
  position: absolute;
  top: 0.375rem;
  right: calc(50% - 1.5rem);
  min-width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  background: #ef4444;
  color: #fff;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 9999px;
  line-height: 1;
}

.explore-tabs__tab--active .explore-tabs__badge {
  background: #10b981;
}
</style>
