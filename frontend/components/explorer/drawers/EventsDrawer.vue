<script setup lang="ts">
import type { Event, Poi, Category } from '~/types'

interface Props {
  events: Event[]
  pois: Poi[]
  selectedCategory?: Category | 'all'
}

withDefaults(defineProps<Props>(), {
  selectedCategory: 'all',
})

const emit = defineEmits<{
  eventClick: [event: Event]
  poiClick: [poi: Poi]
}>()

const drawerRef = ref<HTMLElement | null>(null)

// Expose drawer ref for parent to access
defineExpose({
  drawerRef,
})
</script>

<template>
  <div ref="drawerRef" class="events-drawer">
    <div class="events-drawer__content">
      <EventList
        :events="events"
        :pois="[]"
        :selected-category="selectedCategory"
        @event-click="emit('eventClick', $event)"
        @poi-click="emit('poiClick', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.events-drawer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  position: absolute;
  inset: 0;
}

.events-drawer__content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.events-drawer :deep(.event-list) {
  max-height: none;
  padding: 1rem;
  padding-bottom: 6rem;
}
</style>
