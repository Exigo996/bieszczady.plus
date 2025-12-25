"""
Django Integration for Facebook Event Scraper
==============================================

Example management command and Celery task for importing scraped events.
"""

# ==========================================
# Management Command Example
# ==========================================
# Save as: backend/apps/events/management/commands/import_scraped_events.py

"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
import json
from pathlib import Path
from apps.events.models import Event, Organizer
from apps.locations.models import Location
from django.contrib.gis.geos import Point


class Command(BaseCommand):
    help = 'Import events from scraped Facebook JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to JSON file with scraped events')
        parser.add_argument(
            '--auto-approve',
            action='store_true',
            help='Automatically approve imported events'
        )

    def handle(self, *args, **options):
        json_file = Path(options['json_file'])

        if not json_file.exists():
            self.stdout.write(self.style.ERROR(f'File not found: {json_file}'))
            return

        with open(json_file, 'r', encoding='utf-8') as f:
            events_data = json.load(f)

        self.stdout.write(f'Found {len(events_data)} events to import')

        imported_count = 0
        updated_count = 0
        skipped_count = 0

        for event_data in events_data:
            try:
                # Skip if missing critical data
                if not event_data.get('title'):
                    self.stdout.write(self.style.WARNING(f'Skipping event without title'))
                    skipped_count += 1
                    continue

                # Find or create location
                location_name = event_data.get('location', 'Unknown')
                location, _ = Location.objects.get_or_create(
                    name=location_name,
                    defaults={
                        'name_en': location_name,
                        'name_uk': location_name,
                        'location_type': 'TOWN',
                    }
                )

                # Find or create organizer
                organizer = None
                organizer_info = event_data.get('organizer_contact', {})
                if organizer_info:
                    organizer, _ = Organizer.objects.get_or_create(
                        name=event_data.get('organizer_name', 'Unknown Organizer'),
                        defaults={
                            'contact_email': organizer_info.get('email'),
                            'contact_phone': organizer_info.get('phone'),
                            'website': organizer_info.get('website'),
                        }
                    )

                # Generate slug
                title = event_data['title']
                slug = slugify(title[:50])

                # Prepare event data
                event_defaults = {
                    'title': {'pl': title},
                    'description': {'pl': event_data.get('description', '')},
                    'location': location,
                    'category': event_data.get('category', 'CULTURAL'),
                    'event_type': 'EVENT',
                    'source': 'SCRAPED',
                    'moderation_status': 'APPROVED' if options['auto_approve'] else 'PENDING',
                    'external_url': event_data.get('external_url'),
                    'organizer': organizer,
                }

                # Add dates if available
                if event_data.get('start_date'):
                    event_defaults['start_date'] = event_data['start_date']
                if event_data.get('end_date'):
                    event_defaults['end_date'] = event_data['end_date']

                # Add price info
                event_defaults['price_type'] = event_data.get('price_type', 'FREE')
                if event_data.get('price_amount'):
                    event_defaults['price_amount'] = event_data['price_amount']
                    event_defaults['price_currency'] = event_data.get('price_currency', 'PLN')

                # Add images
                if event_data.get('images'):
                    event_defaults['images'] = event_data['images']

                # Create or update event
                if event_data.get('facebook_event_id'):
                    event, created = Event.objects.update_or_create(
                        facebook_event_id=event_data['facebook_event_id'],
                        defaults=event_defaults
                    )
                else:
                    # No Facebook ID, create new event with unique slug
                    base_slug = slug
                    counter = 1
                    while Event.objects.filter(slug=slug).exists():
                        slug = f"{base_slug}-{counter}"
                        counter += 1

                    event_defaults['slug'] = slug
                    event = Event.objects.create(**event_defaults)
                    created = True

                if created:
                    imported_count += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Imported: {title}'))
                else:
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f'↻ Updated: {title}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error importing event: {e}'))
                skipped_count += 1
                continue

        self.stdout.write(
            self.style.SUCCESS(
                f'\nImport complete:\n'
                f'  Imported: {imported_count}\n'
                f'  Updated: {updated_count}\n'
                f'  Skipped: {skipped_count}'
            )
        )
"""


# ==========================================
# Celery Task Example
# ==========================================
# Save as: backend/apps/scraper/tasks.py

"""
from celery import shared_task
import asyncio
import logging
from pathlib import Path
from django.utils import timezone

from .facebook_scraper import FacebookEventScraper
from .config import ScraperConfig
from .utils import enrich_event_data, validate_event_data

logger = logging.getLogger(__name__)


