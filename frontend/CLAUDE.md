# CLAUDE.md - Bieszczady.plus Frontend

## Opis Projektu

Bieszczady.plus to progresywna aplikacja webowa dla turystów odwiedzających region Bieszczad. Aplikacja umożliwia odkrywanie wydarzeń i miejsc (POI) w okolicy z uwzględnieniem czasu/dystansu podróży wybranym środkiem transportu.

### Główny Value Proposition

- Turysta wpisuje na stronę → widzi eventy i POI w zasięgu wybranego środka transportu
- Automatyczna detekcja lokalizacji GPS z domyślną lokalizacją w Bieszczadach
- Mapa interaktywna z izochronami (polygon) dla wyszukiwania czasowego
- System ulubionych zapisywanych lokalnie

---

## Tech Stack

### Core

- **Framework:** Nuxt 4 (Vue 3 + Composition API)
- **Język:** TypeScript
- **Styling:** SCSS modules
- **State Management:** Pinia
- **Mapa:** Leaflet + @vue-leaflet/vue-leaflet
- **i18n:** @nuxtjs/i18n (PL, EN, DE, UK)

### Dodatkowe

- **HTTP Client:** ofetch (wbudowany w Nuxt)
- **Icons:** SVG inline (własne ikony)
- **Animacje:** CSS transitions + Vue Transition
- **PWA:** @vite-pwa/nuxt
- **Analytics:** własny moduł (localStorage + API)

### Dev Tools

- **Linting:** ESLint + Prettier
- **Testing:** Vitest (unit) + Playwright (e2e) - opcjonalnie
- **Git hooks:** husky + lint-staged

---

## Architektura Aplikacji

### Struktura katalogów

```
bieszczady-plus/
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── icons/           # SVG ikony kategorii
│   └── images/
├── components/
│   ├── onboarding/           # Components exist but UNUSED
│   │   ├── OnboardingGrid.vue
│   │   ├── CategoryTile.vue
│   │   ├── ChildrenToggle.vue
│   │   └── OnboardingHeader.vue
│   ├── explorer/              # Explore page components
│   │   ├── HeroSection.vue
│   │   ├── TransportMenu.vue
│   │   ├── LocationButton.vue
│   │   ├── ExploreTabs.vue    # Bottom navigation (4 tabs)
│   │   ├── MapView.vue
│   │   ├── MapPin.vue
│   │   ├── EventCard.vue
│   │   ├── PoiCard.vue
│   │   ├── VideoCard.vue
│   │   └── drawers/           # Tab content drawers
│   │       ├── MapDrawer.vue
│   │       ├── EventsDrawer.vue
│   │       ├── PoisDrawer.vue
│   │       └── FavoritesDrawer.vue
│   ├── modals/
│   │   ├── EventDetailModal.vue
│   │   ├── PoiDetailModal.vue
│   │   └── EventClusterModal.vue  # Shows multiple events at same POI
│   ├── poi/
│   │   └── VideoCard.vue       # Video thumbnail component
│   ├── ui/
│   │   ├── BaseAccordion.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseDrawer.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseSlider.vue
│   │   ├── Dropdown.vue
│   │   ├── FavoriteButton.vue
│   │   └── LanguageSwitcher.vue # Fixed position language switcher
│   └── analytics/
│       └── NewsletterForm.vue
├── composables/
│   ├── useLanguage.ts        # Detekcja języka
│   ├── useGeolocation.ts     # Geolokalizacja
│   ├── useFavorites.ts       # Ulubione (localStorage)
│   ├── useAnalytics.ts       # Statystyki
│   └── useCalendar.ts        # Generowanie .ics
├── layouts/
│   ├── default.vue           # Contains LanguageSwitcher
│   └── fullscreen.vue
├── pages/
│   ├── index.vue             # Redirects to /explore
│   ├── explore.vue           # Main discovery page with tabs
│   └── poi/
│       └── [id]/
│           └── [slug].vue    # POI detail page with accordions
├── plugins/
│   └── leaflet.client.ts
├── server/
│   └── api/                  # Proxy do backendu (opcjonalnie)
├── stores/
│   ├── poi.ts                # Dane aktualnego POI
│   ├── events.ts             # Lista eventów, POIs, videos
│   ├── filters.ts            # Filtry (transport, czas, kategoria)
│   ├── favorites.ts          # Ulubione
│   └── user.ts               # Preferencje użytkownika (język)
├── types/
│   ├── index.ts              # Re-exports
│   ├── poi.ts
│   ├── event.ts
│   ├── category.ts
│   ├── video.ts
│   ├── api.ts                # API response types
│   └── analytics.ts
├── utils/
│   └── formatters.ts
├── i18n/
│   └── locales/
│       ├── pl.json
│       ├── en.json
│       ├── de.json
│       └── uk.json
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Routing

### Current Routes (Feb 2025)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `pages/index.vue` | Redirects to `/explore` |
| `/explore` | `pages/explore.vue` | Main discovery page with 4 tabs |
| `/poi/[id]/[slug]` | `pages/poi/[id]/[slug].vue` | POI detail page |

### Removed Routes

- ~~`/poi/[id]`~~ - Onboarding page (deleted)
- ~~`/poi/[id]/explore`~~ - Old explore route (replaced by `/explore`)

---

## User Flow

### 1. Page Load → GPS Location

```
URL: / → redirects to /explore

