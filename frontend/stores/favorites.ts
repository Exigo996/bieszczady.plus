export const useFavoritesStore = defineStore(
  'favorites',
  () => {
    const events = ref<string[]>([])
    const pois = ref<string[]>([])

    function addEvent(id: string) {
      if (!events.value.includes(id)) {
        events.value.push(id)
        saveToStorage()
      }
    }

    function removeEvent(id: string) {
      events.value = events.value.filter(e => e !== id)
      saveToStorage()
    }

    function toggleEvent(id: string) {
      if (events.value.includes(id)) {
        removeEvent(id)
      } else {
        addEvent(id)
      }
    }

    function addPoi(id: string) {
      if (!pois.value.includes(id)) {
        pois.value.push(id)
        saveToStorage()
      }
    }

    function removePoi(id: string) {
      pois.value = pois.value.filter(p => p !== id)
      saveToStorage()
    }

    function togglePoi(id: string) {
      if (pois.value.includes(id)) {
        removePoi(id)
      } else {
        addPoi(id)
      }
    }

    function isEventFavorite(id: string): boolean {
      return events.value.includes(id)
    }

    function isPoiFavorite(id: string): boolean {
      return pois.value.includes(id)
    }

    function saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem(
          'favorites',
          JSON.stringify({ events: events.value, pois: pois.value }),
        )
      }
    }

    function loadFromStorage() {
      if (import.meta.client) {
        const stored = localStorage.getItem('favorites')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            events.value = data.events || []
            pois.value = data.pois || []
          } catch {
            // Ignore invalid storage
          }
        }
      }
    }

    // Load from storage on init (client-side only)
    if (import.meta.client) {
      loadFromStorage()
    }

    return {
      events,
      pois,
      addEvent,
      removeEvent,
      toggleEvent,
      addPoi,
      removePoi,
      togglePoi,
      isEventFavorite,
      isPoiFavorite,
    }
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot))
}
