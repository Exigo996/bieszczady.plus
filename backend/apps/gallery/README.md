# Gallery App

Django app for managing image gallery with tagging functionality for Bieszczady.plus.

## Features

- ✅ Upload and store images on server
- ✅ Tag images with custom tags (comma-separated)
- ✅ Filter images by tags via API
- ✅ Django Admin interface with tag autocomplete
- ✅ REST API with full CRUD operations
- ✅ Auto-extract image metadata (dimensions, file size)
- ✅ Pagination support
- ✅ Polish language support

## Models

### Image

| Field | Type | Description |
|-------|------|-------------|
| `title` | CharField | Image title |
| `description` | TextField | Optional description |
| `image` | ImageField | Image file (stored in `media/gallery/`) |
| `tags` | JSONField | List of tags: `["landscape", "nature"]` |
| `file_size` | Integer | Auto-populated file size in bytes |
| `width` | Integer | Auto-populated image width |
| `height` | Integer | Auto-populated image height |
| `uploaded_at` | DateTime | Auto-generated upload timestamp |
| `updated_at` | DateTime | Auto-generated last update timestamp |

## API Endpoints

### List all images
```
GET /api/gallery/images/
```
Response (paginated, 20 per page):
```json
{
  "count": 100,
  "next": "/api/gallery/images/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Sunset in Bieszczady",
      "image": "http://localhost:8000/media/gallery/sunset.jpg",
      "tags": ["landscape", "sunset", "mountains"],
      "uploaded_at": "2025-01-10T12:00:00Z"
    }
  ]
}
```

### Filter by tag
```
GET /api/gallery/images/?tag=landscape
GET /api/gallery/images/?tag=landscape&tag=sunset
```
Returns images containing ALL specified tags.

### Get single image
```
GET /api/gallery/images/:id/
```
Response:
```json
{
  "id": 1,
  "title": "Sunset in Bieszczady",
  "description": "Beautiful sunset view from the mountain peak",
  "image": "http://localhost:8000/media/gallery/sunset.jpg",
  "tags": ["landscape", "sunset", "mountains"],
  "file_size": 2048576,
  "width": 1920,
  "height": 1080,
  "uploaded_at": "2025-01-10T12:00:00Z",
  "updated_at": "2025-01-10T12:00:00Z"
}
```

### Upload new image
```
POST /api/gallery/images/
Content-Type: multipart/form-data
```
Form data:
```
title: "Mountain Trail"
description: "Scenic trail through Bieszczady mountains"
tags: '["landscape", "mountains", "hiking"]'
image: [file upload]
```

### Update image
```
PUT /api/gallery/images/:id/
PATCH /api/gallery/images/:id/
```

### Delete image
```
DELETE /api/gallery/images/:id/
```

### Get all tags
```
GET /api/gallery/images/tags/
```
Response:
```json
{
  "count": 15,
  "tags": ["architecture", "landscape", "mountains", "nature", "sunset"]
}
```

## Django Admin

### Access
Navigate to `/admin/gallery/image/`

### Features
- **List View**: Shows thumbnails, titles, tags, upload date, file size
- **Search**: Search by title, description, or tags
- **Filter**: Filter by upload date or tags
- **Tag Input**: Enter tags as comma-separated values
  - Example: `landscape, nature, mountains`
  - Auto-converts to JSON array
  - Removes duplicates
  - Sorts alphabetically
- **Image Preview**: See full-size image in detail view
- **Metadata**: Auto-populated dimensions and file size

### Tag Autocomplete

When editing tags in the admin:
1. Start typing a tag name
2. Existing tags will be suggested
3. Press Enter or comma to separate tags
4. Tags are automatically deduplicated and sorted

## File Storage

Images are stored in:
```
backend/media/gallery/
├── image1.jpg
├── image2.png
└── image3.webp
```

Access via URL:
```
http://localhost:8000/media/gallery/image1.jpg
```

## Usage Examples

### Python (Django Shell)
```python
from apps.gallery.models import Image

# Create image
image = Image.objects.create(
    title="Mountain Landscape",
    description="Beautiful view",
    tags=["landscape", "mountains"],
    image=open("path/to/image.jpg", "rb")
)

# Filter by tag
landscape_images = Image.objects.filter(tags__contains="landscape")

# Get all unique tags
all_tags = set()
for img in Image.objects.all():
    all_tags.update(img.tags)
```

### cURL
```bash
# List all images
curl http://localhost:8000/api/gallery/images/

# Filter by tag
curl http://localhost:8000/api/gallery/images/?tag=landscape

# Upload image
curl -X POST http://localhost:8000/api/gallery/images/ \
  -F "title=Sunset" \
  -F "tags=[\"sunset\", \"landscape\"]" \
  -F "image=@/path/to/image.jpg"

# Get all tags
curl http://localhost:8000/api/gallery/images/tags/
```

### JavaScript/Fetch
```javascript
// List images
const response = await fetch('http://localhost:8000/api/gallery/images/');
const data = await response.json();

// Filter by tag
const landscapes = await fetch('http://localhost:8000/api/gallery/images/?tag=landscape');

// Upload image
const formData = new FormData();
formData.append('title', 'Mountain View');
formData.append('tags', JSON.stringify(['landscape', 'mountains']));
formData.append('image', fileInput.files[0]);

await fetch('http://localhost:8000/api/gallery/images/', {
  method: 'POST',
  body: formData
});
```

## Testing

```bash
# Run gallery tests
python manage.py test apps.gallery

# Run with verbose output
python manage.py test apps.gallery --verbosity=2
```

## Future Enhancements

- [ ] Image compression on upload
- [ ] Thumbnail generation (small, medium, large)
- [ ] EXIF data extraction
- [ ] Albums/Collections
- [ ] Batch upload
- [ ] Image editing (crop, rotate)
- [ ] CDN integration (S3, Cloudflare R2)
- [ ] User permissions (Phase 2)

## Technical Details

- **Database**: PostgreSQL with JSONField support
- **Image Processing**: Pillow (PIL)
- **API**: Django Rest Framework
- **Admin**: Django Admin with custom widgets
