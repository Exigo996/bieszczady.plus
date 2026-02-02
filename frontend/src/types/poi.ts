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
  GeometryType: "point" | "polygon";
  Description: string;
  Point: POIPoint;
  Centroid: POIPoint;
  IsPublic: boolean;
  IsVerified: boolean;
  Source: string;
  // Optional polygon data (may only be present in detail view)
  polygon?: POIPolygon;
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
 */
export const getLeafletPosition = (point: POIPoint): [number, number] => {
  return [point.lat, point.lng];
};

/**
 * Helper to convert GeoJSON-style [lng, lat] to Leaflet [lat, lng]
 */
export const toLeafletCoords = (coords: number[][]): [number, number][] => {
  return coords.map(([lng, lat]) => [lat, lng]);
};
