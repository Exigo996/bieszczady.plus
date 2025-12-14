# Quick Start Guide - Bieszczady.plus

Get up and running with Bieszczady.plus in 15 minutes.

## Prerequisites

- **Python 3.11+** installed
- **Node.js 20+** and npm installed
- **PostgreSQL 16+** with PostGIS extension
- **Redis** (for Celery)
- **Git** for version control

## 1. Initial Setup (5 minutes)

```bash
# Clone the repository (once it's created)
git clone https://github.com/yourusername/bieszczady-plus.git
cd bieszczady-plus

# Create necessary directories
mkdir -p backend/media backend/static
mkdir -p frontend/public/icons
```

## 2. Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (create requirements files first)
pip install django djangorestframework django-cors-headers
pip install psycopg2-binary pillow
pip install celery redis
pip install selenium beautifulsoup4
pip install deepl geoip2

# Or use requirements file (once created):
# pip install -r requirements/development.txt

# Create Django project
django-admin startproject config .

# Configure database in config/settings.py
# Add this to DATABASES:
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'bieszczady',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Install PostGIS in PostgreSQL
# In psql:
# CREATE DATABASE bieszczady;
# \c bieszczady
# CREATE EXTENSION postgis;

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
# Backend running at http://localhost:8000
```

## 3. Frontend Setup (5 minutes)

```bash
cd frontend

# Initialize React project with Vite
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom @tanstack/react-query axios
npm install leaflet react-leaflet
npm install i18next react-i18next
npm install date-fns
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/leaflet

# Initialize Tailwind CSS
npx tailwindcss init -p

# Configure Tailwind (update tailwind.config.js):
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

# Add Tailwind to src/index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
# Frontend running at http://localhost:5173
```

## 4. First Django App - Events

```bash
cd backend

# Create events app
python manage.py startapp events apps/events

# Add to INSTALLED_APPS in config/settings.py:
INSTALLED_APPS = [
    # ...
    'django.contrib.gis',
    'rest_framework',
    'corsheaders',
    'apps.events',
]

# Add CORS middleware:
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this near the top
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Create basic Event model in apps/events/models.py:
from django.contrib.gis.db import models as gis_models
from django.db import models

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('CONCERT', 'Concert'),
        ('FESTIVAL', 'Festival'),
        ('THEATRE', 'Theatre'),
        ('CINEMA', 'Cinema'),
        ('WORKSHOP', 'Workshop'),
        ('FOOD', 'Food Event'),
        ('CULTURAL', 'Cultural Event'),
    ]

    title = models.JSONField(default=dict)  # {"pl": "", "en": "", "uk": ""}
    description = models.JSONField(default=dict)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)

    location_name = models.CharField(max_length=200)
    coordinates = gis_models.PointField(geography=True)

    price_type = models.CharField(max_length=10, choices=[('FREE', 'Free'), ('PAID', 'Paid')])
    price_amount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    image = models.ImageField(upload_to='events/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title.get('pl', 'Untitled')

    class Meta:
        ordering = ['-start_date']

# Make migrations
python manage.py makemigrations
python manage.py migrate
```

## 5. Create Basic API

```bash
# Create apps/events/serializers.py:
from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

# Create apps/events/views.py:
from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

# Create apps/events/urls.py:
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# Update config/urls.py:
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.events.urls')),
]

# Register in admin (apps/events/admin.py):
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'category', 'start_date', 'location_name']
    list_filter = ['category', 'start_date']
    search_fields = ['title']
```

## 6. Test Your Setup

```bash
# Backend: Add test event via Django admin
# Go to http://localhost:8000/admin
# Login with superuser credentials
# Add a test event

# Test API endpoint
curl http://localhost:8000/api/events/

# Frontend: Fetch events
# Create src/api/client.ts:
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;

# Create src/api/events.ts:
import api from './client';

export const fetchEvents = async () => {
  const response = await api.get('/events/');
  return response.data;
};

# Update src/App.tsx to fetch and display events:
import { useEffect, useState } from 'react';
import { fetchEvents } from './api/events';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bieszczady.plus</h1>
      <div className="grid gap-4">
        {events.map((event: any) => (
          <div key={event.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{event.title.pl}</h2>
            <p>{event.location_name}</p>
            <p>{new Date(event.start_date).toLocaleDateString('pl-PL')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

## 7. Verify Everything Works

- [ ] Backend running at http://localhost:8000
- [ ] Admin accessible at http://localhost:8000/admin
- [ ] API returns events at http://localhost:8000/api/events/
- [ ] Frontend running at http://localhost:5173
- [ ] Frontend displays events fetched from API
- [ ] No CORS errors in browser console

## Next Steps

Now that you have the foundation:

1. **Read CLAUDE.md** - Understand the full architecture
2. **Review ROADMAP.md** - See what features to build next
3. **Check PROJECT-STRUCTURE.md** - Understand where files go
4. **Start building**:
   - Add more models (Product, Location, Organizer)
   - Implement search and filters
   - Add geolocation features
   - Build event detail pages
   - Implement calendar export

## Common Issues

**"ImportError: No module named django.contrib.gis"**
→ Install PostGIS: `CREATE EXTENSION postgis;` in your database

**CORS errors in browser**
→ Check `CORS_ALLOWED_ORIGINS` in settings.py includes your frontend URL

**Events not appearing**
→ Check API response in browser DevTools → Network tab
→ Verify data in Django admin

**Port already in use**
→ Backend: `python manage.py runserver 8001`
→ Frontend: Update in `vite.config.ts` or use different port

## Resources

- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Tailwind: https://tailwindcss.com/
- PostGIS: https://postgis.net/

---

**You're ready to build Bieszczady.plus! 🚀**

Questions? Check CLAUDE.md or open an issue on GitHub.
