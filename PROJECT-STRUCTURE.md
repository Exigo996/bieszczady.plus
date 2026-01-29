# Project Structure - Bieszczady.plus

## Repository Organization

```
bieszczady-plus/
├── README.md                 # Project overview and documentation
├── CLAUDE.md                 # AI assistant development guide
├── ROADMAP.md                # Development phases and timeline
├── PROJECT-STRUCTURE.md      # This file
├── DOCKER-GUIDE.md           # Docker setup guide
├── QUICKSTART.md             # Quick start guide
├── COOLIFY-DEPLOYMENT.md     # Production deployment guide
├── .gitignore               # Git ignore patterns
│
├── backend/                  # Django backend application
│   ├── config/              # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py      # Main settings file
│   │   ├── urls.py          # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/                # Django applications
│   │   ├── __init__.py
│   │   │
│   │   ├── events/          # Event management
│   │   │   ├── migrations/  # Database migrations
│   │   │   ├── models/      # Model definitions
│   │   │   │   ├── __init__.py
│   │   │   │   ├── event.py         # Event model
│   │   │   │   ├── event_image.py   # EventImage through model
│   │   │   │   ├── event_date.py    # EventDate model (multiple dates)
│   │   │   │   ├── organizer.py     # Organizer model
│   │   │   │   └── location.py      # Location model
│   │   │   ├── views.py      # ViewSets (Event, Organizer)
│   │   │   ├── serializers.py # DRF serializers
│   │   │   ├── admin.py     # Admin customization
│   │   │   ├── urls.py      # API routes
│   │   │   └── tests.py
│   │   │
│   │   ├── gallery/         # Image management
│   │   │   ├── migrations/
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   └── image.py  # Image model with metadata
│   │   │   ├── views.py      # Gallery API views
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── tests.py
│   │   │
│   │   └── scraper/         # Facebook event scraping
│   │       ├── facebook_scraper.py  # Playwright-based scraper
│   │       ├── config.py             # Scraper configuration
│   │       ├── utils.py              # Helper functions
│   │       ├── django_integration.py # Django integration
│   │       ├── cli.py                # CLI interface
│   │       └── test_scraper.py
│   │
│   ├── static/              # Collected static files
│   ├── media/               # User uploads (event images)
│   ├── staticfiles/         # Collected static files (production)
│   │
│   ├── requirements/        # Python dependencies
│   │   ├── base.txt         # Core dependencies
│   │   ├── development.txt  # Dev tools
│   │   └── production.txt   # Production server
│   │
│   ├── manage.py            # Django management script
│   ├── Dockerfile           # Docker container definition
│   ├── Dockerfile.prod      # Production Dockerfile
│   └── docker-entrypoint.sh # Entry point script
│
├── frontend/                # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── icons/           # PWA icons
│   │
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── common/      # Shared components
│   │   │   │   ├── Header.tsx        # Navigation header
│   │   │   │   ├── Footer.tsx        # Site footer
│   │   │   │   └── HeroSplitScreen.tsx  # Hero layout
│   │   │   │
│   │   │   ├── events/      # Event-related components
│   │   │   │   ├── EventCard.tsx      # Event card with full details
│   │   │   │   ├── FilterPanel.tsx    # Filter sidebar
│   │   │   │   └── HeroSection.tsx    # Events hero section
│   │   │   │
│   │   │   ├── organizers/  # Organizer components
│   │   │   │   ├── OrganizerEventsSection.tsx
│   │   │   │   └── ProducerCard.tsx
│   │   │   │
│   │   │   └── products/    # Product-related components
│   │   │       └── (planned)
│   │   │
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx         # Main page
│   │   │   ├── MapPage.tsx           # Interactive map
│   │   │   ├── ProductsPage.tsx      # Local market
│   │   │   └── OrganizerPage.tsx     # Organizer profile
│   │   │
│   │   ├── api/             # API client
│   │   │   ├── client.ts    # Axios instance
│   │   │   ├── events.ts    # Event API calls
│   │   │   ├── organizers.ts # Organizer API calls
│   │   │   └── index.ts     # API exports
│   │   │
│   │   ├── contexts/        # React contexts
│   │   │   ├── LanguageContext.tsx   # i18n state
│   │   │   └── FiltersContext.tsx    # Filter state
│   │   │
│   │   ├── types/           # TypeScript types
│   │   │   ├── event.ts     # Event interfaces
│   │   │   └── organizer.ts # Organizer interfaces
│   │   │
│   │   ├── translations/    # i18n translations
│   │   │   └── index.ts     # PL/EN/UK translations
│   │   │
│   │   ├── data/            # Static data
│   │   │   └── mockEvents.ts # Mock data for development
│   │   │
│   │   ├── assets/          # Static assets (images)
│   │   ├── App.tsx          # Root component
│   │   ├── App.css          # Global styles
│   │   ├── index.css        # Tailwind imports
│   │   └── main.tsx         # Entry point
│   │
│   ├── package.json         # Node dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── eslint.config.js     # ESLint rules
│   ├── Dockerfile           # Docker container definition
│   ├── Dockerfile.prod      # Production Dockerfile
│   └── README.md            # Frontend documentation
│
├── deployment/              # Deployment configurations (planned)
│   └── (Coolify uses docker-compose directly)
│
├── venv/                    # Python virtual environment
├── .venv/                   # Additional Python venv
└── node_modules/            # Frontend dependencies
```

## Backend Models

### events app

