# Bieszczady.plus - Regional Event & Local Market Platform

**A community-driven platform showcasing events, local producers, and craftspeople in the Bieszczady region of Podkarpackie, Poland.**

## 🎯 Project Vision

Bieszczady.plus serves as a centralized notice board for tourists and local citizens to discover:

- Cultural events (concerts, festivals, theatre, cinema, workshops)
- Local agricultural products (honey, jams, vegetables, oils)
- Handcrafted items (jewelry, crafts)
- Community activities and gatherings

The platform bridges the gap between event organizers, local producers, and visitors, making the Bieszczady region more accessible and vibrant.

## 🌟 Core Features

### Phase 1: MVP (Current Focus)

- **Event Discovery**
  - Browse events by category, location, and date
  - Location-based suggestions (GPS on mobile, IP-based on desktop)
  - Distance-based filtering with user-defined radius
  - Multi-language support (Polish, English, Ukrainian)
- **Local Market**

  - Dedicated section for local producers and craftspeople
  - Product listings with contact information
  - Support local agriculture and crafts

- **Smart Search**

  - Search by keyword, location, type
  - Filter by date range, distance, price, category
  - Save favorite event organizers

- **Calendar Integration**

  - Download individual events (.ics format)
  - Subscribe to event organizer calendars
  - Google Calendar integration

- **Notifications**

  - Event reminders (1 week, 1 day, or custom before event)
  - Browser-based notifications (no user accounts required)
  - Privacy-focused (no personal data storage)

- **Facebook Event Scraper**
  - Automated scraping from approved Pages/Groups
  - Manual moderation workflow
  - Partner organization integration

### Phase 2: Enhanced Platform

- **User Registration System** (Priority 2)
  - Event creator accounts
  - Direct event submission
  - Producer/craftsperson profiles
- **Social Media Integration** (Priority 1)
  - Cross-posting to Facebook, Instagram, TikTok, Twitter
  - Unified event promotion
- **Ticket Sales Integration** (Priority 3)
  - Partner with ticketing platforms
  - Embedded ticket purchasing

### Phase 3: Advanced Features

- AI-powered event descriptions (Priority 5)
- Event reviews and ratings (Priority 5)
- Photo galleries from attendees (Priority 5)

## 🗺️ Geographic Scope

**Current Coverage:**

- Bieszczady region, Podkarpackie Voivodeship, Poland
- Village/town-level granularity (e.g., Ustrzyki Dolne, Solina, Wetlina, Cisna)

**Planned Expansion:**

- Full Podkarpackie Voivodeship
- Cross-border partnerships (Slovakia, Ukraine)

## 🏗️ Technical Architecture

### Backend

- **Framework**: Django 5.1+
- **API**: Django REST Framework
- **Database**: PostgreSQL with PostGIS (geospatial queries)
- **Cache/Queue**: Redis + Celery
- **Scraping**: Selenium + Beautiful Soup
- **Geolocation**: GeoIP2, browser Geolocation API
- **i18n**: Django translation framework + AI translation service

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)
- **UI Components**: Tailwind CSS + shadcn/ui
- **Maps**: Leaflet or Mapbox
- **PWA**: Service Workers for offline capability
- **Mobile-First**: Responsive design with mobile priority

### Infrastructure

- **Hosting**: OVH VPS with Coolify
- **Domain**: bieszczady.plus
- **SSL**: Let's Encrypt (via Coolify/Traefik)
- **CDN**: Cloudflare (for static assets)

## 📊 Data Models

### Event

```python
- title (translated: PL, EN, UK)
- description (translated: PL, EN, UK)
- category (Concert, Festival, Theatre, Cinema, Workshop, Food, Cultural)
- event_type (Event, Product, Workshop)
- start_date, end_date
- location (town/village)
- coordinates (lat, lng)
- price (free/paid, amount)
- age_restriction
- organizer (name, contact, facebook_page)
- images
- external_links (tickets, registration)
- source (scraped/manual/user_submitted)
- moderation_status
- duration (for workshops/events)
```

### Product (Local Market)

```python
- title (translated)
- description (translated)
- category (Honey, Jam, Vegetables, Oils, Crafts, etc.)
- producer_name
- location
- contact_info
- price
- images
- availability
```

