from django.contrib.gis.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinValueValidator

from .organizer import Organizer


class Event(models.Model):
    """
    Event model for Bieszczady.plus
    Stores cultural events, concerts, festivals, workshops, etc.
    Can have multiple dates via EventDate model
    """

    # Category choices
    CONCERT = 'CONCERT'
    FESTIVAL = 'FESTIVAL'
    THEATRE = 'THEATRE'
    CINEMA = 'CINEMA'
    WORKSHOP = 'WORKSHOP'
    FOOD = 'FOOD'
    CULTURAL = 'CULTURAL'

    CATEGORY_CHOICES = [
        (CONCERT, 'Koncert'),
        (FESTIVAL, 'Festiwal'),
        (THEATRE, 'Teatr'),
        (CINEMA, 'Kino'),
        (WORKSHOP, 'Warsztat'),
        (FOOD, 'Event kulinarny'),
        (CULTURAL, 'Event kulturalny'),
    ]

    # Event type choices
    EVENT = 'EVENT'
    PRODUCT = 'PRODUCT'
    WORKSHOP_TYPE = 'WORKSHOP'

    EVENT_TYPE_CHOICES = [
        (EVENT, 'Event'),
        (PRODUCT, 'Produkt'),
        (WORKSHOP_TYPE, 'Warsztat'),
    ]

    # Price type choices
    FREE = 'FREE'
    PAID = 'PAID'

    PRICE_TYPE_CHOICES = [
        (FREE, 'Darmowy'),
        (PAID, 'Płatny'),
    ]

    # Source choices
    MANUAL = 'MANUAL'
    SCRAPED = 'SCRAPED'
    USER_SUBMITTED = 'USER_SUBMITTED'

    SOURCE_CHOICES = [
        (MANUAL, 'Ręcznie dodany'),
        (SCRAPED, 'Zescrapowany'),
        (USER_SUBMITTED, 'Dodany przez użytkownika'),
    ]

    # Moderation status
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'

    MODERATION_STATUS_CHOICES = [
        (PENDING, 'Oczekuje'),
        (APPROVED, 'Zatwierdzony'),
        (REJECTED, 'Odrzucony'),
    ]

    # Basic information
    title = models.JSONField(
        help_text="Event title in multiple languages: {'pl': '', 'en': '', 'uk': ''}"
    )
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.JSONField(
        help_text="Event description in multiple languages"
    )

    # Category and classification
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CULTURAL
    )
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        default=EVENT,
        help_text="Event type: Event, Product, or Workshop"
    )

    # Date and time (DEPRECATED - use EventDate model instead)
    # Keeping for backwards compatibility, will be removed after migration
    start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="DEPRECATED: Użyj EventDate model zamiast tego"
    )
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="DEPRECATED: Użyj EventDate model zamiast tego"
    )
    duration_minutes = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="DEPRECATED: Użyj EventDate model zamiast tego"
    )

    # Location (PostGIS)
    location_name = models.CharField(
        max_length=255,
        help_text="Town/village name (e.g., Ustrzyki Dolne)"
    )
    coordinates = models.PointField(
        srid=4326,
        help_text="Geographic coordinates (longitude, latitude)"
    )
    address = models.TextField(blank=True)

    # Pricing
    price_type = models.CharField(
        max_length=10,
        choices=PRICE_TYPE_CHOICES,
        default=FREE
    )
    price_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='PLN')

    # Age restriction
    age_restriction = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Minimum age (e.g., 18)"
    )

    # Organizer information
    organizer = models.ForeignKey(
        Organizer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events',
        help_text="Powiązany organizator"
    )
    organizer_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Nazwa organizatora (używane gdy brak powiązanego organizatora)"
    )
    organizer_contact = models.JSONField(
        default=dict,
        blank=True,
        help_text="Contact info: email, phone, website"
    )

    # External links
    external_url = models.URLField(blank=True, help_text="Event website")
    ticket_url = models.URLField(blank=True, help_text="Ticket purchase link")
    facebook_event_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
        help_text="Facebook event ID (for scraped events)"
    )

    # Media
    image = models.ImageField(
        upload_to='events/',
        blank=True,
        null=True,
        help_text="Main event image"
    )
    images = models.JSONField(
        default=list,
        blank=True,
        help_text="List of additional image URLs"
    )

    # Source and moderation
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default=MANUAL
    )
    moderation_status = models.CharField(
        max_length=20,
        choices=MODERATION_STATUS_CHOICES,
        default=APPROVED
    )
    moderation_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_date']  # Fallback ordering, use event_dates for actual dates
        indexes = [
            models.Index(fields=['start_date']),
            models.Index(fields=['category']),
            models.Index(fields=['moderation_status']),
            models.Index(fields=['location_name']),
        ]
        # Add spatial index for coordinates (PostGIS)

    def __str__(self):
        # Get Polish title, fallback to first available language
        title_pl = self.title.get('pl', '')
        if not title_pl:
            title_pl = next(iter(self.title.values()), 'No title')

        # Show first event date if available
        first_date = self.event_dates.first()
        if first_date:
            return f"{title_pl} - {first_date.start_date.strftime('%Y-%m-%d')}"
        elif self.start_date:  # Fallback to legacy date
            return f"{title_pl} - {self.start_date.strftime('%Y-%m-%d')}"
        return title_pl

    def save(self, *args, **kwargs):
        # Auto-generate slug from Polish title
        if not self.slug:
            title_pl = self.title.get('pl', '')
            if title_pl:
                base_slug = slugify(title_pl)
                slug = base_slug
                counter = 1
                while Event.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                self.slug = slug
        super().save(*args, **kwargs)

    @property
    def is_past(self):
        """Check if all event dates have passed"""
        # Check EventDate entries first
        last_date = self.event_dates.order_by('-start_date').first()
        if last_date:
            return last_date.is_past

        # Fallback to legacy date fields
        if self.start_date:
            now = timezone.now()
            return self.end_date < now if self.end_date else self.start_date < now

        return False

    @property
    def next_date(self):
        """Get the next upcoming event date"""
        now = timezone.now()
        return self.event_dates.filter(start_date__gte=now).order_by('start_date').first()

    @property
    def all_dates(self):
        """Get all event dates ordered by start_date"""
        return self.event_dates.all().order_by('start_date')

    @property
    def is_free(self):
        """Check if event is free"""
        return self.price_type == self.FREE

    def get_title(self, language='pl'):
        """Get title in specified language with fallback"""
        return self.title.get(language) or self.title.get('pl') or next(iter(self.title.values()), '')

    def get_description(self, language='pl'):
        """Get description in specified language with fallback"""
        return self.description.get(language) or self.description.get('pl') or next(iter(self.description.values()), '')
