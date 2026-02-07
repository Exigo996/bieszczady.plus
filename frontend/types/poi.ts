export type Category = 'culture' | 'nature' | 'sport' | 'history'

export interface Location {
  lat: number
  lng: number
  address: string
}

export interface PoiMedia {
  images: string[]
  youtube_url?: string
}

export interface PoiContact {
  phone?: string
  email?: string
  website?: string
}

export interface Poi {
  id: string
  name: string
  description: string
  category: Category
  tags: string[]
  location: Location
  media: PoiMedia
  contact?: PoiContact
}
