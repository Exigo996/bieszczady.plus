<script setup lang="ts">
import type { Event, Poi } from '~/types'

interface Props {
  item: Event | Poi
  type: 'event' | 'poi'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  toggle: []
}>()

const { isEventFavorite, isPoiFavorite, toggleEvent, togglePoi } = useFavorites()

const isFavorite = computed(() =>
  props.type === 'event'
    ? isEventFavorite((props.item as Event).id)
    : isPoiFavorite((props.item as Poi).id),
)

const sizes = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

function handleToggle() {
  if (props.type === 'event') {
    toggleEvent(props.item as Event)
  } else {
    togglePoi(props.item as Poi)
  }
  emit('toggle')
}
</script>

<template>
  <button
    :class="[
      'flex items-center justify-center rounded-full transition-all active:scale-95',
      sizes[size],
      isFavorite
        ? 'bg-red-500 text-white'
        : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-400',
    ]"
    @click="handleToggle"
  >
    <svg
      class="h-5 w-5"
      :class="{ 'fill-current': isFavorite }"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </button>
</template>
