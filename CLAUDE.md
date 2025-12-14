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
**Tech Stack**: Python (Django/Wagtail), JavaScript (React, Vue, Next.js)  
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
│   ├── events/         # Event management
│   ├── products/       # Local market (producers, crafts)
│   ├── locations/      # Towns, villages, geographic data
│   ├── scraper/        # Facebook event scraping
│   ├── notifications/  # Notification service (browser push)
│   └── translations/   # AI-powered translation service
├── api/                # DRF API endpoints
├── locale/             # Translation files
├── static/
├── media/
└── manage.py
```

**Key Libraries**:

- `django-rest-framework` - API
- `django-cors-headers` - CORS for React frontend
- `celery` - Background tasks (scraping, translations)
- `redis` - Cache and task queue
- `psycopg2-binary` - PostgreSQL adapter
- `django.contrib.gis` - PostGIS support
- `selenium` + `beautifulsoup4` - Facebook scraping
- `geoip2` - IP-based geolocation
- `deepl` or `googletrans` - Translation API

### Frontend: React 18+ with TypeScript

```
Structure:
frontend/
├── src/
│   ├── components/
│   │   ├── events/     # Event listing, details, filters
│   │   ├── products/   # Local market components
│   │   ├── map/        # Interactive map view
│   │   ├── calendar/   # Calendar integration
│   │   ├── search/     # Search and filters
│   │   └── common/     # Shared components (Header, Footer, etc.)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   └── AboutPage.tsx
│   ├── hooks/          # Custom React hooks
│   ├── api/            # API client (React Query)
│   ├── utils/          # Helpers, formatters
│   ├── i18n/           # Translation JSON files
│   ├── types/          # TypeScript types
│   └── App.tsx
├── public/
│   ├── sw.js          # Service Worker (PWA, notifications)
│   └── manifest.json  # PWA manifest
└── package.json
```

**Key Libraries**:

- `react` + `react-dom` - Core
- `typescript` - Type safety
- `vite` - Build tool (fast, modern)
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client
- `react-router-dom` - Routing
- `tailwindcss` - Styling
- `leaflet` or `mapbox-gl` - Maps
- `date-fns` - Date formatting
- `i18next` - Internationalization
- `workbox` - Service Worker utilities (PWA)

## 🗂️ Data Models

### Primary Models

**Event**

```python
class Event(models.Model):
    # Basic Info
    title = JSONField()  # {"pl": "...", "en": "...", "uk": "..."}
    description = JSONField()  # Translated descriptions
    slug = SlugField(unique=True)

    # Classification
    category = CharField(choices=CATEGORY_CHOICES)
    # Choices: CONCERT, FESTIVAL, THEATRE, CINEMA, WORKSHOP, FOOD, CULTURAL
    event_type = CharField(choices=TYPE_CHOICES)
    # Choices: EVENT, PRODUCT, WORKSHOP

    # Time & Location
    start_date = DateTimeField()
    end_date = DateTimeField(null=True)
    duration_minutes = IntegerField(null=True)  # For workshops
    location = ForeignKey('locations.Location')
    coordinates = PointField()  # PostGIS

    # Details
    price_type = CharField(choices=['FREE', 'PAID'])
    price_amount = DecimalField(null=True)
    price_currency = CharField(default='PLN')
    age_restriction = IntegerField(null=True)

    # Organizer
    organizer = ForeignKey('events.Organizer', null=True)
    organizer_contact = CharField()
    external_url = URLField(null=True)
    ticket_url = URLField(null=True)

    # Media
    image = ImageField()
    images = JSONField(default=list)  # Multiple images

    # Meta
    source = CharField(choices=['SCRAPED', 'MANUAL', 'USER_SUBMITTED'])
    facebook_event_id = CharField(null=True, unique=True)
    moderation_status = CharField(choices=['PENDING', 'APPROVED', 'REJECTED'])

    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Product (Local Market)**

```python
class Product(models.Model):
    title = JSONField()  # Translated
    description = JSONField()
    category = CharField(choices=PRODUCT_CATEGORY_CHOICES)
    # Choices: HONEY, JAM, VEGETABLES, OILS, CRAFTS, JEWELRY, OTHER

    producer = ForeignKey('products.Producer')
    location = ForeignKey('locations.Location')

    price = DecimalField(null=True)
    availability = CharField(choices=['AVAILABLE', 'SEASONAL', 'SOLD_OUT'])

    contact_phone = CharField()
    contact_email = EmailField(null=True)

    images = JSONField(default=list)

    created_at = DateTimeField(auto_now_add=True)
```

