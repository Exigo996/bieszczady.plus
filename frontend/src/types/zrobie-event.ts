/**
 * Types for the Zrobie Jutro API (content.zrobie.jutro.net)
 * Based on OpenAPI spec v1.0.0
 */

export interface ZrobieLocation {
  lng: number;
  lat: number;
}

export interface SiteEmbed {
  ID: number;
  Name: string;
  Type: string;
  BaseURL: string;
}

export interface POIEmbed {
  ID: number;
  Name: string;
  POIType: string;
  GeometryType: "point" | "linestring" | "polygon";
  Description: string;
  Point: { lat: number; lng: number };
  Centroid: { lat: number; lng: number };
  IsPublic: boolean;
  IsVerified: boolean;
  Source: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ZrobieEvent {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  UniqueID: string;
  SiteID: number;
  Site: SiteEmbed;
  SourceID: string;
  SourceURL: string;
  Title: string;
  Description: string;
  Date: string; // YYYY-MM-DD
  StartTime: string; // HH:MM format
  EndTime: string; // HH:MM format
  Duration: number; // in minutes
  ImageURL: string;
  Venue: string;
  Price: string; // e.g. "20,00 zł" or empty
  ScrapedAt: string;
  IsPublic: boolean;
  POIID?: number;
  POI?: POIEmbed;
  Distance?: number; // Distance from origin in km (when lat/lng provided)
}

export interface ZrobieEventsResponse {
  data: ZrobieEvent[];
  pagination: Pagination;
  polygon?: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

/**
 * Helper to get combined datetime from Date + StartTime
 */
export const getEventDateTime = (event: ZrobieEvent): Date | null => {
  if (!event.Date || !event.StartTime) return null;
  return new Date(`${event.Date}T${event.StartTime}`);
};

/**
 * Helper to parse price string to numeric value (for sorting/filtering)
 */
export const parsePrice = (priceString: string): number | null => {
  if (!priceString) return null;
  // Remove non-numeric chars except decimal separator
  const normalized = priceString.replace(/\s/g, '').replace(',', '.');
  const match = normalized.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
};

/**
 * Helper to check if event is free
 */
export const isEventFree = (event: ZrobieEvent): boolean => {
  if (!event.Price) return true;
  const price = parsePrice(event.Price);
  return price === null || price === 0;
};

/**
 * Helper to get currency from price string
 */
export const getCurrency = (priceString: string): string => {
  if (!priceString) return 'PLN';
  if (priceString.includes('zł') || priceString.includes('PLN')) return 'PLN';
  if (priceString.includes('€') || priceString.includes('EUR')) return 'EUR';
  if (priceString.includes('$') || priceString.includes('USD')) return 'USD';
  return 'PLN';
};
