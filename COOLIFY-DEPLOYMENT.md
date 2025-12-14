# Coolify Deployment Guide - Bieszczady.plus

Complete guide for deploying Bieszczady.plus on Coolify (your OVH VPS).

## Overview

Coolify uses **Traefik** as its reverse proxy, so:

- ✅ No need for Nginx in our containers
- ✅ Traefik handles SSL certificates (Let's Encrypt)
- ✅ Traefik handles routing based on domain names
- ✅ We just expose ports and add Traefik labels

## Prerequisites

- ✅ Coolify installed on your OVH VPS
- ✅ Two domains configured:
  - `bieszczady.plus` (frontend)
  - `api.bieszczady.plus` (backend)
- ✅ DNS A records pointing to your VPS IP
- ✅ Git repository on GitHub/GitLab

## Deployment Steps

### 1. Push Code to GitHub

```bash
cd bieszczady-plus

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin https://github.com/yourusername/bieszczady-plus.git
git branch -M main
git push -u origin main
```

### 2. Create Project in Coolify

1. Log into Coolify dashboard
2. Click **"+ New"** → **"Project"**
3. Name: **"Bieszczady Plus"**
4. Click **"Create"**

### 3. Add Docker Compose Service

1. In your project, click **"+ Add Resource"**
2. Select **"Docker Compose"**
3. Choose **"Public Repository"**
4. Repository URL: `https://github.com/yourusername/bieszczady-plus`
5. Branch: `main`
6. Docker Compose Location: `docker-compose.prod.yml`

### 4. Configure Environment Variables

In Coolify, go to **Environment Variables** and add:

```env
# Django
SECRET_KEY=<generate-with-django-command>
DEBUG=False
ALLOWED_HOSTS=api.bieszczady.plus
CORS_ALLOWED_ORIGINS=https://bieszczady.plus,https://api.bieszczady.plus

# Database (Coolify will create these)
POSTGRES_DB=bieszczady
POSTGRES_USER=bieszczady
POSTGRES_PASSWORD=<generate-strong-password>

# Domains
BACKEND_DOMAIN=api.bieszczady.plus
FRONTEND_DOMAIN=bieszczady.plus

# Translation API
DEEPL_API_KEY=<your-deepl-api-key>

# Email (configure based on your provider)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=<your-app-password>

# Optional: Social Media (Phase 2)
# FACEBOOK_APP_ID=
# FACEBOOK_APP_SECRET=
```

**Generate Django Secret Key:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Configure Domains

In Coolify:

1. Go to **Domains** section
2. Add two domains:
   - **Frontend**: `bieszczady.plus`
   - **Backend**: `api.bieszczady.plus`
3. Coolify will automatically:
   - Configure Traefik routes
   - Generate SSL certificates via Let's Encrypt
   - Handle HTTPS redirects

### 6. Deploy

1. Click **"Deploy"**
2. Coolify will:
   - Clone your repository
   - Build Docker images
   - Start all services (db, redis, backend, celery, frontend)
   - Configure Traefik routing
   - Generate SSL certificates
3. First deployment takes 10-15 minutes

### 7. Monitor Deployment

Watch the deployment logs in Coolify:

- **Build logs**: See Docker image creation
- **Service logs**: See each container's output
- Look for:
  - ✅ Database migrations completed
  - ✅ Superuser created
  - ✅ Static files collected
  - ✅ All services healthy

### 8. Post-Deployment

#### Create Superuser (if not auto-created)

1. In Coolify, go to **Services** → **backend**
2. Click **"Terminal"** or **"Execute Command"**
3. Run:

```bash
python manage.py createsuperuser
```

#### Add Test Data

```bash
# In backend terminal
python manage.py shell

# Then in Python shell:
from apps.events.models import Event
from django.contrib.gis.geos import Point
from datetime import datetime, timedelta

event = Event.objects.create(
    title={"pl": "Festiwal Bieszczadzki", "en": "Bieszczady Festival", "uk": "Фестиваль Бещади"},
    description={"pl": "Testowy event", "en": "Test event", "uk": "Тестова подія"},
    slug="festiwal-bieszczadzki",
    category="FESTIVAL",
    start_date=datetime.now() + timedelta(days=7),
    location_name="Ustrzyki Dolne",
    coordinates=Point(22.5972, 49.4298, srid=4326),
    price_type="FREE"
)
```

### 9. Verify Everything Works

- ✅ Frontend: https://bieszczady.plus
- ✅ Backend API: https://api.bieszczady.plus/api
- ✅ Admin: https://api.bieszczady.plus/admin
- ✅ SSL certificates active (🔒 in browser)
- ✅ No CORS errors in browser console

## Architecture on Coolify

```
Internet (HTTPS)
        ↓
    Traefik (Coolify's reverse proxy)
        ├─→ bieszczady.plus → frontend container (port 3000)
        └─→ api.bieszczady.plus → backend container (port 8000)
            ↓
        PostgreSQL + PostGIS (internal)
            ↓
        Redis (internal)
            ↓
        Celery Workers (internal)
```

**Internal networking:**

- Services communicate via Docker network names (db, redis, backend)
- Only frontend and backend are exposed via Traefik
- Database and Redis are internal only (secure)

## Coolify-Specific Configuration

### Service Labels (in docker-compose.prod.yml)

**Backend:**

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.backend.rule=Host(`${BACKEND_DOMAIN}`)"
  - "traefik.http.routers.backend.entrypoints=websecure"
  - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
  - "traefik.http.services.backend.loadbalancer.server.port=8000"
```

**Frontend:**

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`${FRONTEND_DOMAIN}`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
  - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

These labels tell Traefik:

- Route traffic based on domain
- Enable HTTPS (websecure)
- Generate SSL certificates automatically
- Which port to forward to

### Why No Nginx?

Previously you had issues because:

- ❌ Nginx in container + Traefik = double reverse proxy
- ❌ Port conflicts and routing confusion
- ❌ SSL certificate conflicts

Our solution:

- ✅ Frontend: Node's `serve` package (simple static file server)
- ✅ Backend: Gunicorn (production WSGI server)
- ✅ Traefik handles all reverse proxy duties
- ✅ Clean, simple, works perfectly with Coolify

## Continuous Deployment

### Auto-Deploy on Git Push

1. In Coolify, enable **"Auto Deploy"**
2. Configure webhook in GitHub:
   - Settings → Webhooks → Add webhook
   - Payload URL: (from Coolify)
   - Events: Push events
3. Now: `git push` → Coolify auto-deploys

### Manual Deployment

In Coolify dashboard:

1. Go to your service
2. Click **"Redeploy"**
3. Coolify pulls latest code and rebuilds

## Monitoring & Logs

### View Logs

**In Coolify:**

- Services → Select service → Logs tab
- Real-time logs for each container
- Filter by service (backend, celery, frontend)

**Via Terminal:**

```bash
# SSH into your VPS
ssh user@your-vps-ip

# View logs
docker logs -f bieszczady_backend_prod
docker logs -f bieszczady_frontend_prod
docker logs -f bieszczady_celery_prod
```

### Health Checks

Coolify monitors service health:

- Database health check: `pg_isready`
- Redis health check: `redis-cli ping`
- Backend: HTTP requests to port 8000
- Frontend: HTTP requests to port 3000

If a service fails, Coolify attempts restart.

## Database Management

### Backup Database

```bash
# SSH into VPS
ssh user@your-vps-ip

# Backup
docker exec bieszczady_db_prod pg_dump -U bieszczady bieszczady > backup_$(date +%Y%m%d).sql

# Or use Coolify's built-in backup feature
# Services → Database → Backups
```

### Restore Database

```bash
# Upload backup.sql to VPS
scp backup.sql user@your-vps-ip:/tmp/

# SSH into VPS
ssh user@your-vps-ip

# Restore
cat /tmp/backup.sql | docker exec -i bieszczady_db_prod psql -U bieszczady bieszczady
```

### Access Database

```bash
# Via Coolify terminal
# Services → db → Terminal

psql -U bieszczady -d bieszczady
```

## Troubleshooting

### Services Not Starting

**Check logs:**

```bash
docker logs bieszczady_backend_prod
```

**Common issues:**

- Missing environment variables → Add in Coolify
- Database not ready → Wait for health check
- Port conflicts → Check Traefik labels

### SSL Certificate Issues

**Symptoms:**

- Browser shows "Not Secure"
- Certificate errors

**Solutions:**

1. Verify DNS is correct: `nslookup bieszczady.plus`
2. Wait 5-10 minutes for Let's Encrypt
3. Check Coolify logs for certificate generation
4. Ensure ports 80 and 443 are open in firewall

### CORS Errors

**Check environment variables:**

```env
CORS_ALLOWED_ORIGINS=https://bieszczady.plus,https://api.bieszczady.plus
```

**Verify frontend is using correct API URL:**

```env
VITE_API_URL=https://api.bieszczady.plus
```

### Frontend Shows Blank Page

**Check:**

1. Frontend container logs: `docker logs bieszczady_frontend_prod`
2. Browser console for errors (F12)
3. Verify API URL in frontend env
4. Check if backend is accessible: `curl https://api.bieszczady.plus/api/`

### Celery Not Processing Tasks

**Check worker logs:**

```bash
docker logs bieszczady_celery_prod
```

**Verify Redis connection:**

```bash
docker exec bieszczady_celery_prod python -c "import redis; r = redis.from_url('redis://redis:6379/0'); print(r.ping())"
```

### Database Connection Issues

**Check:**

1. Database is running: `docker ps | grep postgres`
2. Credentials in environment variables match
3. Database health check passing
4. Network connectivity between services

## Performance Optimization

### Scale Celery Workers

Edit `docker-compose.prod.yml`:

```yaml
celery:
  command: celery -A config worker -l info --concurrency=4 # Increase from 2
```

Redeploy in Coolify.

### Increase Gunicorn Workers

Edit backend command:

```yaml
backend:
  command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 8 # Increase from 4
```

### Enable Redis Caching

Add to Django settings:

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL'),
    }
}
```

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] Strong database password
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] CORS origins whitelisted only
- [ ] SSL certificates active
- [ ] Firewall configured (only 80, 443, 22)
- [ ] Regular database backups scheduled
- [ ] Environment variables not committed to Git
- [ ] Sensitive logs not exposed publicly

## Updating the Application

### Code Changes

```bash
# Local development
git add .
git commit -m "Add new feature"
git push origin main

