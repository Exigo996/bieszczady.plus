from django.db import models
from django.core.validators import MinValueValidator

from apps.gallery.models import Image as GalleryImage


class EventImage(models.Model):
    """
    Through model linking Events to Gallery Images.
    Handles ordering and main image selection for events.
    """
    event = models.ForeignKey(
        'Event',
        on_delete=models.CASCADE,
        related_name='event_images'
    )
    image = models.ForeignKey(
        GalleryImage,
        on_delete=models.CASCADE,
        related_name='event_images'
    )
    order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order for display (0 = first/main image)"
    )
    is_main = models.BooleanField(
        default=False,
        help_text="Mark as the main/cover image for this event"
    )

    class Meta:
        ordering = ['order']
        unique_together = [['event', 'image']]
        verbose_name = "Event Image"
        verbose_name_plural = "Event Images"

    def __str__(self):
        return f"{self.event} - {self.image}"

    def save(self, *args, **kwargs):
        # Ensure only one main image per event
        if self.is_main:
            EventImage.objects.filter(
                event=self.event,
                is_main=True
            ).exclude(pk=self.pk).update(is_main=False)
        super().save(*args, **kwargs)
