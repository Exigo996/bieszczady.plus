import { apiClient } from "./client";
import type { ZrobieEvent, ZrobieEventsResponse } from "../types/zrobie-event";

export interface EventFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  poiId?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  minutes?: number;
  mode?: "auto" | "pedestrian" | "bicycle";
  sort?: "date" | "title" | "created_at" | "scraped_at" | "distance";
  order?: "asc" | "desc";
}

/**
 * Fetch events from Zrobie Jutro API with optional filters
 */
export const fetchEvents = async (filters?: EventFilters): Promise<ZrobieEvent[]> => {
  const params: Record<string, string | number> = {};

  if (filters?.search) {
    params.search = filters.search;
  }

  if (filters?.dateFrom) {
    params.dateFrom = filters.dateFrom;
  }

  if (filters?.dateTo) {
    params.dateTo = filters.dateTo;
  }

  if (filters?.poiId) {
    params.poiId = filters.poiId;
  }

  if (filters?.lat) {
    params.lat = filters.lat;
  }

  if (filters?.lng) {
    params.lng = filters.lng;
  }

  if (filters?.radius) {
    params.radius = filters.radius;
  }

  if (filters?.minutes) {
    params.minutes = filters.minutes;
  }

  if (filters?.mode) {
    params.mode = filters.mode;
  }

  if (filters?.sort) {
    params.sort = filters.sort;
  }

  if (filters?.order) {
    params.order = filters.order;
  }

  const response = await apiClient.get<ZrobieEventsResponse>("/events", { params });
  return response.data.data;
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (id: number): Promise<{ data: ZrobieEvent }> => {
  const response = await apiClient.get<{ data: ZrobieEvent }>(`/events/${id}`);
  return response.data;
};