### Organizer

```python
- name
- description
- location
- contact
- facebook_page
- website
- verified_partner (bool)
```

## 🔧 Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/bieszczady-plus.git
cd bieszczady-plus

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

## 🌍 Internationalization

### Translation Strategy

- **Static Content**: JSON files for UI strings (Polish, English, Ukrainian)
- **Dynamic Content**: AI-powered translation for event descriptions
- **User Preference**: Auto-detect browser language, allow manual override
- **SEO**: Proper hreflang tags for each language variant

### AI Translation Service

- Primary: DeepL API (high-quality Polish/Ukrainian translations)
- Fallback: Google Translate API
- Cache translations to avoid repeated API calls

## 🔔 Notification System

### Implementation (No User Accounts)

- **Browser Push Notifications** (via Service Workers)
- **IndexedDB Storage** (user's saved events and preferences)
- **No Server-Side User Data** (GDPR-friendly)
- **Reminder Flow**:
  1. User marks event as "Interested"
  2. Event saved to IndexedDB with reminder preference (1 week/1 day/custom)
  3. Service Worker checks periodically for upcoming events
  4. Push notification sent at configured time
  5. Notification links directly to event details

### User Transparency

- Clear messaging: "Events saved locally in your browser"
- Warning: "Clear browser data = lose saved events"
- Export option: Download saved events as .ics file

## 🤖 Facebook Event Scraper

### Architecture

```python
# Celery periodic task (runs daily)
- Fetch approved Facebook Pages/Groups
- Extract event data (title, date, location, description)
- Store in database with status='pending_moderation'
- Notify admin for review
- Admin approves → status='published'
```

### Approved Partners

- Tracked in database (FacebookSource model)
- Easy to add/remove pages
- Scraping frequency configurable per source

### Rate Limiting

- Respect Facebook's rate limits
- Randomized delays between requests
- User-agent rotation
- Headless browser with Selenium (avoid detection)

## 📱 Progressive Web App (PWA)

- **Offline Capability**: Cache event listings for offline viewing
- **Install Prompt**: "Add to Home Screen" for mobile users
- **App-like Experience**: Full-screen mode, splash screen
- **Background Sync**: Update events when connection restored

## 🚀 Deployment

### Coolify Configuration

```yaml
# Production deployment on OVH VPS
- Backend: Django with Gunicorn
- Frontend: Static build served via Nginx
- Database: PostgreSQL with PostGIS extension
- Cache: Redis
- Worker: Celery for scraping tasks
- SSL: Automatic via Let's Encrypt
```

### Environment Variables

```env
# Django
SECRET_KEY=
DEBUG=False
ALLOWED_HOSTS=bieszczady.plus,www.bieszczady.plus
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Geolocation
GEOIP2_DATABASE_PATH=/path/to/GeoLite2-City.mmdb

# Translation
DEEPL_API_KEY=
GOOGLE_TRANSLATE_API_KEY=

# Social Media (Phase 2)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
# ... etc
```

## 🎨 Design Principles

- **Mobile-First**: Optimized for phones (primary use case)
- **Minimal Design**: Clean, fast, distraction-free
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <3s load time on 3G
- **Nature-Themed**: Subtle Bieszczady mountains imagery

## 📈 Success Metrics

### MVP Goals

- [ ] 50+ events listed within first month
- [ ] 10+ local producers featured
- [ ] 1000+ monthly visitors
- [ ] 5+ verified partner organizations

### Long-term Vision

- Regional hub for Bieszczady events and local economy
- Cross-border expansion (Slovakia, Ukraine)
- Sustainable monetization supporting continued development
- Community ownership and engagement

## 🤝 Contributing

This is a community-focused open-source project. Contributions welcome!

### Priority Areas

1. Facebook scraper improvements
2. Translation quality
3. Mobile UX optimization
4. Event categorization accuracy

## 📄 License

MIT License - Free to use, modify, and distribute.

## 🙏 Acknowledgments

Built with support from:

- Local event organizers in Bieszczady
- Podkarpackie tourism organizations
- Local producers and craftspeople
- Community feedback and testing

---

**Contact**: [Your contact information]  
**Website**: https://bieszczady.plus  
**Region**: Bieszczady, Podkarpackie, Poland 🇵🇱
