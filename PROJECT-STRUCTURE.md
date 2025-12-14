# Project Structure - Bieszczady.plus

## Repository Organization

```
bieszczady-plus/
├── README.md                 # Project overview and documentation
├── CLAUDE.md                 # AI assistant development guide
├── ROADMAP.md                # Development phases and timeline
├── LICENSE                   # MIT License
├── .gitignore               # Git ignore patterns
│
├── backend/                  # Django backend application
│   ├── config/              # Django project settings
│   │   ├── __init__.py
│   │   ├── settings/        # Split settings (base, dev, prod)
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py          # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/                # Django applications
│   │   ├── __init__.py
│   │   ├── events/          # Event management
│   │   │   ├── migrations/
│   │   │   ├── models.py    # Event, Organizer models
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── admin.py     # Admin customization
│   │   │   ├── filters.py   # Django filters
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── products/        # Local market (producers, crafts)
│   │   │   ├── migrations/
│   │   │   ├── models.py    # Product, Producer models
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── admin.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── locations/       # Geographic data
│   │   │   ├── migrations/
│   │   │   ├── models.py    # Location model (towns, villages)
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── admin.py
│   │   │   ├── management/  # Management commands
│   │   │   │   └── commands/
│   │   │   │       └── import_locations.py
│   │   │   └── tests/
│   │   │
│   │   ├── scraper/         # Facebook event scraping
│   │   │   ├── models.py    # FacebookSource model
│   │   │   ├── tasks.py     # Celery tasks
│   │   │   ├── scraper.py   # Selenium scraping logic
│   │   │   ├── admin.py
│   │   │   └── tests/
│   │   │
│   │   ├── notifications/   # Browser push notifications
│   │   │   ├── models.py
│   │   │   ├── views.py     # Subscription endpoints
│   │   │   ├── tasks.py     # Notification sending
│   │   │   └── tests/
│   │   │
│   │   └── translations/    # AI-powered translation
│   │       ├── services.py  # DeepL/Google Translate integration
│   │       ├── tasks.py     # Celery translation tasks
│   │       └── tests/
│   │
│   ├── api/                 # DRF API configuration
│   │   ├── __init__.py
│   │   ├── urls.py          # API URL routing
│   │   ├── permissions.py   # Custom permissions
│   │   ├── pagination.py    # Pagination classes
│   │   └── versioning.py    # API versioning
│   │
│   ├── utils/               # Shared utilities
│   │   ├── geolocation.py   # GeoIP, distance calculations
│   │   ├── calendar.py      # .ics file generation
│   │   ├── validators.py    # Custom validators
│   │   └── helpers.py       # Misc helpers
│   │
│   ├── locale/              # Translation files (Django i18n)
│   │   ├── pl/
│   │   │   └── LC_MESSAGES/
│   │   │       └── django.po
│   │   ├── en/
│   │   └── uk/
│   │
│   ├── static/              # Static files (admin, etc.)
│   ├── media/               # User uploads (event images)
│   │
│   ├── requirements/        # Python dependencies
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   │
│   ├── manage.py            # Django management script
│   ├── pytest.ini           # Pytest configuration
│   ├── .env.example         # Environment variables template
│   └── Dockerfile           # Docker container definition
│
├── frontend/                # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json    # PWA manifest
│   │   ├── sw.js            # Service Worker
│   │   ├── robots.txt
│   │   └── icons/           # PWA icons (various sizes)
│   │
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── events/
│   │   │   │   ├── EventCard.tsx
│   │   │   │   ├── EventList.tsx
│   │   │   │   ├── EventDetail.tsx
│   │   │   │   ├── EventFilters.tsx
│   │   │   │   └── EventMap.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductList.tsx
│   │   │   │   └── ProducerProfile.tsx
│   │   │   ├── map/
│   │   │   │   ├── MapView.tsx
│   │   │   │   ├── EventMarker.tsx
│   │   │   │   └── LocationPicker.tsx
│   │   │   ├── calendar/
│   │   │   │   ├── CalendarButton.tsx
│   │   │   │   └── CalendarExport.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── CategoryFilter.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationPrompt.tsx
│   │   │   │   └── ReminderSettings.tsx
│   │   │   └── common/
│   │   │       ├── Header.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── Navbar.tsx
│   │   │       ├── LanguageSwitcher.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   │
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── EventsPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useLanguage.ts
│   │   │
│   │   ├── api/             # API client
│   │   │   ├── client.ts    # Axios instance
│   │   │   ├── events.ts    # Event endpoints
│   │   │   ├── products.ts  # Product endpoints
│   │   │   ├── locations.ts # Location endpoints
│   │   │   └── types.ts     # API response types
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   ├── date.ts      # Date formatting
│   │   │   ├── distance.ts  # Distance calculations
│   │   │   ├── location.ts  # Location helpers
│   │   │   └── storage.ts   # IndexedDB helpers
│   │   │
│   │   ├── i18n/            # Internationalization
│   │   │   ├── index.ts     # i18next configuration
│   │   │   ├── pl.json      # Polish translations
│   │   │   ├── en.json      # English translations
│   │   │   └── uk.json      # Ukrainian translations
│   │   │
│   │   ├── types/           # TypeScript type definitions
│   │   │   ├── event.ts
│   │   │   ├── product.ts
│   │   │   ├── location.ts
│   │   │   └── common.ts
│   │   │
│   │   ├── styles/          # Global styles
│   │   │   ├── index.css    # Tailwind imports
│   │   │   └── custom.css   # Custom styles
│   │   │
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Entry point
│   │   └── vite-env.d.ts    # Vite TypeScript declarations
│   │
│   ├── package.json         # Node dependencies
│   ├── package-lock.json
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── .eslintrc.json       # ESLint rules
│   ├── .prettierrc          # Prettier configuration
│   └── .env.example         # Environment variables template
│
├── deployment/              # Deployment configurations
│   ├── docker-compose.yml   # Local development
│   ├── docker-compose.prod.yml  # Production
│   ├── nginx.conf           # Nginx configuration
│   └── coolify/             # Coolify-specific configs
│       └── .env.production
│
├── scripts/                 # Utility scripts
│   ├── setup_dev.sh         # Setup development environment
│   ├── deploy.sh            # Deployment script
│   ├── backup_db.sh         # Database backup
│   └── import_locations.py  # Import Bieszczady locations
│
└── docs/                    # Additional documentation
    ├── API.md               # API documentation
    ├── DEPLOYMENT.md        # Deployment guide
    ├── TRANSLATION.md       # Translation guide
    └── SCRAPER.md           # Scraper documentation
```

