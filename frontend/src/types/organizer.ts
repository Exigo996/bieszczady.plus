export interface OrganizerLocation {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Organizer {
  id: number;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  location?: OrganizerLocation;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  facebook_page?: string;
  is_verified_partner?: boolean;
  created_at: string;
  updated_at: string;
}
