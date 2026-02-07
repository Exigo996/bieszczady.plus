import type { Event, Poi, Category, Video } from '~/types'
import type { ApiEventsQuery, ApiListResponse, ApiEvent, ApiPoisQuery, ApiPOI, ApiVideosQuery, ApiVideo, GeoJSONPolygon } from '~/types/api'
import type { TransportMode } from './filters'

// Transport mode mapping: our values -> API values
const TRANSPORT_MODE_MAP: Record<TransportMode, 'auto' | 'pedestrian' | 'bicycle'> = {
  car: 'auto',
  bike: 'bicycle',
  walk: 'pedestrian',
}

// Transform image URL from API response
// If URL contains image-proxy, extract the actual URL (API already proxies)
// Otherwise, return as-is or prepend API base for relative paths
function transformImageUrl(imageUrl: string | null | undefined, apiBase: string): string {
  if (!imageUrl) return ''

  // If URL contains the image-proxy pattern, extract the actual URL
  const proxyMatch = imageUrl.match(/\/api\/v\d+\/image-proxy\?url=([^&]+)/)
  if (proxyMatch && proxyMatch[1]) {
    return decodeURIComponent(proxyMatch[1])
  }

  // If it's a relative path starting with /, prepend API base
  if (imageUrl.startsWith('/')) {
    return apiBase + imageUrl
  }

  // Already a full URL or empty, return as-is
  return imageUrl
}

// Transform API Event to our Event type
function transformApiEvent(apiEvent: ApiEvent, apiBase: string): Event {
  // Parse date/time
  const datetime = apiEvent.Date ? new Date(apiEvent.Date) : new Date()
  let startTime: string | undefined = undefined
  let endTime: string | undefined = undefined

  // Combine date with time if available
  if (apiEvent.Date && apiEvent.StartTime) {
    const [hours, minutes] = apiEvent.StartTime.split(':')
    const date = new Date(apiEvent.Date)
    date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'), 0, 0)
    startTime = date.toISOString()
  }

  if (apiEvent.Date && apiEvent.EndTime) {
    const [hours, minutes] = apiEvent.EndTime.split(':')
    const date = new Date(apiEvent.Date)
    date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'), 0, 0)
    endTime = date.toISOString()
  }

  // Infer category from POI type if available
  const category = inferCategory(apiEvent.POI?.POIType || 'culture')

  // Transform image URL
  const imageUrl = transformImageUrl(apiEvent.ImageURL, apiBase)

  return {
    id: String(apiEvent.ID),
    poiId: apiEvent.POIID ? String(apiEvent.POIID) : undefined,
    title: apiEvent.Title || '',
    description: apiEvent.Description || '',
    category,
    tags: [],
    datetime: {
      start: startTime || datetime.toISOString(),
      end: endTime,
    },
    location: {
      lat: apiEvent.POI?.Centroid?.lat || apiEvent.POI?.Point?.lat || 0,
      lng: apiEvent.POI?.Centroid?.lng || apiEvent.POI?.Point?.lng || 0,
      address: apiEvent.Venue || apiEvent.POI?.Name || '',
    },
    venue_name: apiEvent.Venue || apiEvent.POI?.Name || '',
    price: apiEvent.Price ? {
      amount: parseFloat(apiEvent.Price.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
      currency: 'PLN' as const,
    } : undefined,
    media: {
      thumbnail: imageUrl,
      images: imageUrl ? [imageUrl] : [],
    },
    source: {
      type: 'manual' as const,
      url: apiEvent.SourceURL || '',
    },
  }
}

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
    },
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

