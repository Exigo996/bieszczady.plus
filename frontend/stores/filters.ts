import type { Category } from '~/types'

export type TransportMode = 'car' | 'bike' | 'walk'
export type SearchMode = 'time' | 'distance'

export const useFiltersStore = defineStore('filters', () => {
  const category = ref<Category>('culture')
  const transport = ref<TransportMode>('car')
  const timeMinutes = ref(30)
  const radiusKm = ref(30)
  const searchMode = ref<SearchMode>('time')
  const location = ref<{
    lat: number
    lng: number
    source: 'gps' | 'manual' | 'search'
  } | null>(null)

  function setCategory(cat: Category) {
    category.value = cat
  }

  function setTransport(mode: TransportMode) {
    transport.value = mode
  }

  function setTimeMinutes(minutes: number) {
    timeMinutes.value = Math.min(120, Math.max(15, minutes))
  }

  function setRadiusKm(km: number) {
    radiusKm.value = Math.min(200, Math.max(5, km))
  }

  function setSearchMode(mode: SearchMode) {
    searchMode.value = mode
  }

  function toggleSearchMode() {
    searchMode.value = searchMode.value === 'time' ? 'distance' : 'time'
  }

  function setLocation(loc: typeof location.value) {
    location.value = loc
  }

  function resetLocation() {
    location.value = null
  }

  return {
    category,
    transport,
    timeMinutes,
    radiusKm,
    searchMode,
    location,
    setCategory,
    setTransport,
    setTimeMinutes,
    setRadiusKm,
    setSearchMode,
    toggleSearchMode,
    setLocation,
    resetLocation,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFiltersStore, import.meta.hot))
}
