"""
Event Import Service

Imports events from JSON file, creating locations and organizers as needed.
Skips existing events that have the same title + date + location combination.
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional

from django.utils import timezone
from django.utils.text import slugify

from ..models import Event, EventDate, Location, Organizer

logger = logging.getLogger(__name__)


@dataclass
class ImportResult:
    """Result of event import operation"""
    imported: int = 0
    skipped: int = 0
    errors: list[dict[str, Any]] = field(default_factory=list)

    def add_error(self, index: int, title: str, message: str):
        """Add an error to the result"""
        self.errors.append({
            'index': index,
            'title': title,
            'error': message
        })
        logger.error(f"Import error at index {index} ({title}): {message}")


class EventImporter:
    """
    Service for importing events from JSON structure.

    JSON structure:
    [
        {
            "title_pl": "Event title",
            "title_en": "Event title EN",
            "title_uk": "Event title UK",
            "description_pl": "Description",
            "description_en": "Description EN",
            "description_uk": "Description UK",
            "category": "CONCERT",
            "event_type": "EVENT",
            "price_type": "PAID",
            "price_amount": 50.00,
            "currency": "PLN",
            "external_url": "https://...",
            "ticket_url": "https://...",
            "organizer_id": 1,  // or organizer_name to match/create
            "organizer_name": "Organizer name",
            "dates": [
                {
                    "start_date": "2025-02-01T19:00:00",
                    "end_date": "2025-02-01T22:00:00",
                    "duration_minutes": 180,
                    "notes": "Additional info",
                    "location": {
                        "name": "Location name",
                        "shortname": "Short",
                        "city": "City",
                        "address": "Full address",
                        "latitude": 49.4234,
                        "longitude": 22.5678,
                        "google_maps_url": "https://...",
                        "location_type": "VENUE",
                        "amenities": ["parking", "wifi"],
                        "description": "Location description"
                    }
                }
            ]
        }
    ]
    """

    # Category mapping
    CATEGORIES = {
        'CONCERT', 'FESTIVAL', 'THEATRE', 'CINEMA',
        'WORKSHOP', 'FOOD', 'CULTURAL'
    }

    # Event type mapping
    EVENT_TYPES = {'EVENT', 'PRODUCT', 'WORKSHOP'}

    # Price type mapping
    PRICE_TYPES = {'FREE', 'PAID'}

    # Location type mapping
    LOCATION_TYPES = {'VENUE', 'OUTDOOR', 'PRIVATE', 'VIRTUAL'}

    def __init__(self):
        self.result = ImportResult()

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime, assuming Poland timezone"""
        if not date_str:
            return None

        # Try ISO format first
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            # Make timezone-aware if naive (assume Poland)
            if dt.tzinfo is None:
                import pytz
                poland_tz = pytz.timezone('Europe/Warsaw')
                dt = poland_tz.localize(dt)
            return dt
        except ValueError:
            pass

        # Try other common formats
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M',
        ]

        for fmt in formats:
            try:
                import pytz
                poland_tz = pytz.timezone('Europe/Warsaw')
                return poland_tz.localize(datetime.strptime(date_str, fmt))
            except ValueError:
                continue

        return None

    def get_or_create_location(self, location_data: dict[str, Any]) -> Optional[Location]:
        """
        Get existing location or create new one.
        Matches by name + city combination (both must match to be considered same).
        If name + city don't match any existing, creates a new location.
        """
        if not location_data or not location_data.get('name'):
            return None

        name = location_data['name']
        city = location_data.get('city', '')

        # Look for existing location with same name AND city
        existing = Location.objects.filter(name=name, city=city).first()
        if existing:
            logger.debug(f"Found existing location: {name} ({city})")
            return existing

        # Create new location
        location = Location(
            name=name,
            shortname=location_data.get('shortname', ''),
            city=city,
            address=location_data.get('address', ''),
            latitude=location_data.get('latitude'),
            longitude=location_data.get('longitude'),
            google_maps_url=location_data.get('google_maps_url', ''),
            website=location_data.get('website', ''),
            phone=location_data.get('phone', ''),
            email=location_data.get('email', ''),
            capacity=location_data.get('capacity'),
            location_type=location_data.get('location_type', Location.VENUE),
            amenities=location_data.get('amenities', []),
            description=location_data.get('description', ''),
        )
        location.save()
        logger.info(f"Created new location: {name} ({city})")
        return location

    def get_or_create_organizer(self, organizer_data: dict[str, Any]) -> Optional[Organizer]:
        """
        Get existing organizer or create new one.
        Matches by name first, or by ID if provided.
        """
        if not organizer_data:
            return None

        # By ID if provided
        if organizer_id := organizer_data.get('organizer_id'):
            try:
                return Organizer.objects.get(id=organizer_id)
            except Organizer.DoesNotExist:
                logger.warning(f"Organizer ID {organizer_id} not found")

        # By name if provided
        if name := organizer_data.get('organizer_name'):
            existing = Organizer.objects.filter(name=name).first()
            if existing:
                logger.debug(f"Found existing organizer: {name}")
                return existing

            # Create new organizer
            organizer = Organizer(name=name)
            organizer.save()
            logger.info(f"Created new organizer: {name}")
            return organizer

        return None

    def event_exists(self, event: Event, dates_data: list[dict]) -> bool:
        """
        Check if event already exists with same dates and locations.
        Returns True if all dates with their locations already exist for this event.
        """
        existing_dates = event.event_dates.all()

        for date_data in dates_data:
            start_date = self.parse_date(date_data.get('start_date', ''))
            location_data = date_data.get('location', {})

            if not start_date:
                continue

            # Get location from data
            location = None
            if location_data and location_data.get('name'):
                city = location_data.get('city', '')
                location = Location.objects.filter(
                    name=location_data['name'],
                    city=city
                ).first()

            # Check if this date+location combination exists
            date_exists = existing_dates.filter(
                start_date=start_date,
                location=location
            ).exists()

            if not date_exists:
                return False  # At least one date is new

        return True  # All dates already exist

    def import_event(self, event_data: dict[str, Any], index: int) -> bool:
        """
        Import a single event from JSON data.
        Returns True if imported, False if skipped.
        """
        title_pl = event_data.get('title_pl', '')

        if not title_pl:
            self.result.add_error(index, 'N/A', 'Missing title_pl')
            return False

        dates_data = event_data.get('dates', [])
        if not dates_data:
            self.result.add_error(index, title_pl, 'Missing dates array')
            return False

        # Validate category
        category = event_data.get('category', 'CULTURAL')
        if category not in self.CATEGORIES:
            category = 'CULTURAL'

        # Validate event_type
        event_type = event_data.get('event_type', 'EVENT')
        if event_type not in self.EVENT_TYPES:
            event_type = 'EVENT'

        # Validate price_type
        price_type = event_data.get('price_type', 'FREE')
        if price_type not in self.PRICE_TYPES:
            price_type = 'FREE'

        # Get or create organizer
        organizer_info = {
            'organizer_id': event_data.get('organizer_id'),
            'organizer_name': event_data.get('organizer_name'),
        }
        organizer = self.get_or_create_organizer(organizer_info)

        # Check if event exists by slug
        slug = slugify(title_pl)
        existing_event = Event.objects.filter(slug=slug).first()

        if existing_event:
            # Check if dates/locations are different
            if self.event_exists(existing_event, dates_data):
                logger.info(f"Skipping existing event: {title_pl}")
                self.result.skipped += 1
                return False
            else:
                # Update existing event and add new dates
                event = existing_event
                logger.info(f"Updating existing event with new dates: {title_pl}")
        else:
            # Create new event
            event = Event(
                slug=slug,
                category=category,
                event_type=event_type,
                price_type=price_type,
                organizer=organizer,
            )
            logger.info(f"Creating new event: {title_pl}")

        # Update event fields
        event.title_pl = event_data.get('title_pl') or event.title_pl
        event.title_en = event_data.get('title_en') or event.title_en
        event.title_uk = event_data.get('title_uk') or event.title_uk

        # Rich text descriptions
        if desc_pl := event_data.get('description_pl'):
            event.description_pl = desc_pl
        if desc_en := event_data.get('description_en'):
            event.description_en = desc_en
        if desc_uk := event_data.get('description_uk'):
            event.description_uk = desc_uk

        event.price_amount = event_data.get('price_amount')
        event.currency = event_data.get('currency', 'PLN')
        event.external_url = event_data.get('external_url', '')
        event.ticket_url = event_data.get('ticket_url', '')
        event.age_restriction = event_data.get('age_restriction')

        event.save()

        # Process dates
        for date_data in dates_data:
            start_date = self.parse_date(date_data.get('start_date', ''))
            end_date = self.parse_date(date_data.get('end_date', ''))

            if not start_date:
                continue

            # Get or create location
            location = self.get_or_create_location(date_data.get('location', {}))

            # Check if this specific date+location already exists
            existing_date = event.event_dates.filter(
                start_date=start_date,
                location=location
            ).first()

            if existing_date:
                logger.debug(f"Date already exists: {start_date} at {location}")
                continue

            # Create new EventDate
            event_date = EventDate(
                event=event,
                location=location,
                start_date=start_date,
                end_date=end_date,
                duration_minutes=date_data.get('duration_minutes'),
                notes=date_data.get('notes', ''),
            )
            event_date.save()
            logger.info(f"Added new date: {start_date} at {location}")

        self.result.imported += 1
        return True

    def import_from_json(self, json_data: list[dict[str, Any]]) -> ImportResult:
        """
        Import events from JSON data list.

        Args:
            json_data: List of event dictionaries

        Returns:
            ImportResult with counts and errors
        """
        self.result = ImportResult()

        if not isinstance(json_data, list):
            self.result.add_error(0, 'N/A', 'JSON data must be an array')
            return self.result

        for index, event_data in enumerate(json_data):
            try:
                self.import_event(event_data, index)
            except Exception as e:
                title = event_data.get('title_pl', 'N/A')
                self.result.add_error(index, title, str(e))

        return self.result

    def import_from_string(self, json_string: str) -> ImportResult:
        """
        Import events from JSON string.

        Args:
            json_string: JSON string containing events array

        Returns:
            ImportResult with counts and errors
        """
        try:
            data = json.loads(json_string)
        except json.JSONDecodeError as e:
            self.result = ImportResult()
            self.result.add_error(0, 'N/A', f'Invalid JSON: {e}')
            return self.result

        return self.import_from_json(data)

    def import_from_file(self, file_path: str) -> ImportResult:
        """
        Import events from JSON file.

        Args:
            file_path: Path to JSON file

        Returns:
            ImportResult with counts and errors
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (IOError, json.JSONDecodeError) as e:
            self.result = ImportResult()
            self.result.add_error(0, 'N/A', f'Error reading file: {e}')
            return self.result

        return self.import_from_json(data)