1. Page mounts
2. Requests GPS location via navigator.geolocation
3. If accepted: uses real coordinates
4. If denied/timeout: defaults to (49.430283, 22.5370482) - Bieszczady center
5. Sets filtersStore.location with source="gps"
```

### 2. Explore Page (Tabbed Interface)

```
URL: /explore

┌─────────────────────────────┐
│  [Language: 🇬🇧]            │  ← Fixed in top-right
│                             │
│  ┌───────────────────────┐  │
│  │ HERO: Bieszczady       │  │
│  └───────────────────────┘  │
│                             │
│  [🚗] [Time|Distance] ─●─    │  ← TransportMenu
│  30 min | 30 km             │
│                             │
│  [📍 GPS] [Category ▼]      │  ← LocationButton + CategoryFilter
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   TAB CONTENT AREA    │  │  ← 4 drawer components
│  │   (Map/Events/POIs/    │  │     CSS controls visibility
│  │    Favorites)          │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───┬───┬───┬───┐         │
│  │Map│Evt│POI│♥  │         │  ← ExploreTabs (bottom nav)
│  └───┴───┴───┴───┘         │
└─────────────────────────────┘
```

### 3. Tab Content

**Map Tab (`MapDrawer`)**
- Interactive Leaflet map
- Event cluster markers (show count when > 1 event at location)
- POI markers
- Isochrone polygon when using time-based search
- User location marker (home icon)
- Click map to set new search center
- Click cluster → EventClusterModal
- Click single marker → Detail modal

**Events Tab (`EventsDrawer`)**
- List of events grouped by category
- Category accordion (culture, nature, sport, history)
- Event cards with thumbnail, date, price
- Click → EventDetailModal

**POIs Tab (`PoisDrawer`)**
- List of places grouped by category
- Category accordion
- POI cards
- Click → PoiDetailModal OR navigate to `/poi/[id]/[slug]`

**Favorites Tab (`FavoritesDrawer`)**
- Saved events and POIs
- Newsletter signup form
- Remove buttons

### 4. Event Clustering

Events at the same POI are grouped into a cluster marker:

```
Map shows:
  📍(3)  ← Cluster marker with count

Click → EventClusterModal:
┌─────────────────────────────┐
│ Sanocki Dom Kultury          │
│ Culture • 3 events      [✕] │
├─────────────────────────────┤
│ [Event 1 thumbnail]          │
│ Koncert Xyz                  │
│ 15 Aug, 19:00 • Free         │
├─────────────────────────────┤
│ [Event 2 thumbnail]          │
│ Wystawa sztuki               │
│ 16 Aug, 10:00 • 20 PLN       │
├─────────────────────────────┤
│ [Event 3 thumbnail]          │
│ Warsztaty ceramiczne         │
│ 17 Aug, 14:00 • 35 PLN       │
├─────────────────────────────┤
│  [    See more →    ]        │  ← Navigates to POI page
└─────────────────────────────┘
```

### 5. POI Detail Page

```
URL: /poi/123/sanocki-dom-kultury

┌─────────────────────────────┐
│ ← Back to Explorer          │
├─────────────────────────────┤
│ Hero Section                 │
│ POI Name                     │
├─────────────────────────────┤
│ ▼ About this place           │  ← Always visible
│ Description text...          │
├─────────────────────────────┤
│ ▼ How does it look like (0)  │  ← Accordion
│ Video cards                  │
├─────────────────────────────┤
│ ▼ What's going on here (3)   │  ← Accordion
│ [Transport controls]         │
│ Event cards                  │
├─────────────────────────────┤
│ ▼ What's nearby (8)          │  ← Accordion
│ [Transport controls]         │
│ [Map with polygon]           │
│ Nearby POI cards             │
└─────────────────────────────┘
```

---

## Tabbed Drawer Pattern

All drawer components are **always mounted** in the DOM. Visibility is controlled via CSS:

```vue
<!-- All drawers present, only active is visible -->
<div class="explore-page__content">
  <MapDrawer :class="{ 'drawer-content--active': activeTab === 'map' }" />
  <EventsDrawer :class="{ 'drawer-content--active': activeTab === 'events' }" />
  <PoisDrawer :class="{ 'drawer-content--active': activeTab === 'pois' }" />
  <FavoritesDrawer :class="{ 'drawer-content--active': activeTab === 'favorites' }" />
