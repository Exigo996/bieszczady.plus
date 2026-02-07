import type { Poi, Category } from '~/types'
import type { ApiPOI, ApiDataResponse } from '~/types/api'

// Transform API POI to our Poi type
function transformApiPoi(apiPoi: ApiPOI): Poi {
  const category = inferCategory(apiPoi.POIType || 'culture')

  return {
    id: String(apiPoi.ID),
    name: apiPoi.Name || '',
    description: apiPoi.Description || '',
    category,
    tags: [],
    location: {
      lat: apiPoi.Centroid?.lat || apiPoi.Point?.lat || 0,
      lng: apiPoi.Centroid?.lng || apiPoi.Point?.lng || 0,
      address: '', // API doesn't provide address
    },
    media: {
      images: [], // API doesn't provide images
      youtube_url: undefined,
    },
    contact: undefined,
  }
}

// Helper to infer category from POI type
function inferCategory(poiType: string): Category {
  const type = poiType.toLowerCase()
  if (type.includes('kultu')) return 'culture'
  if (type.includes('natur')) return 'nature'
  if (type.includes('sport')) return 'sport'
  if (type.includes('hist')) return 'history'
  return 'culture'
}

export const usePoiStore = defineStore('poi', () => {
  const currentPoi = ref<Poi | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPoi(id: string) {
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const response = await $fetch<ApiDataResponse<ApiPOI>>(`${config.public.apiBase}/pois/${id}`)

      // Handle both wrapped and direct responses
      const apiPoi = response?.data || (response as any as ApiPOI)
      currentPoi.value = transformApiPoi(apiPoi)

      return currentPoi.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch POI'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearPoi() {
    currentPoi.value = null
    error.value = null
  }

  return {
    currentPoi,
    loading,
    error,
    fetchPoi,
    clearPoi,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePoiStore, import.meta.hot))
}
