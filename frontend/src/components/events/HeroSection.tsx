import React, { useState, useMemo, useEffect } from "react";
import type { Event, EventFilters } from "../../types/event";
import FilterPanel from "./FilterPanel";
import EventCard from "./EventCard";

// Mock data - będzie zastąpione przez prawdziwe dane z API
const mockEvents: Event[] = [
  {
    id: 0,
    title: {
      pl: "KOCHLIWY AMBASADOR",
      en: "KOCHLIWY AMBASADOR",
    },
    description: {
      pl: "Spektakl teatralny w Ustrzyckim Domu Kultury. Zapraszamy na niezapomniane widowisko teatralne.",
      en: "Theatre performance at Ustrzycki Dom Kultury. Join us for an unforgettable theatrical show.",
    },
    slug: "kochliwy-ambasador",
    category: "THEATRE",
    event_type: "EVENT",
    start_date: "2025-12-19T19:00:00Z",
    location: {
      id: 4,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 40,
    price_currency: "PLN",
    image: "/kochliwy.png",
    ticket_url:
      "https://udk.systembiletowy.pl/index.php/repertoire.html?id=983&fbclid=IwY2xjawOtPLdleHRuA2FlbQIxMABicmlkETF0WUlEY2p3Qk1qM0dyakZRc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHvoroZ9oK4peh0_cuz9VatETCX5CO5c07nzk0gCLzKkjoi8LTZq38bQW7O7M_aem_ep_E4Z_ZQQNIO7a5GJhtdA&brid=pdGdLy57MiIrAcFqKKVnuw",
    created_at: "2025-12-15T18:00:00Z",
    updated_at: "2025-12-15T18:00:00Z",
  },
  {
    id: 1,
    title: {
      pl: '„André Rieu. Wesołych Świąt!"',
      en: "André Rieu. Merry Christmas!",
    },
    description: {
      pl: "Zobacz z najbliższymi nowy bożonarodzeniowo-noworoczny koncert André Rieu i jego Orkiestry Johanna Straussa! Najnowsze kinowe widowisko króla walca przeniesie Was w prawdziwie magiczny świat świątecznej muzyki i radości. Usłyszycie najpiękniejsze kolędy, cudowne walce i polki.",
      en: "See the new Christmas and New Year concert by André Rieu and his Johann Strauss Orchestra! The latest cinema show by the king of waltz will transport you to a truly magical world of festive music and joy.",
    },
    slug: "andre-rieu-wesolych-swiat",
    category: "CONCERT",
    event_type: "EVENT",
    start_date: "2025-12-21T18:00:00Z",
    location: {
      id: 1,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 30,
    price_currency: "PLN",
    image: "/koncert.jpg",
    ticket_url:
      "https://udk.systembiletowy.pl/index.php/repertoire.html?id=984",
    created_at: "2025-12-15T20:00:00Z",
    updated_at: "2025-12-15T20:00:00Z",
  },
  {
    id: 2,
    title: {
      pl: "XII Zimowy Maraton Bieszczadzki",
      en: "XII Winter Bieszczady Marathon",
    },
    description: {
      pl: "Zimowy maraton w sercu Bieszczad. 3 dystanse do wyboru: 16 km (suma podbiegów/zbiegów ±455m), 27 km (suma podbiegów/zbiegów ±632m), 45 km (suma podbiegów/zbiegów ±1000m).",
      en: "Winter marathon in the heart of Bieszczady. 3 distances to choose from: 16 km (±455m elevation), 27 km (±632m elevation), 45 km (±1000m elevation).",
    },
    slug: "zimowy-maraton-bieszczadzki",
    category: "FESTIVAL",
    event_type: "EVENT",
    start_date: "2026-01-24T09:00:00Z",
    location: {
      id: 2,
      name: "Cisna",
      coordinates: { lat: 49.35, lng: 22.4833 },
      distance: 15.2,
    },
    price_type: "PAID",
    price_amount: 50,
    price_currency: "PLN",
    image: "/festywal.jpg",
    created_at: "2025-12-05T14:30:00Z",
    updated_at: "2025-12-05T14:30:00Z",
  },
  {
    id: 3,
    title: {
      pl: "Warsztaty z ogrodnictwa i zielarstwa",
      en: "Gardening and Herbalism Workshops",
    },
    description: {
      pl: "Nabieramy grupy szkolne i przedszkolne! Praktyczne warsztaty z ogrodnictwa i zielarstwa w Bieszczadach. Poznaj tajemnice uprawy roślin i zioł górskich. Idealne dla dzieci i młodzieży.",
      en: "School and preschool groups welcome! Practical gardening and herbalism workshops in the Bieszczady mountains. Learn the secrets of mountain plant and herb cultivation.",
    },
    slug: "warsztaty-ogrodnictwo-zielarstwo",
    category: "WORKSHOP",
    event_type: "WORKSHOP",
    start_date: "2026-03-15T10:00:00Z",
    duration_minutes: 240,
    location: {
      id: 3,
      name: "Moczary 39",
      coordinates: { lat: 49.35, lng: 22.5 },
      distance: 12.5,
    },
    price_type: "PAID",
    price_amount: 80,
    price_currency: "PLN",
    age_restriction: 6,
    image: "/plantacja.jpg",
    created_at: "2025-12-15T21:00:00Z",
    updated_at: "2025-12-15T21:00:00Z",
  },
  {
    id: 4,
    title: {
      pl: "KOCHLIWY AMBASADOR",
      en: "KOCHLIWY AMBASADOR",
    },
    description: {
      pl: "Spektakl teatralny w Ustrzyckim Domu Kultury. Zapraszamy na niezapomniane widowisko teatralne.",
      en: "Theatre performance at Ustrzycki Dom Kultury. Join us for an unforgettable theatrical show.",
    },
    slug: "kochliwy-ambasador",
    category: "THEATRE",
    event_type: "EVENT",
    start_date: "2025-12-19T19:00:00Z",
    location: {
      id: 4,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 40,
    price_currency: "PLN",
    image: "/kochliwy.png",
    ticket_url:
      "https://udk.systembiletowy.pl/index.php/repertoire.html?id=983&fbclid=IwY2xjawOtPLdleHRuA2FlbQIxMABicmlkETF0WUlEY2p3Qk1qM0dyakZRc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHvoroZ9oK4peh0_cuz9VatETCX5CO5c07nzk0gCLzKkjoi8LTZq38bQW7O7M_aem_ep_E4Z_ZQQNIO7a5GJhtdA&brid=pdGdLy57MiIrAcFqKKVnuw",
    created_at: "2025-12-15T18:00:00Z",
    updated_at: "2025-12-15T18:00:00Z",
  },
  {
    id: 5,
    title: {
      pl: "Degustacja Lokalnych Serów i Miodów",
      en: "Local Cheese and Honey Tasting",
    },
    description: {
      pl: "Spotkanie z lokalnymi producentami serów i miodów. Możliwość zakupu produktów bezpośrednio od producentów.",
      en: "Meeting with local cheese and honey producers.",
    },
    slug: "degustacja-lokalnych-serow",
    category: "FOOD",
    event_type: "EVENT",
    start_date: "2025-06-25T11:00:00Z",
    location: {
      id: 5,
      name: "Wetlina",
      coordinates: { lat: 49.15, lng: 22.4833 },
      distance: 22.1,
    },
    price_type: "FREE",
    price_currency: "PLN",
    created_at: "2025-12-12T16:45:00Z",
    updated_at: "2025-12-12T16:45:00Z",
  },
  {
    id: 6,
    title: {
      pl: "WIELKIE OSTRZEŻENIE - MEKSYK",
      en: "THE GREAT WARNING - MEXICO",
    },
    description: {
      pl: "Film dokumentalny - 2D Lektor. Czas projekcji: 96 minut. Wiek: +15. Bilety: 20 zł.",
      en: "Documentary film - 2D with narrator. Duration: 96 minutes. Age: +15. Tickets: 20 PLN.",
    },
    slug: "wielkie-ostrzezenie-meksyk",
    category: "CINEMA",
    event_type: "EVENT",
    start_date: "2025-12-20T19:00:00Z",
    duration_minutes: 96,
    location: {
      id: 1,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 20,
    price_currency: "PLN",
    age_restriction: 15,
    image: "/kino.jpg",
    ticket_url:
      "https://udk.systembiletowy.pl/index.php/repertoire.html?id=992",
    created_at: "2025-12-15T19:00:00Z",
    updated_at: "2025-12-15T19:00:00Z",
  },
];

const HeroSection: React.FC = () => {
  const [filters, setFilters] = useState<EventFilters>({
    radius: 25,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle filter changes and close mobile sidebar
  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    // Close sidebar on mobile when a filter is applied (except radius changes)
    if (window.innerWidth < 1024) {
      const filterChanged =
        JSON.stringify(filters) !== JSON.stringify(newFilters);
      const onlyRadiusChanged =
        filterChanged &&
        Object.keys(newFilters).filter(
          (key) =>
            key !== "radius" &&
            newFilters[key as keyof EventFilters] !==
              filters[key as keyof EventFilters]
        ).length === 0;

      if (filterChanged && !onlyRadiusChanged) {
        setIsSidebarOpen(false);
      }
    }
  };

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Price type filter
      if (filters.price_type && event.price_type !== filters.price_type) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = event.title.pl.toLowerCase().includes(searchLower);
        const descMatch = event.description.pl
          .toLowerCase()
          .includes(searchLower);
        const locationMatch = event.location.name
          .toLowerCase()
          .includes(searchLower);

        if (!titleMatch && !descMatch && !locationMatch) {
          return false;
        }
      }

      // Distance filter
      if (filters.radius && event.location.distance) {
        if (event.location.distance > filters.radius) {
          return false;
        }
      }

      // Date range filter
      if (filters.date_from) {
        const eventDate = new Date(event.start_date);
        const fromDate = new Date(filters.date_from);
        if (eventDate < fromDate) {
          return false;
        }
      }

      if (filters.date_to) {
        const eventDate = new Date(event.start_date);
        const toDate = new Date(filters.date_to);
        if (eventDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Sort by ID
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.id - b.id);
  }, [filteredEvents]);

  return (
    <section
      className="min-h-screen bg-gray-50 py-8"
      aria-label="Sekcja główna z wydarzeniami"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wydarzenia w Bieszczadach
          </h1>
          <p className="text-lg text-gray-600">
            Odkryj kulturę, tradycje i rozrywkę w sercu Podkarpacia
          </p>
        </header>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel - Left Side */}
          <div className="lg:col-span-1">
            {/* Mobile Bottom Sheet */}
            <div
              className={`
                lg:hidden fixed inset-x-0 bottom-0 bg-white z-50 rounded-t-2xl shadow-2xl
                transform transition-transform duration-300 ease-in-out
                max-h-[80vh] overflow-y-auto
                ${isSidebarOpen ? "translate-y-0" : "translate-y-full"}
              `}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                aria-label="Zamknij filtry"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div
                  className="w-12 h-1.5 bg-gray-300 rounded-full"
                  aria-hidden="true"
                ></div>
              </div>

              <div className="px-6 pb-6">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Events Grid - Right Side */}
          <div className="lg:col-span-3 pb-24 lg:pb-0">
            {/* Results Count */}
            <div className="mb-6">
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
            </div>

            {/* Events Grid */}
            {sortedEvents.length > 0 ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                role="list"
                aria-label="Lista wydarzeń"
              >
                {sortedEvents.map((event) => (
                  <div key={event.id} role="listitem">
                    <EventCard event={event} />
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
            (key) => key !== "radius" && filters[key as keyof EventFilters]
          ).length > 0 && (
            <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {
                Object.keys(filters).filter(
                  (key) =>
                    key !== "radius" && filters[key as keyof EventFilters]
                ).length
              }
            </span>
          )}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