**Location**

```python
class Location(models.Model):
    name = CharField()  # e.g., "Ustrzyki Dolne"
    name_en = CharField()
    name_uk = CharField()

    location_type = CharField(choices=['TOWN', 'VILLAGE', 'AREA'])

    coordinates = PointField()  # PostGIS

    # Admin hierarchy
    gmina = CharField()  # Municipality
    powiat = CharField()  # District
    voivodeship = CharField(default='Podkarpackie')

    # For scraping/search
    alternative_names = JSONField(default=list)
```

**Organizer**

```python
class Organizer(models.Model):
    name = CharField()
    description = TextField()

    location = ForeignKey('locations.Location', null=True)

    contact_email = EmailField(null=True)
    contact_phone = CharField(null=True)
    website = URLField(null=True)

    facebook_page = URLField(null=True)
    facebook_page_id = CharField(null=True)

    # For scraping
    is_verified_partner = BooleanField(default=False)
    scraping_enabled = BooleanField(default=False)

    created_at = DateTimeField(auto_now_add=True)
```

## 🔧 Key Features Implementation

### 1. Location-Based Event Discovery

**Mobile (GPS)**:

```javascript
// Frontend: Request user location
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  fetchNearbyEvents(latitude, longitude, radiusKm);
});
```

**Desktop (IP-based)**:

```python
# Backend: GeoIP lookup
from geoip2 import database
reader = database.Reader('/path/to/GeoLite2-City.mmdb')
response = reader.city(ip_address)
lat, lng = response.location.latitude, response.location.longitude
```

**API Endpoint**:

```python
# GET /api/events/nearby/?lat=49.4&lng=22.5&radius=25
# Returns events sorted by distance
from django.contrib.gis.measure import D  # Distance
from django.contrib.gis.geos import Point

user_location = Point(lng, lat, srid=4326)
nearby_events = Event.objects.filter(
    coordinates__distance_lte=(user_location, D(km=radius))
).distance(user_location).order_by('distance')
```

### 2. Multi-Language Support

**Translation Workflow**:

1. Admin creates event in Polish
2. Celery task calls DeepL API to translate to EN/UK
3. Translations stored in JSONField
4. Frontend requests language via `Accept-Language` header or query param

```python
# Celery task
@shared_task
def translate_event(event_id):
    event = Event.objects.get(id=event_id)
    translator = deepl.Translator(settings.DEEPL_API_KEY)

    # Translate title
    event.title['en'] = translator.translate_text(
        event.title['pl'], target_lang='EN-GB'
    ).text
    event.title['uk'] = translator.translate_text(
        event.title['pl'], target_lang='UK'
    ).text

    # Same for description...
    event.save()
```

**Frontend**:

```javascript
// i18n configuration
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Static translations (UI)
import pl from "./i18n/pl.json";
import en from "./i18n/en.json";
import uk from "./i18n/uk.json";

i18n.use(initReactI18next).init({
  resources: { pl, en, uk },
  lng: navigator.language.startsWith("pl")
    ? "pl"
    : navigator.language.startsWith("uk")
    ? "uk"
    : "en",
  fallbackLng: "pl",
});

// Dynamic translations (events)
const event = await fetchEvent(id);
const title = event.title[i18n.language];
```

### 3. Facebook Event Scraper

**Celery Periodic Task**:

```python
@periodic_task(run_every=crontab(hour=2, minute=0))  # Daily at 2 AM
def scrape_facebook_events():
    sources = FacebookSource.objects.filter(scraping_enabled=True)

    for source in sources:
        try:
            events = scrape_facebook_page_events(source.facebook_url)
            for event_data in events:
                Event.objects.update_or_create(
                    facebook_event_id=event_data['id'],
                    defaults={
                        'title': {'pl': event_data['title']},
                        'description': {'pl': event_data['description']},
                        'start_date': event_data['start_time'],
                        'source': 'SCRAPED',
                        'moderation_status': 'PENDING',
                        'organizer': source.organizer
                    }
                )
                # Trigger translation task
                translate_event.delay(event.id)
        except Exception as e:
            logger.error(f"Scraping failed for {source.name}: {e}")
```

**Selenium Implementation**:

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

def scrape_facebook_page_events(page_url):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    driver.get(f"{page_url}/events")
    # Wait for events to load, extract data
    # ... scraping logic ...

    driver.quit()
    return events
