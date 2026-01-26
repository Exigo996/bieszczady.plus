import { apiClient } from './client';
import type { Organizer } from '../types/organizer';

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
): Promise<any[]> => {
  const response = await apiClient.get<any>(`/organizers/${slug}/events/`, { params: filters });

  // Handle both paginated and non-paginated responses
  if (response.data.results) {
    return response.data.results;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};
