import type { Organizer } from './organizer';

export type EventCategory =
  | 'CONCERT'
  | 'FESTIVAL'
  | 'THEATRE'
  | 'CINEMA'
  | 'WORKSHOP'
  | 'FOOD'
  | 'CULTURAL';

export type EventType = 'EVENT' | 'PRODUCT' | 'WORKSHOP';

export type PriceType = 'FREE' | 'PAID';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LocationType = 'VENUE' | 'OUTDOOR' | 'PRIVATE' | 'VIRTUAL';

export interface Location {
  id?: number;
  name: string;
  shortname?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  website?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  location_type?: LocationType;
  amenities?: string[];
  description?: string;
  is_active?: boolean;
  // Computed/helper fields
  coordinates?: [number, number] | { lat: number; lng: number };
  distance?: number;
}

export interface EventImage {
  id: number;
  url: string;
  title: string;
  is_main: boolean;
  order: number;
}

export interface EventDate {
  id: number;
  start_date: string;
  end_date?: string | null;
  duration_minutes?: number | null;
  notes?: string;
  is_past?: boolean;
  location?: Location | null;
  created_at: string;
  updated_at: string;
}

export interface BaseEvent {
  id: number;
  title: {
    pl: string;
    en: string;
    uk: string;
  };
  slug: string;
  category: EventCategory;
  event_type: EventType;
  start_date: string;
  end_date?: string | null;
  duration_minutes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  price_type: PriceType;
  price_amount?: number | null;
  currency: string;
  price_currency?: string; // Alias for currency
  age_restriction?: number | null;
  external_url?: string;
  ticket_url?: string;
  image?: string | null; // Main image URL (convenience field)
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventList extends BaseEvent {
  // Fields from EventListSerializer
  location_name?: string | null;
  location_city?: string | null;
  location?: Location | null; // Full location object (may be included)
  image?: string | null;  // Main image URL
  description?: {
    pl: string;
    en: string;
    uk: string;
  };
}

export interface Event extends BaseEvent {
  // Fields from EventSerializer (detail view)
  description: {
    pl: string;
    en: string;
    uk: string;
  };
  location?: Location | null;
  organizer?: Organizer | null;
  images?: EventImage[];
  event_dates?: EventDate[];
  source: string;
  moderation_status: ModerationStatus;
  facebook_event_id?: string | null;
  is_past?: boolean;
}

export interface EventFilters {
  category?: EventCategory;
  event_type?: EventType;
  price_type?: PriceType;
  radius?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