```

### 4. Browser Push Notifications

**Service Worker** (`public/sw.js`):

```javascript
// Listen for notification permission
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: { url: data.url },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

**Frontend Integration**:

```javascript
// Request permission
const permission = await Notification.requestPermission();

// Save event to IndexedDB with reminder
const db = await openDB("bieszczady-events", 1);
await db.put("saved-events", {
  eventId: event.id,
  reminderTime: addDays(event.start_date, -1), // 1 day before
  notificationPreference: "DAY_BEFORE",
});

// Check periodically (in Service Worker)
// When reminder time reached, show push notification
```

### 5. Calendar Export (.ics)

```python
from icalendar import Calendar, Event as ICalEvent

def generate_ics(event):
    cal = Calendar()
    cal.add('prodid', '-//Bieszczady.plus//Event//PL')
    cal.add('version', '2.0')

    ical_event = ICalEvent()
    ical_event.add('summary', event.title['pl'])
    ical_event.add('dtstart', event.start_date)
    ical_event.add('dtend', event.end_date or event.start_date)
    ical_event.add('location', event.location.name)
    ical_event.add('description', event.description['pl'])
    ical_event.add('url', f"https://bieszczady.plus/event/{event.slug}")

    cal.add_component(ical_event)
    return cal.to_ical()

# API endpoint: GET /api/events/{id}/calendar.ics
```

## 📱 Mobile-First Development Guidelines

1. **Test on mobile devices first** - Use Chrome DevTools mobile emulation
2. **Touch targets**: Minimum 44x44px for buttons
3. **Viewport units**: Use `vh`, `vw` for responsive layouts
4. **Performance**: Lazy load images, code splitting
5. **Offline-first**: Service Worker caching for key pages
6. **Fast 3G testing**: Throttle network in DevTools

## 🎨 UI/UX Patterns

### Event Card (Mobile)

```jsx
<div className="event-card bg-white rounded-lg shadow-md p-4 mb-4">
  <img src={event.image} className="w-full h-48 object-cover rounded-md" />
  <h3 className="text-lg font-semibold mt-3">{event.title[lang]}</h3>
  <div className="flex items-center text-sm text-gray-600 mt-2">
    <CalendarIcon className="w-4 h-4 mr-2" />
    <span>{formatDate(event.start_date)}</span>
  </div>
  <div className="flex items-center text-sm text-gray-600 mt-1">
    <LocationIcon className="w-4 h-4 mr-2" />
    <span>{event.location.name}</span>
    <span className="ml-auto">{event.distance.toFixed(1)} km</span>
  </div>
  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md">
    {t("view_details")}
  </button>
</div>
```

### Filter Bar

```jsx
<div className="filter-bar sticky top-0 bg-white shadow-md p-4 z-10">
  <select className="w-full mb-2" onChange={(e) => setCategory(e.target.value)}>
    <option value="">{t("all_categories")}</option>
    <option value="CONCERT">{t("concerts")}</option>
    <option value="FESTIVAL">{t("festivals")}</option>
    {/* ... */}
  </select>

  <input
    type="range"
    min="5"
    max="100"
    value={radius}
    onChange={(e) => setRadius(e.target.value)}
    className="w-full"
  />
  <span className="text-sm">
    {t("within")} {radius} km
  </span>
</div>
```

## 🚀 Development Workflow

### 1. Starting New Feature

**With Docker (Recommended):**

```bash
# Start containers
docker-compose up -d
# Or: make up

# Create feature branch
git checkout -b feature/event-calendar-export

# Backend changes (in container)
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend pytest apps.events

# Frontend changes (auto-reload)
# Just edit files in frontend/src/

# Commit
git add .
git commit -m "feat: Add calendar export functionality"
git push origin feature/event-calendar-export
```

**Manual Setup:**

```bash
# Create branch
git checkout -b feature/event-calendar-export

# Backend changes
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py test apps.events

# Frontend changes
cd frontend
npm run dev
# Test in browser

# Commit
git add .
git commit -m "feat: Add calendar export functionality"
git push origin feature/event-calendar-export
```

### 2. Testing

**With Docker:**

```bash
# Backend tests
docker-compose exec backend pytest
# Or: make test

# Frontend tests
docker-compose exec frontend npm run test
```

