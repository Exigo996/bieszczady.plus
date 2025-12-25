# Facebook Event Scraper for Bieszczady.plus

Production-ready Facebook event scraper using Playwright for the Bieszczady.plus regional event discovery platform.

## Features

- **Async Playwright-based scraping** for high performance
- **Anti-bot detection measures** (stealth mode, realistic user agent, random delays)
- **Cookie-based session persistence** (login once, reuse sessions)
- **Multiple post format support** (text events, structured event pages)
- **Dynamic content handling** (infinite scroll, "See more" buttons)
- **Intelligent event detection** (Polish/English keywords, date parsing, location extraction)
- **Rate limiting** to avoid Facebook blocks
- **Robust error handling** and retry logic
- **JSON export** for Django integration
- **CLI interface** for easy usage

## Installation

### 1. Install Python dependencies

```bash
cd backend/apps/scraper
pip install -r requirements.txt
```

### 2. Install Playwright browsers

```bash
playwright install chromium
```

### 3. Set up directories

```bash
mkdir -p data/cookies data/scraped_events logs
```

## Usage

### CLI Commands

#### 1. Login to Facebook

Login once and save cookies for future use:

```bash
python cli.py login --email your@email.com --password yourpassword
```

Use `--visible` to see the browser window (useful for handling 2FA):

```bash
python cli.py login --email your@email.com --password yourpassword --visible
```

#### 2. Scrape events from a Facebook page

Scrape posts from a page/group and extract event information:

```bash
python cli.py scrape-page --url https://www.facebook.com/BieszczadyEvents
```

Options:
- `--max-posts N` - Maximum posts to scrape (default: 50)
- `--output events.json` - Custom output file
- `--visible` - Show browser window
- `--verbose` - Print event details

Example:
```bash
python cli.py scrape-page \
  --url https://www.facebook.com/BieszczadyEvents \
  --max-posts 100 \
  --output bieszczady_events.json \
  --verbose
```

#### 3. Scrape a single Facebook event

Scrape structured data from a Facebook event page:

```bash
python cli.py scrape-event --url https://www.facebook.com/events/123456789
```

Options:
- `--output event.json` - Custom output file
- `--visible` - Show browser window
- `--verbose` - Print full event JSON

#### 4. Scrape multiple URLs from file

Create a text file with URLs (one per line):

```bash
# urls.txt
https://www.facebook.com/BieszczadyEvents
https://www.facebook.com/events/123456789
https://www.facebook.com/UstrzykiDolneMiasto
# Comments starting with # are ignored
```

Run scraper:

```bash
python cli.py scrape-multiple --urls urls.txt --output all_events.json
```

### Python API

Use the scraper programmatically:

```python
import asyncio
from facebook_scraper import FacebookEventScraper
from config import ScraperConfig

async def main():
    config = ScraperConfig.from_env()

    async with FacebookEventScraper(config) as scraper:
        # Login (if needed)
        await scraper.login('email@example.com', 'password')

        # Scrape page events
        events = await scraper.scrape_page_events(
            'https://www.facebook.com/BieszczadyEvents',
            max_posts=50
        )

        # Scrape event page
        event = await scraper.scrape_event_page(
            'https://www.facebook.com/events/123456789'
        )

        # Export to JSON
        scraper.export_events(events, 'output.json')

        print(f"Scraped {len(events)} events")

asyncio.run(main())
```

## Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Browser settings
SCRAPER_HEADLESS=true

# File paths
SCRAPER_COOKIE_FILE=data/cookies/facebook_cookies.json
SCRAPER_OUTPUT_DIR=data/scraped_events
SCRAPER_LOG_LEVEL=INFO

# Scraping limits
SCRAPER_MAX_POSTS=50

# Django integration
SCRAPER_DJANGO_IMPORT=true
SCRAPER_AUTO_TRANSLATE=true
```

### Configuration File

Modify [config.py](./config.py) to customize:

- Event detection keywords (Polish/English)
- Location keywords (Bieszczady region)
- Date parsing patterns
- Rate limiting delays
- Browser settings

## Output Format

The scraper exports events in JSON format compatible with Django Event model:

```json
[
  {
    "source": "facebook_post",
    "scraped_at": "2025-12-17T15:30:00",
    "title": "Koncert André Rieu w Ustrzyki Dolne",
    "description": "Zapraszamy na niezapomniany koncert...",
    "start_date": "2025-12-20T18:00:00",
    "end_date": "2025-12-20T22:00:00",
    "location": "Ustrzyki Dolne",
    "category": "CONCERT",
    "price_type": "PAID",
    "price_amount": 50.0,
    "price_currency": "PLN",
    "images": [
      "https://scontent.xx.fbcdn.net/..."
    ],
    "external_url": "https://www.facebook.com/posts/...",
    "facebook_event_id": "123456789",
    "organizer_contact": {
      "phone": "+48 123 456 789",
      "email": "info@example.com"
    }
  }
]
```

## Django Integration

### Import events to Django

Create a management command:

```python
# backend/apps/events/management/commands/import_scraped_events.py

