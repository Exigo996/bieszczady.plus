# Development Roadmap - Bieszczady.plus

## Phase 1: MVP (4-6 weeks)

### Week 1-2: Foundation ✅

**Backend** ✅

- [x] Django project setup with PostgreSQL
- [x] Core models: Event, Organizer, Location, EventDate
- [x] Django Admin customization for content moderation
- [x] REST API endpoints (DRF) - Events, Organizers
- [x] CORS configuration
- [x] Basic seed data (Bieszczady locations)

**Frontend** ✅

- [x] React 19 + TypeScript + Vite setup
- [x] Tailwind CSS v4 configuration
- [x] Basic routing (Home, Map, Products, Organizer)
- [x] API client with React Query (TanStack Query)
- [x] i18n setup (Polish, English, Ukrainian)
- [x] Mobile-first layout components

**Infrastructure** ✅

- [x] Docker development environment
- [x] Docker Compose configuration
- [x] Production Dockerfile (Coolify-ready)
- [x] Local development environment documentation
- [x] Git repository structure
- [x] Environment variables management

### Week 3-4: Core Features 🚧

**Location & Discovery**

- [ ] Distance-based filtering
- [ ] IP-based geolocation (GeoIP2)
- [ ] GPS location request (frontend)
- [ ] Distance calculation and sorting
- [ ] Radius filter (5km, 10km, 25km, 50km, 100km)
- [x] Interactive map view (Leaflet) - **DONE**

**Event Listing & Search** ✅/🚧

- [x] Event listing page with filters - **DONE**
- [x] Category filter (Concert, Festival, Theatre, etc.) - **DONE**
- [x] Date range picker - **PARTIAL** (in FilterPanel)
- [x] Price filter (Free/Paid) - **DONE**
- [ ] Location/town filter
- [x] Keyword search (title, description) - **DONE**
- [ ] Event detail page with full information
- [x] Responsive event cards - **DONE**

**Product Listings** 🚧

- [x] Producer/product listing page structure - **DONE**
- [ ] Category filter (Honey, Jams, Crafts, etc.)
- [ ] Product detail view
- [ ] Contact information display

### Week 5-6: Enhanced Features 🚧

**Calendar Integration**

- [ ] .ics file generation for single events
- [ ] Download button on event details
- [ ] Google Calendar "Add to Calendar" link
- [ ] Organizer calendar feed (subscribe to all events)

**Notifications (Browser-based)**

- [ ] Service Worker setup (PWA)
- [ ] Push notification permission request
- [ ] IndexedDB for saved events
- [ ] Notification scheduling logic
- [ ] User preference: 1 week / 1 day / custom
- [ ] Notification display with event link

**Facebook Scraper** ✅/🚧

- [x] Playwright setup with headless Chrome - **DONE** (changed from Selenium)
- [x] Scraper for single Facebook page/group - **DONE**
- [x] Event data extraction (title, date, location, description) - **DONE**
- [ ] Save to database with PENDING status
- [ ] Admin moderation workflow
- [ ] Celery periodic task (daily scraping)

**Translation System** 🚧

- [ ] DeepL API integration
- [ ] Celery task for async translation
- [x] Multi-language content fields (PL/EN/UK) - **DONE**
- [x] UI language switcher - **DONE**
- [x] Static content translation files (PL/EN/UK) - **DONE**

### End of Phase 1: MVP Launch 🚧

**Deployment**

