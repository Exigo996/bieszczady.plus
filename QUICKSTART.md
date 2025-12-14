# Quick Start Guide - Bieszczady.plus

Get up and running with Bieszczady.plus in **5 minutes** using Docker.

## 🎯 Recommended Approach: Docker (Easiest!)

**Why Docker?**

- ✅ No need to install PostgreSQL, PostGIS, Redis locally
- ✅ Identical environment to production (Coolify)
- ✅ One command to start everything
- ✅ Auto-reload on code changes
- ✅ Clean, isolated environment

**Prerequisites:**

- **Docker Desktop** for Mac ([download here](https://www.docker.com/products/docker-desktop/))
- **Git** for version control

### Quick Start with Docker (Recommended)

```bash
# 1. Install Docker Desktop
brew install --cask docker
# Or download from https://www.docker.com/products/docker-desktop/

# 2. Clone repository (or create new one)
git clone https://github.com/yourusername/bieszczady-plus.git
cd bieszczady-plus

# 3. Copy environment file (defaults work out of the box!)
cp .env.example .env

# 4. Start everything with ONE command
docker-compose up -d --build

# That's it! 🎉
```

**Access your app:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin (admin/admin123)

**Useful commands:**

```bash
make logs          # View all logs
make shell         # Django shell
make migrate       # Run migrations
make test          # Run tests
make down          # Stop everything
```

See **[DOCKER-GUIDE.md](DOCKER-GUIDE.md)** for complete Docker documentation.

---

## 🔧 Alternative: Manual Setup (Advanced)

Only use this if you prefer not to use Docker or need manual control.

### Prerequisites

> **Note:** This manual setup is more complex. We recommend using Docker (see above) unless you specifically need a manual installation.

- **Python 3.11+** installed
- **Node.js 20+** and npm installed
- **PostgreSQL 16+** with PostGIS extension
- **Redis** (for Celery)
- **Git** for version control

### 1. Initial Setup (15 minutes)

```bash
# Clone the repository (once it's created)
git clone https://github.com/yourusername/bieszczady-plus.git
cd bieszczady-plus

# Create necessary directories
mkdir -p backend/media backend/static
mkdir -p frontend/public/icons
```

### 2. Install PostgreSQL with PostGIS (macOS)

```bash
# Install via Homebrew
brew install postgresql@16 postgis

# Start PostgreSQL
brew services start postgresql@16

# Create database and enable PostGIS
psql postgres << EOF
CREATE DATABASE bieszczady;
\c bieszczady
CREATE EXTENSION postgis;
\q
EOF
```

### 3. Install Redis

```bash
# Install via Homebrew
brew install redis

# Start Redis
brew services start redis
```

### 4. Backend Setup (Django)

### 4. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/development.txt

# Configure database in .env (create from .env.example)
cp ../.env.example .env
# Edit .env and set:
# DATABASE_URL=postgresql://your_username@localhost:5432/bieszczady
# REDIS_URL=redis://localhost:6379/0

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
# Backend running at http://localhost:8000
```

### 5. Frontend Setup (React)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
# Frontend running at http://localhost:5173
```

### 6. Start Celery (Background Tasks)

```bash
# In a new terminal
cd backend
source venv/bin/activate

# Start Celery worker
celery -A config worker -l info

# In another terminal (for scheduled tasks)
celery -A config beat -l info
```

---

## 📝 Creating Your First Django App

Once everything is running, create the core apps:

---

## 📝 Creating Your First Django App

> **Note:** If using Docker, run these commands with `docker-compose exec backend` prefix.
> Example: `docker-compose exec backend python manage.py startapp events apps/events`

### Create Events App

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

# Add CORS middleware to settings.py:
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add near the top
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Create Basic Event Model

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

````

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
````

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

## ✅ Verify Everything Works

**With Docker:**

```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test API
curl http://localhost:8000/api/events/
```

**Manual setup:**

- [ ] Backend running at http://localhost:8000
- [ ] Admin accessible at http://localhost:8000/admin
- [ ] API returns events at http://localhost:8000/api/events/
- [ ] Frontend running at http://localhost:5173
- [ ] Frontend displays events fetched from API
- [ ] No CORS errors in browser console
- [ ] Celery worker running (check terminal)
- [ ] Redis accessible

## 🚀 Next Steps

Now that you have the foundation:

1. **Read documentation:**

   - **[DOCKER-GUIDE.md](DOCKER-GUIDE.md)** - Complete Docker usage
   - **[CLAUDE.md](CLAUDE.md)** - Full architecture and features
   - **[ROADMAP.md](ROADMAP.md)** - What to build next
   - **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - Where files go

2. **Start building features:**

   - Add more models (Product, Location, Organizer)
   - Implement search and filters
   - Add geolocation features
   - Build event detail pages
   - Implement calendar export

3. **For production deployment:**
   - **[COOLIFY-DEPLOYMENT.md](COOLIFY-DEPLOYMENT.md)** - Deploy to your OVH VPS

## 🐛 Common Issues

### Docker Issues

**"Port already in use"**

```bash
# Check what's using the port
lsof -i :8000

# Stop the service or change port in docker-compose.yml
```

**"Cannot connect to database"**

```bash
# Wait for database to be ready (health check)
docker-compose logs db

# Restart if needed
docker-compose restart backend
```

**"Module not found"**

```bash
# Rebuild containers
docker-compose build backend
docker-compose up -d backend
```

### Manual Setup Issues

### Manual Setup Issues

**"ImportError: No module named django.contrib.gis"**

```bash
# Make sure PostGIS is installed
brew install postgis

# In PostgreSQL:
psql bieszczady
CREATE EXTENSION postgis;
```

**CORS errors in browser**

```bash
# Check CORS_ALLOWED_ORIGINS in backend settings.py
# Should include http://localhost:5173
```

**Events not appearing**

```bash
# Check API response in browser DevTools → Network tab
# Verify data in Django admin
# Check backend logs for errors
```

**Port already in use (manual setup)**

```bash
# Backend: Change port
python manage.py runserver 8001

# Frontend: Update vite.config.ts or use --port flag
npm run dev -- --port 5174
```

## 📚 Resources

- **Project Documentation**: Check all .md files in project root
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Tailwind: https://tailwindcss.com/
- PostGIS: https://postgis.net/
- Docker: https://docs.docker.com/

---

## 🎉 You're Ready!

**Recommended next step:** Start Docker containers and access Django admin to add your first event!

```bash
# With Docker (easiest)
docker-compose up -d
open http://localhost:8000/admin

# Login: admin / admin123
# Create your first event in Bieszczady region!
```

**Questions?**

- Check [DOCKER-GUIDE.md](DOCKER-GUIDE.md) for Docker help
- Check [CLAUDE.md](CLAUDE.md) for development guidance
- Review [ROADMAP.md](ROADMAP.md) for feature ideas
