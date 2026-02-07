import type { Location } from './event';

export interface Organizer {
  id: number;
  name: string;
  shortname?: string;
  slug?: string;
  description?: string;
  image?: string;
  logo?: string;
  facebook_link?: string;
  ticketing_site?: string;
  website?: string;
  is_active: boolean;
  events_count?: number;
  upcoming_events_count?: number;
  location?: Location | { city?: string; address?: string };
  created_at: string;
  updated_at: string;
}
