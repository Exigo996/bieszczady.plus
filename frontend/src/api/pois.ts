import { apiClient } from "./client";
import type { POI, POIsResponse } from "../types/poi";

/**
 * Fetch all POIs with optional filters
 */
export const fetchPOIs = async (
  filters?: Record<string, string | number>
): Promise<POIsResponse> => {
  const response = await apiClient.get<POIsResponse>("/pois", { params: filters });
  return response.data;
};

/**
 * Fetch a single POI by ID
 */
export const fetchPOIById = async (id: number | string): Promise<POI> => {
  const response = await apiClient.get<{ data: POI }>(`/pois/${id}`);
  return response.data.data;
};

/**
 * Fetch POIs by type
 */
export const fetchPOIsByType = async (type: string): Promise<POI[]> => {
  const response = await fetchPOIs({ POIType: type });
  return response.data;
};

/**
 * Get unique POI types from a list of POIs
 */
export const getUniquePOITypes = (pois: POI[]): string[] => {
  const types = new Set(pois.map((poi) => poi.POIType));
  return Array.from(types).sort();
};
