import { apiClient } from "./client";
import type { ZrobieEvent, ZrobieEventsResponse } from "../types/zrobie-event";

export interface EventFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  site?: string;
  is_public?: boolean;
}

/**
 * Fetch events from Zrobie Jutro API with optional filters
 */
export const fetchEvents = async (filters?: EventFilters): Promise<ZrobieEvent[]> => {
  const params: Record<string, string | number | boolean> = {};

  if (filters?.search) {
    params.search = filters.search;
  }

  if (filters?.date_from) {
    params.date_from = filters.date_from;
  }

  if (filters?.date_to) {
    params.date_to = filters.date_to;
  }

  if (filters?.site) {
    params.site = filters.site;
  }

  if (filters?.is_public !== undefined) {
    params.is_public = filters.is_public;
  }

  const response = await apiClient.get<ZrobieEventsResponse>("/events", { params });

  // Handle both paginated and non-paginated responses
  if (response.data.events) {
    return response.data.events;
  }

  // If the API returns an array directly
  if (Array.isArray(response.data)) {
    return response.data as unknown as ZrobieEvent[];
  }

  return [];
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (id: number): Promise<ZrobieEvent> => {
  const response = await apiClient.get<ZrobieEvent>(`/events/${id}`);
  return response.data;
};

/**
 * Fetch a single event by UniqueID
 */
export const fetchEventByUniqueId = async (uniqueId: string): Promise<ZrobieEvent> => {
  const response = await apiClient.get<ZrobieEvent>(`/events/by-unique-id/${uniqueId}`);
  return response.data;
};
