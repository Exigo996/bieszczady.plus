export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export type AnalyticsEventType =
  | 'page_view'
  | 'category_select'
  | 'filter_change'
  | 'event_view'
  | 'poi_view'
  | 'favorite_add'
  | 'favorite_remove'
  | 'calendar_add'
  | 'ticket_click'
  | 'newsletter_subscribe'
  | 'location_gps_enable'
  | 'location_reset'
  | 'location_map_click'
  | 'favorites_drawer_open'

export interface AnalyticsEvent {
  timestamp: string
  session_id: string
  poi_id: string

  // Device
  device_type: DeviceType
  os: string
  browser: string
  language: string

  // Actions
  event_type: AnalyticsEventType

  // Payload
  data?: Record<string, unknown>
}
