from django.db import models
from django.core.validators import MinValueValidator


class Location(models.Model):
    """
    Location model for Bieszczady.plus
    Represents physical venues/places where events can occur.
    Can be reused across multiple events.
    """
    # Basic information
    name = models.CharField(
        max_length=255,
        help_text="Location name (e.g., Centrum Kultury, Bieszczadzki Dom Kultury)"
    )
    shortname = models.CharField(
        max_length=100,
        blank=True,
        help_text="Short name for lists (e.g., CK, BDK)"
    )

    # Address
    address = models.TextField(
        blank=True,
        help_text="Full address (ulica, numer, kod pocztowy, miasto)"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        help_text="City name (e.g., Ustrzyki Dolne)"
    )

    # Coordinates as simple decimal fields
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="Latitude (e.g., 49.4234)"
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="Longitude (e.g., 22.5678)"
    )

    # Google Maps URL for easy lookup
    google_maps_url = models.URLField(
        blank=True,
        help_text="Google Maps link to location"
    )

    # Contact
    website = models.URLField(
        blank=True,
        help_text="Location website"
    )
    phone = models.CharField(
        max_length=50,
        blank=True,
        help_text="Contact phone"
    )
    email = models.EmailField(
        blank=True,
        help_text="Contact email"
    )

    # Capacity
    capacity = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Maximum capacity (optional)"
    )

    # Location type
    VENUE = 'VENUE'
    OUTDOOR = 'OUTDOOR'
    PRIVATE = 'PRIVATE'
    VIRTUAL = 'VIRTUAL'

    LOCATION_TYPE_CHOICES = [
        (VENUE, 'Obiekt/ sala'),
        (OUTDOOR, 'Plener'),
        (PRIVATE, 'Prywatne'),
        (VIRTUAL, 'Online'),
    ]

    location_type = models.CharField(
        max_length=20,
        choices=LOCATION_TYPE_CHOICES,
        default=VENUE,
        help_text="Type of location"
    )

    # Description
    description = models.TextField(
        blank=True,
        help_text="Additional information about the location"
    )

    # Amenities - stored as JSON array
    # Example: ["parking", "wifi", "accessible", "bar"]
    amenities = models.JSONField(
        default=list,
        blank=True,
        help_text="List of amenities: ['parking', 'wifi', 'accessible', 'bar', 'ac']"
    )

    # Active status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this location can be used for new events"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['city', 'name']
        verbose_name = "Lokalizacja"
        verbose_name_plural = "Lokalizacje"
        indexes = [
            models.Index(fields=['city', 'name']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        if self.city:
            return f"{self.name} ({self.city})"
        return self.name