@shared_task
def scrape_facebook_pages():
    '''
    Celery task to scrape Facebook pages for events.
    Runs daily via Celery Beat.
    '''
    from apps.events.models import Organizer

    logger.info("Starting Facebook scraping task")

    config = ScraperConfig.from_env()

    # Get all organizers with Facebook pages that have scraping enabled
    organizers = Organizer.objects.filter(
        scraping_enabled=True,
        facebook_page__isnull=False
    ).exclude(facebook_page='')

    if not organizers.exists():
        logger.warning("No organizers configured for scraping")
        return "No organizers to scrape"

    async def run_scraper():
        async with FacebookEventScraper(config) as scraper:
            all_events = []

            for organizer in organizers:
                try:
                    logger.info(f"Scraping: {organizer.name} ({organizer.facebook_page})")

                    events = await scraper.scrape_page_events(
                        organizer.facebook_page,
                        max_posts=config.max_posts_per_page
                    )

                    # Enrich and validate
                    for event in events:
                        enriched = enrich_event_data(event)
                        if validate_event_data(enriched):
                            enriched['organizer_id'] = organizer.id
                            enriched['organizer_name'] = organizer.name
                            all_events.append(enriched)

                    logger.info(f"Found {len(events)} events from {organizer.name}")

                except Exception as e:
                    logger.error(f"Error scraping {organizer.name}: {e}")
                    continue

            return all_events

    # Run async scraper
    events = asyncio.run(run_scraper())

    # Export to JSON file
    if events:
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        output_file = Path(config.output_dir) / f'scraped_{timestamp}.json'
        output_file.parent.mkdir(parents=True, exist_ok=True)

        import json
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)

        logger.info(f"Exported {len(events)} events to {output_file}")

        # Optionally auto-import to Django
        if config.django_import_enabled:
            import_scraped_events.delay(str(output_file))

    return f"Scraped {len(events)} events from {len(organizers)} pages"


@shared_task
def import_scraped_events(json_file_path: str, auto_approve: bool = False):
    '''
    Celery task to import scraped events from JSON file.
    '''
    from apps.events.models import Event, Organizer
    from apps.locations.models import Location
    from django.utils.text import slugify
    import json

    logger.info(f"Importing events from {json_file_path}")

    with open(json_file_path, 'r', encoding='utf-8') as f:
        events_data = json.load(f)

    imported = 0
    updated = 0
    skipped = 0

    for event_data in events_data:
        try:
            if not event_data.get('title'):
                skipped += 1
                continue

            # Find/create location
            location_name = event_data.get('location', 'Unknown')
            location, _ = Location.objects.get_or_create(
                name=location_name,
                defaults={'location_type': 'TOWN'}
            )

            # Find/create organizer
            organizer = None
            if event_data.get('organizer_id'):
                organizer = Organizer.objects.filter(id=event_data['organizer_id']).first()

            # Create event
            event_defaults = {
                'title': {'pl': event_data['title']},
                'description': {'pl': event_data.get('description', '')},
                'location': location,
                'category': event_data.get('category', 'CULTURAL'),
                'source': 'SCRAPED',
                'moderation_status': 'APPROVED' if auto_approve else 'PENDING',
                'organizer': organizer,
            }

            if event_data.get('start_date'):
                event_defaults['start_date'] = event_data['start_date']
            if event_data.get('end_date'):
                event_defaults['end_date'] = event_data['end_date']

            event_defaults['price_type'] = event_data.get('price_type', 'FREE')
            if event_data.get('price_amount'):
                event_defaults['price_amount'] = event_data['price_amount']

            if event_data.get('images'):
                event_defaults['images'] = event_data['images']

            if event_data.get('external_url'):
                event_defaults['external_url'] = event_data['external_url']

            # Create/update
            if event_data.get('facebook_event_id'):
                event, created = Event.objects.update_or_create(
                    facebook_event_id=event_data['facebook_event_id'],
                    defaults=event_defaults
                )
            else:
                slug = slugify(event_data['title'][:50])
                event_defaults['slug'] = slug
                event = Event.objects.create(**event_defaults)
                created = True

            if created:
                imported += 1
            else:
                updated += 1

        except Exception as e:
            logger.error(f"Error importing event: {e}")
            skipped += 1

    logger.info(f"Import complete: {imported} imported, {updated} updated, {skipped} skipped")

    return f"Imported {imported}, updated {updated}, skipped {skipped}"
"""


# ==========================================
# Celery Beat Schedule
# ==========================================
# Add to: backend/config/celery.py

"""
from celery.schedules import crontab

app.conf.beat_schedule = {
    'scrape-facebook-events-daily': {
        'task': 'apps.scraper.tasks.scrape_facebook_pages',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
"""
