/**
 * Types for the Zrobie Jutro API (content.zrobie.jutro.net)
 */

export interface ZrobieLocation {
  lng: number;
  lat: number;
}

export interface ZrobieSite {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  Name: string;
  Type: string;
  BaseURL: string;
  Enabled: boolean;
  ScrapeSchedule: string;
  LastScraped: string;
  LastNewContent: string;
  Status: string;
  LastError: string;
  Config: unknown;
  DefaultPublic: boolean;
  Source: string;
  Location: ZrobieLocation;
  LocationZoom: number;
}

export interface ZrobieEvent {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  UniqueID: string;
  SiteID: number;
  Site: ZrobieSite;
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
  Location: ZrobieLocation;
  ScrapedAt: string;
  RawData: unknown;
  IsPublic: boolean;
}

export interface ZrobieEventsResponse {
  currentPage: number;
  events: ZrobieEvent[];
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
