import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ZrobieEvent } from "../../types/zrobie-event";
import type { EventFilters } from "../../types/event";
import { fetchEvents } from "../../api/events";
import { useFilters } from "../../contexts/FiltersContext";
import EventCard from "./EventCard";
import FilterPanel from "./FilterPanel";

type ViewMode = "grid" | "list";

const HeroSection: React.FC = () => {
  const { filters, setFilters } = useFilters();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch events from API
  const {
    data: events = [],
    isLoading,
  } = useQuery<ZrobieEvent[]>({
    queryKey: ["events", filters],
    queryFn: () => fetchEvents(filters),
    retry: 1,
  });

  // Close sidebar when ESC key is pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isSidebarOpen]);

  // Handle filter changes (close sidebar on change, except radius)
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Don't close sidebar when only radius changes
    if (
      JSON.stringify({ ...newFilters, radius: undefined }) !==
      JSON.stringify({ ...filters, radius: undefined })
    ) {
      setIsSidebarOpen(false);
    }
  };

  // Filter events based on active filters (for client-side filtering if API doesn't support all filters)
  const filteredEvents = events.filter((event) => {
    // Search filter (client-side backup)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = event.Title.toLowerCase().includes(searchLower);
      const descMatch = event.Description?.toLowerCase().includes(searchLower);
      const venueMatch = event.Venue?.toLowerCase().includes(searchLower);

      if (!titleMatch && !descMatch && !venueMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort by ID
  const sortedEvents = [...filteredEvents].sort((a, b) => a.ID - b.ID);

  return (
    <section
      id="events-section"
      className="min-h-screen bg-gray-50 py-8"
      aria-label="Sekcja główna z wydarzeniami"
    >
      {/* Mobile Filter Toggle Button */}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filtry</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              aria-label="Zamknij filtry"
            >
              ×
            </button>
          </div>
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bieszczady + Kultura
          </h1>
          <p className="text-lg text-gray-600">
            Odkryj kulturę, tradycje i rozrywkę w sercu Podkarpacia
          </p>
        </header>

        {/* Results Count and View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-700">
            Znaleziono{" "}
            <span className="font-bold text-blue-600">
              {sortedEvents.length}
            </span>{" "}
            {sortedEvents.length === 1
              ? "wydarzenie"
              : sortedEvents.length < 5
                ? "wydarzenia"
                : "wydarzeń"}
          </p>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Widok kafelkowy"
              title="Widok kafelkowy"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Widok listy"
              title="Widok listy"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {sortedEvents.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            role="list"
            aria-label="Lista wydarzeń"
          >
            {sortedEvents.map((event) => (
              <div key={event.ID} role="listitem">
                <EventCard event={event} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Nie znaleziono wydarzeń
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Spróbuj zmienić filtry lub poszukać w szerszym zakresie.
            </p>
            <button
              onClick={() => handleFiltersChange({ radius: 25 })}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Toggle Button - Fixed at bottom with margin */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 -right-10 -translate-x-1/2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg z-30 hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-11"
        aria-label="Otwórz filtry"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm font-semibold">Filtry</span>
        {Object.keys(filters).filter(
          (key) => key !== "radius" && filters[key as keyof EventFilters],
        ).length > 0 && (
          <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {
              Object.keys(filters).filter(
                (key) => key !== "radius" && filters[key as keyof EventFilters],
              ).length
            }
          </span>
        )}
      </button>
    </section>
  );
};

export default HeroSection;
