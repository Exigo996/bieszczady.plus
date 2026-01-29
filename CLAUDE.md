# CLAUDE.md - AI-Assisted Development Guide

This file contains instructions and context for AI assistants (like Claude) working on the Bieszczady.plus project.

## 🎯 Project Context

Bieszczady.plus is a regional event discovery and local market platform for the Bieszczady region in Podkarpackie, Poland. The platform serves both tourists and locals by centralizing:

- Cultural events (concerts, festivals, theatre, workshops)
- Local producer listings (honey, crafts, agricultural products)
- Community activities

**Key Principle**: Mobile-first, privacy-focused, community-driven, no user data collection (Phase 1).

## 👤 Developer Profile

**Name**: Seba
**Experience**: Senior fullstack developer (10 years)
**Tech Stack**: Python (Django), JavaScript (React, Vue, Next.js)
**Deployment**: Coolify, Docker, OVH VPS
**Location**: Poland (Polish-speaking)
**Current Setup**: Multiple client projects, familiar with e-commerce, CMS platforms

## 🏗️ Technical Architecture

### Backend: Django 5.1+

```
Structure:
backend/
├── config/              # Django project settings
├── apps/
│   ├── events/         # Event management (Event, Organizer, Location, EventDate)
│   ├── gallery/        # Image management (Image model)
│   └── scraper/        # Facebook event scraping (Playwright-based)
├── static/             # Collected static files
├── media/              # User uploads (event images)
├── staticfiles/        # Static files (production)
└── manage.py
```

**Key Libraries**:

- `django-rest-framework` - API
- `django-cors-headers` - CORS for React frontend
- `celery` - Background tasks (scraping, translations) - PLANNED
- `redis` - Cache and task queue - PLANNED
- `psycopg2-binary` - PostgreSQL adapter
- `playwright` - Facebook scraping (NOT Selenium)
- `geoip2` - IP-based geolocation - PLANNED
- `deepl` - Translation API - PLANNED
- `django-prose-editor` - Rich text editor with sanitization

### Frontend: React 19 with TypeScript

```
Structure:
frontend/
├── src/
│   ├── components/
│   │   ├── common/     # Header, Footer, HeroSplitScreen
│   │   ├── events/     # EventCard, FilterPanel, HeroSection
│   │   ├── organizers/ # OrganizerEventsSection, ProducerCard
│   │   └── products/   # Product-related components (planned)
│   ├── pages/          # HomePage, MapPage, ProductsPage, OrganizerPage
│   ├── api/            # API client (events.ts, organizers.ts, client.ts)
│   ├── contexts/       # LanguageContext, FiltersContext
│   ├── types/          # TypeScript types (event.ts, organizer.ts)
│   ├── translations/   # PL/EN/UK translations (index.ts)
│   ├── data/           # Mock data for development
│   └── App.tsx
├── public/
│   └── icons/          # PWA icons
└── package.json
```

**Key Libraries**:

- `react` 19 + `react-dom` 19 - Core
- `typescript` - Type safety
- `vite` 7 - Build tool (fast, modern)
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client
- `react-router-dom` 7 - Routing
- `tailwindcss` 4 - Styling
- `leaflet` + `react-leaflet` - Maps
- `date-fns` - Date formatting
- `i18next` + `react-i18next` - Internationalization

## 🗂️ Data Models

### Actual Implementation

**Event** (`apps/events/models/event.py`)

