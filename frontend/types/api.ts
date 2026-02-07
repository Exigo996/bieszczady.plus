// API Types based on openapi.yaml
// The API returns PascalCase properties, we need to transform them

export interface ApiPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiListResponse<T> {
  data: T[]
  pagination: ApiPagination
  polygon?: GeoJSONPolygon
}

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][][]
}

export interface ApiEvent {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  UniqueID: string
  SiteID: number
  Site: ApiSiteEmbed
  SourceID: string
  SourceURL: string
  Title: string
  Description: string
  Date: string // YYYY-MM-DD
  StartTime?: string
  EndTime?: string
  Duration?: number // minutes
  ImageURL?: string
  Venue?: string
  Price?: string
  ScrapedAt: string
  IsPublic: boolean
  POIID?: number
  POI?: ApiPOI
  Distance?: number // km
}

export interface ApiVideo {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  UniqueID: string
  SiteID: number
  Site: ApiSiteEmbed
  SourceID: string
  SourceURL: string
  Title: string
  Description: string
  VideoURL: string
  ThumbnailURL: string
  Duration: number // seconds
  PublishedAt: string
  ScrapedAt: string
  IsPublic: boolean
  POIs: ApiPOI[]
}

export interface ApiPOI {
  ID: number
  Name: string
  POIType: string
  GeometryType: 'point' | 'linestring' | 'polygon'
  Description: string
  Point?: { lat: number; lng: number }
  Centroid?: { lat: number; lng: number }
  IsPublic: boolean
  IsVerified: boolean
  Source?: string
  Distance?: number // km
}

export interface ApiSiteEmbed {
  ID: number
  Name: string
  Type: string
  BaseURL: string
}

export interface ApiTag {
  ID: number
  Slug: string
  Name: string
  CategoryID: number
}

export interface ApiTagCategory {
  ID: number
  Slug: string
  Name: string
  SortOrder: number
  Tags: ApiTag[]
}

export interface ApiDataResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: string
  code: string
}

// API Query Parameters
export interface ApiEventsQuery {
  page?: number
  pageSize?: number
  poiId?: number
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  search?: string
  lat?: number
  lng?: number
  radius?: number // km
  minutes?: number // 1-120, for isochrone
  mode?: 'auto' | 'pedestrian' | 'bicycle' // for isochrone
  sort?: 'date' | 'title' | 'created_at' | 'scraped_at' | 'distance'
  order?: 'asc' | 'desc'
}

export interface ApiPoisQuery {
  page?: number
  pageSize?: number
  poiType?: string
  geometryType?: 'point' | 'linestring' | 'polygon'
  tags?: string // comma-separated slugs
  search?: string
  lat?: number
  lng?: number
  radius?: number // meters
  minutes?: number // 1-120, for isochrone
  mode?: 'auto' | 'pedestrian' | 'bicycle' // for isochrone
}

export interface ApiVideosQuery {
  page?: number
  pageSize?: number
  poiId?: number
  search?: string
  lat?: number
  lng?: number
  radius?: number // km
  minutes?: number // 1-120, for isochrone
  mode?: 'auto' | 'pedestrian' | 'bicycle' // for isochrone
  sort?: 'title' | 'created_at' | 'scraped_at' | 'duration' | 'distance'
  order?: 'asc' | 'desc'
}
