import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import { fetchPOIById } from "../api/pois";
import type { POI } from "../types/poi";
import { toLeafletCoords, getLeafletPosition } from "../types/poi";
import "leaflet/dist/leaflet.css";

const POIDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch POI by ID
  const {
    data: poi,
    isLoading,
    isError,
  } = useQuery<POI>({
    queryKey: ["poi", id],
    queryFn: () => fetchPOIById(id!),
    enabled: !!id,
  });

  // Get color for POI type
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      "producent": "#22c55e",
      "punkt": "#3b82f6",
      "atrakcja": "#f97316",
      "nocleg": "#9333ea",
      "jedzenie": "#ef4444",
    };
    return colors[type.toLowerCase()] || "#6b7280";
  };

  // Custom marker icon
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: "custom-poi-marker-detail",
      html: `
        <svg width="40" height="52" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      `,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52],
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Ładowanie szczegółów...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !poi) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Obiekt nie został znaleziony
          </h1>
          <p className="text-gray-600 mb-6">
            Obiekt o podanym identyfikatorze nie istnieje.
          </p>
          <button
            onClick={() => navigate("/lokalni-producenci")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Powrót do listy
          </button>
        </div>
      </div>
    );
  }

  const color = getTypeColor(poi.POIType);
  const center = getLeafletPosition(poi.Point, poi.Centroid);
  const mapZoom = poi.GeometryType === "polygon" ? 11 : 13;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/lokalni-producenci")}
            className="inline-flex items-center text-blue-100 hover:text-white transition-colors mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Powrót do listy
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="inline-block px-3 py-1 text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: color }}
            >
              {poi.POIType}
            </span>
            {poi.IsVerified && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-green-100 bg-green-600/50 rounded-lg">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Zweryfikowany
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{poi.Name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-[500px]">
                <MapContainer
                  center={center}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Point marker */}
                  {poi.GeometryType === "point" && (
                    <Marker position={center} icon={createCustomIcon(color)}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg">{poi.Name}</h3>
                          <p className="text-sm text-gray-600">{poi.POIType}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Polygon */}
                  {poi.GeometryType === "polygon" && poi.polygon?.coordinates && (
                    <Polygon
                      positions={toLeafletCoords(poi.polygon.coordinates[0])}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.2,
                        weight: 3,
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg">{poi.Name}</h3>
                          <p className="text-sm text-gray-600">{poi.POIType}</p>
                        </div>
                      </Popup>
                    </Polygon>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Szczegóły</h2>

              <div className="space-y-4">
                {/* Type */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 uppercase">
                      Typ obiektu
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {poi.POIType}
                  </p>
                </div>

                {/* Geometry Type */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 uppercase">
                      Typ geometrii
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {poi.GeometryType === "point" ? "📍 Punkt" : "🗺️ Obszar"}
                  </p>
                </div>

                {/* Coordinates */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 uppercase">
                      Współrzędne
                    </span>
                  </div>
                  {poi.Point ? (
                    <>
                      <p className="text-sm font-mono text-gray-900">
                        Lat: {poi.Point.lat.toFixed(6)}
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        Lng: {poi.Point.lng.toFixed(6)}
                      </p>
                    </>
                  ) : poi.Centroid ? (
                    <>
                      <p className="text-xs text-gray-500 mb-1">Centroid obszaru:</p>
                      <p className="text-sm font-mono text-gray-900">
                        Lat: {poi.Centroid.lat.toFixed(6)}
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        Lng: {poi.Centroid.lng.toFixed(6)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Brak danych</p>
                  )}
                </div>

                {/* Source */}
                {poi.Source && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-gray-700 uppercase">
                        Źródło
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{poi.Source}</p>
                  </div>
                )}

                {/* ID */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 uppercase">
                      ID
                    </span>
                  </div>
                  <p className="text-sm font-mono text-gray-900">#{poi.ID}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {poi.Description && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Opis</h2>
                <p className="text-gray-700 leading-relaxed">{poi.Description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIDetailPage;