```python
class Event(models.Model):
    # NOTE: Using separate fields for each language (NOT JSONField)
    title_pl = CharField(max_length=500, blank=True, null=True)
    title_en = CharField(max_length=500, blank=True, null=True)
    title_uk = CharField(max_length=500, blank=True, null=True)

    # Rich text descriptions with sanitization (django-prose-editor)
    description_pl = ProseEditorField(blank=True, sanitize=True)
    description_en = ProseEditorField(blank=True, sanitize=True)
    description_uk = ProseEditorField(blank=True, sanitize=True)

    slug = SlugField(unique=True, blank=True)  # Auto-generated from title_pl

    # Classification
    category = CharField(choices=[
        'CONCERT', 'FESTIVAL', 'THEATRE', 'CINEMA',
        'WORKSHOP', 'FOOD', 'CULTURAL'
    ])
    event_type = CharField(choices=['EVENT', 'PRODUCT', 'WORKSHOP'])

    # Dates - NOTE: Using EventDate model for multiple dates
    start_date = DateTimeField(null=True, blank=True)  # DEPRECATED
    end_date = DateTimeField(null=True, blank=True)    # DEPRECATED
    # Use event_dates related_name instead

    # Location
    location = ForeignKey('Location', on_delete=SET_NULL, null=True)

    # Pricing
    price_type = CharField(choices=['FREE', 'PAID'])
    price_amount = DecimalField(max_digits=10, decimal_places=2, null=True)
    currency = CharField(default='PLN')

    # Organizer
    organizer = ForeignKey('Organizer', on_delete=SET_NULL, null=True)

    # External links
    external_url = URLField(blank=True)
    ticket_url = URLField(blank=True)
    facebook_event_id = CharField(max_length=100, blank=True, null=True, unique=True)

    # Images - via Gallery app
    # Use event_images.all() to get all images
    # Use main_image property to get cover image

    # Moderation
    source = CharField(choices=['MANUAL', 'SCRAPED', 'USER_SUBMITTED'])
    moderation_status = CharField(choices=['PENDING', 'APPROVED', 'REJECTED'])

    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    @property
    def main_image(self):
        # Get marked main image or first by order
        return self.event_images.filter(is_main=True).first() or self.event_images.order_by('order').first()
```

**EventDate** (`apps/events/models/event_date.py`)

```python
class EventDate(models.Model):
    """Supports multiple dates per event"""
    event = ForeignKey('Event', related_name='event_dates', on_delete=CASCADE)
    start_date = DateTimeField()
    end_date = DateTimeField(null=True, blank=True)
    duration_minutes = IntegerField(null=True, blank=True)
    notes = TextField(blank=True)

    @property
    def is_past(self):
        # Check if this date has passed
```

**Location** (`apps/events/models/location.py`)

```python
class Location(models.Model):
    # NOTE: Using DecimalField for coordinates (NOT PostGIS PointField currently)
    name = CharField(max_length=255)
    shortname = CharField(max_length=100, blank=True)
    address = TextField(blank=True)
    city = CharField(max_length=100, blank=True)

    latitude = DecimalField(max_digits=10, decimal_places=7, null=True)
    longitude = DecimalField(max_digits=10, decimal_places=7, null=True)
    google_maps_url = URLField(blank=True)

    location_type = CharField(choices=['VENUE', 'OUTDOOR', 'PRIVATE', 'VIRTUAL'])
    amenities = JSONField(default=list)  # ['parking', 'wifi', 'accessible', ...]
    capacity = IntegerField(null=True)

    contact fields: website, phone, email
    is_active = BooleanField(default=True)
```

**Organizer** (`apps/events/models/organizer.py`)

```python
class Organizer(models.Model):
    name = CharField(max_length=255)
    shortname = CharField(max_length=100, blank=True)
    description = TextField(blank=True)

    image = ImageField(upload_to='organizers/images/', blank=True)
    logo = ImageField(upload_to='organizers/logos/', blank=True)

    facebook_link = URLField(blank=True)
    ticketing_site = URLField(blank=True)
    website = URLField(blank=True)

    is_active = BooleanField(default=True)
```

**Image** (`apps/gallery/models/image.py`)

```python
class Image(models.Model):
    title = CharField(max_length=255)
    description = TextField(blank=True)
    image = ImageField(upload_to='gallery/')
    tags = JSONField(default=list)  # ['landscape', 'nature', ...]

    # Auto-populated metadata
    file_size = IntegerField(null=True)
    width = IntegerField(null=True)
    height = IntegerField(null=True)
```

