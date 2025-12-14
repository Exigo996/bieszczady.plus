# Development Roadmap - Bieszczady.plus

## Phase 1: MVP (4-6 weeks)

### Week 1-2: Foundation

**Backend**

- [x] Django project setup with PostgreSQL + PostGIS
- [ ] Core models: Event, Product, Location, Organizer
- [ ] Django Admin customization for content moderation
- [ ] REST API endpoints (DRF)
- [ ] CORS configuration
- [ ] Basic seed data (Bieszczady locations)

**Frontend**

- [x] React + TypeScript + Vite setup
- [ ] Tailwind CSS configuration
- [ ] Basic routing (Home, Events, Products, Event Detail)
- [ ] API client with React Query
- [ ] i18n setup (Polish, English, Ukrainian)
- [ ] Mobile-first layout components

**Infrastructure**

- [x] Docker development environment
- [x] Docker Compose configuration
- [x] Production Dockerfile (Coolify-ready)
- [x] Local development environment documentation
- [x] Git repository structure
- [x] Environment variables management

### Week 3-4: Core Features

**Location & Discovery**

- [ ] PostGIS geospatial queries
- [ ] IP-based geolocation (GeoIP2)
- [ ] GPS location request (frontend)
- [ ] Distance calculation and sorting
- [ ] Radius filter (5km, 10km, 25km, 50km, 100km)
- [ ] Interactive map view (Leaflet)

**Event Listing & Search**

- [ ] Event listing page with filters
- [ ] Category filter (Concert, Festival, Theatre, etc.)
- [ ] Date range picker
- [ ] Price filter (Free/Paid)
- [ ] Location/town filter
- [ ] Keyword search (title, description)
- [ ] Event detail page with full information
- [ ] Responsive event cards

**Product Listings**

- [ ] Producer/product listing page
- [ ] Category filter (Honey, Jams, Crafts, etc.)
- [ ] Product detail view
- [ ] Contact information display

### Week 5-6: Enhanced Features

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

**Facebook Scraper (Basic)**

- [ ] Selenium setup with headless Chrome
- [ ] Scraper for single Facebook page/group
- [ ] Event data extraction (title, date, location, description)
- [ ] Save to database with PENDING status
- [ ] Admin moderation workflow
- [ ] Celery periodic task (daily scraping)

**Translation System**

- [ ] DeepL API integration
- [ ] Celery task for async translation
- [ ] JSONField for multi-language content
- [ ] UI language switcher
- [ ] Static content translation files (JSON)

### End of Phase 1: MVP Launch

**Deployment**

- [x] Docker production configuration (docker-compose.prod.yml)
- [x] Coolify deployment documentation (COOLIFY-DEPLOYMENT.md)
- [ ] Production environment setup on OVH VPS
- [ ] Coolify deployment configuration
- [ ] SSL certificate (Let's Encrypt) - Auto via Coolify
- [ ] Domain configuration (bieszczady.plus)
- [ ] Database backup strategy
- [ ] Monitoring and logging

**Content**

- [ ] 20+ events manually added
- [ ] 5+ local producers featured
- [ ] 10+ Bieszczady locations in database
- [ ] 2-3 approved Facebook sources for scraping

**Launch Checklist**

- [ ] Performance testing (mobile 3G)
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Multi-language content verification
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
- [ ] Frontend code splitting
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
- [ ] Code quality checks (linting, formatting)

### Security

- [ ] GDPR compliance audit
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Rate limiting for API endpoints
- [ ] DDoS protection
- [ ] Regular dependency updates
- [ ] Penetration testing

---

## Success Metrics

### Phase 1 (MVP)

- **Users**: 1,000+ monthly visitors
- **Content**: 50+ events, 10+ producers
- **Engagement**: 100+ calendar downloads
- **Partners**: 5+ verified event organizers

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

Last updated: 2024-12-15
