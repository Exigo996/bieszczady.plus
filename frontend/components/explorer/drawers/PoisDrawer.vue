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
  <div ref="drawerRef" class="pois-drawer">
    <div class="pois-drawer__content">
      <EventList
        :events="[]"
        :pois="pois"
        :selected-category="selectedCategory"
        @event-click="emit('eventClick', $event)"
        @poi-click="emit('poiClick', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.pois-drawer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  position: absolute;
  inset: 0;
}

.pois-drawer__content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.pois-drawer :deep(.event-list) {
  max-height: none;
  padding: 1rem;
  padding-bottom: 6rem;
}
</style>
