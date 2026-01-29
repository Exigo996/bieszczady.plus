import { apiClient } from './client';
import type { Organizer } from '../types/organizer';
import type { Event } from '../types/event';

export interface OrganizerEventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

/**
 * Fetch a single organizer by slug
 */
export const fetchOrganizerBySlug = async (slug: string): Promise<Organizer> => {
  const response = await apiClient.get<Organizer>(`/organizers/${slug}/`);
  return response.data;
};

/**
 * Fetch events for a specific organizer by slug
 */
export const fetchOrganizerEvents = async (
  slug: string,
  filters?: Record<string, string | number>
): Promise<Event[]> => {
  const response = await apiClient.get<OrganizerEventsResponse>(`/organizers/${slug}/events/`, { params: filters });

  // Handle both paginated and non-paginated responses
  if (response.data.results) {
    return response.data.results;
  }

  if (Array.isArray(response.data)) {
    return response.data as unknown as Event[];
  }

  return [];
};

/**
 * Fetch a single organizer by ID
 */
export const fetchOrganizerById = async (id: number): Promise<Organizer> => {
  const response = await apiClient.get<Organizer>(`/organizers/${id}/`);
  return response.data;
};