## 🔧 Key Features Implementation

### 1. Multi-Language Support

**Current Implementation**:
- Backend: Separate fields (`title_pl`, `title_en`, `title_uk`)
- Frontend: `i18next` with `LanguageContext`
- Supported: PL (primary), EN, UK

```javascript
// Frontend language context
const { language, setLanguage } = useLanguage();

// Dynamic content from API
const title = event[`title_${language}`] || event.title_pl;

// Static UI translations
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

**Planned**:
- DeepL API integration for auto-translation
- Celery task for async translation

### 2. Facebook Event Scraper

**Current Implementation**:
- Using **Playwright** (NOT Selenium - more reliable for FB)
- Async/await pattern
- Anti-detection measures

```python
# apps/scraper/facebook_scraper.py
class FacebookEventScraper:
    async def initialize(self):
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=self.config.headless)
        self.context = await self.browser.new_context(
            user_agent=self.config.user_agent,
            locale='pl-PL',
            timezone_id='Europe/Warsaw',
        )
```

### 3. API Endpoints

**Current Implementation**:

```
GET    /api/events/              # List all events
GET    /api/events/{id}/         # Get event by ID
GET    /api/events/{slug}/       # Get event by slug
GET    /api/organizers/          # List all organizers
GET    /api/organizers/{id}/     # Get organizer by ID
GET    /api/organizers/{id}/events/  # Get organizer's events
GET    /api/gallery/             # Gallery endpoints
```

### 4. Maps

**Current Implementation**:
- **Leaflet** + **react-leaflet** (NOT Mapbox - no API key needed)
- Location coordinates stored as DecimalField lat/lng
- MapPage displays events on map

```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Convert decimal coordinates to Leaflet format
const position: [number, number] = [
  parseFloat(location.latitude),
  parseFloat(location.longitude)
];
```

### 5. Rich Text Editor

**Current Implementation**:
- **django-prose-editor** with server-side sanitization
- Limited extensions for security (Bold, Italic, H2-H3, Lists, Links)

```python
PROSE_EDITOR_EXTENSIONS = {
    "Bold": True,
    "Italic": True,
    "Heading": {"levels": [2, 3]},
    "BulletList": True,
    "OrderedList": True,
    "Link": {"enableTarget": True, "protocols": ["http", "https", "mailto"]},
}
```

## 📱 Mobile-First Development Guidelines

1. **Test on mobile devices first** - Use Chrome DevTools mobile emulation
2. **Touch targets**: Minimum 44x44px for buttons (WCAG requirement)
3. **Responsive patterns**: Use toggleable sidebars on mobile, always-visible on desktop
4. **Viewport units**: Use `vh`, `vw` for responsive layouts
5. **Performance**: Lazy load images, code splitting, optimize for 3G networks
6. **Breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (≥1024px)

## 🎨 UI/UX Patterns

### Event Card (Current Implementation)

The `EventCard` component in `components/events/EventCard.tsx`:
- Displays event image, title, dates, location
- Handles multi-language content
- Shows organizer info
- Responsive design

### Filter Panel (Current Implementation)

The `FilterPanel` component in `components/events/FilterPanel.tsx`:
- Category filter (buttons)
- Price filter (Free/Paid)
- Search input
- Date range picker
- Mobile sidebar toggle

## ♿ Accessibility (WCAG 2.1 AA Compliance)

Bieszczady.plus is committed to being accessible to all users. We follow **WCAG 2.1 Level AA** standards.

### Key Accessibility Guidelines

1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Touch Targets**: Minimum 44x44px for interactive elements
3. **Keyboard Navigation**: All features accessible via keyboard
4. **Semantic HTML**: Use proper HTML5 elements
5. **ARIA Labels**: On all form controls and interactive elements
6. **Alt Text**: All images have meaningful descriptions
7. **Focus Indicators**: Visible focus rings on all focusable elements

### Testing Checklist

- [ ] All images have meaningful alt text
- [ ] Color contrast meets WCAG standards
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Touch targets minimum 44x44px
- [ ] Semantic HTML5 elements used
- [ ] ARIA labels on form controls
- [ ] No keyboard traps in modals/sidebars
- [ ] Headings follow logical hierarchy
- [ ] Language attribute set on HTML tag

## 🚀 Development Workflow

### With Docker (Recommended)

```bash
# Start containers
docker-compose up -d

