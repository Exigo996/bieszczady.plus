# Gallery App Setup Guide

## Quick Start

### 1. Install Dependencies (if needed)
```bash
# Ensure Pillow is installed for image handling
pip install Pillow
```

### 2. Run Migrations
```bash
# With Docker
docker-compose exec backend python manage.py migrate gallery

# Without Docker
cd backend
python manage.py migrate gallery
```

### 3. Create Superuser (if not exists)
```bash
docker-compose exec backend python manage.py createsuperuser

# Or locally
python manage.py createsuperuser
```

### 4. Access Admin Panel
Navigate to: `http://localhost:8000/admin/`

Log in with superuser credentials and go to **Galeria → Obrazy**

## Testing the API

### Using cURL

```bash
# List all images
curl http://localhost:8000/api/gallery/images/

# Get all unique tags
curl http://localhost:8000/api/gallery/images/tags/

# Filter by tag
curl http://localhost:8000/api/gallery/images/?tag=landscape
```

### Using Python

```python
import requests

# List all images
response = requests.get('http://localhost:8000/api/gallery/images/')
print(response.json())

# Filter by tag
response = requests.get('http://localhost:8000/api/gallery/images/?tag=landscape')
print(response.json())

# Get all tags
response = requests.get('http://localhost:8000/api/gallery/images/tags/')
print(response.json())
```

## File Structure

```
backend/
├── apps/
│   └── gallery/
│       ├── __init__.py
│       ├── admin.py              # Django admin with tag autocomplete
│       ├── apps.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── image.py          # Image model
│       ├── migrations/
│       │   ├── __init__.py
│       │   └── 0001_initial.py   # Initial migration
│       ├── serializers.py        # DRF serializers
│       ├── urls.py               # API routes
│       ├── views.py              # ViewSets
│       ├── tests.py              # Tests
│       └── README.md             # Documentation
├── config/
│   ├── settings.py               # Updated with gallery app
│   └── urls.py                   # Updated with gallery routes
└── media/
    └── gallery/                  # Uploaded images stored here
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gallery/images/` | List all images (paginated) |
| POST | `/api/gallery/images/` | Upload new image |
| GET | `/api/gallery/images/:id/` | Get single image |
| PUT/PATCH | `/api/gallery/images/:id/` | Update image |
| DELETE | `/api/gallery/images/:id/` | Delete image |
| GET | `/api/gallery/images/tags/` | Get all unique tags |

## Tag Filtering Examples

### Single tag
```
GET /api/gallery/images/?tag=landscape
```

### Multiple tags (AND logic - must have ALL tags)
```
GET /api/gallery/images/?tag=landscape&tag=mountains
```

### Get all available tags
```
GET /api/gallery/images/tags/
```

## Uploading Images

### Via Django Admin
1. Go to `/admin/gallery/image/`
2. Click "Add Obraz"
3. Fill in:
   - Title: "Mountain Landscape"
   - Description: "Beautiful view"
   - Image: Choose file
   - Tags: `landscape, nature, mountains` (comma-separated)
4. Click "Save"

### Via API (cURL)
```bash
curl -X POST http://localhost:8000/api/gallery/images/ \
  -F "title=Mountain Landscape" \
  -F "description=Beautiful view" \
  -F 'tags=["landscape", "nature", "mountains"]' \
  -F "image=@/path/to/image.jpg"
```

### Via API (Python)
```python
import requests

url = 'http://localhost:8000/api/gallery/images/'
files = {'image': open('image.jpg', 'rb')}
data = {
    'title': 'Mountain Landscape',
    'description': 'Beautiful view',
    'tags': '["landscape", "nature", "mountains"]'
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

## Troubleshooting

### Migration not applied
```bash
# Check migration status
docker-compose exec backend python manage.py showmigrations gallery

# Apply migration
docker-compose exec backend python manage.py migrate gallery
```

### Images not displaying
- Check `MEDIA_URL` and `MEDIA_ROOT` in settings.py
- Ensure media files are being served in development (check urls.py)
- Verify file permissions on `media/gallery/` directory

### Tags not saving correctly
- Ensure tags are sent as JSON array: `["tag1", "tag2"]`
- In admin, use comma-separated: `tag1, tag2`
- Check browser console for JavaScript errors

## Next Steps

1. ✅ Test image upload via admin panel
2. ✅ Test API endpoints
3. ✅ Integrate with frontend (React)
4. ✅ Add image compression if needed
5. ✅ Set up CDN for production (S3, Cloudflare R2)

## Production Checklist

- [ ] Configure CDN/S3 for image storage
- [ ] Set up image compression (reduce file sizes)
- [ ] Add rate limiting to upload endpoint
- [ ] Configure proper file size limits
- [ ] Add image validation (file types, dimensions)
- [ ] Set up backups for media directory
- [ ] Configure HTTPS (required for image uploads)
- [ ] Add authentication/permissions if needed