from django.core.management.base import BaseCommand
import json
from apps.events.models import Event, Organizer
from apps.locations.models import Location

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str)

    def handle(self, *args, **options):
        with open(options['json_file'], 'r') as f:
            events = json.load(f)

        for event_data in events:
            # Find or create location
            location, _ = Location.objects.get_or_create(
                name=event_data.get('location', 'Unknown')
            )

            # Create event
            Event.objects.update_or_create(
                facebook_event_id=event_data.get('facebook_event_id'),
                defaults={
                    'title': {'pl': event_data.get('title', '')},
                    'description': {'pl': event_data.get('description', '')},
                    'start_date': event_data.get('start_date'),
                    'end_date': event_data.get('end_date'),
                    'location': location,
                    'category': event_data.get('category', 'CULTURAL'),
                    'source': 'SCRAPED',
                    'moderation_status': 'PENDING',
                }
            )

        self.stdout.write(f"Imported {len(events)} events")
```

Run:
```bash
python manage.py import_scraped_events data/scraped_events/events.json
```

### Celery Periodic Task

Automate scraping with Celery:

```python
# backend/apps/scraper/tasks.py

from celery import shared_task
import asyncio
from .facebook_scraper import FacebookEventScraper
from .config import ScraperConfig

@shared_task
def scrape_facebook_pages():
    """Celery task to scrape Facebook pages daily."""
    from apps.events.models import Organizer

    config = ScraperConfig.from_env()

    # Get Facebook page URLs from Organizer model
    organizers = Organizer.objects.filter(
        scraping_enabled=True,
        facebook_page__isnull=False
    )

    async def run_scraper():
        async with FacebookEventScraper(config) as scraper:
            all_events = []

            for organizer in organizers:
                try:
                    events = await scraper.scrape_page_events(
                        organizer.facebook_page,
                        max_posts=50
                    )
                    all_events.extend(events)
                except Exception as e:
                    logger.error(f"Error scraping {organizer.name}: {e}")

            return all_events

    events = asyncio.run(run_scraper())

    # Import events to Django
    # ... (import logic here)

    return f"Scraped {len(events)} events"
```

Schedule in Celery Beat:

```python
# config/celery.py

from celery.schedules import crontab

app.conf.beat_schedule = {
    'scrape-facebook-daily': {
        'task': 'apps.scraper.tasks.scrape_facebook_pages',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
```

## Anti-Detection Features

The scraper includes multiple techniques to avoid Facebook's bot detection:

1. **Stealth mode**: Removes `navigator.webdriver` flag
2. **Realistic user agent**: Uses real Chrome user agent
3. **Random delays**: Mimics human behavior with random pauses
4. **Cookie persistence**: Reuses authenticated sessions
5. **Viewport and locale**: Sets realistic browser settings
6. **Geolocation**: Sets location to Bieszczady region
7. **Gradual scrolling**: Loads content naturally with infinite scroll

## Troubleshooting

### Login fails with 2FA

Use `--visible` flag to manually complete 2FA:

```bash
python cli.py login --email your@email.com --password pass --visible
```

### "Checkpoint" or security check

Facebook may require manual verification:
1. Run with `--visible`
2. Complete security check manually
3. Cookies will be saved automatically

### No events found

Check:
- Page URL is correct
- Page/group is public
- Login cookies are valid (`rm data/cookies/*.json` and re-login)
- Adjust event keywords in [config.py](./config.py)

### Rate limiting / blocked

Increase delays in [config.py](./config.py):

```python
min_delay: float = 2.0  # Increase from 1.0
max_delay: float = 5.0  # Increase from 3.0
```

## Docker Integration

Add to your existing `docker-compose.yml`:

```yaml
services:
  scraper:
    build:
      context: ./backend
      dockerfile: apps/scraper/Dockerfile
    volumes:
      - ./backend/apps/scraper/data:/app/data
      - ./backend/apps/scraper/logs:/app/logs
    environment:
      - SCRAPER_HEADLESS=true
      - SCRAPER_DJANGO_IMPORT=true
    depends_on:
      - db
    command: python -m celery -A config worker -B -l info
```

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Install dependencies for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libappindicator3-1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy scraper files
COPY apps/scraper/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium
RUN playwright install-deps chromium

COPY apps/scraper /app

CMD ["python", "cli.py"]
```

## Performance

- **Async/await**: Non-blocking I/O for concurrent scraping
- **Lazy loading**: Only loads posts as needed (infinite scroll)
- **Efficient selectors**: Uses multiple fallback selectors
- **Rate limiting**: Prevents resource exhaustion

Typical performance:
- **Login**: ~5 seconds
- **Scrape 50 posts**: ~2-3 minutes
- **Scrape event page**: ~5-10 seconds

## Security

- **No credentials in code**: Uses environment variables or CLI arguments
- **Cookie encryption**: Store cookies securely (chmod 600)
- **HTTPS only**: All Facebook requests use HTTPS
- **Input sanitization**: Cleans scraped data before export

## License

MIT License - see main project LICENSE file.

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/yourusername/bieszczady.plus/issues
- Email: seba@bieszczady.plus

## Changelog

### v1.0.0 (2025-12-17)
- Initial release
- Playwright-based scraper
- CLI interface
- Django integration support
- Anti-detection features
- Polish/English date parsing
- Event enrichment (category, price, organizer detection)
