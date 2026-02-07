import type { Category, Location } from './poi'

export interface EventDatetime {
  start: string // ISO 8601
  end?: string
}

export interface EventPrice {
  amount: number
  currency: 'PLN'
  ticket_url?: string
}

export interface EventMedia {
  thumbnail: string
  images: string[]
}

export interface EventSource {
  type: 'facebook' | 'ticketing' | 'manual'
  url: string
}

export interface Event {
  id: string
  poiId?: string  // Reference to associated POI
  title: string
  description: string
  category: Category
  tags: string[]
  datetime: EventDatetime
  location: Location
  venue_name: string
  price?: EventPrice
  media: EventMedia
  source: EventSource
}
