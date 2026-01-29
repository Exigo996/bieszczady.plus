# Bieszczady.plus - Regional Event & Local Market Platform

**A community-driven platform showcasing events, local producers, and craftspeople in the Bieszczady region of Podkarpackie, Poland.**

## Project Vision

Bieszczady.plus serves as a centralized notice board for tourists and local citizens to discover:

- Cultural events (concerts, festivals, theatre, cinema, workshops)
- Local agricultural products (honey, jams, vegetables, oils)
- Handcrafted items (jewelry, crafts)
- Community activities and gatherings

The platform bridges the gap between event organizers, local producers, and visitors, making the Bieszczady region more accessible and vibrant.

## Current Implementation Status

### ✅ Completed (MVP Foundation)

**Backend (Django 5.1)**
- ✅ Django project with PostgreSQL database
- ✅ Events app with models:
  - `Event` - Multi-language titles/descriptions (PL/EN/UK), categories, pricing
  - `Organizer` - Event organizers with social links and logos
  - `Location` - Venues with lat/lng coordinates and amenities
  - `EventDate` - Multiple dates per event support
  - `EventImage` - Image management through Gallery app
- ✅ Gallery app - Image model with metadata and tagging
- ✅ Scraper app - Playwright-based Facebook event scraper
- ✅ REST API (DRF) - Events and Organizers endpoints
- ✅ Rich text editor (django-prose-editor) for event descriptions
- ✅ Docker development environment

**Frontend (React 19 + Vite)**
- ✅ React 19 with TypeScript and Vite
- ✅ React Router for navigation
- ✅ TanStack Query (React Query) for server state
- ✅ Tailwind CSS v4 for styling
- ✅ i18n support (Polish, English, Ukrainian)
- ✅ Leaflet maps integration (react-leaflet)
- ✅ Components:
  - `Header`, `Footer`, `HeroSection`, `HeroSplitScreen`
  - `EventCard` with full event details display
  - `FilterPanel` with category, price, search filters
  - `ProducerCard`, `OrganizerEventsSection`
- ✅ Pages: `HomePage`, `MapPage`, `ProductsPage`, `OrganizerPage`
- ✅ Language and Filters contexts

**Infrastructure**
- ✅ Docker Compose for local development
- ✅ Production Dockerfiles (Coolify-ready)
- ✅ Deployment documentation for Coolify

### 🚧 In Progress / Planned

- [ ] Distance-based filtering using decimal coordinates
- [ ] IP-based geolocation (GeoIP2)
- [ ] GPS location request (mobile)
- [ ] Calendar export (.ics)
- [ ] Browser push notifications
- [ ] AI-powered translations (DeepL integration)
- [ ] Event detail page
- [ ] User registration system
- [ ] Social media integration

## Architecture

### Backend

```
backend/
├── config/              # Django settings, URLs
├── apps/
│   ├── events/         # Event, Organizer, Location, EventDate models
│   ├── gallery/        # Image model with EventImage through model
│   └── scraper/        # Playwright-based Facebook scraper
├── requirements/        # Python dependencies
└── manage.py
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/     # Header, Footer, HeroSplitScreen
│   │   ├── events/     # EventCard, FilterPanel, HeroSection
│   │   ├── organizers/ # OrganizerEventsSection, ProducerCard
│   │   └── products/   # Product-related components
│   ├── pages/          # HomePage, MapPage, ProductsPage, OrganizerPage
│   ├── api/            # API client (events, organizers)
│   ├── contexts/       # LanguageContext, FiltersContext
│   ├── types/          # TypeScript types
│   └── translations/   # PL/EN/UK translations
└── package.json
```

## Data Models

### Event

