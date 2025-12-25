from django.contrib.gis.db import models


class Organizer(models.Model):
    """
    Organizer model for Bieszczady.plus
    Stores information about event organizers/groups
    """

    name = models.CharField(
        max_length=255,
        help_text="Nazwa organizatora"
    )
    shortname = models.CharField(
        max_length=100,
        blank=True,
        help_text="Krótka nazwa organizatora (np. skrót lub nazwa wyświetlana)"
    )
    description = models.TextField(
        blank=True,
        help_text="Opis organizatora"
    )

    # Media
    image = models.ImageField(
        upload_to='organizers/images/',
        blank=True,
        null=True,
        help_text="Zdjęcie główne organizatora"
    )
    logo = models.ImageField(
        upload_to='organizers/logos/',
        blank=True,
        null=True,
        help_text="Logo organizatora"
    )

    # External links
    facebook_link = models.URLField(
        blank=True,
        help_text="Link do strony/grupy na Facebooku"
    )
    ticketing_site = models.URLField(
        blank=True,
        help_text="Link do strony z biletami"
    )
    website = models.URLField(
        blank=True,
        help_text="Strona internetowa organizatora"
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Czy organizator jest aktywny"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Organizator'
        verbose_name_plural = 'Organizatorzy'

    def __str__(self):
        return self.name