</div>

<style>
.drawer-content {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.drawer-content--active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
</style>
```

Benefits:
- Tab switching is instant (no component mount/unmount)
- Map state is preserved when switching tabs
- Scroll position is maintained

---

## API Integration

### Base URL

```
https://content.zrobie.jutro.net/api/v1
```

### Dokumentacja

- **Interaktywna dokumentacja:** https://content.zrobie.jutro.net/docs

### Główne endpointy

```typescript
// POI - pojedynczy obiekt
GET /pois/{id}
Response: { data: ApiPOI }

// Lista POI (paginowana, z filtrowaniem po lokacji)
GET /pois?page=1&pageSize=50&lat=49.5&lng=22.5&radius=50000
GET /pois?lat=49.5&lng=22.5&minutes=30&mode=auto
Response: { data: ApiPOI[], pagination: {...}, polygon?: {...} }

// Eventy - lista (paginowana, z filtrowaniem)
GET /events?page=1&pageSize=50&lat=49.5&lng=22.5&minutes=30&mode=auto
Response: { data: ApiEvent[], pagination: {...}, polygon?: {...} }

// Eventy dla konkretnego POI
GET /events?poiId=123

// Pojedynczy event
GET /events/{id}
Response: { data: ApiEvent }

// Videos
GET /videos?poiId=123
GET /videos?lat=49.5&lng=22.5&minutes=30&mode=auto
Response: { data: ApiVideo[], pagination: {...} }

// Newsletter
POST /newsletter/subscribe
Body: { email: string }
```

### API Response Wrapper

```typescript
// Prawidłowa odpowiedź:
{
  data: [...],      // tablica z obiektami
  pagination: { page, pageSize, total, totalPages },
  polygon?: {...}  // GeoJSON polygon (tylko gdy użyto minutes/isochrone)
}
```

### Parametry wyszukiwania

#### Lokacja (wspólne dla /events i /pois)

| Parametr | Typ | Opis |
|----------|-----|------|
| `lat` | number | Szerokość geograficzna |
| `lng` | number | Długość geograficzna |
| `radius` | number | Promień w **km** (events) lub **metrach** (pois) |
| `minutes` | number | Czas podróży 1-120 min (izochrona) |
| `mode` | string | Środek transportu: `auto` \| `pedestrian` \| `bicycle` |

**Uwaga:** Parametr `minutes` z `mode` używa izochrony zamiast koła promienia!

### Nazewnictwo pól API

API używa **PascalCase** (np. `ID`, `Title`, `ImageURL`, `CreatedAt`).
Frontend używa **camelCase** (np. `id`, `title`, `imageUrl`, `createdAt`).

Konwersja odbywa się w `stores/events.ts`:
- `transformApiEvent()` - converts ApiEvent to Event
- `transformApiPoi()` - converts ApiPOI to Poi
- `transformApiVideo()` - converts ApiVideo to Video

---

## State Management (Pinia)

### stores/user.ts

```typescript
interface UserState {
  language: "pl" | "en" | "de" | "uk";
  currentPoiId: string | null;
}
```

### stores/filters.ts

```typescript
interface FiltersState {
  category: "culture" | "nature" | "sport" | "history";
  transport: "car" | "bike" | "walk";
  timeMinutes: number;        // 15-120
  radiusKm: number;           // 5-200
  searchMode: "time" | "distance";
  location: {
    lat: number;
    lng: number;
    source: "gps" | "manual" | "search";
  } | null;
}
```

### stores/events.ts

```typescript
interface EventsState {
  events: Event[];
  pois: Poi[];
  videos: Video[];
  polygon: GeoJSONPolygon | null;  // Isochrone from last search
  loading: boolean;
  error: string | null;

  // Methods
  fetchEvents(params): Promise<Event[]>;
  fetchPois(params): Promise<Poi[]>;
  fetchVideos(params): Promise<Video[]>;
  getEventById(id): Event | undefined;
  getPoiById(id): Poi | undefined;
}
```

### stores/favorites.ts

```typescript
interface FavoritesState {
  events: string[];  // event IDs
  pois: string[];    // poi IDs

  // Methods
  isEventFavorite(id): boolean;
  isPoiFavorite(id): boolean;
  toggleEvent(id): void;
  togglePoi(id): void;
}
// Persisted w localStorage
```

---

## i18n

### Obsługiwane języki

- 🇵🇱 Polski (domyślny)
- 🇬🇧 English
- 🇩🇪 Deutsch
- 🇺🇦 Українська

### Language Switcher

Fixed position component in top-right corner (z-index: 2000).
Uses Dropdown component with flag emojis.

### Ważne klucze i18n

```json
{
  "explorer": {
    "tabs": {
      "map": "Mapa",
      "events": "Wydarzenia",
      "pois": "Miejsca",
      "favorites": "Ulubione"
    },
    "mode": {
      "time": "Czas",
      "distance": "Dystans"
    },
    "time": {
      "minutes": "{n} min"
    },
    "distance": {
      "kilometers": "{n} km"
    }
  },
  "poi": {
    "about": "O miejscu",
    "videosSection": "Jak to wygląda",
    "eventsSection": "Co się dzieje",
    "nearbySection": "Co w pobliżu",
    "backToExplorer": "Powrót do eksploratora"
  }
}
```

---

## GPS Location Initialization

On `/explore` page mount:

```typescript
// In pages/explore.vue
async function initializeUserLocation() {
  // Only initialize if we don't have a POI set and no manual location
  if (!currentPoi.value && !filtersStore.location) {
    try {
      const position = await getCurrentPosition();
      if (position) {
        filtersStore.setLocation({
          lat: position.lat,
          lng: position.lng,
          source: "gps",
        });
      } else {
        // User denied or timeout - set default location
        filtersStore.setLocation({
          lat: 49.430283,
          lng: 22.5370482,
          source: "gps",
        });
      }
    } catch (e) {
      // Error getting location - set default location
      filtersStore.setLocation({
        lat: 49.430283,
        lng: 22.5370482,
        source: "gps",
      });
    }
  }
}
```

Default location: `49.430283, 22.5370482` (Bieszczady center)

---

## Event Clustering

Events at the same location are grouped into clusters on the map:

1. **Grouping key**: `event.poiId` or coordinates proximity
2. **Cluster marker**: Shows count badge when > 1 event
3. **Click behavior**:
   - Single event → Opens EventDetailModal
   - Multiple events → Opens EventClusterModal
4. **EventClusterModal**:
   - Lists all events at that POI
   - Click event → Opens EventDetailModal
   - "See more" button → Navigates to `/poi/[id]/[slug]`

---

## Analytics

### Zbierane dane

```typescript
interface AnalyticsEvent {
  timestamp: string;
  session_id: string;
  poi_id: string;  // skąd skanował QR

  // Device
  device_type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  language: string;

  // Actions
  event_type:
    | "page_view"
    | "category_select"
    | "filter_change"
    | "event_view"
    | "poi_view"
    | "favorite_add"
    | "favorite_remove"
    | "calendar_add"
    | "ticket_click"
    | "newsletter_subscribe"
    | "location_gps_enable"
    | "location_map_click"
    | "location_reset";

  // Payload
  data: Record<string, any>;
}
```

---

## Performance Guidelines

1. **Tabbed interface** - All drawers mounted, CSS controls visibility
2. **Map lazy loading** - Leaflet only loads on client
3. **Marker optimization** - Reuses marker layers, only updates when needed
4. **Polygon caching** - Stores hash to avoid unnecessary redraws
5. **Image lazy loading** - Use `loading="lazy"` on images

---

## Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  bieszczady-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE=https://content.zrobie.jutro.net/api/v1
      - NUXT_PUBLIC_SITE_URL=https://bieszczady.plus
    restart: unless-stopped
```

### Environment Variables

```bash
# .env.example
NUXT_PUBLIC_API_BASE=https://content.zrobie.jutro.net/api/v1
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_MAPS_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## Conventions

### Nazewnictwo

- Komponenty: PascalCase (`EventCard.vue`)
- Composables: camelCase z prefixem `use` (`useGeolocation.ts`)
- Stores: camelCase (`favorites.ts`)
- Typy: PascalCase (`Event`, `Poi`)

### Komponenty

- Composition API + `<script setup>`
- Props z TypeScript interface
- Emity typowane
- SCSS scoped

### Git

- Conventional Commits (`feat:`, `fix:`, `chore:`)
- Branch naming: `feature/nazwa`, `fix/nazwa`

---

## TODO / Roadmap

### ✅ Completed

- [x] Activity Explorer with tabs
- [x] GPS auto-detection on page load
- [x] Integration with API
- [x] Map with pins and clustering
- [x] Events/POIs lists with accordion
- [x] Event/Poi detail modals
- [x] Favorites (localStorage)
- [x] Newsletter signup
- [x] Language switcher (fixed position)
- [x] POI detail page with accordions
- [x] Video support
- [x] Time/distance search modes
- [x] Isochrone polygon visualization

### Future

- [ ] Eksport .ics (kalendarz)
- [ ] PWA + offline mode
- [ ] Analytics backend integration
- [ ] User registration
- [ ] Sync ulubionych cross-device
- [ ] Push notifications

---

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Type check
npm run typecheck

# Docker build
docker compose build

# Docker run
docker compose up -d
```

---

## Links

- **API Docs:** https://content.zrobie.jutro.net/docs
- **Demo Explorer:** https://content.zrobie.jutro.net/demo/explorer