- [x] Docker production configuration (docker-compose.prod.yml) - **DONE**
- [x] Coolify deployment documentation (COOLIFY-DEPLOYMENT.md) - **DONE**
- [ ] Production environment setup on OVH VPS
- [ ] Coolify deployment configuration
- [ ] SSL certificate (Let's Encrypt) - Auto via Coolify
- [ ] Domain configuration (bieszczady.plus)
- [ ] Database backup strategy
- [ ] Monitoring and logging

**Content**

- [ ] 20+ events manually added
- [ ] 5+ local producers featured
- [x] 10+ Bieszczady locations in database - **DONE**
- [ ] 2-3 approved Facebook sources for scraping

**Launch Checklist**

- [ ] Performance testing (mobile 3G)
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [x] Multi-language content support - **DONE**
- [ ] Privacy policy page
- [ ] Contact/About page
- [ ] Analytics setup (privacy-friendly)

---

## Phase 2: User Engagement (2-3 months post-MVP)

### Social Media Integration (Priority 1)

- [ ] Facebook API integration
- [ ] Instagram API integration
- [ ] TikTok API integration
- [ ] Twitter/X API integration
- [ ] Unified post composer
- [ ] Cross-platform posting from single form
- [ ] Image optimization for each platform
- [ ] Scheduling capability

### User Registration (Priority 2)

- [ ] Django authentication system
- [ ] User registration and login
- [ ] Email verification
- [ ] Password reset
- [ ] User profile pages
- [ ] Event creator accounts
- [ ] Producer accounts
- [ ] Event submission form (authenticated users)
- [ ] Producer profile management

### Enhanced Features

- [ ] Save favorite organizers (local storage → user profile)
- [ ] Event recommendation engine (ML-based)
- [ ] Email notifications (opt-in)
- [ ] Advanced search filters
- [ ] Map clustering for many events
- [ ] Event sharing (social media, WhatsApp)

### Scraper Improvements

- [ ] Multiple Facebook pages/groups support
- [ ] Instagram event scraping (if applicable)
- [ ] Duplicate detection algorithm
- [ ] Auto-categorization using ML/AI
- [ ] Image extraction from Facebook events

---

## Phase 3: Advanced Platform (3-6 months post-Phase 2)

### Ticket Sales Integration (Priority 3)

- [ ] Research Polish ticketing platforms
- [ ] API integration (e.g., GoingApp, Evenea)
- [ ] Embedded ticket purchase
- [ ] Commission structure setup
- [ ] Payment processing (Stripe or local provider)

### Monetization

- [ ] Featured event listings (paid promotion)
- [ ] Banner ad system (local businesses)
- [ ] Premium producer profiles
- [ ] Analytics dashboard for organizers
- [ ] Subscription plans for frequent posters

### AI Features (Priority 5)

- [ ] AI-generated event descriptions from images
- [ ] Content quality improvement suggestions
- [ ] Automatic translation quality check
- [ ] Event categorization automation
- [ ] Sentiment analysis for reviews

### Community Features (Priority 5)

- [ ] Event reviews and ratings
- [ ] Photo galleries from attendees
- [ ] User comments on events
- [ ] Event check-in system
- [ ] Community leaderboards (gamification)
- [ ] User-generated content moderation

### Geographic Expansion

- [ ] Full Podkarpackie Voivodeship coverage
- [ ] Slovakia partnership integration
- [ ] Ukraine cross-border events
- [ ] Multi-region platform architecture
- [ ] Region-specific subdomain (e.g., slovakia.bieszczady.plus)

---

## Technical Debt & Improvements (Ongoing)

### Performance

- [ ] Database query optimization
- [ ] CDN for images (Cloudflare)
- [x] Frontend code splitting - **PARTIAL** (Vite handles this)
- [ ] Image lazy loading
- [ ] Service Worker caching strategy
- [ ] API response caching (Redis)

### Testing

- [ ] Backend unit tests (pytest)
- [ ] API integration tests
- [ ] Frontend component tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Accessibility tests (axe-core)

### Developer Experience

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Frontend component library (Storybook)
- [ ] CI/CD pipeline
- [ ] Automated deployment
- [x] Code quality checks (linting, formatting) - **DONE** (ESLint, Prettier)

### Security

- [x] GDPR compliance audit - **PARTIAL** (no user data collection)
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Rate limiting for API endpoints
- [ ] DDoS protection
- [ ] Regular dependency updates
- [ ] Penetration testing

---

## Success Metrics

### Phase 1 (MVP) 🚧

- **Users**: 1,000+ monthly visitors
- **Content**: 50+ events, 10+ producers
- **Engagement**: 100+ calendar downloads
- **Partners**: 5+ verified event organizers

**Current Status**:
- ✅ Platform foundation complete
- ✅ Core models implemented
- ✅ Frontend components built
- ⏳ Content creation in progress
- ⏳ Production deployment pending

### Phase 2

- **Users**: 5,000+ monthly visitors
- **Content**: 200+ events, 30+ producers
- **Engagement**: 500+ calendar downloads, 200+ push notification subscribers
- **Partners**: 20+ verified organizers, 3+ scraping sources

### Phase 3

- **Users**: 20,000+ monthly visitors
- **Content**: 1,000+ events, 100+ producers
- **Revenue**: Break-even on hosting costs
- **Geographic**: Expand to 2+ neighboring regions

---

## Notes

- **Flexibility**: This roadmap is a guide, not a contract. Adjust based on user feedback.
- **Community-first**: Always prioritize user value over monetization.
- **Sustainable**: Build at a pace that's maintainable for Seba as a solo developer.
- **Open to partners**: If local organizations want to contribute, accommodate them.

---

## Implementation Progress Summary

### ✅ Completed

| Feature | Status |
|---------|--------|
| Django 5.1 backend | ✅ |
| PostgreSQL | ✅ |
| Events app (Event, Organizer, Location, EventDate models) | ✅ |
| Gallery app (Image model) | ✅ |
| Scraper app (Playwright-based) | ✅ |
| DRF API endpoints | ✅ |
| React 19 + TypeScript + Vite | ✅ |
| TanStack Query | ✅ |
| Tailwind CSS v4 | ✅ |
| React Router v7 | ✅ |
| i18n (PL/EN/UK) | ✅ |
| Leaflet maps | ✅ |
| Components (Header, Footer, EventCard, FilterPanel) | ✅ |
| Pages (Home, Map, Products, Organizer) | ✅ |
| Docker environment | ✅ |

### 🚧 In Progress / TODO

| Feature | Status |
|---------|--------|
| Distance-based filtering | 🚧 |
| Event detail page | 🚧 |
| Calendar export (.ics) | 📋 |
| Push notifications | 📋 |
| DeepL translations | 📋 |
| GeoIP2 geolocation | 📋 |
| GPS location request | 📋 |
| PWA manifest | 📋 |

Last updated: 2025-01-28