**Event** (`models/event.py`)
- Multi-language titles: `title_pl`, `title_en`, `title_uk`
- Rich text descriptions: `description_pl`, `description_en`, `description_uk`
- Categories: CONCERT, FESTIVAL, THEATRE, CINEMA, WORKSHOP, FOOD, CULTURAL
- Relations: `location` (FK), `organizer` (FK)
- Images: via `event_images` (EventImage through model)
- Dates: via `event_dates` (EventDate reverse FK)
- Pricing: `price_type`, `price_amount`, `currency`
- Moderation: `source`, `moderation_status`

**EventDate** (`models/event_date.py`)
- Supports multiple dates per event
- `start_date`, `end_date`, `duration_minutes`
- `notes` for date-specific information
- `is_past` property

**Location** (`models/location.py`)
- `name`, `shortname`
- `address`, `city`
- `latitude`, `longitude` (DecimalField)
- `google_maps_url`
- `location_type`: VENUE, OUTDOOR, PRIVATE, VIRTUAL
- `amenities` (JSONField): parking, wifi, accessible, etc.
- `capacity`, `website`, `phone`, `email`

**Organizer** (`models/organizer.py`)
- `name`, `shortname`, `description`
- `image`, `logo`
- `facebook_link`, `ticketing_site`, `website`
- `is_active` status

**EventImage** (`models/event_image.py`)
- Through model connecting Event and Image
- `order` field for sorting
- `is_main` for cover image

### gallery app

**Image** (`models/image.py`)
- `title`, `description`
- `image` file
- `tags` (JSONField)
- Auto-populated metadata: `file_size`, `width`, `height`

### scraper app

**FacebookEventScraper** (`facebook_scraper.py`)
- Playwright-based async scraper
- Anti-detection measures
- Cookie persistence
- Date parsing, location extraction
- Event detection in text

## Frontend Components

### Pages

| Component | Route | Description |
|-----------|-------|-------------|
| `HomePage` | `/` | Main page with events listing |
| `MapPage` | `/mapa` | Interactive map with events |
| `ProductsPage` | `/produkty` | Local market page |
| `OrganizerPage` | `/organizator/:slug` | Organizer profile page |

### Components

**common/**
- `Header` - Navigation with language switcher
- `Footer` - Site footer with links
- `HeroSplitScreen` - Two-column hero layout

**events/**
- `EventCard` - Full event card with images, dates, location
- `FilterPanel` - Category, price, search filters
- `HeroSection` - Events page hero

**organizers/**
- `OrganizerEventsSection` - Events list for organizer
- `ProducerCard` - Producer/organizer card

### API Endpoints

```
GET    /api/events/              # List all events
GET    /api/events/{id}/         # Get event by ID
GET    /api/events/{slug}/       # Get event by slug
GET    /api/organizers/          # List all organizers
GET    /api/organizers/{id}/     # Get organizer by ID
GET    /api/organizers/{id}/events/  # Get organizer's events
GET    /api/gallery/             # Gallery endpoints
POST   /api/gallery/upload/      # Upload images
```

## Configuration Files

### Backend

**settings.py** - Key settings:
- `INSTALLED_APPS`: rest_framework, corsheaders, events, gallery
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis/Celery connection
- `CORS_ALLOWED_ORIGINS`: Frontend URLs
- `MEDIA_ROOT`, `STATIC_ROOT`: File storage

### Frontend

**vite.config.ts**:
- Build target, plugins (@vitejs/plugin-react)
- Proxy configuration for API calls

**tailwind.config.js**:
- Content paths for scanning
- Theme customization

**tsconfig.json**:
- TypeScript compiler options
- Path aliases

## Key Design Decisions

### Backend Architecture

- **Separate language fields** instead of JSONField for better DB querying
- **Decimal lat/lng** in Location instead of PostGIS PointField (simpler for now)
- **EventDate model** for multi-date events
- **Gallery app** with through model for flexible image management
- **Playwright** for scraping (more reliable than Selenium for FB)

### Frontend Architecture

- **React 19** with TypeScript for type safety
- **TanStack Query** for server state management and caching
- **Context API** for shared state (language, filters)
- **Tailwind CSS v4** for utility-first styling
- **React Router v7** for navigation
- **Leaflet** for maps (no API key needed)

### Data Flow

1. User opens page → React Router renders component
2. Component uses TanStack Query hook to fetch data
3. Axios client makes API call to Django backend
4. DRF ViewSet queries DB with select_related/prefetch_related
5. Serializer transforms data, returns JSON
6. Frontend renders components with data

## Development Workflow

### 1. Starting Development

```bash
# Docker (recommended)
docker-compose up -d

# Manual
cd backend && python manage.py runserver
cd frontend && npm run dev
```

### 2. Adding New Feature

**Backend:**
```bash
cd backend/apps/events
# Create/modify models in models/
python manage.py makemigrations
python manage.py migrate
# Update views.py, serializers.py
```

**Frontend:**
```bash
cd frontend/src
# Create component in components/
# Add route in App.tsx
# Add API call in api/
# Add type in types/
```

## Next Steps

Based on current implementation:

1. ✅ Core models and API - **DONE**
2. ✅ Frontend pages and components - **DONE**
3. ⏳ Distance-based filtering - **TODO**
4. ⏳ Event detail page - **TODO**
5. ⏳ Calendar export (.ics) - **TODO**
6. ⏳ Push notifications - **TODO**
7. ⏳ DeepL translations - **TODO**

Last updated: 2025-01-28