## Key Design Decisions

### Backend Architecture

- **Django Apps**: Modular design, each feature in separate app
- **DRF**: RESTful API for frontend consumption
- **PostGIS**: Geospatial queries for location-based features
- **Celery**: Async tasks (scraping, translations)
- **Redis**: Cache and message broker

### Frontend Architecture

- **React + TypeScript**: Type-safe, modern React
- **Vite**: Fast build tool, HMR for development
- **React Query**: Server state management, caching
- **Tailwind CSS**: Utility-first, mobile-first styling
- **PWA**: Offline capability, installable app

### Data Flow

1. **User requests events** → Frontend API call
2. **DRF view** → Query database with filters
3. **PostGIS** → Calculate distances, sort by proximity
4. **Serializer** → Transform data, select language
5. **Response** → Frontend renders event cards

### File Organization Principles

- **Separation of concerns**: Each app handles one domain
- **DRY**: Shared utilities in `utils/`
- **Testability**: Tests alongside code
- **Configuration**: Environment-based settings (dev/prod)
- **Scalability**: Easy to add new apps/features

## Development Workflow

### 1. Starting Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Adding New Feature

```bash
# Create Django app
cd backend
python manage.py startapp new_feature apps/new_feature

# Create React component
cd frontend/src/components
mkdir new_feature
touch new_feature/NewFeature.tsx
```

### 3. Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

## Configuration Files

### Backend `.env`

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/bieszczady
REDIS_URL=redis://localhost:6379/0
DEEPL_API_KEY=your-deepl-key
GEOIP2_DATABASE=/path/to/GeoLite2-City.mmdb
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your-key
```

## Next Steps

1. Review this structure
2. Set up backend skeleton
3. Set up frontend skeleton
4. Implement core models
5. Create basic API endpoints
6. Build MVP features

Ready to start coding! 🚀
