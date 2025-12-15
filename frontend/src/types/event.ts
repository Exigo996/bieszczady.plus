export type EventCategory =
  | 'CONCERT'
  | 'FESTIVAL'
  | 'THEATRE'
  | 'CINEMA'
  | 'WORKSHOP'
  | 'FOOD'
  | 'CULTURAL'
  | 'OTHER';

export type EventType = 'EVENT' | 'PRODUCT' | 'WORKSHOP';

export type PriceType = 'FREE' | 'PAID';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Location {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

export interface Event {
  id: number;
  title: {
    pl: string;
    en?: string;
    uk?: string;
  };
  description: {
    pl: string;
    en?: string;
    uk?: string;
  };
  slug: string;
  category: EventCategory;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  duration_minutes?: number;
  location: Location;
  price_type: PriceType;
  price_amount?: number;
  price_currency: string;
  age_restriction?: number;
  organizer_name?: string;
  organizer_contact?: string;
  external_url?: string;
  ticket_url?: string;
  image?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  category?: EventCategory;
  event_type?: EventType;
  price_type?: PriceType;
  radius?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}
