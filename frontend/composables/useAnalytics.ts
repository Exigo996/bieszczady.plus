import type { AnalyticsEvent, DeviceType, AnalyticsEventType } from '~/types'

let sessionId: string
let eventQueue: AnalyticsEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function getDeviceType(): DeviceType {
  if (import.meta.server) return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getOS(): string {
  if (import.meta.server) return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS')) return 'iOS'
  return 'Unknown'
}

function getBrowser(): string {
  if (import.meta.server) return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown'
}

export function useAnalytics() {
  const config = useRuntimeConfig()
  const userStore = useUserStore()

  if (!sessionId) {
    sessionId = generateSessionId()
  }

  async function flushQueue() {
    if (eventQueue.length === 0) return

    const eventsToSend = [...eventQueue]
    eventQueue = []

    try {
      await $fetch(`${config.public.apiBase}/analytics/batch`, {
        method: 'POST',
        body: { events: eventsToSend },
      })
    } catch (e) {
      // Re-queue on failure
      eventQueue = [...eventsToSend, ...eventQueue]
    }
  }

  function scheduleFlush() {
    if (import.meta.server) return
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(flushQueue, 5000) // Flush every 5 seconds
  }

  function track(eventType: AnalyticsEventType, data?: Record<string, unknown>) {
    if (import.meta.server) return

    const event: AnalyticsEvent = {
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      poi_id: userStore.currentPoiId || '',
      device_type: getDeviceType(),
      os: getOS(),
      browser: getBrowser(),
      language: userStore.language,
      event_type: eventType,
      data,
    }

    // Store in localStorage for offline support
    try {
      const stored = localStorage.getItem('analytics_queue')
      const queue = stored ? JSON.parse(stored) : []
      queue.push(event)
      localStorage.setItem('analytics_queue', JSON.stringify(queue.slice(-100))) // Keep last 100
    } catch {
      // Ignore localStorage errors
    }

    // Also add to in-memory queue for immediate sync
    eventQueue.push(event)
    scheduleFlush()
  }

  function pageView(page: string) {
    track('page_view', { page })
  }

  // Flush on page unload
  onBeforeUnmount(() => {
    if (flushTimer) clearTimeout(flushTimer)
    flushQueue()
  })

  return {
    track,
    pageView,
  }
}
