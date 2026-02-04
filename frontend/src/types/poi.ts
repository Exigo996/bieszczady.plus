/**
 * Types for POI (Point of Interest) API from content.zrobie.jutro.net
 */

export interface POIPoint {
  lat: number;
  lng: number;
}

export interface POIPolygon {
  type: "Polygon";
  coordinates: number[][][]; // Array of [lng, lat] pairs forming polygon rings
}

export interface POIPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface POI {
  ID: number;
  Name: string;
  POIType: string;
  GeometryType: "point" | "linestring" | "polygon";
  Description: string;
  Point?: POIPoint | null;
  Centroid?: POIPoint | null;
  IsPublic: boolean;
  IsVerified: boolean;
  Source: string;
  // Optional polygon data (may only be present in detail view)
  polygon?: POIPolygon;
  // Optional distance from search origin (when lat/lng params provided)
  Distance?: number;
}

export interface POIsResponse {
  data: POI[];
  pagination: POIPagination;
  polygon?: POIPolygon;
}

/**
 * Helper to check if POI has a polygon
 */
export const hasPolygon = (poi: POI): boolean => {
  return poi.GeometryType === "polygon" && !!poi.polygon;
};

/**
 * Helper to get coordinates for Leaflet (expects [lat, lng])
 * Handles optional Point and falls back to Centroid
 */
export const getLeafletPosition = (point?: POIPoint | null, centroid?: POIPoint | null): [number, number] => {
  const validPoint = point || centroid;
  if (!validPoint) {
    // Default to Bieszczady center if no coordinates available
    return [49.35, 22.5];
  }
  return [validPoint.lat, validPoint.lng];
};

/**
 * Helper to convert GeoJSON-style [lng, lat] to Leaflet [lat, lng]
 */
export const toLeafletCoords = (coords: number[][]): [number, number][] => {
  return coords.map(([lng, lat]) => [lat, lng]);
};
