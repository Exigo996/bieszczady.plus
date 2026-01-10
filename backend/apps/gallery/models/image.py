from django.db import models
from django.core.validators import MinValueValidator


class Image(models.Model):
    """
    Image model for global gallery with tagging support
    Stores images uploaded to the server with metadata and tags
    """
    # Basic information
    title = models.CharField(
        max_length=255,
        help_text="Tytuł obrazu"
    )
    description = models.TextField(
        blank=True,
        help_text="Opis obrazu (opcjonalnie)"
    )

    # Image file
    image = models.ImageField(
        upload_to='gallery/',
        help_text="Plik obrazu"
    )

    # Tags - stored as JSON array for flexibility
    # Example: ["landscape", "nature", "mountains"]
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista tagów: ['landscape', 'nature', 'mountains']"
    )

    # Metadata (auto-populated on save)
    file_size = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Rozmiar pliku w bajtach"
    )
    width = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Szerokość obrazu w pikselach"
    )
    height = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Wysokość obrazu w pikselach"
    )

    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Obraz"
        verbose_name_plural = "Obrazy"
        indexes = [
            models.Index(fields=['uploaded_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Auto-populate image metadata on save"""
        # Populate file size
        if self.image:
            self.file_size = self.image.size

            # Populate dimensions using Pillow
            from PIL import Image as PILImage
            try:
                with PILImage.open(self.image.path) as img:
                    self.width, self.height = img.size
            except Exception:
                # If image doesn't exist yet or can't be read
                pass

        super().save(*args, **kwargs)
