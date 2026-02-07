export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const position = ref<{ lat: number; lng: number } | null>(null)

  async function getCurrentPosition(options?: GeolocationOptions) {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported'
      return null
    }

    loading.value = true
    error.value = null

    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          position.value = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }
          loading.value = false
          resolve(position.value)
        },
        (err) => {
          error.value = err.message
          loading.value = false
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        },
      )
    })
  }

  function clearPosition() {
    position.value = null
    error.value = null
  }

  return {
    loading,
    error,
    position,
    getCurrentPosition,
    clearPosition,
  }
}
