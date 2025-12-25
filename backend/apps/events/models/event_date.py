from django.contrib.gis.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator


class EventDate(models.Model):
    """
    EventDate model - stores individual dates for events
    Allows events to have multiple occurrences
    """
    event = models.ForeignKey(
        'Event',
        on_delete=models.CASCADE,
        related_name='event_dates',
        help_text="Wydarzenie do którego należy ta data"
    )
    start_date = models.DateTimeField(
        help_text="Data i godzina rozpoczęcia"
    )
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data i godzina zakończenia (opcjonalne)"
    )
    duration_minutes = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Czas trwania w minutach"
    )
    notes = models.TextField(
        blank=True,
        help_text="Dodatkowe informacje o tym terminie (np. 'Dodatkowy koncert')"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_date']
        verbose_name = 'Termin wydarzenia'
        verbose_name_plural = 'Terminy wydarzeń'
        indexes = [
            models.Index(fields=['start_date']),
            models.Index(fields=['event', 'start_date']),
        ]

    def __str__(self):
        return f"{self.event.get_title()} - {self.start_date.strftime('%Y-%m-%d %H:%M')}"

    @property
    def is_past(self):
        """Check if this event date has already occurred"""
        now = timezone.now()
        return self.end_date < now if self.end_date else self.start_date < now