# Coolify auto-deploys (if enabled)
# Or manually click "Redeploy" in Coolify
```

### Dependency Changes

**Backend:**

1. Update `requirements/production.txt`
2. Commit and push
3. Coolify rebuilds image with new dependencies

**Frontend:**

1. Update `package.json`
2. Commit and push
3. Coolify rebuilds image

### Database Migrations

**Automatic** (via docker-entrypoint.sh):

- Migrations run automatically on container start
- New migrations applied on each deployment

**Manual** (if needed):

```bash
# In Coolify terminal
python manage.py migrate
```

## Cost Optimization

**Current setup is very efficient:**

- Single VPS running all services
- No external services needed
- Coolify manages everything

**If you grow and need to scale:**

- Separate database server (managed PostgreSQL)
- CDN for static files (Cloudflare)
- Redis cluster for high availability
- Multiple backend instances behind load balancer

## Next Steps After Deployment

1. **Add content**: Create events via Django admin
2. **Configure scraper**: Add Facebook pages to scrape
3. **Enable translations**: Add DeepL API key
4. **Set up monitoring**: Configure alerts in Coolify
5. **Schedule backups**: Coolify backup automation
6. **Add analytics**: Privacy-friendly analytics (Plausible/Umami)

---

**Your site is now live! 🎉**

- Frontend: https://bieszczady.plus
- Backend: https://api.bieszczady.plus/admin

Questions? Check Coolify logs first, then review this guide.
