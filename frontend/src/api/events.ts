import { apiClient } from "./client";
import type { Event, EventFilters } from "../types/event";

export interface EventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

/**
 * Fetch events from API with optional filters
 */
export const fetchEvents = async (filters?: EventFilters): Promise<Event[]> => {
  const params: Record<string, string | number> = {};

  if (filters?.category) {
    params.category = filters.category;
  }

  if (filters?.price_type) {
    params.price_type = filters.price_type;
  }

  if (filters?.search) {
    params.search = filters.search;
  }

  if (filters?.date_from) {
    params.date_from = filters.date_from;
  }

  if (filters?.date_to) {
    params.date_to = filters.date_to;
  }

  if (filters?.radius) {
    // params.radius = filters.radius;
  }

  const response = await apiClient.get<EventsResponse>("/events/", { params });

  // Handle both paginated and non-paginated responses
  if (response.data.results) {
    return response.data.results;
  }

  // If the API returns an array directly
  if (Array.isArray(response.data)) {
    return response.data as unknown as Event[];
  }

  return [];
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (id: number): Promise<Event> => {
  const response = await apiClient.get<Event>(`/events/${id}/`);
  return response.data;
};

/**
 * Fetch a single event by slug
 */
export const fetchEventBySlug = async (slug: string): Promise<Event> => {
  const response = await apiClient.get<Event>(`/events/${slug}/`);
  return response.data;
};