**Manual:**

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (if implemented)
cd frontend
npm run test
```

### 3. Code Quality

- **Backend**: Follow PEP 8, use Black formatter
- **Frontend**: ESLint + Prettier
- **TypeScript**: Strict mode enabled
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## 🔐 Security Considerations

1. **No user authentication (Phase 1)** - No passwords to secure
2. **CORS**: Restrict to bieszczady.plus domain in production
3. **Rate limiting**: Prevent scraper abuse, API spam
4. **Input validation**: Sanitize all user inputs (search queries)
5. **HTTPS only**: Enforce in production (Coolify handles this)
6. **Secrets**: Use environment variables, never commit API keys

## 📦 Deployment Checklist

**Docker/Coolify Deployment:**

- [x] Docker Compose files created (development & production)
- [x] Dockerfile for backend (Gunicorn)
- [x] Dockerfile for frontend (serve, not Nginx - Coolify uses Traefik)
- [x] Traefik labels configured in docker-compose.prod.yml
- [ ] Code pushed to GitHub/GitLab
- [ ] Repository connected in Coolify
- [ ] Environment variables configured in Coolify:
  - [ ] SECRET_KEY (Django)
  - [ ] POSTGRES_PASSWORD
  - [ ] DEEPL_API_KEY
  - [ ] ALLOWED_HOSTS (api.bieszczady.plus)
  - [ ] CORS_ALLOWED_ORIGINS (https://bieszczady.plus)
  - [ ] BACKEND_DOMAIN (api.bieszczady.plus)
  - [ ] FRONTEND_DOMAIN (bieszczady.plus)
- [ ] DNS A records pointing to VPS IP
- [ ] Deployed via Coolify (auto SSL via Let's Encrypt)
- [ ] Database migrations applied (auto via entrypoint)
- [ ] Celery worker running for background tasks
- [ ] GeoIP2 database configured (optional)
- [ ] Facebook scraper tested with approved pages
- [ ] Translation API keys working
- [ ] Service Worker registered (PWA)
- [ ] Verify both domains accessible (https://bieszczady.plus, https://api.bieszczady.plus)

## 🐛 Common Issues & Solutions

**With Docker:**

**Issue**: Container won't start

- Check: `docker-compose logs backend` or `make logs-backend`
- Check: Port conflicts? Change port in docker-compose.yml
- Fix: `docker-compose down -v && docker-compose up -d --build`

**Issue**: Database connection refused

- Check: `docker-compose ps` - ensure db is healthy
- Wait: Database health check takes ~10 seconds
- Fix: `docker-compose restart db && docker-compose restart backend`

**Issue**: Module not found / dependency issues

- Fix: Rebuild containers: `docker-compose build --no-cache backend`

**Manual Setup:**

**Issue**: Events not appearing on map

- Check: PostGIS extension installed? `CREATE EXTENSION postgis;`
- Check: Coordinates in correct format (lng, lat, not lat, lng)

**Issue**: Facebook scraper failing

- Check: Rate limits? Add delays between requests
- Check: Page structure changed? Update selectors

**Issue**: Translations not working

- Check: API key valid? Test with curl
- Check: Celery worker running? `celery -A config worker -l info`

**Issue**: Notifications not showing

- Check: HTTPS enabled? (required for push notifications)
- Check: Notification permission granted?
- Check: Service Worker registered?

## 💡 Best Practices

1. **Keep it simple** - Seba is experienced but prefers clarity
2. **Mobile-first** - Always test mobile view first
3. **Performance matters** - Bieszczady has spotty 3G/4G coverage
4. **Accessibility** - Semantic HTML, proper ARIA labels
5. **Offline capability** - Cache critical resources
6. **Error handling** - Graceful degradation, helpful error messages
7. **Logging** - Use Django logging for debugging scraper issues

## 📞 Communication Style

When providing code/guidance to Seba:

- **Be direct** - No excessive explanations, he knows the stack
- **Code-first** - Show working examples
- **Polish terms OK** - He's Polish, can mix English/Polish
- **Production-ready** - Not toy examples, real implementations
- **Coolify-aware** - Understand his deployment environment

## 🎯 Current Priority (Phase 1 MVP)

1. ✅ Core Django + React setup
2. Event listing with search/filters
3. Location-based discovery (GPS + IP)
4. Facebook scraper integration
5. Calendar export (.ics)
6. Browser push notifications
7. Multi-language support (PL/EN/UK)
8. Basic product/producer listings

**Timeline**: MVP in 4-6 weeks, then iterate based on user feedback.

---

**Remember**: This is a community service for Bieszczady region. Keep it fast, accessible, and privacy-focused. No tracking, no ads (yet), just pure event discovery.