# Create feature branch
git checkout -b feature/new-feature

# Backend changes
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Frontend changes (auto-reload)
# Just edit files in frontend/src/

# Commit
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature
```

### Code Quality

- **Backend**: PEP 8, Black formatter
- **Frontend**: ESLint, Prettier, TypeScript strict mode
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)

## 🔐 Security Considerations

1. **No user authentication (Phase 1)** - No passwords to secure
2. **CORS**: Restrict to bieszczady.plus domain in production
3. **Rate limiting**: Prevent scraper abuse, API spam - PLANNED
4. **Input validation**: Sanitize all user inputs
5. **Rich text sanitization**: django-prose-editor with sanitize=True
6. **HTTPS only**: Enforced by Coolify (Let's Encrypt)

## 📦 Deployment

**Coolify Deployment**:

- Backend served by **Gunicorn**
- Frontend served by Node's **serve** package (NOT Nginx - Traefik handles reverse proxy)
- SSL certificates via **Let's Encrypt** (auto via Coolify/Traefik)
- Auto-deployment on git push

See **[COOLIFY-DEPLOYMENT.md](COOLIFY-DEPLOYMENT.md)** for complete guide.

## 🐛 Common Issues & Solutions

**Issue**: Events not appearing on map
- Check: Coordinates exist on Location model
- Check: Leaflet map initialized correctly

**Issue**: Facebook scraper failing
- Check: Playwright browser is launching
- Check: Facebook page structure hasn't changed
- Check: Authentication/cookie status

**Issue**: Rich text not rendering
- Check: django-prose-editor is installed
- Check: ProseEditorField is configured correctly

## 💡 Best Practices

1. **Keep it simple** - Seba is experienced but prefers clarity
2. **Mobile-first** - Always test mobile view first
3. **Performance matters** - Bieszczady has spotty 3G/4G coverage
4. **Accessibility (WCAG 2.1 AA)** - Semantic HTML, proper ARIA labels
5. **Error handling** - Graceful degradation, helpful error messages
6. **Responsive design** - Test at different breakpoints

## 📞 Communication Style

When providing code/guidance to Seba:

- **Be direct** - No excessive explanations, he knows the stack
- **Code-first** - Show working examples
- **Polish terms OK** - He's Polish, can mix English/Polish
- **Production-ready** - Not toy examples, real implementations
- **Coolify-aware** - Understand his deployment environment

## 🎯 Current Priority (Phase 1 MVP)

### ✅ Completed

1. ✅ Core Django + React setup
2. ✅ Event listing with search/filters
3. ✅ Mobile-responsive sidebar with toggle
4. ✅ Multi-language support (PL/EN/UK)
5. ✅ Leaflet map integration
6. ✅ Rich text editor (ProseEditor)
7. ✅ Image gallery system
8. ✅ Playwright-based scraper

### 🚧 In Progress / TODO

1. ⏳ Distance-based filtering using decimal coordinates
2. ⏳ GPS location request (mobile)
3. ⏳ IP-based geolocation (GeoIP2)
4. ⏳ Calendar export (.ics)
5. ⏳ Browser push notifications
6. ⏳ DeepL translations integration
7. ⏳ Event detail page
8. ⏳ Celery background tasks

**Recent Updates**:
- **2025-01-28**: Updated to reflect actual implementation (React 19, Playwright, separate language fields, etc.)

**Timeline**: MVP foundation complete, iterating on advanced features.

---

**Remember**: This is a community service for Bieszczady region. Keep it fast, accessible, and privacy-focused. No tracking, no ads (yet), just pure event discovery.