```python
# Multi-language title fields (not JSONField)
title_pl, title_en, title_uk

# Rich text descriptions with sanitization
description_pl, description_en, description_uk

# Classification
category (CONCERT, FESTIVAL, THEATRE, CINEMA, WORKSHOP, FOOD, CULTURAL)
event_type (EVENT, PRODUCT, WORKSHOP)

# Dates via EventDate model (multiple dates supported)
event_dates (related_name)

# Location
location (ForeignKey to Location)

# Pricing
price_type (FREE, PAID)
price_amount, currency

# Organizer
organizer (ForeignKey to Organizer)

# Images via Gallery
event_images (through EventImage model)

# Moderation
source (MANUAL, SCRAPED, USER_SUBMITTED)
moderation_status (PENDING, APPROVED, REJECTED)
```

### Location

```python
name, shortname
address, city
latitude, longitude  # Decimal fields (not PostGIS Point)
google_maps_url
location_type (VENUE, OUTDOOR, PRIVATE, VIRTUAL)
amenities (JSONField)
capacity, website, phone, email
```

### Organizer

```python
name, shortname
description
image, logo
facebook_link, ticketing_site, website
is_active
```

## Development Setup

### Docker (Recommended)

```bash
# Start all services
docker-compose up -d --build

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
# Django Admin: http://localhost:8000/admin (admin/admin123)
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

```
GET    /api/events/              # List all events
GET    /api/events/{id}/         # Get event by ID
GET    /api/events/{slug}/       # Get event by slug
GET    /api/organizers/          # List all organizers
GET    /api/organizers/{id}/     # Get organizer by ID
GET    /api/organizers/{id}/events/  # Get organizer's events
GET    /api/gallery/             # Gallery endpoints
```

## Internationalization

- **Backend**: Separate fields for each language (title_pl, title_en, title_uk)
- **Frontend**: i18next with context-based translations
- **Supported Languages**: Polish (primary), English, Ukrainian
- **Planned**: AI-powered translations using DeepL API

## Design Principles

- **Mobile-First**: Optimized for phones (primary use case)
- **Minimal Design**: Clean, fast, distraction-free
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <3s load time on 3G
- **Nature-Themed**: Subtle Bieszczady mountains imagery

## Deployment

Production deployment on OVH VPS with Coolify:

```bash
# Push to GitHub
git push origin main

# Coolify handles:
# - Docker builds
# - SSL certificates (Let's Encrypt)
# - Reverse proxy (Traefik)
# - Auto-deployment on push
```

See **[COOLIFY-DEPLOYMENT.md](COOLIFY-DEPLOYMENT.md)** for complete guide.

## Tech Stack

### Backend
- Django 5.1+
- Django REST Framework
- PostgreSQL 16
- Celery + Redis
- Playwright (scraping)
- django-prose-editor (rich text)

### Frontend
- React 19
- TypeScript
- Vite 7
- TanStack Query
- React Router 7
- Tailwind CSS 4
- Leaflet + react-leaflet
- i18next

## Success Metrics

### MVP Goals (Current Phase)

- [ ] 50+ events listed
- [ ] 10+ local producers featured
- [ ] 1000+ monthly visitors
- [ ] 5+ verified partner organizations

## Contributing

This is a community-focused open-source project. Contributions welcome!

### Priority Areas

1. Facebook scraper improvements
2. Translation quality
3. Mobile UX optimization
4. Event categorization accuracy
5. Distance-based filtering implementation

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - AI assistant development guide
- **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - Detailed file structure
- **[DOCKER-GUIDE.md](DOCKER-GUIDE.md)** - Docker setup guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[ROADMAP.md](ROADMAP.md)** - Development phases and timeline
- **[COOLIFY-DEPLOYMENT.md](COOLIFY-DEPLOYMENT.md)** - Production deployment

## License

MIT License - Free to use, modify, and distribute.

## Acknowledgments

Built with support from:

- Local event organizers in Bieszczady
- Podkarpackie tourism organizations
- Local producers and craftspeople
- Community feedback and testing

---

**Contact**: [Your contact information]
**Website**: https://bieszczady.plus
**Region**: Bieszczady, Podkarpackie, Poland 🇵🇱
