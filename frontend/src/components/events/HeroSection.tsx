import React, { useState, useMemo } from 'react';
import type { Event, EventFilters } from '../../types/event';
import FilterPanel from './FilterPanel';
import EventCard from './EventCard';

// Mock data - będzie zastąpione przez prawdziwe dane z API
const mockEvents: Event[] = [
  {
    id: 1,
    title: {
      pl: '„André Rieu. Wesołych Świąt!"',
      en: 'André Rieu. Merry Christmas!',
    },
    description: {
      pl: 'Zobacz z najbliższymi nowy bożonarodzeniowo-noworoczny koncert André Rieu i jego Orkiestry Johanna Straussa! Najnowsze kinowe widowisko króla walca przeniesie Was w prawdziwie magiczny świat świątecznej muzyki i radości. Usłyszycie najpiękniejsze kolędy, cudowne walce i polki.',
      en: 'See the new Christmas and New Year concert by André Rieu and his Johann Strauss Orchestra! The latest cinema show by the king of waltz will transport you to a truly magical world of festive music and joy.',
    },
    slug: 'andre-rieu-wesolych-swiat',
    category: 'CONCERT',
    event_type: 'EVENT',
    start_date: '2025-12-21T18:00:00Z',
    location: {
      id: 1,
      name: 'Ustrzycki Dom Kultury',
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: 'PAID',
    price_amount: 30,
    price_currency: 'PLN',
    image: '/koncert.jpg',
    ticket_url: 'https://udk.systembiletowy.pl/index.php/repertoire.html?id=984',
    created_at: '2025-12-15T20:00:00Z',
    updated_at: '2025-12-15T20:00:00Z',
  },
  {
    id: 2,
    title: {
      pl: 'XII Zimowy Maraton Bieszczadzki',
      en: 'XII Winter Bieszczady Marathon',
    },
    description: {
      pl: 'Zimowy maraton w sercu Bieszczad. 3 dystanse do wyboru: 16 km (suma podbiegów/zbiegów ±455m), 27 km (suma podbiegów/zbiegów ±632m), 45 km (suma podbiegów/zbiegów ±1000m).',
      en: 'Winter marathon in the heart of Bieszczady. 3 distances to choose from: 16 km (±455m elevation), 27 km (±632m elevation), 45 km (±1000m elevation).',
    },
    slug: 'zimowy-maraton-bieszczadzki',
    category: 'FESTIVAL',
    event_type: 'EVENT',
    start_date: '2026-01-24T09:00:00Z',
    location: {
      id: 2,
      name: 'Cisna',
      coordinates: { lat: 49.3500, lng: 22.4833 },
      distance: 15.2,
    },
    price_type: 'PAID',
    price_amount: 50,
    price_currency: 'PLN',
    image: '/festywal.jpg',
    created_at: '2025-12-05T14:30:00Z',
    updated_at: '2025-12-05T14:30:00Z',
  },
  {
    id: 3,
    title: {
      pl: 'Warsztaty z ogrodnictwa i zielarstwa',
      en: 'Gardening and Herbalism Workshops',
    },
    description: {
      pl: 'Nabieramy grupy szkolne i przedszkolne! Praktyczne warsztaty z ogrodnictwa i zielarstwa w Bieszczadach. Poznaj tajemnice uprawy roślin i zioł górskich. Idealne dla dzieci i młodzieży.',
      en: 'School and preschool groups welcome! Practical gardening and herbalism workshops in the Bieszczady mountains. Learn the secrets of mountain plant and herb cultivation.',
    },
    slug: 'warsztaty-ogrodnictwo-zielarstwo',
    category: 'WORKSHOP',
    event_type: 'WORKSHOP',
    start_date: '2026-03-15T10:00:00Z',
    duration_minutes: 240,
    location: {
      id: 3,
      name: 'Moczary 39',
      coordinates: { lat: 49.3500, lng: 22.5000 },
      distance: 12.5,
    },
    price_type: 'PAID',
    price_amount: 80,
    price_currency: 'PLN',
    age_restriction: 6,
    image: '/plantacja.jpg',
    created_at: '2025-12-15T21:00:00Z',
    updated_at: '2025-12-15T21:00:00Z',
  },
  {
    id: 4,
    title: {
      pl: 'KOCHLIWY AMBASADOR',
      en: 'KOCHLIWY AMBASADOR',
    },
    description: {
      pl: 'Spektakl teatralny w Ustrzyckim Domu Kultury. Zapraszamy na niezapomniane widowisko teatralne.',
      en: 'Theatre performance at Ustrzycki Dom Kultury. Join us for an unforgettable theatrical show.',
    },
    slug: 'kochliwy-ambasador',
    category: 'THEATRE',
    event_type: 'EVENT',
    start_date: '2025-12-19T19:00:00Z',
    location: {
      id: 4,
      name: 'Ustrzycki Dom Kultury',
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: 'PAID',
    price_amount: 40,
    price_currency: 'PLN',
    image: '/kochliwy.png',
    ticket_url: 'https://udk.systembiletowy.pl/index.php/repertoire.html?id=983&fbclid=IwY2xjawOtPLdleHRuA2FlbQIxMABicmlkETF0WUlEY2p3Qk1qM0dyakZRc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHvoroZ9oK4peh0_cuz9VatETCX5CO5c07nzk0gCLzKkjoi8LTZq38bQW7O7M_aem_ep_E4Z_ZQQNIO7a5GJhtdA&brid=pdGdLy57MiIrAcFqKKVnuw',
    created_at: '2025-12-15T18:00:00Z',
    updated_at: '2025-12-15T18:00:00Z',
  },
  {
    id: 5,
    title: {
      pl: 'Degustacja Lokalnych Serów i Miodów',
      en: 'Local Cheese and Honey Tasting',
    },
    description: {
      pl: 'Spotkanie z lokalnymi producentami serów i miodów. Możliwość zakupu produktów bezpośrednio od producentów.',
      en: 'Meeting with local cheese and honey producers.',
    },
    slug: 'degustacja-lokalnych-serow',
    category: 'FOOD',
    event_type: 'EVENT',
    start_date: '2025-06-25T11:00:00Z',
    location: {
      id: 5,
      name: 'Wetlina',
      coordinates: { lat: 49.1500, lng: 22.4833 },
      distance: 22.1,
    },
    price_type: 'FREE',
    price_currency: 'PLN',
    created_at: '2025-12-12T16:45:00Z',
    updated_at: '2025-12-12T16:45:00Z',
  },
  {
    id: 6,
    title: {
      pl: 'WIELKIE OSTRZEŻENIE - MEKSYK',
      en: 'THE GREAT WARNING - MEXICO',
    },
    description: {
      pl: 'Film dokumentalny - 2D Lektor. Czas projekcji: 96 minut. Wiek: +15. Bilety: 20 zł.',
      en: 'Documentary film - 2D with narrator. Duration: 96 minutes. Age: +15. Tickets: 20 PLN.',
    },
    slug: 'wielkie-ostrzezenie-meksyk',
    category: 'CINEMA',
    event_type: 'EVENT',
    start_date: '2025-12-20T19:00:00Z',
    duration_minutes: 96,
    location: {
      id: 1,
      name: 'Ustrzycki Dom Kultury',
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: 'PAID',
    price_amount: 20,
    price_currency: 'PLN',
    age_restriction: 15,
    image: '/kino.jpg',
    ticket_url: 'https://udk.systembiletowy.pl/index.php/repertoire.html?id=992',
    created_at: '2025-12-15T19:00:00Z',
    updated_at: '2025-12-15T19:00:00Z',
  },
];

const HeroSection: React.FC = () => {
  const [filters, setFilters] = useState<EventFilters>({
    radius: 25,
  });

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
        const descMatch = event.description.pl.toLowerCase().includes(searchLower);
        const locationMatch = event.location.name.toLowerCase().includes(searchLower);

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

  // Sort by newest (created_at)
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredEvents]);

  return (
    <section className="min-h-screen bg-gray-50 py-8" aria-label="Sekcja główna z wydarzeniami">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel - Left Side */}
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Events Grid - Right Side */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-700">
                Znaleziono{' '}
                <span className="font-bold text-blue-600">{sortedEvents.length}</span>{' '}
                {sortedEvents.length === 1
                  ? 'wydarzenie'
                  : sortedEvents.length < 5
                  ? 'wydarzenia'
                  : 'wydarzeń'}
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
                  onClick={() => setFilters({ radius: 25 })}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
