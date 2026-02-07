import type { Event, Poi } from '~/types'

export function useFavorites() {
  const favoritesStore = useFavoritesStore()
  const { track } = useAnalytics()

  function toggleEvent(event: Event) {
    favoritesStore.toggleEvent(event.id)
    track(
      favoritesStore.isEventFavorite(event.id) ? 'favorite_add' : 'favorite_remove',
      { type: 'event', id: event.id, title: event.title },
    )
  }

  function togglePoi(poi: Poi) {
    favoritesStore.togglePoi(poi.id)
    track(
      favoritesStore.isPoiFavorite(poi.id) ? 'favorite_add' : 'favorite_remove',
      { type: 'poi', id: poi.id, name: poi.name },
    )
  }

  return {
    events: computed(() => favoritesStore.events),
    pois: computed(() => favoritesStore.pois),
    isEventFavorite: favoritesStore.isEventFavorite,
    isPoiFavorite: favoritesStore.isPoiFavorite,
    toggleEvent,
    togglePoi,
  }
}
