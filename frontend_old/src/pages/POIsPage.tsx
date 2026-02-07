import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPOIs, getUniquePOITypes } from "../api/pois";
import type { POI, POIsResponse } from "../types/poi";
import POICard from "../components/pois/POICard";
import POIFilterPanel from "../components/pois/POIFilterPanel";
import POIMap from "../components/pois/POIMap";

const POIsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Fetch all POIs
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<POIsResponse>({
    queryKey: ["pois"],
    queryFn: () => fetchPOIs(),
  });

  const pois = response?.data || [];
  const uniqueTypes = getUniquePOITypes(pois);

  // Filter POIs by selected type
  const filteredPOIs = selectedType
    ? pois.filter((poi: POI) => poi.POIType === selectedType)
    : pois;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Ładowanie obiektów...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <svg
            className="mx-auto h-16 w-16 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Błąd ładowania danych
          </h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "Nie udało się załadować obiektów."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Punkty warte zobaczenia</h1>
          <p className="text-blue-100 text-lg">
            Odkryj najlepsze miejsca i producentów w Bieszczadach
          </p>
          <p className="text-blue-200 text-sm mt-2">
            Znaleziono {filteredPOIs.length} {filteredPOIs.length === 1 ? "obiekt" : filteredPOIs.length < 5 ? "obiekty" : "obiektów"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <POIFilterPanel
            selectedType={selectedType}
            types={uniqueTypes}
            onTypeChange={setSelectedType}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Widok siatki"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Widok mapy"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <div className="mb-6">
            <POIMap
              pois={filteredPOIs}
              selectedPOI={selectedPOI}
              onPOISelect={setSelectedPOI}
            />
            {/* Selected POI info */}
            {selectedPOI && (
              <div className="mt-4 bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded mb-2">
                      {selectedPOI.POIType}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedPOI.Name}
                    </h3>
                    {selectedPOI.Description && (
                      <p className="text-gray-600 mt-2">{selectedPOI.Description}</p>
                    )}
                    <div className="mt-3 text-sm text-gray-500">
                      <p>
                        <span className="font-semibold">Typ geometrii:</span>{" "}
                        {selectedPOI.GeometryType}
                      </p>
                      <p>
                        <span className="font-semibold">Współrzędne:</span>{" "}
                        {selectedPOI.Point
                          ? `${selectedPOI.Point.lat.toFixed(6)}, ${selectedPOI.Point.lng.toFixed(6)}`
                          : selectedPOI.Centroid
                            ? `${selectedPOI.Centroid.lat.toFixed(6)}, ${selectedPOI.Centroid.lng.toFixed(6)}`
                            : "Brak danych"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPOI(null)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    aria-label="Zamknij"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <>
            {filteredPOIs.length === 0 ? (
              <div className="text-center py-12">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Brak obiektów
                </h3>
                <p className="text-gray-600">
                  {selectedType
                    ? `Nie znaleziono obiektów typu "${selectedType}".`
                    : "Brak dostępnych obiektów."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPOIs.map((poi: POI) => (
                  <POICard key={poi.ID} poi={poi} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default POIsPage;