// Transform API Video to our Video type
function transformApiVideo(apiVideo: ApiVideo): Video {
  // Detect video type from URL
  let type: Video['source']['type'] = 'manual'
  if (apiVideo.VideoURL.includes('youtube.com') || apiVideo.VideoURL.includes('youtu.be')) {
    type = 'youtube'
  } else if (apiVideo.VideoURL.includes('vimeo.com')) {
    type = 'vimeo'
  } else if (apiVideo.VideoURL.includes('facebook.com') || apiVideo.VideoURL.includes('fb.watch')) {
    type = 'facebook'
  }

  return {
    id: String(apiVideo.ID),
    title: apiVideo.Title || '',
    description: apiVideo.Description || '',
    videoUrl: apiVideo.VideoURL,
    thumbnailUrl: apiVideo.ThumbnailURL || '',
    duration: apiVideo.Duration || 0,
    publishedAt: apiVideo.PublishedAt || apiVideo.ScrapedAt,
    source: {
      type,
      url: apiVideo.SourceURL,
    },
  }
}

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const pois = ref<Poi[]>([])
  const videos = ref<Video[]>([])
  const polygon = ref<GeoJSONPolygon | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEvents(params?: {
    poiId?: number | string
    lat?: number
    lng?: number
    radius?: number
    minutes?: number
    transport?: TransportMode
  }) {
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const queryParams: ApiEventsQuery = {}

      if (params?.poiId) {
        queryParams.poiId = typeof params.poiId === 'string' ? parseInt(params.poiId) : params.poiId
      }

      if (params?.lat && params?.lng) {
        queryParams.lat = params.lat
        queryParams.lng = params.lng
      }

      // Time-based search (isochrone)
      if (params?.minutes !== undefined) {
        queryParams.minutes = params.minutes
        if (params?.transport) {
          queryParams.mode = TRANSPORT_MODE_MAP[params.transport]
        }
      }
      // Distance-based search
      else if (params?.radius !== undefined) {
        queryParams.radius = params.radius // km for events
      }

      // Default sort by date
      queryParams.sort = 'date'
      queryParams.order = 'asc'

      const url = `${config.public.apiBase}/events${Object.keys(queryParams).length ? `?${new URLSearchParams(queryParams as any)}` : ''}`

      const response = await $fetch<ApiListResponse<ApiEvent>>(url)

      if (response?.data) {
        events.value = response.data.map(e => transformApiEvent(e, config.public.apiBase))
        // Store polygon if present (isochrone response)
        polygon.value = response.polygon || null
      } else {
        // Fallback for direct array response
        events.value = (response as any as ApiEvent[]).map(e => transformApiEvent(e, config.public.apiBase))
        polygon.value = null
      }

      return events.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch events'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchPois(params?: {
    lat?: number
    lng?: number
    radius?: number // we expect km, will convert to meters
    minutes?: number
    transport?: TransportMode
  }) {
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const queryParams: ApiPoisQuery = {}

      if (params?.lat && params?.lng) {
        queryParams.lat = params.lat
        queryParams.lng = params.lng
      }

      // Time-based search (isochrone)
      if (params?.minutes !== undefined) {
        queryParams.minutes = params.minutes
        if (params?.transport) {
          queryParams.mode = TRANSPORT_MODE_MAP[params.transport]
        }
      }
      // Distance-based search
      else if (params?.radius !== undefined) {
        queryParams.radius = params.radius * 1000 // convert km to meters
      }

      const url = `${config.public.apiBase}/pois${Object.keys(queryParams).length ? `?${new URLSearchParams(queryParams as any)}` : ''}`

      const response = await $fetch<ApiListResponse<ApiPOI>>(url)

      if (response?.data) {
        pois.value = response.data.map(transformApiPoi)
        // Store polygon if present (isochrone response) - only update if we're doing time-based search
        if (params?.minutes !== undefined) {
          polygon.value = response.polygon || null
        }
      } else {
        // Fallback for direct array response
        pois.value = (response as any as ApiPOI[]).map(transformApiPoi)
      }

      return pois.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch pois'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchVideos(params?: {
    poiId?: number | string
    lat?: number
    lng?: number
    radius?: number
    minutes?: number
    transport?: TransportMode
  }) {
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const queryParams: ApiVideosQuery = {}

      if (params?.poiId) {
        queryParams.poiId = typeof params.poiId === 'string' ? parseInt(params.poiId) : params.poiId
      }

      if (params?.lat && params?.lng) {
        queryParams.lat = params.lat
        queryParams.lng = params.lng
      }

      // Time-based search (isochrone)
      if (params?.minutes !== undefined) {
        queryParams.minutes = params.minutes
        if (params?.transport) {
          queryParams.mode = TRANSPORT_MODE_MAP[params.transport]
        }
      }
      // Distance-based search
      else if (params?.radius !== undefined) {
        queryParams.radius = params.radius
      }

      const url = `${config.public.apiBase}/videos${Object.keys(queryParams).length ? `?${new URLSearchParams(queryParams as any)}` : ''}`

      const response = await $fetch<ApiListResponse<ApiVideo>>(url)

      if (response?.data) {
        videos.value = response.data.map(transformApiVideo)
      } else {
        // Fallback for direct array response
        videos.value = (response as any as ApiVideo[]).map(transformApiVideo)
      }

      return videos.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch videos'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearEvents() {
    events.value = []
    polygon.value = null
    error.value = null
  }

  function clearPois() {
    pois.value = []
    error.value = null
  }

  function clearVideos() {
    videos.value = []
    error.value = null
  }

  function getEventById(id: string): Event | undefined {
    return events.value.find(e => e.id === id)
  }

  function getPoiById(id: string): Poi | undefined {
    return pois.value.find(p => p.id === id)
  }

  return {
    events,
    pois,
    videos,
    polygon,
    loading,
    error,
    fetchEvents,
    fetchPois,
    fetchVideos,
    clearEvents,
    clearPois,
    clearVideos,
    getEventById,
    getPoiById,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventsStore, import.meta.hot))
}
