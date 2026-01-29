# Docker Setup Guide - Bieszczady.plus

Complete guide for running Bieszczady.plus with Docker on macOS.

## Prerequisites

- **Docker Desktop** for Mac installed ([download here](https://www.docker.com/products/docker-desktop/))
- **Git** installed

## Quick Start (5 minutes)

### 1. Install Docker Desktop

```bash
# Download and install Docker Desktop for Mac
# Or use Homebrew:
brew install --cask docker

# Start Docker Desktop from Applications
# Wait for Docker to start (you'll see the whale icon in menu bar)

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone & Setup Project

```bash
# Clone the repository
git clone https://github.com/yourusername/bieszczady-plus.git
cd bieszczady-plus

# Copy environment file
cp .env.example .env

# No need to edit .env for local development - defaults work fine!
```

### 3. Start Everything with One Command

```bash
# Build and start all services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up -d --build
```

**That's it!** Docker will:

- Download all necessary images (PostgreSQL, Redis, Python, Node)
- Install all dependencies
- Set up the database
- Run migrations
- Create a superuser (admin / admin123)
- Start backend on http://localhost:8000
- Start frontend on http://localhost:5173

### 4. Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
  - Username: `admin`
  - Password: `admin123`

## Common Commands

### Starting & Stopping

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs for specific service
docker-compose logs -f backend
```

### Running Commands in Containers

```bash
# Django shell
docker-compose exec backend python manage.py shell

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Run tests
docker-compose exec backend pytest

# Access PostgreSQL
docker-compose exec db psql -U bieszczady -d bieszczady

# Access Redis CLI
docker-compose exec redis redis-cli

# Install new npm package (frontend)
docker-compose exec frontend npm install package-name

# Install new pip package (backend)
docker-compose exec backend pip install package-name
# Then add to requirements/base.txt or requirements/development.txt
```

### Rebuilding Services

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build backend

# Rebuild everything from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Project Structure in Docker

```
Services running:
├── db (PostgreSQL 16 + PostGIS)     → localhost:5432
├── redis                             → localhost:6379
├── backend (Django)                  → localhost:8000
├── celery (Worker)                   → (background)
├── celery-beat (Scheduler)           → (background)
└── frontend (React + Vite)           → localhost:5173
```

## Development Workflow

### Making Backend Changes

```bash
# 1. Edit files in backend/ directory
# 2. Changes auto-reload (Django runserver has auto-reload)
# 3. If you add new dependencies:
docker-compose exec backend pip install new-package
# Add to requirements/development.txt
docker-compose restart backend

# 4. If you change models:
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Making Frontend Changes

```bash
# 1. Edit files in frontend/src/ directory
# 2. Vite auto-reloads (HMR - Hot Module Replacement)
# 3. If you add new dependencies:
docker-compose exec frontend npm install new-package
docker-compose restart frontend
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U bieszczady -d bieszczady

# Backup database
docker-compose exec db pg_dump -U bieszczady bieszczady > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U bieszczady -d bieszczady

# Reset database (CAREFUL!)
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Kill the process
kill -9 PID

# Or change port in docker-compose.yml:
ports:
  - "8001:8000"  # Use 8001 instead
```

### Container Fails to Start

```bash
# View logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait a few seconds, it should retry
# 2. Port conflict - change port in docker-compose.yml
# 3. Permission issues - try: docker-compose down -v && docker-compose up -d
```

### "Cannot connect to database"

```bash
# Make sure db service is healthy
docker-compose ps

# Check db logs
docker-compose logs db

# Restart database
docker-compose restart db

# Wait for health check to pass
docker-compose up -d db
sleep 10
docker-compose up -d backend
```

### Frontend Can't Connect to Backend

```bash
# Check if backend is running
curl http://localhost:8000/api/

# Check CORS settings in backend/.env:
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Check frontend/.env:
VITE_API_URL=http://localhost:8000/api

# Restart both services
docker-compose restart backend frontend
```

### "Module not found" Errors

```bash
# Backend - reinstall dependencies
docker-compose exec backend pip install -r requirements/development.txt
docker-compose restart backend

# Frontend - reinstall dependencies
docker-compose exec frontend npm install
docker-compose restart frontend

# Or rebuild:
docker-compose build backend
docker-compose up -d backend
```

### Slow Performance on Mac

```bash
# Docker on Mac can be slow with volumes
# Use :cached option in docker-compose.yml:
volumes:
  - ./backend:/app:cached

# Or enable VirtioFS in Docker Desktop:
# Settings → General → Enable VirtioFS
```

### Reset Everything (Nuclear Option)

```bash
# Stop and remove everything
docker-compose down -v

# Remove all Docker resources for this project
docker system prune -a

# Rebuild from scratch
docker-compose up -d --build
```

## Production Deployment (Coolify)

For production deployment on your OVH VPS with Coolify, see **[COOLIFY-DEPLOYMENT.md](COOLIFY-DEPLOYMENT.md)** for complete guide.

**Key points:**

- Coolify uses Traefik (no Nginx needed in containers)
- Auto SSL certificates via Let's Encrypt
- Just push to GitHub and Coolify handles deployment
- Frontend served by Node's `serve` package (not Nginx)
- Backend served by Gunicorn

Quick setup:

```bash
# Push to GitHub
git push origin main

# In Coolify:
# 1. Connect repository
# 2. Select docker-compose.prod.yml
# 3. Set environment variables
# 4. Deploy!
```

## Best Practices

1. **Keep docker-compose up while developing** - auto-reload works
2. **Use logs** - `docker-compose logs -f` to debug issues
3. **Commit often** - Docker volumes persist data, but code changes need commits
4. **Don't edit files in containers** - edit locally, changes sync automatically
5. **Use exec, not run** - `exec` uses existing container, `run` creates new one

## Performance Tips

```bash
# Build with multi-stage builds (already configured)
# Use .dockerignore to exclude unnecessary files
# Layer caching - put dependencies before code in Dockerfile

# Monitor resource usage
docker stats

# Clean up unused resources regularly
docker system prune -a --volumes
```

## Environment Variables

Default values in `.env` work for local development:

```env
DATABASE_URL=postgresql://bieszczady:bieszczady_dev_password@db:5432/bieszczady
REDIS_URL=redis://redis:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

For production, update these in Coolify or `.env.production`.

## Next Steps

1. ✅ Start containers: `docker-compose up -d`
2. ✅ Access admin: http://localhost:8000/admin (admin/admin123)
3. ✅ Add test event in Django admin
4. ✅ View events on frontend: http://localhost:5173
5. 📝 Start building your features!

---

**Questions?** Check logs first: `docker-compose logs -f`

**Need help?** Open an issue on GitHub or refer to Docker docs.
