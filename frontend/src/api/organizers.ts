import { apiClient } from './client';
import type { Organizer } from '../types/organizer';
import type { ZrobieEvent } from '../types/zrobie-event';

export interface OrganizerEventsResponse {
  events: ZrobieEvent[];
}

/**
 * Fetch a single organizer by slug
 * Note: This may not be available in the new API
 */
export const fetchOrganizerBySlug = async (slug: string): Promise<Organizer> => {
  const response = await apiClient.get<Organizer>(`/organizers/${slug}/`);
  return response.data;
};

/**
 * Fetch events for a specific organizer by slug
 * Note: This may not be available in the new API
 */
export const fetchOrganizerEvents = async (
  slug: string,
  filters?: Record<string, string | number>
): Promise<ZrobieEvent[]> => {
  const response = await apiClient.get<OrganizerEventsResponse>(`/organizers/${slug}/events/`, { params: filters });

  // Handle both paginated and non-paginated responses
  if (response.data.events) {
    return response.data.events;
  }

  if (Array.isArray(response.data)) {
    return response.data as unknown as ZrobieEvent[];
  }

  return [];
};

/**
 * Fetch a single organizer by ID
 * Note: This may not be available in the new API
 */
export const fetchOrganizerById = async (id: number): Promise<Organizer> => {
  const response = await apiClient.get<Organizer>(`/organizers/${id}/`);
  return response.data;
};
